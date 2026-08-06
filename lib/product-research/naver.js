/**
 * 네이버 검색광고 API 클라이언트
 *
 * 서버에서만 호출한다 (환경변수 사용). 응답을 우리 컬럼으로 옮기는 부분은
 * 순수 함수로 분리해 단위 테스트가 가능하게 했다.
 */

import crypto from 'node:crypto';
import { toNumber, hasValue } from './calc.js';

const SEARCHAD_BASE = 'https://api.searchad.naver.com';
const KEYWORDSTOOL_PATH = '/keywordstool';

export function hasSearchAdEnv() {
  return Boolean(
    process.env.NAVER_AD_API_KEY &&
    process.env.NAVER_AD_SECRET_KEY &&
    process.env.NAVER_AD_CUSTOMER_ID
  );
}

/** 검색광고 API 서명 헤더 — HMAC-SHA256(비밀키, "타임스탬프.메서드.경로") base64 */
export function buildSearchAdHeaders(method, path) {
  const timestamp = Date.now().toString();
  const signature = crypto
    .createHmac('sha256', process.env.NAVER_AD_SECRET_KEY)
    .update(`${timestamp}.${method}.${path}`)
    .digest('base64');

  return {
    'X-Timestamp': timestamp,
    'X-API-KEY': process.env.NAVER_AD_API_KEY,
    'X-Customer': process.env.NAVER_AD_CUSTOMER_ID,
    'X-Signature': signature,
  };
}

/** 키워드 도구 호출 — 연관 키워드 목록을 그대로 돌려준다 */
export async function fetchKeywordTool(keyword, { timeoutMs = 10000 } = {}) {
  const hint = encodeURIComponent(normalizeKeyword(keyword));
  const res = await fetch(
    `${SEARCHAD_BASE}${KEYWORDSTOOL_PATH}?hintKeywords=${hint}&showDetail=1`,
    {
      headers: buildSearchAdHeaders('GET', KEYWORDSTOOL_PATH),
      cache: 'no-store',
      signal: AbortSignal.timeout(timeoutMs),
    }
  );

  const text = await res.text();
  if (!res.ok) {
    const err = new Error(`네이버 검색광고 API 오류 (HTTP ${res.status}): ${text.slice(0, 300)}`);
    err.status = res.status;
    throw err;
  }
  return JSON.parse(text)?.keywordList ?? [];
}

// ─── 순수 변환부 (테스트 대상) ───────────────────────────────────────────────

/** 힌트 키워드는 공백을 빼서 보내는 것이 관례 */
export function normalizeKeyword(keyword) {
  return String(keyword ?? '').replace(/\s/g, '');
}

/**
 * 검색수 파싱.
 * 네이버는 10 미만이면 숫자 대신 "< 10" 문자열을 준다.
 * 0으로 두면 '측정값 0'과 구별이 안 되므로 9로 기록하고, 출처 메모에 사실을 남긴다.
 */
export function parseSearchCount(value) {
  if (!hasValue(value)) return null;
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  const s = String(value).trim();
  if (/^<\s*10$/.test(s)) return 9;
  return toNumber(s);
}

/** 연관 키워드 목록에서 정확히 일치하는 행을 찾는다 */
export function findExactRow(keywordList, keyword) {
  const target = normalizeKeyword(keyword).toUpperCase();
  return (keywordList || []).find(
    (row) => normalizeKeyword(row?.relKeyword).toUpperCase() === target
  ) ?? null;
}

/**
 * 검색광고 응답 1행 → 우리 컬럼
 * 값이 없으면 null 로 둔다 (0으로 만들지 않는다).
 */
export function mapKeywordToolRow(row) {
  if (!row) return {};

  const pcSearch = parseSearchCount(row.monthlyPcQcCnt);
  const moSearch = parseSearchCount(row.monthlyMobileQcCnt);
  const pcClicks = toNumber(row.monthlyAvePcClkCnt);
  const moClicks = toNumber(row.monthlyAveMobileClkCnt);
  const pcCtr = toNumber(row.monthlyAvePcCtr);
  const moCtr = toNumber(row.monthlyAveMobileCtr);

  const clickCount = pcClicks === null && moClicks === null
    ? null
    : round2((pcClicks ?? 0) + (moClicks ?? 0));

  const competition = hasValue(row.compIdx) ? String(row.compIdx) : null;

  return {
    pc_monthly_search: pcSearch,
    mobile_monthly_search: moSearch,
    average_click_count: clickCount,
    average_click_rate: weightedCtr(pcCtr, moCtr, pcSearch, moSearch),
    search_competition: competition,
    ad_competition: competition,
  };
}

/** PC·모바일 CTR 을 검색량으로 가중평균. 검색량을 모르면 단순평균 */
export function weightedCtr(pcCtr, moCtr, pcSearch, moSearch) {
  if (pcCtr === null && moCtr === null) return null;

  const totalSearch = (pcSearch ?? 0) + (moSearch ?? 0);
  if (totalSearch > 0) {
    return round2(((pcCtr ?? 0) * (pcSearch ?? 0) + (moCtr ?? 0) * (moSearch ?? 0)) / totalSearch);
  }
  const present = [pcCtr, moCtr].filter((v) => v !== null);
  return round2(present.reduce((a, b) => a + b, 0) / present.length);
}

function round2(n) {
  return Math.round(n * 100) / 100;
}

/** 10 미만이라 9로 기록된 값이 섞였는지 — 출처 메모에 남기기 위함 */
export function hasCensoredCount(row) {
  return [row?.monthlyPcQcCnt, row?.monthlyMobileQcCnt].some(
    (v) => typeof v === 'string' && /^<\s*10$/.test(v.trim())
  );
}
