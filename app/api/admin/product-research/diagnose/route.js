import { NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/product-research/service.js';
import { hasSearchAdEnv, fetchKeywordTool, findExactRow } from '@/lib/product-research/naver.js';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/product-research/diagnose
 * 외부 API 키가 실제로 먹히는지 확인만 한다. 아무것도 저장하지 않는다.
 * 키 값은 절대 응답에 담지 않는다 — 존재 여부(boolean)만 노출한다.
 */

const TEST_KEYWORD = '버티컬 마우스';
const TIMEOUT_MS = 10000;

export async function GET(request) {
  const actor = await verifyAdmin(request);
  if (!actor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const env = {
    NAVER_AD_API_KEY: Boolean(process.env.NAVER_AD_API_KEY),
    NAVER_AD_SECRET_KEY: Boolean(process.env.NAVER_AD_SECRET_KEY),
    NAVER_AD_CUSTOMER_ID: Boolean(process.env.NAVER_AD_CUSTOMER_ID),
    NAVER_OPENAPI_CLIENT_ID: Boolean(process.env.NAVER_OPENAPI_CLIENT_ID),
    NAVER_OPENAPI_CLIENT_SECRET: Boolean(process.env.NAVER_OPENAPI_CLIENT_SECRET),
  };

  const checks = await Promise.all([
    checkSearchAd(),
    checkDatalabSearch(),
    checkDatalabShopping(),
  ]);

  return NextResponse.json({ env, checks, testedKeyword: TEST_KEYWORD });
}

// ─── 네이버 검색광고 (키워드 도구) ───────────────────────────────────────────

async function checkSearchAd() {
  const base = { id: 'naver_ad', name: '네이버 검색광고 키워드 도구' };

  if (!hasSearchAdEnv()) {
    return { ...base, ok: false, skipped: true, message: '환경변수 3개(API_KEY/SECRET_KEY/CUSTOMER_ID) 중 빠진 값이 있습니다.' };
  }

  try {
    const list = await fetchKeywordTool(TEST_KEYWORD, { timeoutMs: TIMEOUT_MS });
    const row = findExactRow(list, TEST_KEYWORD) ?? list[0];
    return {
      ...base,
      ok: true,
      status: 200,
      message: `정상 — ${list.length}개 연관 키워드 수신`,
      sample: row && {
        키워드: row.relKeyword,
        PC검색량: row.monthlyPcQcCnt,
        모바일검색량: row.monthlyMobileQcCnt,
        경쟁정도: row.compIdx,
      },
    };
  } catch (e) {
    return { ...base, ok: false, status: e.status, message: e.status ? hint401(e.status) : `요청 실패: ${e.message}`, body: truncate(e.message) };
  }
}

// ─── 네이버 데이터랩 — 검색어트렌드 ─────────────────────────────────────────

async function checkDatalabSearch() {
  const base = { id: 'datalab_search', name: '네이버 데이터랩 검색어트렌드' };
  const result = await callDatalab('/v1/datalab/search', {
    ...dateRange(),
    timeUnit: 'month',
    keywordGroups: [{ groupName: TEST_KEYWORD, keywords: [TEST_KEYWORD] }],
  });
  if (!result.ok) return { ...base, ...result };

  const points = result.data?.results?.[0]?.data ?? [];
  const last = points[points.length - 1];
  return {
    ...base,
    ok: true,
    status: result.status,
    message: `정상 — ${points.length}개 구간 수신`,
    sample: last && { 기간: last.period, 상대지수: last.ratio },
  };
}

// ─── 네이버 데이터랩 — 쇼핑인사이트 ─────────────────────────────────────────

async function checkDatalabShopping() {
  const base = { id: 'datalab_shopping', name: '네이버 데이터랩 쇼핑인사이트' };
  const result = await callDatalab('/v1/datalab/shopping/category/keywords', {
    ...dateRange(),
    timeUnit: 'month',
    category: '50000003', // 디지털/가전 (실제 catId 는 확인 후 조정)
    keyword: [{ name: TEST_KEYWORD, param: [TEST_KEYWORD] }],
  });
  if (!result.ok) {
    return {
      ...base,
      ...result,
      hint: result.status === 400
        ? '카테고리 코드(catId)가 맞지 않을 수 있습니다. 네이버 쇼핑에서 해당 카테고리 URL의 catId 를 확인하세요.'
        : undefined,
    };
  }

  const points = result.data?.results?.[0]?.data ?? [];
  const last = points[points.length - 1];
  return {
    ...base,
    ok: true,
    status: result.status,
    message: `정상 — ${points.length}개 구간 수신`,
    sample: last && { 기간: last.period, 상대지수: last.ratio },
  };
}

// ─── 공통 ────────────────────────────────────────────────────────────────────

async function callDatalab(path, body) {
  const id = process.env.NAVER_OPENAPI_CLIENT_ID;
  const secret = process.env.NAVER_OPENAPI_CLIENT_SECRET;

  if (!id || !secret) {
    return { ok: false, skipped: true, message: '환경변수 2개(CLIENT_ID/CLIENT_SECRET) 중 빠진 값이 있습니다.' };
  }

  try {
    const res = await fetch(`https://openapi.naver.com${path}`, {
      method: 'POST',
      headers: {
        'X-Naver-Client-Id': id,
        'X-Naver-Client-Secret': secret,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      cache: 'no-store',
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    const text = await res.text();
    if (!res.ok) {
      return { ok: false, status: res.status, message: hint401(res.status), body: truncate(text) };
    }
    return { ok: true, status: res.status, data: JSON.parse(text) };
  } catch (e) {
    return { ok: false, message: `요청 실패: ${e.message}` };
  }
}

/** 최근 3개월 (데이터랩은 2016-01-01 이후만 조회 가능) */
function dateRange() {
  const end = new Date();
  const start = new Date(end);
  start.setMonth(start.getMonth() - 3);
  return {
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
  };
}

function hint401(status) {
  if (status === 401) return '인증 실패 — 키 값 또는 서명이 틀렸습니다.';
  if (status === 403) return '권한 없음 — 이 API 사용이 허용되지 않은 계정/애플리케이션입니다.';
  if (status === 400) return '요청 형식 오류 — 파라미터를 확인해야 합니다.';
  if (status === 429) return '호출 한도 초과 — 잠시 후 다시 시도하세요.';
  return `HTTP ${status}`;
}

function truncate(text, max = 400) {
  const s = String(text ?? '');
  return s.length > max ? `${s.slice(0, max)}…` : s;
}
