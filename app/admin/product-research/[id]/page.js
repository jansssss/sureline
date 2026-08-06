'use client';
/**
 * /admin/product-research/[id] — 제품 후보 상세 분석
 */
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import AdminNav from '@/components/admin/AdminNav';
import {
  Button, Badge, Empty, Card, T, ScorePill, ScoreBar, Sparkline,
  Field, FieldGrid, TextInput, DateInput, Select, SectionTitle, EstimatedBadge,
} from '@/components/product-research/ui';
import CandidateFormModal from '@/components/product-research/CandidateFormModal';
import FinalCandidateModal from '@/components/product-research/FinalCandidateModal';
import HistoryRecordModal from '@/components/product-research/HistoryRecordModal';
import {
  STATUS_STYLES, STALE_DAYS, HISTORY_FIELDS, DATA_TYPES, SOURCE_KINDS, SOURCE_NAMES,
} from '@/lib/product-research/constants.js';
import { hasValue, daysSince } from '@/lib/product-research/calc.js';
import { calculateScore } from '@/lib/product-research/scoring.js';
import { fmtNumber, fmtMoney, fmtDate, fmtPercent } from '@/lib/product-research/format.js';

export default function ProductResearchDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  const [authChecked, setAuthChecked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');

  const [candidate, setCandidate] = useState(null);
  const [history, setHistory] = useState([]);
  const [sources, setSources] = useState([]);
  const [settings, setSettings] = useState([]);
  const [audit, setAudit] = useState([]);
  const [rankInfo, setRankInfo] = useState(null);

  const [editOpen, setEditOpen] = useState(false);
  const [finalOpen, setFinalOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [chartField, setChartField] = useState('total_monthly_search');
  const [fetching, setFetching] = useState(false);

  const authFetch = useCallback(async (url, init = {}) => {
    const token = localStorage.getItem('admin_token');
    return fetch(url, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(init.headers || {}),
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    });
  }, []);

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const [detailRes, finalRes] = await Promise.all([
        authFetch(`/api/admin/product-research/${id}`),
        authFetch(`/api/admin/product-research/${id}/final`),
      ]);
      if (detailRes.status === 401) { router.replace('/'); return; }
      const detail = await detailRes.json();
      if (!detailRes.ok) throw new Error(detail.error || '데이터를 불러오지 못했습니다.');

      setCandidate(detail.candidate);
      setHistory(detail.history || []);
      setSources(detail.sources || []);
      setSettings(detail.settings || []);
      setAudit(detail.audit || []);

      if (finalRes.ok) setRankInfo(await finalRes.json());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [authFetch, id, router]);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) { router.replace('/'); return; }
    setAuthChecked(true);
    load();
  }, [load, router]);

  const flash = (t) => { setMsg(t); setTimeout(() => setMsg(''), 3500); };

  const score = useMemo(
    () => (candidate ? calculateScore(candidate, settings) : null),
    [candidate, settings]
  );

  const handleFetchNaver = async () => {
    setFetching(true);
    setError('');
    try {
      const res = await authFetch(`/api/admin/product-research/${id}/fetch`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '수집에 실패했습니다.');
      const a = data.applied;
      flash(
        `네이버 검색광고 수집 완료 — 총 ${Number(a.total_monthly_search ?? 0).toLocaleString('ko-KR')}회` +
        (a.search_competition ? ` · 경쟁도 ${a.search_competition}` : '')
      );
      load();
    } catch (e) {
      setError(e.message);
    } finally {
      setFetching(false);
    }
  };

  const handleUpdate = async (form) => {
    const res = await authFetch(`/api/admin/product-research/${id}`, {
      method: 'PATCH', body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || '저장에 실패했습니다.');
    setEditOpen(false);
    flash('수정 내용을 저장했습니다.');
    load();
  };

  if (!authChecked) return null;

  const age = candidate ? daysSince(candidate.last_checked_at) : null;
  const stale = age !== null && age >= STALE_DAYS;
  const st = candidate ? (STATUS_STYLES[candidate.status] ?? STATUS_STYLES['조사 전']) : null;

  const chartMeta = HISTORY_FIELDS.find((f) => f.key === chartField) ?? HISTORY_FIELDS[0];
  const chartPoints = history.map((h) => ({
    label: String(h.recorded_at).slice(5),
    value: h[chartField] ?? null,
  }));

  return (
    <div style={{ minHeight: '100vh', background: T.bg }}>
      <div style={{
        background: '#fff', borderBottom: `1px solid ${T.border}`,
        padding: '0 16px', minHeight: 52, display: 'flex', alignItems: 'center',
        gap: 12, flexWrap: 'wrap',
      }}>
        <Link href="/admin/product-research" style={{ fontSize: 13, color: T.sub, textDecoration: 'none' }}>
          ← 목록
        </Link>
        <AdminNav />
        <div style={{ flex: 1 }} />
        {msg && <span style={{ fontSize: 12, fontWeight: 700, color: T.success }}>{msg}</span>}
        <Button size="sm" onClick={load}>새로고침</Button>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '20px 14px 60px' }}>
        {error && (
          <div style={{
            background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10,
            padding: '10px 12px', marginBottom: 14, fontSize: 12.5, color: '#b91c1c', fontWeight: 600,
          }}>✕ {error}</div>
        )}

        {loading && <div style={{ textAlign: 'center', padding: 60, color: T.muted }}>불러오는 중…</div>}

        {!loading && candidate && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* ─── 상단 요약 ─────────────────────────────────────────────── */}
            <Card style={{ padding: 18 }}>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-start' }}>
                <div style={{ flex: '1 1 260px', minWidth: 0 }}>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 6 }}>
                    <Badge bg={st.bg} fg={st.fg} icon={st.icon}>{candidate.status}</Badge>
                    {candidate.is_final_candidate && <Badge bg="#fef3c7" fg={T.warnFg} icon="★">최종 후보</Badge>}
                    {stale && <Badge bg="#fff7ed" fg="#9a3412" icon="!">{age}일 경과</Badge>}
                    {!hasValue(candidate.last_checked_at) && <Badge bg="#f4f4f5" fg="#71717a" icon="?">확인일 없음</Badge>}
                  </div>
                  <h1 style={{ fontSize: 21, fontWeight: 900, color: T.text, margin: '0 0 4px', letterSpacing: '-0.02em' }}>
                    {candidate.product_name}
                  </h1>
                  <div style={{ fontSize: 13, color: T.sub }}>
                    대표 키워드 <strong style={{ color: T.primary }}>{candidate.primary_keyword}</strong>
                    {candidate.category && <> · {candidate.category}</>}
                  </div>
                  <div style={{ fontSize: 12, color: T.muted, marginTop: 4 }}>
                    최종 확인일 {fmtDate(candidate.last_checked_at) ?? '미입력'}
                    {rankInfo && ` · 전체 ${rankInfo.totalCandidates}개 중 ${rankInfo.rank}위`}
                  </div>
                </div>

                <div style={{ textAlign: 'right', minWidth: 160 }}>
                  <ScorePill score={score?.total ?? null} max={score?.maxTotal ?? 100} size="lg" />
                  <div style={{ marginTop: 8, width: 160, marginLeft: 'auto' }}>
                    <ScoreBar score={score?.total ?? 0} max={score?.maxTotal ?? 100} />
                  </div>
                  {score && score.missingCount > 0 && (
                    <div style={{ fontSize: 11, color: T.warn, marginTop: 6, fontWeight: 700 }}>
                      미입력 평가항목 {score.missingCount}개
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                  <Button onClick={handleFetchNaver} disabled={fetching}>
                    {fetching ? '수집 중…' : '네이버 검색량 가져오기'}
                  </Button>
                  <Button variant="soft" onClick={() => setEditOpen(true)}>수정</Button>
                  <Button onClick={() => setHistoryOpen(true)}>데이터 기록 추가</Button>
                  <Button
                    variant="primary"
                    onClick={() => setFinalOpen(true)}
                    disabled={candidate.is_final_candidate}
                  >
                    {candidate.is_final_candidate ? '이미 최종 후보' : '최종 후보 지정'}
                  </Button>
                </div>
              </div>
            </Card>

            {/* ─── 점수 분석 ─────────────────────────────────────────────── */}
            <Card>
              <SectionTitle right={
                <span style={{ fontSize: 11, color: T.muted }}>
                  입력된 항목 기준 최대 {score?.evaluatedMax ?? 0}점 / 전체 {score?.maxTotal ?? 100}점
                </span>
              }>
                점수 분석
              </SectionTitle>

              {(!score || score.breakdown.length === 0) ? (
                <div style={{ fontSize: 12.5, color: T.muted }}>평가기준이 설정되지 않았습니다.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {score.breakdown.map((b) => (
                    <div key={b.key}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 12.5, fontWeight: 800, color: T.text, minWidth: 130 }}>{b.name}</span>
                        {b.missing && <Badge bg="#f4f4f5" fg="#a1a1aa" icon="—">미입력</Badge>}
                        <div style={{ flex: 1 }} />
                        <span style={{ fontSize: 12.5, fontWeight: 800, color: T.text }}>
                          {b.score}<span style={{ color: T.muted, fontWeight: 600 }}>/{b.max}</span>
                        </span>
                      </div>
                      <ScoreBar score={b.score} max={b.max} />
                      <div style={{ fontSize: 11, color: T.sub, marginTop: 4, lineHeight: 1.6 }}>
                        {b.reason}
                      </div>
                      {b.parts && (
                        <ul style={{ margin: '4px 0 0', paddingLeft: 16, fontSize: 10.5, color: T.muted, lineHeight: 1.7 }}>
                          {b.parts.map((p) => (
                            <li key={p.key}>
                              {p.name}: {p.score}/{p.max} — {p.reason}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}

                  <div style={{
                    borderTop: `1px solid ${T.borderSoft}`, paddingTop: 10,
                    display: 'flex', alignItems: 'center', gap: 8,
                  }}>
                    <span style={{ fontSize: 13, fontWeight: 900, color: T.text }}>총점</span>
                    <div style={{ flex: 1 }} />
                    <ScorePill score={score.total} max={score.maxTotal} />
                  </div>
                </div>
              )}
            </Card>

            {/* ─── 입력 데이터 요약 ──────────────────────────────────────── */}
            <Card>
              <SectionTitle>입력 데이터</SectionTitle>
              <div style={{
                display: 'grid', gap: 10,
                gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
              }}>
                <Stat label="월간 총검색량" value={fmtNumber(candidate.total_monthly_search, '회')} kind={candidate.search_source_kind} />
                <Stat label="PC / 모바일" value={
                  hasValue(candidate.pc_monthly_search) || hasValue(candidate.mobile_monthly_search)
                    ? `${fmtNumber(candidate.pc_monthly_search) ?? '-'} / ${fmtNumber(candidate.mobile_monthly_search) ?? '-'}`
                    : null
                } />
                <Stat label="25~54세 비중" value={hasValue(candidate.age_25_54_ratio) ? `${Number(candidate.age_25_54_ratio)}%` : null} />
                <Stat label="3개월 검색 추세" value={fmtPercent(candidate.search_trend_3_month)} />
                <Stat label="검색 경쟁도" value={candidate.search_competition} />
                <Stat label="쇼핑 클릭지수" value={fmtNumber(candidate.shopping_click_index)} kind={candidate.shopping_source_kind} note={candidate.shopping_index_note} />
                <Stat label="쇼핑 3개월 추세" value={fmtPercent(candidate.shopping_trend_3_month)} />
                <Stat label="현재 후기 수" value={fmtNumber(candidate.current_review_count, '개')} kind={candidate.coupang_source_kind} />
                <Stat label="측정 기간" value={candidate.measurement_days === null || candidate.measurement_days === undefined ? null : `${candidate.measurement_days}일`} emptyLabel="기간 확인 필요" />
                <Stat label="후기 증가량" value={fmtNumber(candidate.review_increase, '개')} />
                <Stat label="30일 환산 증가량" value={fmtNumber(candidate.normalized_30_day_review_increase, '개')} emptyLabel="기간 확인 필요" />
                <Stat label="판매가격" value={fmtMoney(candidate.price)} />
                <Stat label="평점" value={hasValue(candidate.rating) ? `${Number(candidate.rating)}점` : null} />
                <Stat label="로켓배송" value={boolText(candidate.rocket_delivery)} />
                <Stat label="건당 예상 수익" value={fmtMoney(candidate.estimated_commission_amount)} />
                <Stat label="반품 위험도" value={candidate.return_risk} />
                <Stat label="판매자 안정성" value={candidate.seller_stability} />
                <Stat label="의료효능 과장 위험" value={candidate.medical_claim_risk} />
              </div>

              {(candidate.coupang_url || candidate.affiliate_url) && (
                <div style={{ display: 'flex', gap: 10, marginTop: 12, flexWrap: 'wrap', fontSize: 12 }}>
                  {candidate.coupang_url && (
                    <a href={candidate.coupang_url} target="_blank" rel="noopener noreferrer nofollow" style={linkStyle}>
                      쿠팡 상품페이지 ↗
                    </a>
                  )}
                  {candidate.affiliate_url && (
                    <a href={candidate.affiliate_url} target="_blank" rel="noopener noreferrer nofollow" style={linkStyle}>
                      쿠팡파트너스 링크 ↗
                    </a>
                  )}
                </div>
              )}

              {candidate.admin_memo && (
                <div style={{
                  marginTop: 12, background: '#f8fafc', borderRadius: 9, padding: '9px 11px',
                  fontSize: 12, color: T.sub, whiteSpace: 'pre-wrap', lineHeight: 1.7,
                }}>
                  <strong style={{ color: T.text }}>메모</strong><br />{candidate.admin_memo}
                </div>
              )}
            </Card>

            {/* ─── 데이터 이력 ───────────────────────────────────────────── */}
            <Card>
              <SectionTitle right={
                <Button size="sm" variant="soft" onClick={() => setHistoryOpen(true)}>기록 추가</Button>
              }>
                데이터 이력 ({history.length}건)
              </SectionTitle>

              {history.length === 0 ? (
                <div style={{ fontSize: 12.5, color: T.muted, padding: '14px 0' }}>
                  아직 기록된 이력이 없습니다. &quot;기록 추가&quot;로 날짜별 수치를 남겨두면 추이를 볼 수 있습니다.
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                    {HISTORY_FIELDS.map((f) => (
                      <button
                        key={f.key}
                        type="button"
                        onClick={() => setChartField(f.key)}
                        style={{
                          padding: '4px 10px', fontSize: 11.5, fontWeight: chartField === f.key ? 800 : 600,
                          borderRadius: 7, cursor: 'pointer', fontFamily: 'inherit',
                          border: `1px solid ${chartField === f.key ? T.primary : T.primaryBorder}`,
                          background: chartField === f.key ? T.primary : '#fff',
                          color: chartField === f.key ? '#fff' : T.sub,
                        }}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>

                  <div style={{ background: '#fbfcff', borderRadius: 10, padding: '10px 12px', marginBottom: 12 }}>
                    <Sparkline points={chartPoints} unit={chartMeta.unit} height={110} width={640} />
                  </div>

                  <ReviewDelta history={history} />

                  <div style={{ overflowX: 'auto', border: `1px solid ${T.border}`, borderRadius: 10 }}>
                    <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: 620, fontSize: 12 }}>
                      <thead>
                        <tr style={{ background: '#f8fafc' }}>
                          <th style={hCell}>기록일</th>
                          {HISTORY_FIELDS.map((f) => <th key={f.key} style={hCell}>{f.label}</th>)}
                          <th style={hCell}>메모</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[...history].reverse().map((h) => (
                          <tr key={h.id} style={{ borderTop: `1px solid ${T.borderSoft}` }}>
                            <td style={{ ...bCell, fontWeight: 700 }}>{fmtDate(h.recorded_at)}</td>
                            {HISTORY_FIELDS.map((f) => (
                              <td key={f.key} style={{ ...bCell, textAlign: 'right' }}>
                                {hasValue(h[f.key]) ? fmtNumber(h[f.key], f.unit) : <Empty />}
                              </td>
                            ))}
                            <td style={bCell}>{h.memo || ''}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </Card>

            {/* ─── 데이터 출처 ───────────────────────────────────────────── */}
            <Card>
              <SectionTitle>데이터 출처 ({sources.length}건)</SectionTitle>
              <SourceForm
                candidateId={id}
                authFetch={authFetch}
                onAdded={(s) => { setSources((prev) => [s, ...prev]); flash('출처를 추가했습니다.'); }}
              />

              {sources.length === 0 ? (
                <div style={{ fontSize: 12.5, color: T.muted, padding: '14px 0' }}>
                  등록된 출처가 없습니다. 숫자와 함께 어디서 확인했는지 반드시 남겨주세요.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
                  {sources.map((s) => (
                    <div key={s.id} style={{
                      border: `1px solid ${T.border}`, borderRadius: 10, padding: '10px 12px',
                      display: 'flex', gap: 10, alignItems: 'flex-start', flexWrap: 'wrap',
                    }}>
                      <Badge bg="#eff6ff" fg="#1d4ed8">
                        {DATA_TYPES.find((d) => d.key === s.data_type)?.label ?? s.data_type}
                      </Badge>
                      <div style={{ flex: 1, minWidth: 180 }}>
                        <div style={{ fontSize: 12.5, fontWeight: 700, color: T.text }}>
                          {s.source_name || '출처명 미입력'}
                        </div>
                        <div style={{ fontSize: 11, color: T.muted, marginTop: 2, display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                          <EstimatedBadge kind={s.source_kind} />
                          {s.checked_at && <span>확인일 {fmtDate(s.checked_at)}</span>}
                          {s.created_by && <span>· {s.created_by}</span>}
                        </div>
                        {s.memo && <div style={{ fontSize: 11.5, color: T.sub, marginTop: 4 }}>{s.memo}</div>}
                        <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                          {s.source_url && <a href={s.source_url} target="_blank" rel="noopener noreferrer nofollow" style={linkStyle}>원본 ↗</a>}
                          {s.evidence_image_url && <a href={s.evidence_image_url} target="_blank" rel="noopener noreferrer nofollow" style={linkStyle}>증빙 이미지 ↗</a>}
                        </div>
                      </div>
                      <Button
                        size="sm" variant="danger"
                        onClick={async () => {
                          const res = await authFetch(`/api/admin/product-research/${id}/sources?sourceId=${s.id}`, { method: 'DELETE' });
                          if (res.ok) setSources((prev) => prev.filter((x) => x.id !== s.id));
                        }}
                      >삭제</Button>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* ─── 작업 이력 ─────────────────────────────────────────────── */}
            {audit.length > 0 && (
              <Card>
                <SectionTitle>관리자 작업 이력</SectionTitle>
                <ul style={{ margin: 0, paddingLeft: 16, fontSize: 11.5, color: T.sub, lineHeight: 1.9 }}>
                  {audit.slice(0, 12).map((a) => (
                    <li key={a.id}>
                      <span style={{ color: T.muted }}>{String(a.created_at).slice(0, 16).replace('T', ' ')}</span>
                      {' · '}<strong>{AUDIT_LABELS[a.action] ?? a.action}</strong>
                      {a.actor && <span style={{ color: T.muted }}> · {a.actor}</span>}
                    </li>
                  ))}
                </ul>
              </Card>
            )}
          </div>
        )}
      </div>

      <CandidateFormModal
        open={editOpen}
        initial={candidate}
        settings={settings}
        onClose={() => setEditOpen(false)}
        onSubmit={handleUpdate}
      />
      <FinalCandidateModal
        open={finalOpen}
        candidateId={id}
        onClose={() => setFinalOpen(false)}
        onDone={() => { setFinalOpen(false); flash('최종 후보로 지정했습니다.'); load(); }}
        authFetch={authFetch}
      />
      <HistoryRecordModal
        open={historyOpen}
        candidate={candidate}
        onClose={() => setHistoryOpen(false)}
        onSaved={() => { setHistoryOpen(false); flash('데이터 기록을 추가했습니다.'); load(); }}
        authFetch={authFetch}
      />
    </div>
  );
}

// ─── 조각들 ──────────────────────────────────────────────────────────────────

const AUDIT_LABELS = {
  create: '후보 생성',
  update: '후보 수정',
  delete: '후보 삭제',
  status_change: '상태 변경',
  score_recalculate: '점수 재계산',
  final_candidate: '최종 후보 변경',
  csv_import: 'CSV 가져오기',
  history_add: '데이터 기록 추가',
};

function boolText(v) {
  if (v === null || v === undefined) return null;
  return v ? '적용' : '미적용';
}

function Stat({ label, value, kind, note, emptyLabel = '미입력' }) {
  return (
    <div style={{ background: '#fafbfd', borderRadius: 9, padding: '9px 11px' }}>
      <div style={{ fontSize: 10.5, color: T.muted, fontWeight: 700, marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 13.5, fontWeight: 800, color: T.text }}>
        {hasValue(value) ? value : <Empty label={emptyLabel} />}
      </div>
      {kind && <div style={{ marginTop: 4 }}><EstimatedBadge kind={kind} /></div>}
      {note && <div style={{ fontSize: 10, color: T.muted, marginTop: 3, lineHeight: 1.5 }}>{note}</div>}
    </div>
  );
}

/** 후기 수 이력에서 최근 증가량을 계산해 보여준다 */
function ReviewDelta({ history }) {
  const points = history.filter((h) => hasValue(h.review_count));
  if (points.length < 2) return null;

  const last = points[points.length - 1];
  const prev = points[points.length - 2];
  const days = Math.round(
    (new Date(`${String(last.recorded_at).slice(0, 10)}T00:00:00Z`) -
     new Date(`${String(prev.recorded_at).slice(0, 10)}T00:00:00Z`)) / 86400000
  );
  const delta = Number(last.review_count) - Number(prev.review_count);
  const normalized = days > 0 ? Math.round((delta / days) * 30) : null;

  return (
    <div style={{
      background: '#eff6ff', border: '1px solid #dbeafe', borderRadius: 9,
      padding: '9px 12px', marginBottom: 12, fontSize: 12, color: '#1e40af', lineHeight: 1.7,
    }}>
      {fmtDate(prev.recorded_at)}: 후기 {Number(prev.review_count).toLocaleString('ko-KR')}개 →{' '}
      {fmtDate(last.recorded_at)}: 후기 {Number(last.review_count).toLocaleString('ko-KR')}개
      {' · '}
      {days > 0
        ? <>{days}일 증가량 {delta.toLocaleString('ko-KR')}개 · 30일 환산 {normalized.toLocaleString('ko-KR')}개</>
        : <span style={{ color: T.warnFg }}>측정 간격이 0일이라 환산하지 않습니다 (기간 확인 필요)</span>}
    </div>
  );
}

function SourceForm({ candidateId, authFetch, onAdded }) {
  const [form, setForm] = useState({
    data_type: 'search', source_name: null, source_kind: null,
    source_url: null, checked_at: null, evidence_image_url: null, memo: null,
  });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const set = (k) => (v) => setForm((p) => ({ ...p, [k]: v }));

  const submit = async () => {
    setBusy(true); setErr('');
    try {
      const res = await authFetch(`/api/admin/product-research/${candidateId}/sources`, {
        method: 'POST', body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '저장에 실패했습니다.');
      onAdded(data.source);
      setForm({ data_type: 'search', source_name: null, source_kind: null, source_url: null, checked_at: null, evidence_image_url: null, memo: null });
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ background: '#fbfcff', border: `1px solid ${T.primaryBorder}`, borderRadius: 10, padding: 12 }}>
      <FieldGrid min={150}>
        <Field label="데이터 종류">
          <Select
            value={form.data_type} onChange={set('data_type')} placeholder="선택"
            options={DATA_TYPES.map((d) => ({ value: d.key, label: d.label }))}
          />
        </Field>
        <Field label="출처명">
          <Select value={form.source_name} onChange={set('source_name')} options={SOURCE_NAMES} />
        </Field>
        <Field label="데이터 성격 *" hint="공식 수치와 추정치를 구분합니다">
          <Select value={form.source_kind} onChange={set('source_kind')} options={SOURCE_KINDS} />
        </Field>
        <Field label="확인일"><DateInput value={form.checked_at} onChange={set('checked_at')} /></Field>
        <Field label="원본 URL" span={2}><TextInput value={form.source_url} onChange={set('source_url')} /></Field>
        <Field label="증빙 이미지 URL" span={2}><TextInput value={form.evidence_image_url} onChange={set('evidence_image_url')} /></Field>
        <Field label="비고" span={2}><TextInput value={form.memo} onChange={set('memo')} /></Field>
      </FieldGrid>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10 }}>
        {err && <span style={{ fontSize: 11.5, color: T.danger, fontWeight: 600 }}>{err}</span>}
        <div style={{ flex: 1 }} />
        <Button variant="primary" size="sm" onClick={submit} disabled={busy || !form.source_kind}>
          {busy ? '저장 중…' : '출처 추가'}
        </Button>
      </div>
    </div>
  );
}

const linkStyle = { fontSize: 11.5, color: T.primary, fontWeight: 700, textDecoration: 'none' };
const hCell = { padding: '8px 9px', textAlign: 'left', fontSize: 11, color: T.sub, borderBottom: `1px solid ${T.border}`, whiteSpace: 'nowrap' };
const bCell = { padding: '8px 9px', verticalAlign: 'middle', whiteSpace: 'nowrap' };
