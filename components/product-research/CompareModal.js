'use client';
/**
 * 제품 비교 (최대 5개)
 * 각 항목에서 가장 유리한 값을 시각적으로 구분한다.
 * 경쟁도·반품 위험은 낮은 값이 유리하다.
 */
import { useMemo } from 'react';
import { Modal, Button, Badge, Empty, T } from './ui';
import { COMPETITION_LEVELS } from '@/lib/product-research/constants.js';
import { hasValue } from '@/lib/product-research/calc.js';
import { fmtNumber, fmtPercent, fmtMoney } from '@/lib/product-research/format.js';

/** 각 행: value(비교용 숫자), display(표시), lowerIsBetter */
const ROWS = [
  {
    label: '월간 검색량',
    get: (c) => c.total_monthly_search,
    display: (c) => fmtNumber(c.total_monthly_search, '회'),
  },
  {
    label: '모바일 검색 비중',
    get: (c) => mobileRatio(c),
    display: (c) => (mobileRatio(c) === null ? null : `${mobileRatio(c).toFixed(1)}%`),
  },
  {
    label: '최근 3개월 상승률',
    get: (c) => c.search_trend_3_month,
    display: (c) => fmtPercent(c.search_trend_3_month),
  },
  {
    label: '쇼핑 클릭 관심도',
    get: (c) => c.shopping_click_index,
    display: (c) => fmtNumber(c.shopping_click_index),
  },
  {
    label: '검색 경쟁도',
    lowerIsBetter: true,
    get: (c) => {
      const i = COMPETITION_LEVELS.indexOf(String(c.search_competition));
      return i === -1 ? null : i;
    },
    display: (c) => c.search_competition,
    note: '낮을수록 유리',
  },
  {
    label: '판매가격',
    get: () => null, // 유불리를 단정하지 않는다
    display: (c) => fmtMoney(c.price),
  },
  {
    label: '로켓배송',
    get: (c) => (c.rocket_delivery === null || c.rocket_delivery === undefined ? null : (c.rocket_delivery ? 1 : 0)),
    display: (c) => (c.rocket_delivery === null || c.rocket_delivery === undefined ? null : (c.rocket_delivery ? '적용' : '미적용')),
  },
  {
    label: '종합점수',
    get: (c) => c.total_score,
    display: (c) => (hasValue(c.total_score) ? `${Number(c.total_score)}점` : null),
    strong: true,
  },
];

function mobileRatio(c) {
  const pc = hasValue(c.pc_monthly_search) ? Number(c.pc_monthly_search) : null;
  const mo = hasValue(c.mobile_monthly_search) ? Number(c.mobile_monthly_search) : null;
  if (pc === null || mo === null) return null;
  const total = pc + mo;
  if (total === 0) return null;
  return (mo / total) * 100;
}

export default function CompareModal({ open, candidates, onClose }) {
  const summary = useMemo(() => buildSummary(candidates), [candidates]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`제품 비교 (${candidates.length}개)`}
      subtitle="입력된 데이터만으로 비교합니다. 미입력 항목은 비교에서 제외됩니다."
      width={1000}
      footer={<Button variant="primary" onClick={onClose}>닫기</Button>}
    >
      <div style={{ overflowX: 'auto', border: `1px solid ${T.border}`, borderRadius: 10 }}>
        <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: 640, fontSize: 12.5 }}>
          <thead>
            <tr style={{ background: '#f8fafc' }}>
              <th style={{ ...th, position: 'sticky', left: 0, background: '#f8fafc', zIndex: 1, minWidth: 130 }}>항목</th>
              {candidates.map((c) => (
                <th key={c.id} style={{ ...th, minWidth: 130 }}>
                  <div style={{ fontWeight: 800, color: T.text }}>{c.product_name}</div>
                  <div style={{ fontWeight: 500, color: T.muted, fontSize: 11 }}>{c.primary_keyword}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => {
              const values = candidates.map(row.get);
              const nums = values.filter((v) => hasValue(v) && !Number.isNaN(Number(v))).map(Number);
              const best = nums.length > 1
                ? (row.lowerIsBetter ? Math.min(...nums) : Math.max(...nums))
                : null;

              return (
                <tr key={row.label} style={{ borderTop: `1px solid ${T.borderSoft}` }}>
                  <td style={{ ...td, position: 'sticky', left: 0, background: '#fff', fontWeight: 700, color: T.sub }}>
                    {row.label}
                    {row.note && <div style={{ fontSize: 10, color: T.muted, fontWeight: 500 }}>{row.note}</div>}
                  </td>
                  {candidates.map((c, i) => {
                    const display = row.display(c);
                    const isBest = best !== null && hasValue(values[i]) && Number(values[i]) === best;
                    return (
                      <td key={c.id} style={{
                        ...td,
                        background: isBest ? '#ecfdf5' : undefined,
                        fontWeight: row.strong || isBest ? 800 : 500,
                        color: row.strong ? T.text : T.sub,
                      }}>
                        {hasValue(display) ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                            {display}
                            {isBest && <Badge bg="#d1fae5" fg="#065f46" icon="▲">최적</Badge>}
                          </span>
                        ) : <Empty />}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div style={{
        marginTop: 14, background: '#f4f7ff', border: `1px solid ${T.primaryBorder}`,
        borderRadius: 10, padding: '12px 14px', fontSize: 12.5, color: T.text, lineHeight: 1.7,
      }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: T.primary, marginBottom: 4 }}>비교 요약</div>
        {summary}
      </div>
    </Modal>
  );
}

/** 실제 점수 결과로 요약 문구를 동적 생성 */
function buildSummary(candidates) {
  const scored = candidates.filter((c) => hasValue(c.total_score));
  if (scored.length === 0) {
    return '아직 점수가 계산된 후보가 없습니다. 조사 데이터를 입력한 뒤 "점수 다시 계산"을 실행하세요.';
  }

  const top = [...scored].sort((a, b) => Number(b.total_score) - Number(a.total_score))[0];
  const breakdown = top.score_breakdown?.breakdown ?? [];
  const evaluated = breakdown.filter((b) => !b.missing && b.max > 0);

  const base = `현재 입력된 데이터 기준으로 ${top.product_name} 제품이 종합점수 ${Number(top.total_score)}점으로 가장 높습니다.`;

  if (evaluated.length === 0) {
    return `${base} 다만 평가항목 대부분이 미입력 상태라 비교 신뢰도가 낮습니다.`;
  }

  const ranked = [...evaluated].sort((a, b) => (b.score / b.max) - (a.score / a.max));
  const strong = ranked.slice(0, 2).map((b) => b.name);
  const weakest = ranked[ranked.length - 1];
  const searchItem = evaluated.find((b) => b.key === 'search_volume');

  let second = '';
  if (searchItem && !strong.includes(searchItem.name) && strong.length > 0) {
    second = ` ${searchItem.name}보다 ${strong.join('과(와) ')}에서 상대적으로 높은 평가를 받았습니다.`;
  } else if (strong.length > 0) {
    second = ` ${strong.join('과(와) ')}에서 가장 높은 평가를 받았습니다.`;
  }

  const third = weakest && weakest.score / weakest.max < 0.5
    ? ` 반면 ${weakest.name}은(는) ${weakest.score}/${weakest.max}점으로 낮아 보완이 필요합니다.`
    : '';

  const missing = breakdown.filter((b) => b.missing).map((b) => b.name);
  const fourth = missing.length ? ` (미입력 항목: ${missing.join(', ')})` : '';

  return `${base}${second}${third}${fourth}`;
}

const th = { padding: '9px 10px', textAlign: 'left', fontSize: 11.5, color: T.sub, borderBottom: `1px solid ${T.border}` };
const td = { padding: '9px 10px', textAlign: 'left', verticalAlign: 'middle' };
