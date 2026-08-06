/**
 * 입력 검증 — 화면(모달)과 API 라우트가 같은 규칙을 쓴다.
 * errors 는 저장을 막고, warnings 는 저장은 되지만 경고를 보여준다.
 */

import { hasValue, toNumber, calcMeasurementDays, daysSince } from './calc.js';
import { COMPETITION_LEVELS, LEVEL_3, STATUSES, STALE_DAYS } from './constants.js';

export function isValidUrl(value) {
  if (!hasValue(value)) return true; // 미입력은 통과
  try {
    const u = new URL(String(value));
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

function checkNonNegativeInt(errors, field, label, value) {
  if (!hasValue(value)) return;
  const n = toNumber(value);
  if (n === null) errors.push({ field, message: `${label}은(는) 숫자여야 합니다.` });
  else if (n < 0) errors.push({ field, message: `${label}은(는) 0 이상이어야 합니다.` });
  else if (!Number.isInteger(n)) errors.push({ field, message: `${label}은(는) 정수여야 합니다.` });
}

function checkRange(errors, field, label, value, min, max) {
  if (!hasValue(value)) return;
  const n = toNumber(value);
  if (n === null) errors.push({ field, message: `${label}은(는) 숫자여야 합니다.` });
  else if (n < min || n > max) errors.push({ field, message: `${label}은(는) ${min}~${max} 범위여야 합니다.` });
}

function checkEnum(errors, field, label, value, allowed) {
  if (!hasValue(value)) return;
  if (!allowed.includes(String(value))) {
    errors.push({ field, message: `${label}은(는) ${allowed.join(' / ')} 중 하나여야 합니다.` });
  }
}

function checkUrl(errors, field, label, value) {
  if (!isValidUrl(value)) errors.push({ field, message: `${label} 형식이 올바르지 않습니다. (http/https)` });
}

/**
 * 후보 1건 검증
 * @returns {{ errors: Array<{field,message}>, warnings: Array<{field,message}> }}
 */
export function validateCandidate(candidate, { now = new Date() } = {}) {
  const errors = [];
  const warnings = [];
  const c = candidate || {};

  if (!hasValue(c.product_name)) errors.push({ field: 'product_name', message: '제품명은 필수입니다.' });
  if (!hasValue(c.primary_keyword)) errors.push({ field: 'primary_keyword', message: '대표 키워드는 필수입니다.' });

  checkEnum(errors, 'status', '상태', c.status, STATUSES);

  // 검색량 — 0 이상의 정수
  checkNonNegativeInt(errors, 'pc_monthly_search', 'PC 월간 검색량', c.pc_monthly_search);
  checkNonNegativeInt(errors, 'mobile_monthly_search', '모바일 월간 검색량', c.mobile_monthly_search);
  checkNonNegativeInt(errors, 'total_monthly_search', '월간 총검색량', c.total_monthly_search);
  checkNonNegativeInt(errors, 'related_product_count', '관련 상품 수', c.related_product_count);
  checkNonNegativeInt(errors, 'review_count', '후기 총수', c.review_count);

  // 비율 — 0~100
  checkRange(errors, 'age_25_54_ratio', '25~54세 비중', c.age_25_54_ratio, 0, 100);
  checkRange(errors, 'shopping_mobile_ratio', '모바일 비중', c.shopping_mobile_ratio, 0, 100);
  checkRange(errors, 'average_click_rate', '월평균 클릭률', c.average_click_rate, 0, 100);
  checkRange(errors, 'estimated_commission_rate', '예상 제휴 수수료율', c.estimated_commission_rate, 0, 100);

  // 평점 — 0~5
  checkRange(errors, 'rating', '평점', c.rating, 0, 5);

  // 가격 — 0 이상
  for (const [field, label] of [['price', '판매가격'], ['estimated_price', '예상 상품가격']]) {
    if (hasValue(c[field])) {
      const n = toNumber(c[field]);
      if (n === null) errors.push({ field, message: `${label}은(는) 숫자여야 합니다.` });
      else if (n < 0) errors.push({ field, message: `${label}은(는) 0 이상이어야 합니다.` });
    }
  }

  // 후기 수 — 음수 불가
  checkNonNegativeInt(errors, 'current_review_count', '현재 후기 수', c.current_review_count);
  checkNonNegativeInt(errors, 'previous_review_count', '이전 측정 후기 수', c.previous_review_count);

  // 측정 기간
  if (hasValue(c.measurement_start_date) && hasValue(c.measurement_end_date)) {
    const days = calcMeasurementDays(c.measurement_start_date, c.measurement_end_date);
    if (days === null) {
      errors.push({ field: 'measurement_end_date', message: '측정 종료일은 시작일보다 빠를 수 없습니다.' });
    } else if (days === 0) {
      warnings.push({ field: 'measurement_end_date', message: '측정 기간이 0일입니다. 30일 환산 증가량을 계산하지 않습니다. (기간 확인 필요)' });
    }
  }

  // enum
  checkEnum(errors, 'search_competition', '검색 경쟁도', c.search_competition, COMPETITION_LEVELS);
  checkEnum(errors, 'ad_competition', '검색광고 경쟁 정도', c.ad_competition, COMPETITION_LEVELS);
  checkEnum(errors, 'seller_stability', '판매자 안정성', c.seller_stability, LEVEL_3);
  checkEnum(errors, 'return_risk', '반품 위험도', c.return_risk, LEVEL_3);
  checkEnum(errors, 'product_page_stability', '상품 페이지 안정성', c.product_page_stability, LEVEL_3);
  checkEnum(errors, 'sureline_relevance', 'sureline 관련성', c.sureline_relevance, LEVEL_3);
  checkEnum(errors, 'medical_claim_risk', '의료효능 과장 위험', c.medical_claim_risk, LEVEL_3);

  // URL
  checkUrl(errors, 'coupang_url', '쿠팡 상품 URL', c.coupang_url);
  checkUrl(errors, 'affiliate_url', '쿠팡파트너스 URL', c.affiliate_url);
  checkUrl(errors, 'image_url', '대표 이미지 URL', c.image_url);

  // 경고 — 오래된 데이터
  const age = daysSince(c.last_checked_at, now);
  if (age !== null && age >= STALE_DAYS) {
    warnings.push({ field: 'last_checked_at', message: `최종 확인일이 ${age}일 지났습니다. 데이터 갱신이 필요합니다.` });
  }

  // 경고 — 추정치 구분 미기재
  if (hasValue(c.shopping_click_index) && !hasValue(c.shopping_source_kind)) {
    warnings.push({ field: 'shopping_source_kind', message: '쇼핑 클릭지수의 데이터 성격(공식/지수/추정)이 지정되지 않았습니다.' });
  }
  if (hasValue(c.total_monthly_search) && !hasValue(c.search_source_kind)) {
    warnings.push({ field: 'search_source_kind', message: '검색량의 데이터 성격(공식/지수/추정)이 지정되지 않았습니다.' });
  }

  return { errors, warnings };
}

/**
 * 최종 후보 지정 전 점검 — 지정은 가능하지만 경고를 보여준다.
 */
export function checkFinalCandidateReadiness(candidate, scoreResult, { now = new Date() } = {}) {
  const warnings = [];
  const c = candidate || {};

  const missing = (scoreResult?.breakdown || []).filter((b) => b.missing).map((b) => b.name);
  if (missing.length) warnings.push(`데이터 미입력 평가항목: ${missing.join(', ')}`);

  const age = daysSince(c.last_checked_at, now);
  if (age === null) warnings.push('최종 확인일이 입력되지 않았습니다.');
  else if (age >= STALE_DAYS) warnings.push(`최종 확인일이 ${age}일 지났습니다. (${STALE_DAYS}일 이상 경과)`);

  if (!hasValue(c.affiliate_url)) warnings.push('쿠팡파트너스 URL이 입력되지 않았습니다.');
  if (c.direct_purchase_possible !== true) warnings.push('직접 구매 가능 여부가 "예"로 확인되지 않았습니다.');
  if (c.direct_review_possible !== true) warnings.push('직접 사용 후기 작성 가능 여부가 "예"로 확인되지 않았습니다.');
  if (c.medical_claim_risk === '높음') warnings.push('의료효능 과장 위험이 "높음"으로 표시돼 있습니다.');
  if (!hasValue(c.medical_claim_risk)) warnings.push('의료효능 과장 위험이 평가되지 않았습니다.');

  return warnings;
}
