/**
 * 파생값 계산 — null과 0을 엄격히 구분한다.
 * 계산에 필요한 입력이 하나라도 없으면 결과는 null 이다 (0이 아니다).
 */

/** 값이 실제로 입력됐는지 판단. 0은 '입력됨'이다. */
export function hasValue(v) {
  return v !== null && v !== undefined && v !== '' && !(typeof v === 'number' && Number.isNaN(v));
}

/** 숫자로 변환하되 미입력은 null 로 유지 */
export function toNumber(v) {
  if (!hasValue(v)) return null;
  if (typeof v === 'number') return Number.isNaN(v) ? null : v;
  const cleaned = String(v).replace(/,/g, '').replace(/\s/g, '').replace(/%$/, '');
  if (cleaned === '') return null;
  const n = Number(cleaned);
  return Number.isNaN(n) ? null : n;
}

/** '예', 'true', 'Y', '로켓배송' 등을 boolean 으로. 미입력은 null */
export function toBoolean(v) {
  if (!hasValue(v)) return null;
  if (typeof v === 'boolean') return v;
  const s = String(v).trim().toLowerCase();
  if (['true', 'y', 'yes', '1', 'o', '예', '있음', '해당'].includes(s)) return true;
  if (['false', 'n', 'no', '0', 'x', '아니오', '없음', '미해당'].includes(s)) return false;
  return null;
}

/**
 * 월간 총검색량 = PC + 모바일
 * 둘 다 미입력이면 null. 한쪽만 있으면 있는 쪽 값만 합산한다.
 */
export function calcTotalMonthlySearch(pc, mobile) {
  const p = toNumber(pc);
  const m = toNumber(mobile);
  if (p === null && m === null) return null;
  return (p ?? 0) + (m ?? 0);
}

/**
 * 측정 기간 일수 = 종료일 - 시작일
 * 날짜가 없거나 순서가 뒤집혔으면 null
 */
export function calcMeasurementDays(startDate, endDate) {
  if (!hasValue(startDate) || !hasValue(endDate)) return null;
  const s = new Date(`${String(startDate).slice(0, 10)}T00:00:00Z`);
  const e = new Date(`${String(endDate).slice(0, 10)}T00:00:00Z`);
  if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return null;
  const days = Math.round((e - s) / 86400000);
  if (days < 0) return null;
  return days;
}

/** 후기 증가량 = 현재 후기 수 - 이전 측정 후기 수 */
export function calcReviewIncrease(current, previous) {
  const c = toNumber(current);
  const p = toNumber(previous);
  if (c === null || p === null) return null;
  return c - p;
}

/**
 * 30일 환산 후기 증가량 = 증가량 ÷ 측정 기간 일수 × 30
 * 측정 기간이 0일이면 계산하지 않는다 ('기간 확인 필요').
 */
export function calcNormalized30DayReviewIncrease(increase, days) {
  const inc = toNumber(increase);
  const d = toNumber(days);
  if (inc === null || d === null || d <= 0) return null;
  return Math.round((inc / d) * 30 * 100) / 100;
}

/**
 * 건당 예상 수익 = 예상 상품가격 × (수수료율 ÷ 100)
 * 수수료율은 퍼센트로 입력받아 계산 시 소수로 변환한다.
 */
export function calcCommissionAmount(price, ratePercent) {
  const p = toNumber(price);
  const r = toNumber(ratePercent);
  if (p === null || r === null) return null;
  return Math.round(p * (r / 100) * 100) / 100;
}

/**
 * 후보 객체의 모든 파생값을 채워 새 객체로 반환한다.
 * total_monthly_search 는 관리자가 직접 넣은 값이 있으면 존중한다.
 */
export function applyDerivedFields(candidate, { respectManualTotal = true } = {}) {
  const c = { ...candidate };

  const autoTotal = calcTotalMonthlySearch(c.pc_monthly_search, c.mobile_monthly_search);
  if (!respectManualTotal || !hasValue(c.total_monthly_search)) {
    c.total_monthly_search = autoTotal;
  } else {
    c.total_monthly_search = toNumber(c.total_monthly_search);
  }

  c.measurement_days = calcMeasurementDays(c.measurement_start_date, c.measurement_end_date);
  c.review_increase = calcReviewIncrease(c.current_review_count, c.previous_review_count);
  c.normalized_30_day_review_increase = calcNormalized30DayReviewIncrease(
    c.review_increase,
    c.measurement_days
  );

  const priceForCommission = hasValue(c.estimated_price) ? c.estimated_price : c.price;
  c.estimated_commission_amount = calcCommissionAmount(priceForCommission, c.estimated_commission_rate);

  return c;
}

/** 마지막 확인일로부터 며칠 지났는지. 미입력이면 null */
export function daysSince(dateStr, now = new Date()) {
  if (!hasValue(dateStr)) return null;
  const d = new Date(`${String(dateStr).slice(0, 10)}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return null;
  const today = new Date(`${now.toISOString().slice(0, 10)}T00:00:00Z`);
  return Math.round((today - d) / 86400000);
}
