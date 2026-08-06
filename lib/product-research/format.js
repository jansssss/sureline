/**
 * 화면 표시 헬퍼
 * null 을 0으로 보여주지 않는다 — 값이 없으면 null 을 돌려주고,
 * 화면 쪽 <Empty> 배지가 '미입력' / '확인 필요'로 표시한다.
 */

import { hasValue } from './calc.js';

export function fmtNumber(v, unit = '') {
  if (!hasValue(v)) return null;
  const n = Number(v);
  if (Number.isNaN(n)) return null;
  const s = Number.isInteger(n)
    ? n.toLocaleString('ko-KR')
    : n.toLocaleString('ko-KR', { maximumFractionDigits: 2 });
  return unit ? `${s}${unit}` : s;
}

export function fmtPercent(v) {
  if (!hasValue(v)) return null;
  const n = Number(v);
  if (Number.isNaN(n)) return null;
  const sign = n > 0 ? '+' : '';
  return `${sign}${n.toLocaleString('ko-KR', { maximumFractionDigits: 1 })}%`;
}

export function fmtMoney(v) {
  const s = fmtNumber(v);
  return s === null ? null : `${s}원`;
}

export function fmtDate(v) {
  if (!hasValue(v)) return null;
  const s = String(v).slice(0, 10);
  const [y, m, d] = s.split('-');
  if (!y || !m || !d) return s;
  return `${y}.${Number(m)}.${Number(d)}`;
}
