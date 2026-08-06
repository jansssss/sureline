/**
 * 서버 전용 서비스 레이어 (Supabase REST)
 * 기존 /api/admin/* 라우트와 동일한 방식: 토큰 검증은 anon key, 데이터 접근은 service_role.
 * 클라이언트 번들에 들어가면 안 된다 — API 라우트에서만 import 할 것.
 */

import { applyDerivedFields } from './calc.js';
import { calculateScore } from './scoring.js';
import { resolveFinalCandidateChange } from './final-candidate.js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const TABLE = 'product_research_candidates';
const HISTORY = 'product_research_history';
const SOURCES = 'product_research_sources';
const SETTINGS = 'product_research_score_settings';
const AUDIT = 'product_research_audit_logs';

export function isConfigured() {
  return Boolean(SUPABASE_URL && SERVICE_KEY);
}

function headers(extra = {}) {
  return {
    apikey: SERVICE_KEY,
    Authorization: `Bearer ${SERVICE_KEY}`,
    'Content-Type': 'application/json',
    ...extra,
  };
}

async function rest(path, init = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    cache: 'no-store',
    ...init,
    headers: headers(init.headers),
  });
  if (!res.ok) {
    const text = await res.text();
    const err = new Error(text || `Supabase ${res.status}`);
    err.status = res.status;
    throw err;
  }
  if (res.status === 204) return null;
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

/** 관리자 토큰 검증 — 기존 라우트와 동일한 규칙 */
export async function verifyAdmin(request) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;
  const auth = request.headers.get('Authorization') ?? '';
  if (!auth.startsWith('Bearer ')) return null;
  const token = auth.slice(7);
  const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  if (!res.ok) return null;
  const user = await res.json().catch(() => null);
  return user?.email || user?.id || 'admin';
}

// ─── 평가기준 ────────────────────────────────────────────────────────────────

export async function getScoreSettings() {
  return (await rest(`${SETTINGS}?order=sort_order.asc`)) ?? [];
}

export async function updateScoreSetting(criterionKey, patch, actor) {
  const body = { ...patch, updated_by: actor ?? null };
  return rest(`${SETTINGS}?criterion_key=eq.${encodeURIComponent(criterionKey)}`, {
    method: 'PATCH',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify(body),
  });
}

// ─── 후보 ────────────────────────────────────────────────────────────────────

export async function listCandidates() {
  return (await rest(`${TABLE}?order=total_score.desc.nullslast,created_at.asc&limit=1000`)) ?? [];
}

export async function getCandidate(id) {
  const rows = await rest(`${TABLE}?id=eq.${Number(id)}&limit=1`);
  return rows?.[0] ?? null;
}

/** 저장 전 파생값 + 점수를 계산해서 붙인다 */
export async function withDerivedAndScore(candidate, settings) {
  const derived = applyDerivedFields(candidate);
  const result = calculateScore(derived, settings);
  return {
    ...derived,
    total_score: result.total,
    score_breakdown: result,
  };
}

export async function createCandidate(input, actor) {
  const settings = await getScoreSettings();
  const prepared = await withDerivedAndScore(input, settings);
  const row = {
    ...stripUnknown(prepared),
    created_by: actor ?? null,
    updated_by: actor ?? null,
  };
  const created = await rest(TABLE, {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify(row),
  });
  const candidate = created?.[0] ?? null;
  if (candidate) await writeAudit(candidate.id, 'create', actor, { product_name: candidate.product_name });
  return candidate;
}

export async function updateCandidate(id, input, actor) {
  const existing = await getCandidate(id);
  if (!existing) return null;

  const settings = await getScoreSettings();
  // total_monthly_search 를 null 로 보내면 PC+모바일 자동 합계로 되돌아간다
  const prepared = await withDerivedAndScore({ ...existing, ...input }, settings);

  const row = { ...stripUnknown(prepared), updated_by: actor ?? null };
  delete row.id;
  delete row.created_at;
  delete row.created_by;
  delete row.is_final_candidate; // 최종 후보 지정은 전용 엔드포인트로만

  // 최종 후보를 다른 상태로 옮기면 지정도 함께 해제한다
  if (existing.is_final_candidate && row.status && row.status !== '최종 후보') {
    row.is_final_candidate = false;
  }

  const updated = await rest(`${TABLE}?id=eq.${Number(id)}`, {
    method: 'PATCH',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify(row),
  });
  const candidate = updated?.[0] ?? null;

  if (candidate) {
    const action = existing.status !== candidate.status ? 'status_change' : 'update';
    await writeAudit(candidate.id, action, actor, {
      from_status: existing.status,
      to_status: candidate.status,
      score: candidate.total_score,
    });
  }
  return candidate;
}

export async function deleteCandidate(id, actor) {
  const existing = await getCandidate(id);
  if (!existing) return false;
  await writeAudit(null, 'delete', actor, { id: Number(id), product_name: existing.product_name });
  await rest(`${TABLE}?id=eq.${Number(id)}`, { method: 'DELETE' });
  return true;
}

/** 전체 후보 점수 재계산 */
export async function recalculateAll(actor) {
  const settings = await getScoreSettings();
  const candidates = await listCandidates();
  let updated = 0;

  for (const c of candidates) {
    const prepared = await withDerivedAndScore(c, settings);
    const changed =
      Number(c.total_score ?? -1) !== Number(prepared.total_score) ||
      c.total_monthly_search !== prepared.total_monthly_search ||
      c.review_increase !== prepared.review_increase;
    await rest(`${TABLE}?id=eq.${c.id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        total_score: prepared.total_score,
        score_breakdown: prepared.score_breakdown,
        total_monthly_search: prepared.total_monthly_search,
        measurement_days: prepared.measurement_days,
        review_increase: prepared.review_increase,
        normalized_30_day_review_increase: prepared.normalized_30_day_review_increase,
        estimated_commission_amount: prepared.estimated_commission_amount,
        updated_by: actor ?? null,
      }),
    });
    if (changed) updated += 1;
  }

  await writeAudit(null, 'score_recalculate', actor, { total: candidates.length, changed: updated });
  return { total: candidates.length, changed: updated };
}

/**
 * 최종 후보 지정 — 기존 최종 후보는 '분석 완료'로 되돌린다.
 * 최종 후보는 항상 최대 1개만 유지된다.
 */
export async function setFinalCandidate(id, actor) {
  const target = await getCandidate(id);
  if (!target) return null;

  const currentFinals = (await rest(`${TABLE}?is_final_candidate=eq.true&select=id,status,is_final_candidate`)) ?? [];
  const { releases, promote } = resolveFinalCandidateChange([...currentFinals, target], id);

  // 기존 최종 후보를 먼저 해제해야 유니크 인덱스와 충돌하지 않는다
  for (const r of releases) {
    await rest(`${TABLE}?id=eq.${r.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ ...r.patch, updated_by: actor ?? null }),
    });
    await writeAudit(r.id, 'final_candidate', actor, { released: true });
  }

  const updated = await rest(`${TABLE}?id=eq.${Number(promote.id)}`, {
    method: 'PATCH',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify({ ...promote.patch, updated_by: actor ?? null }),
  });
  await writeAudit(id, 'final_candidate', actor, { designated: true, score: target.total_score });
  return updated?.[0] ?? null;
}

export async function clearFinalCandidate(id, actor) {
  const updated = await rest(`${TABLE}?id=eq.${Number(id)}`, {
    method: 'PATCH',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify({ is_final_candidate: false, status: '분석 완료', updated_by: actor ?? null }),
  });
  await writeAudit(id, 'final_candidate', actor, { released: true });
  return updated?.[0] ?? null;
}

/**
 * 공개 추천페이지가 나중에 쓸 조회 함수.
 * 최종 후보의 최소 필드만 반환한다. (이번 작업에서는 호출하는 공개페이지를 만들지 않는다)
 */
export async function getFinalCandidatePublicFields() {
  const rows = await rest(
    `${TABLE}?is_final_candidate=eq.true&select=product_name,primary_keyword,category,description,coupang_product_name,affiliate_url,image_url,price,rating,rocket_delivery,last_checked_at&limit=1`
  );
  return rows?.[0] ?? null;
}

// ─── 이력 ────────────────────────────────────────────────────────────────────

export async function listHistory(candidateId) {
  return (await rest(`${HISTORY}?candidate_id=eq.${Number(candidateId)}&order=recorded_at.asc`)) ?? [];
}

/** 현재 후보 값을 스냅샷으로 저장 (자동수집 프로바이더도 이 함수를 재사용한다) */
export async function saveSnapshot(candidateId, input, actor) {
  const candidate = await getCandidate(candidateId);
  if (!candidate) return null;

  const row = {
    candidate_id: Number(candidateId),
    recorded_at: input.recorded_at ?? new Date().toISOString().slice(0, 10),
    pc_monthly_search: pick(input, candidate, 'pc_monthly_search'),
    mobile_monthly_search: pick(input, candidate, 'mobile_monthly_search'),
    total_monthly_search: pick(input, candidate, 'total_monthly_search'),
    age_25_54_ratio: pick(input, candidate, 'age_25_54_ratio'),
    search_trend_3_month: pick(input, candidate, 'search_trend_3_month'),
    shopping_click_index: pick(input, candidate, 'shopping_click_index'),
    shopping_trend_3_month: pick(input, candidate, 'shopping_trend_3_month'),
    review_count: input.review_count ?? candidate.current_review_count ?? candidate.review_count ?? null,
    price: pick(input, candidate, 'price'),
    rating: pick(input, candidate, 'rating'),
    stock_status: pick(input, candidate, 'stock_status'),
    total_score: input.total_score ?? candidate.total_score ?? null,
    memo: input.memo ?? null,
    created_by: actor ?? null,
  };

  const created = await rest(HISTORY, {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify(row),
  });
  await writeAudit(candidateId, 'history_add', actor, { recorded_at: row.recorded_at });
  return created?.[0] ?? null;
}

function pick(input, fallback, key) {
  return input[key] !== undefined ? input[key] : (fallback[key] ?? null);
}

// ─── 출처 ────────────────────────────────────────────────────────────────────

export async function listSources(candidateId) {
  return (await rest(`${SOURCES}?candidate_id=eq.${Number(candidateId)}&order=created_at.desc`)) ?? [];
}

export async function addSource(candidateId, input, actor) {
  const row = {
    candidate_id: Number(candidateId),
    data_type: input.data_type ?? 'etc',
    source_name: input.source_name ?? null,
    source_kind: input.source_kind ?? null,
    source_url: input.source_url ?? null,
    checked_at: input.checked_at ?? null,
    evidence_image_url: input.evidence_image_url ?? null,
    memo: input.memo ?? null,
    created_by: actor ?? null,
  };
  const created = await rest(SOURCES, {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify(row),
  });
  await writeAudit(candidateId, 'update', actor, { source_added: row.data_type });
  return created?.[0] ?? null;
}

export async function deleteSource(sourceId) {
  await rest(`${SOURCES}?id=eq.${Number(sourceId)}`, { method: 'DELETE' });
  return true;
}

// ─── 감사 로그 ───────────────────────────────────────────────────────────────

export async function writeAudit(candidateId, action, actor, detail) {
  try {
    await rest(AUDIT, {
      method: 'POST',
      body: JSON.stringify({
        candidate_id: candidateId ? Number(candidateId) : null,
        action,
        actor: actor ?? null,
        detail: detail ?? null,
      }),
    });
  } catch {
    // 감사 로그 실패가 본 작업을 막지 않는다
  }
}

export async function listAudit(candidateId, limit = 50) {
  const filter = candidateId ? `candidate_id=eq.${Number(candidateId)}&` : '';
  return (await rest(`${AUDIT}?${filter}order=created_at.desc&limit=${limit}`)) ?? [];
}

// ─── 내부 ────────────────────────────────────────────────────────────────────

/** DB에 존재하는 컬럼만 남긴다 (알 수 없는 키가 섞이면 PostgREST가 400을 낸다) */
const CANDIDATE_COLUMNS = new Set([
  'product_name', 'primary_keyword', 'secondary_keywords', 'category', 'description',
  'research_purpose', 'coupang_product_name', 'coupang_url', 'affiliate_url', 'image_url',
  'price', 'rating', 'review_count', 'rocket_delivery', 'seller_name', 'brand_name',
  'status', 'admin_memo',
  'pc_monthly_search', 'mobile_monthly_search', 'total_monthly_search',
  'average_click_count', 'average_click_rate', 'age_25_54_ratio',
  'search_trend_3_month', 'search_trend_12_month', 'search_competition', 'ad_competition',
  'related_product_count', 'search_source_kind',
  'shopping_click_index', 'shopping_index_note', 'shopping_trend_3_month',
  'shopping_trend_12_month', 'shopping_main_age_group', 'shopping_mobile_ratio',
  'shopping_source_kind',
  'current_review_count', 'previous_review_count', 'measurement_start_date',
  'measurement_end_date', 'measurement_days', 'review_increase',
  'normalized_30_day_review_increase', 'stock_status', 'stock_memo',
  'recommendation_badge', 'category_best', 'coupang_source_kind',
  'estimated_price', 'estimated_commission_rate', 'estimated_commission_amount',
  'return_risk', 'seller_stability', 'product_page_stability', 'seasonality',
  'direct_purchase_possible', 'direct_review_possible', 'sureline_relevance',
  'medical_claim_risk', 'profitability_memo',
  'total_score', 'score_breakdown', 'last_checked_at',
]);

function stripUnknown(obj) {
  const out = {};
  for (const [k, v] of Object.entries(obj || {})) {
    if (CANDIDATE_COLUMNS.has(k)) out[k] = v === '' ? null : v;
  }
  return out;
}
