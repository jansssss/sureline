/**
 * 직장인 관심제품 분석 — 순수 로직 단위 테스트
 * 의존성 없이 Node 내장 러너로 실행한다.
 *
 *   node --test scripts/test-product-research.mjs
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

import {
  hasValue, toNumber, toBoolean,
  calcTotalMonthlySearch, calcMeasurementDays, calcReviewIncrease,
  calcNormalized30DayReviewIncrease, calcCommissionAmount, applyDerivedFields,
} from '../lib/product-research/calc.js';
import { calculateScore, scoreAndRank } from '../lib/product-research/scoring.js';
import { validateCandidate } from '../lib/product-research/validation.js';
import { previewCsv, parseCsv, candidatesToCsv } from '../lib/product-research/csv.js';
import {
  resolveFinalCandidateChange, applyFinalCandidateChange, countFinalCandidates,
} from '../lib/product-research/final-candidate.js';
import {
  NotConnectedError, NaverKeywordProvider, ManualDataProvider, CsvImportProvider, PROVIDERS,
} from '../lib/product-research/providers.js';
import {
  mapKeywordToolRow, parseSearchCount, weightedCtr, findExactRow, hasCensoredCount,
  computeTrends, trendRange,
} from '../lib/product-research/naver.js';

// ─── 평가기준을 마이그레이션 SQL 에서 그대로 읽어온다 ────────────────────────
// 코드가 아니라 DB 가 기준값의 원본이므로, 테스트도 SQL 을 원본으로 삼는다.
const __dirname = dirname(fileURLToPath(import.meta.url));
const migration = (name) => readFileSync(resolve(__dirname, `../supabase/migrations/${name}`), 'utf8');

/** '(key, name, weight, order, {...}::jsonb)' 튜플을 파싱 */
function parseSettings(sql) {
  const re = /\(\s*'([a-z_]+)',\s*'([^']+)',\s*(\d+),\s*(\d+),\s*'(\{[\s\S]*?\})'::jsonb\s*\)/g;
  const out = [];
  let m;
  while ((m = re.exec(sql)) !== null) {
    out.push({
      criterion_key: m[1],
      criterion_name: m[2],
      weight: Number(m[3]),
      sort_order: Number(m[4]),
      scoring_rules: JSON.parse(m[5]),
      is_active: true,
    });
  }
  return out;
}

/** 004 = 전체 카탈로그(비활성 항목 포함). 점수 엔진의 규칙 타입 커버리지용 */
const ALL_SETTINGS = parseSettings(migration('004_product_research_seed.sql'));

/** 005 = 실제 운영 중인 활성 기준. 자동 수집 가능한 항목만 남겼다 */
const SETTINGS = parseSettings(migration('005_product_research_auto_only.sql'));

const DEACTIVATED = ['age_fit', 'coupang_signal', 'profitability'];

test('활성 평가기준은 4개이고 배점 합계가 100점이다', () => {
  assert.equal(SETTINGS.length, 4);
  assert.equal(SETTINGS.reduce((a, s) => a + s.weight, 0), 100);
});

test('자동 수집이 불가능한 항목은 활성 기준에서 빠져 있다', () => {
  const activeKeys = SETTINGS.map((s) => s.criterion_key);
  for (const key of DEACTIVATED) {
    assert.equal(activeKeys.includes(key), false, `${key} 는 비활성이어야 한다`);
  }
  assert.deepEqual(activeKeys, ['search_volume', 'trend', 'competition', 'shopping_interest']);
});

test('비활성 항목도 카탈로그(004)에는 남아 있어 언제든 되살릴 수 있다', () => {
  const catalogKeys = ALL_SETTINGS.map((s) => s.criterion_key);
  for (const key of DEACTIVATED) assert.ok(catalogKeys.includes(key));
  assert.equal(ALL_SETTINGS.length, 7);
});

test('is_active=false 인 항목은 점수 계산에서 아예 제외된다', () => {
  const withInactive = ALL_SETTINGS.map((s) => ({ ...s, is_active: !DEACTIVATED.includes(s.criterion_key) }));
  const result = calculateScore({ total_monthly_search: 50000 }, withInactive);
  assert.equal(result.breakdown.length, 4);
  assert.equal(result.maxTotal, 65); // 004 배점 기준 활성 4개 합
});

// ─── null / 0 구분 ───────────────────────────────────────────────────────────

test('hasValue 는 0을 입력값으로 인정하고 null/빈문자열은 미입력으로 본다', () => {
  assert.equal(hasValue(0), true);
  assert.equal(hasValue(false), true);
  assert.equal(hasValue(null), false);
  assert.equal(hasValue(undefined), false);
  assert.equal(hasValue(''), false);
  assert.equal(hasValue(NaN), false);
});

test('toNumber 는 콤마·퍼센트를 벗겨내고 미입력은 null 로 둔다', () => {
  assert.equal(toNumber('12,345'), 12345);
  assert.equal(toNumber('15%'), 15);
  assert.equal(toNumber(0), 0);
  assert.equal(toNumber(''), null);
  assert.equal(toNumber(null), null);
  assert.equal(toNumber('abc'), null);
});

test('toBoolean 은 Y/N·예/아니오를 인식하고 미입력은 null 이다', () => {
  assert.equal(toBoolean('Y'), true);
  assert.equal(toBoolean('아니오'), false);
  assert.equal(toBoolean(''), null);
  assert.equal(toBoolean(null), null);
});

// ─── 총검색량 계산 ───────────────────────────────────────────────────────────

test('총검색량 = PC + 모바일', () => {
  assert.equal(calcTotalMonthlySearch(1200, 8800), 10000);
});

test('총검색량 — 한쪽만 있으면 있는 쪽만 합산, 둘 다 없으면 null', () => {
  assert.equal(calcTotalMonthlySearch(1200, null), 1200);
  assert.equal(calcTotalMonthlySearch(null, 900), 900);
  assert.equal(calcTotalMonthlySearch(null, null), null);
});

test('총검색량 — 0은 유효한 값이라 null 이 되지 않는다', () => {
  assert.equal(calcTotalMonthlySearch(0, 0), 0);
});

test('applyDerivedFields 는 관리자가 직접 넣은 총검색량을 존중한다', () => {
  const manual = applyDerivedFields({ pc_monthly_search: 100, mobile_monthly_search: 200, total_monthly_search: 999 });
  assert.equal(manual.total_monthly_search, 999);

  const auto = applyDerivedFields({ pc_monthly_search: 100, mobile_monthly_search: 200, total_monthly_search: null });
  assert.equal(auto.total_monthly_search, 300);
});

// ─── 후기 증가량 · 30일 환산 ─────────────────────────────────────────────────

test('후기 증가량 = 현재 - 이전', () => {
  assert.equal(calcReviewIncrease(4101, 4012), 89);
});

test('후기 증가량 — 한쪽이라도 미입력이면 null (0이 아니다)', () => {
  assert.equal(calcReviewIncrease(4101, null), null);
  assert.equal(calcReviewIncrease(null, 4012), null);
});

test('30일 환산 = 증가량 ÷ 일수 × 30', () => {
  assert.equal(calcNormalized30DayReviewIncrease(89, 7), 381.43);
});

test('30일 환산 — 측정 기간이 0일이면 계산하지 않는다', () => {
  assert.equal(calcNormalized30DayReviewIncrease(89, 0), null);
  assert.equal(calcNormalized30DayReviewIncrease(89, null), null);
});

test('측정 기간 일수 — 종료일이 시작일보다 빠르면 null', () => {
  assert.equal(calcMeasurementDays('2026-08-06', '2026-08-13'), 7);
  assert.equal(calcMeasurementDays('2026-08-13', '2026-08-06'), null);
  assert.equal(calcMeasurementDays('2026-08-06', '2026-08-06'), 0);
  assert.equal(calcMeasurementDays(null, '2026-08-13'), null);
});

test('applyDerivedFields — 후기 파생값 일괄 계산', () => {
  const c = applyDerivedFields({
    current_review_count: 4101,
    previous_review_count: 4012,
    measurement_start_date: '2026-08-06',
    measurement_end_date: '2026-08-13',
  });
  assert.equal(c.measurement_days, 7);
  assert.equal(c.review_increase, 89);
  assert.equal(c.normalized_30_day_review_increase, 381.43);
});

// ─── 예상 수익 ───────────────────────────────────────────────────────────────

test('건당 예상 수익 = 가격 × (수수료율 ÷ 100)', () => {
  assert.equal(calcCommissionAmount(30000, 3), 900);
  assert.equal(calcCommissionAmount(45900, 2.5), 1147.5);
});

test('예상 수익 — 입력이 없으면 null', () => {
  assert.equal(calcCommissionAmount(30000, null), null);
  assert.equal(calcCommissionAmount(null, 3), null);
});

test('예상 수익 — 예상 상품가격이 있으면 그것을 우선 사용한다', () => {
  const a = applyDerivedFields({ price: 10000, estimated_price: 50000, estimated_commission_rate: 3 });
  assert.equal(a.estimated_commission_amount, 1500);

  const b = applyDerivedFields({ price: 10000, estimated_commission_rate: 3 });
  assert.equal(b.estimated_commission_amount, 300);
});

// ─── 항목별 점수 ─────────────────────────────────────────────────────────────

/** 현재 운영 기준(005)으로 채점 */
function scoreOf(candidate) {
  const r = calculateScore(applyDerivedFields(candidate), SETTINGS);
  const by = Object.fromEntries(r.breakdown.map((b) => [b.key, b]));
  return { result: r, by };
}

/** 전체 카탈로그(004)로 채점 — 비활성 항목의 규칙 타입까지 검증하기 위함 */
function scoreOfCatalog(candidate) {
  const r = calculateScore(applyDerivedFields(candidate), ALL_SETTINGS);
  const by = Object.fromEntries(r.breakdown.map((b) => [b.key, b]));
  return { result: r, by };
}

test('월간 검색수 구간별 점수 (45점 기준)', () => {
  const cases = [[500, 5], [1500, 14], [5000, 27], [15000, 38], [50000, 45]];
  for (const [value, expected] of cases) {
    const { by } = scoreOf({ total_monthly_search: value });
    assert.equal(by.search_volume.score, expected, `${value}회 → ${expected}점`);
  }
});

test('최근 관심도 상승률 구간별 점수 (25점 기준)', () => {
  const cases = [[-35, 0], [-8, 7], [0, 12], [5, 17], [20, 22], [45, 25]];
  for (const [value, expected] of cases) {
    const { by } = scoreOf({ search_trend_3_month: value });
    assert.equal(by.trend.score, expected, `${value}% → ${expected}점`);
  }
});

test('경쟁도는 낮을수록 높은 점수를 받는다 (20점 기준)', () => {
  const levels = ['매우 낮음', '낮음', '중간', '높음', '매우 높음'];
  const scores = levels.map((lv) => scoreOf({ search_competition: lv }).by.competition.score);
  assert.deepEqual(scores, [20, 16, 12, 6, 0]);
  for (let i = 1; i < scores.length; i += 1) {
    assert.ok(scores[i] < scores[i - 1], '경쟁도가 높아질수록 점수가 낮아져야 한다');
  }
});

test('쇼핑 관심도는 클릭지수와 증감률을 합산한다 (10점 기준)', () => {
  const { by } = scoreOf({ shopping_click_index: 85, shopping_trend_3_month: 15 });
  assert.equal(by.shopping_interest.score, 10);
  assert.equal(by.shopping_interest.max, 10);
});

// ─── 비활성 항목 — 되살렸을 때 정상 동작하는지 (엔진 규칙 타입 커버리지) ────

test('[카탈로그] 25~54세 적합도 구간별 점수', () => {
  const cases = [[30, 3], [50, 7], [60, 10], [70, 13], [82, 15]];
  for (const [value, expected] of cases) {
    const { by } = scoreOfCatalog({ age_25_54_ratio: value });
    assert.equal(by.age_fit.score, expected);
  }
});

test('[카탈로그] 쿠팡 판매 신호는 후기 증가·평점·로켓배송·베스트 노출을 합산한다', () => {
  const { by } = scoreOfCatalog({
    current_review_count: 4200,
    previous_review_count: 4000,   // 30일 환산 200개 → 9점
    measurement_start_date: '2026-07-06',
    measurement_end_date: '2026-08-05',
    rating: 4.6,                   // 2점
    rocket_delivery: true,         // 2점
    category_best: true,           // 2점
  });
  assert.equal(by.coupang_signal.score, 15);
  assert.equal(by.coupang_signal.max, 15);
});

test('[카탈로그] 쿠팡 판매 신호 — 세부 항목이 모두 미입력이면 미입력으로 표시된다', () => {
  const { by } = scoreOfCatalog({ product_name: 'x' });
  assert.equal(by.coupang_signal.score, 0);
  assert.equal(by.coupang_signal.missing, true);
});

test('[카탈로그] 수익성·안정성 세부 배점 합계는 5점을 넘지 않는다', () => {
  const { by } = scoreOfCatalog({
    price: 39000, estimated_commission_rate: 10,  // 3,900원
    seller_stability: '높음', return_risk: '낮음',
    product_page_stability: '높음', direct_review_possible: true,
    sureline_relevance: '높음',
  });
  assert.equal(by.profitability.max, 5);
  assert.equal(by.profitability.score, 5);
});

// ─── null 처리 ───────────────────────────────────────────────────────────────

test('null 은 0점 처리하되 실제 0 입력과 구별해서 missing 으로 표시한다', () => {
  const nullCase = scoreOf({ total_monthly_search: null }).by.search_volume;
  assert.equal(nullCase.score, 0);
  assert.equal(nullCase.missing, true);
  assert.match(nullCase.reason, /미입력/);

  const zeroCase = scoreOf({ total_monthly_search: 0 }).by.search_volume;
  assert.equal(zeroCase.score, 5);       // 실제 0 은 '1,000회 미만' 구간
  assert.equal(zeroCase.missing, false);
});

test('추세 0%(보합)은 미입력과 다르게 12점을 받는다', () => {
  assert.equal(scoreOf({ search_trend_3_month: 0 }).by.trend.score, 12);
  assert.equal(scoreOf({ search_trend_3_month: null }).by.trend.score, 0);
  assert.equal(scoreOf({ search_trend_3_month: null }).by.trend.missing, true);
});

// ─── 총점 ────────────────────────────────────────────────────────────────────

test('총점 = 항목별 점수의 합이고 100점을 넘지 않는다', () => {
  const { result } = scoreOf({
    total_monthly_search: 15000,      // 38
    search_trend_3_month: 20,         // 22
    search_competition: '낮음',        // 16
    shopping_click_index: 45,         // 4
    shopping_trend_3_month: 12,       // 3  → 쇼핑 7
    // 아래 값들은 비활성 항목이라 점수에 반영되지 않는다
    age_25_54_ratio: 82,
    rating: 4.6,
    rocket_delivery: true,
  });

  const sum = result.breakdown.reduce((a, b) => a + b.score, 0);
  assert.equal(result.total, Math.round(sum * 100) / 100);
  assert.equal(result.total, 38 + 22 + 16 + 7);
  assert.ok(result.total <= 100);
  assert.equal(result.maxTotal, 100);
  assert.equal(result.missingCount, 0);
});

test('자동 수집만으로 얻을 수 있는 최대 점수는 90점이다 (쇼핑 10점은 미연결)', () => {
  const { result } = scoreOf({
    total_monthly_search: 50000,      // 45
    search_trend_3_month: 45,         // 25
    search_competition: '매우 낮음',   // 20
  });
  assert.equal(result.total, 90);
  assert.equal(result.missingCount, 1);          // 쇼핑 관심도만 미입력
  assert.equal(result.evaluatedMax, 90);
});

test('완전 미입력 후보의 총점은 0이고 활성 항목 전부가 missing 이다', () => {
  const { result } = scoreOf({ product_name: '버티컬 마우스', primary_keyword: '버티컬 마우스' });
  assert.equal(result.total, 0);
  assert.equal(result.missingCount, 4);
  assert.equal(result.evaluatedMax, 0);
});

test('scoreAndRank 는 점수 내림차순으로 순위를 매긴다', () => {
  const ranked = scoreAndRank([
    { id: 1, product_name: 'A', total_monthly_search: 500 },
    { id: 2, product_name: 'B', total_monthly_search: 50000 },
    { id: 3, product_name: 'C', total_monthly_search: 5000 },
  ], SETTINGS);
  assert.deepEqual(ranked.map((c) => c.id), [2, 3, 1]);
  assert.deepEqual(ranked.map((c) => c.rank), [1, 2, 3]);
});

test('배점을 바꾸면 점수도 따라 바뀐다 (기준이 DB에 있다는 전제)', () => {
  const lowered = SETTINGS.map((s) => (s.criterion_key === 'search_volume' ? { ...s, weight: 10 } : s));
  const base = calculateScore({ total_monthly_search: 50000 }, SETTINGS);
  const changed = calculateScore({ total_monthly_search: 50000 }, lowered);
  assert.equal(base.breakdown.find((b) => b.key === 'search_volume').score, 45);
  assert.equal(changed.breakdown.find((b) => b.key === 'search_volume').score, 10); // weight 로 clamp
});

// ─── 검증 ────────────────────────────────────────────────────────────────────

test('필수값 누락은 오류다', () => {
  const { errors } = validateCandidate({});
  assert.ok(errors.some((e) => e.field === 'product_name'));
  assert.ok(errors.some((e) => e.field === 'primary_keyword'));
});

test('날짜 검증 — 종료일이 시작일보다 빠르면 오류', () => {
  const { errors } = validateCandidate({
    product_name: 'A', primary_keyword: 'A',
    measurement_start_date: '2026-08-13', measurement_end_date: '2026-08-06',
  });
  assert.ok(errors.some((e) => e.field === 'measurement_end_date'));
});

test('측정 기간 0일은 오류가 아니라 경고다', () => {
  const { errors, warnings } = validateCandidate({
    product_name: 'A', primary_keyword: 'A',
    measurement_start_date: '2026-08-06', measurement_end_date: '2026-08-06',
  });
  assert.equal(errors.length, 0);
  assert.ok(warnings.some((w) => /기간 확인 필요/.test(w.message)));
});

test('범위 검증 — 비율 0~100, 평점 0~5, 검색량·가격 0 이상', () => {
  const bad = validateCandidate({
    product_name: 'A', primary_keyword: 'A',
    age_25_54_ratio: 120, rating: 6, price: -1,
    pc_monthly_search: -5, estimated_commission_rate: 150,
  }).errors.map((e) => e.field);

  assert.ok(bad.includes('age_25_54_ratio'));
  assert.ok(bad.includes('rating'));
  assert.ok(bad.includes('price'));
  assert.ok(bad.includes('pc_monthly_search'));
  assert.ok(bad.includes('estimated_commission_rate'));
});

test('검색량은 정수여야 한다', () => {
  const { errors } = validateCandidate({ product_name: 'A', primary_keyword: 'A', pc_monthly_search: 12.5 });
  assert.ok(errors.some((e) => e.field === 'pc_monthly_search'));
});

test('URL 형식 검증', () => {
  const { errors } = validateCandidate({
    product_name: 'A', primary_keyword: 'A',
    coupang_url: 'not-a-url', affiliate_url: 'https://link.coupang.com/a/abc',
  });
  assert.ok(errors.some((e) => e.field === 'coupang_url'));
  assert.ok(!errors.some((e) => e.field === 'affiliate_url'));
});

test('30일 이상 지난 확인일은 경고를 만든다', () => {
  const old = new Date('2026-06-01');
  const { warnings } = validateCandidate(
    { product_name: 'A', primary_keyword: 'A', last_checked_at: '2026-06-01' },
    { now: new Date('2026-08-06') }
  );
  assert.ok(warnings.some((w) => w.field === 'last_checked_at'));
  assert.ok(old instanceof Date);
});

// ─── 최종 후보 단일 유지 ─────────────────────────────────────────────────────

test('최종 후보 지정 시 기존 최종 후보는 해제되고 분석 완료로 바뀐다', () => {
  const list = [
    { id: 1, product_name: 'A', is_final_candidate: true, status: '최종 후보' },
    { id: 2, product_name: 'B', is_final_candidate: false, status: '분석 완료' },
    { id: 3, product_name: 'C', is_final_candidate: false, status: '조사 중' },
  ];
  const next = applyFinalCandidateChange(list, 2);

  assert.equal(countFinalCandidates(next), 1);
  assert.equal(next.find((c) => c.id === 2).is_final_candidate, true);
  assert.equal(next.find((c) => c.id === 2).status, '최종 후보');
  assert.equal(next.find((c) => c.id === 1).is_final_candidate, false);
  assert.equal(next.find((c) => c.id === 1).status, '분석 완료');
  assert.equal(next.find((c) => c.id === 3).status, '조사 중');
});

test('이미 최종 후보인 제품을 다시 지정해도 1개가 유지된다', () => {
  const list = [{ id: 1, is_final_candidate: true, status: '최종 후보' }];
  assert.equal(countFinalCandidates(applyFinalCandidateChange(list, 1)), 1);
  assert.equal(resolveFinalCandidateChange(list, 1).releases.length, 0);
});

test('존재하지 않는 id 를 지정하면 아무것도 바뀌지 않는다', () => {
  const list = [{ id: 1, is_final_candidate: true, status: '최종 후보' }];
  assert.deepEqual(applyFinalCandidateChange(list, 99), list);
});

// ─── CSV ─────────────────────────────────────────────────────────────────────

test('CSV 파서는 따옴표·콤마·줄바꿈을 처리한다', () => {
  const rows = parseCsv('a,b\n"1,000","he said ""hi"""\n');
  assert.deepEqual(rows, [['a', 'b'], ['1,000', 'he said "hi"']]);
});

test('CSV 미리보기 — 정상 행과 오류 행을 구분한다', () => {
  const csv = [
    'product_name,primary_keyword,pc_monthly_search,mobile_monthly_search,rating,competition_level',
    '버티컬 마우스,버티컬 마우스,1200,8800,4.5,낮음',
    ',키워드만,100,200,4.5,낮음',
    '평점오류,평점오류,100,200,9,낮음',
  ].join('\n');

  const preview = previewCsv(csv, []);
  assert.equal(preview.rows.length, 3);
  assert.equal(preview.validCount, 1);
  assert.equal(preview.errorCount, 2);
  assert.equal(preview.rows[0].data.total_monthly_search, 10000);
  assert.equal(preview.rows[0].data.search_competition, '낮음');
});

test('CSV — 제품명 + 대표 키워드가 같으면 중복 후보로 경고한다', () => {
  const csv = 'product_name,primary_keyword\n버티컬 마우스,버티컬 마우스\n';
  const preview = previewCsv(csv, [{ product_name: '버티컬 마우스', primary_keyword: '버티컬 마우스' }]);
  assert.equal(preview.rows[0].valid, true);
  assert.equal(preview.rows[0].duplicate, true);
  assert.ok(preview.rows[0].warnings.some((w) => /중복/.test(w.message)));
});

test('CSV — 필수 컬럼이 없으면 전체를 거부한다', () => {
  const preview = previewCsv('foo,bar\n1,2\n', []);
  assert.match(preview.fatal, /필수 컬럼/);
});

test('CSV 내보내기 — 콤마가 든 값은 따옴표로 감싸고 빈 값은 빈칸으로 둔다', () => {
  const csv = candidatesToCsv([
    { product_name: '마우스, 무선', primary_keyword: '무선마우스', price: 29900, rating: null, rocket_delivery: true },
  ]);
  assert.ok(csv.includes('"마우스, 무선"'));
  assert.ok(csv.includes('29900'));
  assert.ok(csv.startsWith('﻿'));   // 엑셀 호환 BOM

  const dataLine = csv.trim().split('\r\n')[1];
  const ratingIndex = csv.trim().split('\r\n')[0].replace('﻿', '').split(',').indexOf('rating');
  assert.equal(parseCsv(dataLine)[0][ratingIndex], '');   // null 은 0이 아니라 빈칸
});

// ─── 프로바이더 ──────────────────────────────────────────────────────────────

// ─── 네이버 검색광고 응답 변환 ───────────────────────────────────────────────

test('검색광고 응답 1행을 우리 컬럼으로 옮긴다', () => {
  const mapped = mapKeywordToolRow({
    relKeyword: '버티컬마우스',
    monthlyPcQcCnt: 15800,
    monthlyMobileQcCnt: 14200,
    monthlyAvePcClkCnt: 30.5,
    monthlyAveMobileClkCnt: 12.1,
    monthlyAvePcCtr: 0.21,
    monthlyAveMobileCtr: 0.09,
    compIdx: '중간',
  });

  assert.equal(mapped.pc_monthly_search, 15800);
  assert.equal(mapped.mobile_monthly_search, 14200);
  assert.equal(mapped.average_click_count, 42.6);
  assert.equal(mapped.search_competition, '중간');
  assert.equal(mapped.ad_competition, '중간');

  // 총검색량은 파생 계산에 맡긴다
  const derived = applyDerivedFields(mapped, { respectManualTotal: false });
  assert.equal(derived.total_monthly_search, 30000);
});

test('검색광고 경쟁도 값은 우리 경쟁도 등급과 그대로 맞물린다', () => {
  for (const level of ['낮음', '중간', '높음']) {
    const mapped = mapKeywordToolRow({ compIdx: level });
    const { errors } = validateCandidate({ product_name: 'A', primary_keyword: 'A', ...mapped });
    assert.equal(errors.length, 0, `${level} 이 검증을 통과해야 한다`);
  }
});

test('검색량 "< 10" 은 0이 아니라 9로 기록한다', () => {
  assert.equal(parseSearchCount('< 10'), 9);
  assert.equal(parseSearchCount('<10'), 9);
  assert.equal(parseSearchCount('1,200'), 1200);
  assert.equal(parseSearchCount(0), 0);
  assert.equal(parseSearchCount(null), null);
  assert.equal(parseSearchCount(''), null);
});

test('CTR 은 검색량으로 가중평균한다', () => {
  // PC 0.2%(검색 100) + 모바일 0.4%(검색 300) → (0.2*100 + 0.4*300) / 400 = 0.35
  assert.equal(weightedCtr(0.2, 0.4, 100, 300), 0.35);
  // 검색량을 모르면 단순평균
  assert.equal(weightedCtr(0.2, 0.4, null, null), 0.3);
  // 둘 다 없으면 null
  assert.equal(weightedCtr(null, null, 100, 300), null);
});

test('연관 키워드 목록에서 공백을 무시하고 정확히 일치하는 행만 고른다', () => {
  const list = [
    { relKeyword: '마우스' },
    { relKeyword: '버티컬마우스' },
    { relKeyword: '버티컬마우스추천' },
  ];
  assert.equal(findExactRow(list, '버티컬 마우스').relKeyword, '버티컬마우스');
  assert.equal(findExactRow(list, '없는키워드'), null);
});

test('10 미만 검열 값이 섞였는지 감지한다 (출처 메모에 남기기 위함)', () => {
  assert.equal(hasCensoredCount({ monthlyPcQcCnt: '< 10', monthlyMobileQcCnt: 120 }), true);
  assert.equal(hasCensoredCount({ monthlyPcQcCnt: 800, monthlyMobileQcCnt: 120 }), false);
});

// ─── 데이터랩 검색어트렌드 ───────────────────────────────────────────────────

const monthly = (ratios) =>
  ratios.map((ratio, i) => ({ period: `2025-${String(i + 1).padStart(2, '0')}-01`, ratio }));

test('3개월 추세 = 최근 3개월 평균 대비 직전 3개월 평균', () => {
  // 직전 3개월 평균 10, 최근 3개월 평균 15 → +50%
  const { search_trend_3_month } = computeTrends(monthly([10, 10, 10, 15, 15, 15]));
  assert.equal(search_trend_3_month, 50);
});

test('12개월 추세는 12개 구간이 있을 때만 계산한다', () => {
  const short = computeTrends(monthly([10, 10, 10, 12, 12, 12]));
  assert.equal(short.search_trend_12_month, null);

  const full = computeTrends(monthly([
    20, 20, 20, 25, 25, 25, 30, 30, 30, 40, 40, 40,
  ]));
  assert.equal(full.search_trend_12_month, 100);   // 20 → 40
  assert.equal(full.search_trend_3_month, Math.round(((40 / 30) - 1) * 1000) / 10);
});

test('추세 — 구간이 모자라거나 기준이 0이면 0%가 아니라 null', () => {
  assert.equal(computeTrends(monthly([10, 12])).search_trend_3_month, null);
  assert.equal(computeTrends(monthly([0, 0, 0, 5, 5, 5])).search_trend_3_month, null);
  assert.equal(computeTrends([]).search_trend_3_month, null);
});

test('추세 — 하락도 그대로 음수로 잡는다', () => {
  const { search_trend_3_month } = computeTrends(monthly([100, 100, 100, 75, 75, 75]));
  assert.equal(search_trend_3_month, -25);
});

test('추세 조회 구간은 이번 달을 빼고 완결된 12개월을 잡는다', () => {
  const { startDate, endDate } = trendRange(new Date('2026-08-06T00:00:00Z'));
  assert.equal(endDate, '2026-07-31');   // 지난달 말일
  assert.equal(startDate, '2025-08-01'); // 12개월 전 1일
});

test('자동수집 대상은 네이버 검색·쇼핑뿐 — 쿠팡 프로바이더는 없다', () => {
  assert.deepEqual(
    PROVIDERS.map((p) => p.id),
    ['manual', 'csv', 'naver_keyword', 'naver_search_trend', 'naver_shopping_insight', 'google_trends']
  );
  assert.equal(PROVIDERS.some((p) => /coupang/i.test(p.id)), false);
});

test('미연결 프로바이더는 가짜 데이터를 반환하지 않고 오류를 던진다', async () => {
  assert.equal(NaverKeywordProvider.connected, false);
  await assert.rejects(() => NaverKeywordProvider.fetchKeywordMetrics('버티컬 마우스'), NotConnectedError);
});

test('ManualDataProvider 와 CsvImportProvider 만 실제로 동작한다', async () => {
  assert.equal(ManualDataProvider.connected, true);
  assert.equal(CsvImportProvider.connected, true);

  const rows = await CsvImportProvider.fetchKeywordMetrics(null, {
    csvText: 'product_name,primary_keyword,pc_monthly_search,mobile_monthly_search\n폼롤러,폼롤러,1000,2000\n',
  });
  assert.equal(rows.length, 1);
  assert.equal(rows[0].total_monthly_search, 3000);
});
