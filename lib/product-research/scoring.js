/**
 * 100점 평가 시스템
 *
 * 배점과 구간은 코드가 아니라 DB(product_research_score_settings)가 원본이다.
 * 이 파일은 그 규칙을 해석해서 점수를 계산하는 순수 함수만 갖는다.
 *
 * 규칙 타입
 *  - bands       : 구간표. 위에서부터 첫 매치 (min/max 는 포함 경계, 생략 시 무한)
 *  - map         : 값 → 점수 사전 (경쟁도 등)
 *  - boolean     : true 면 points
 *  - any_boolean : fields 중 하나라도 true 면 points
 *  - composite   : parts 의 합. 각 part 는 위 타입 중 하나
 *
 * null 은 0점으로 계산하되 '미입력'으로 표시한다. 실제 0 입력과 혼동하지 않도록
 * 결과에 missing 플래그와 사유를 함께 담는다.
 */

import { hasValue, toNumber, toBoolean } from './calc.js';

function matchBand(bands, value) {
  for (const band of bands || []) {
    const min = hasValue(band.min) ? Number(band.min) : -Infinity;
    const max = hasValue(band.max) ? Number(band.max) : Infinity;
    if (value >= min && value <= max) return band;
  }
  return null;
}

function formatValue(value, unit) {
  if (!hasValue(value)) return '미입력';
  if (typeof value === 'boolean') return value ? '예' : '아니오';
  if (typeof value === 'number') {
    const s = Number.isInteger(value) ? value.toLocaleString('ko-KR') : String(value);
    return unit ? `${s}${unit}` : s;
  }
  return String(value);
}

function readField(candidate, rule) {
  let raw = candidate?.[rule.field];
  if (!hasValue(raw) && rule.fallbackField) raw = candidate?.[rule.fallbackField];
  return raw;
}

/** 단일 규칙(part 또는 criterion) 평가 → { score, max, missing, value, reason } */
function evaluateRule(candidate, rule, maxPoints) {
  const max = hasValue(rule.max) ? Number(rule.max) : maxPoints;

  if (rule.type === 'bands') {
    const raw = readField(candidate, rule);
    const value = toNumber(raw);
    if (value === null) {
      return { score: 0, max, missing: true, value: null, reason: '미입력 — 0점 처리' };
    }
    const band = matchBand(rule.bands, value);
    if (!band) {
      return {
        score: 0, max, missing: false, value,
        reason: `${formatValue(value, rule.unit)} — 해당 구간 없음 (기준 설정 확인 필요)`,
      };
    }
    const score = Math.max(0, Math.min(Number(band.points) || 0, max));
    return {
      score, max, missing: false, value,
      reason: `${formatValue(value, rule.unit)} → ${band.label || '구간'} ${score}점`,
    };
  }

  if (rule.type === 'map') {
    const raw = readField(candidate, rule);
    if (!hasValue(raw)) {
      return { score: 0, max, missing: true, value: null, reason: '미입력 — 0점 처리' };
    }
    const key = String(raw);
    if (!(key in (rule.map || {}))) {
      return { score: 0, max, missing: false, value: raw, reason: `"${key}" — 정의되지 않은 값` };
    }
    const score = Math.max(0, Math.min(Number(rule.map[key]) || 0, max));
    const hint = rule.lowerIsBetter ? ' (낮을수록 유리)' : '';
    return { score, max, missing: false, value: raw, reason: `${key} → ${score}점${hint}` };
  }

  if (rule.type === 'boolean') {
    const raw = readField(candidate, rule);
    const value = toBoolean(raw);
    if (value === null) {
      return { score: 0, max, missing: true, value: null, reason: '미입력 — 0점 처리' };
    }
    const score = value ? Math.max(0, Math.min(Number(rule.points) || 0, max)) : 0;
    return { score, max, missing: false, value, reason: `${value ? '해당' : '미해당'} → ${score}점` };
  }

  if (rule.type === 'any_boolean') {
    const fields = rule.fields || [];
    const values = fields.map((f) => toBoolean(candidate?.[f]));
    if (values.every((v) => v === null)) {
      return { score: 0, max, missing: true, value: null, reason: '미입력 — 0점 처리' };
    }
    const any = values.some((v) => v === true);
    const score = any ? Math.max(0, Math.min(Number(rule.points) || 0, max)) : 0;
    return { score, max, missing: false, value: any, reason: `${any ? '노출됨' : '노출 없음'} → ${score}점` };
  }

  if (rule.type === 'composite') {
    const parts = (rule.parts || []).map((part) => {
      const r = evaluateRule(candidate, part, part.max ?? 0);
      return { key: part.key, name: part.name || part.key, ...r };
    });
    const rawSum = parts.reduce((acc, p) => acc + p.score, 0);
    const score = Math.max(0, Math.min(round2(rawSum), max));
    const missing = parts.length > 0 && parts.every((p) => p.missing);
    return {
      score,
      max,
      missing,
      value: null,
      parts,
      reason: missing
        ? '모든 세부 항목 미입력 — 0점 처리'
        : parts.map((p) => `${p.name} ${round2(p.score)}/${p.max}`).join(' · '),
    };
  }

  return { score: 0, max, missing: true, value: null, reason: `알 수 없는 규칙 타입: ${rule.type}` };
}

function round2(n) {
  return Math.round(n * 100) / 100;
}

/**
 * 후보 1건의 종합점수 계산
 * @param {object} candidate  파생값이 이미 채워진 후보 (applyDerivedFields 결과 권장)
 * @param {Array}  settings   product_research_score_settings 행 배열
 * @returns {{ total:number, maxTotal:number, evaluatedMax:number, missingCount:number, breakdown:Array }}
 */
export function calculateScore(candidate, settings) {
  const active = (settings || [])
    .filter((s) => s.is_active !== false)
    .slice()
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

  const breakdown = active.map((s) => {
    const weight = Number(s.weight) || 0;
    const rules = typeof s.scoring_rules === 'string' ? JSON.parse(s.scoring_rules) : s.scoring_rules;
    const result = evaluateRule(candidate, rules || {}, weight);
    return {
      key: s.criterion_key,
      name: s.criterion_name,
      score: round2(Math.min(result.score, weight)),
      max: weight,
      missing: result.missing,
      value: result.value,
      reason: result.reason,
      parts: result.parts,
    };
  });

  const total = round2(breakdown.reduce((acc, b) => acc + b.score, 0));
  const maxTotal = round2(breakdown.reduce((acc, b) => acc + b.max, 0));
  const evaluatedMax = round2(
    breakdown.filter((b) => !b.missing).reduce((acc, b) => acc + b.max, 0)
  );

  return {
    total,
    maxTotal,
    evaluatedMax,
    missingCount: breakdown.filter((b) => b.missing).length,
    breakdown,
  };
}

/** 목록 전체 재계산 후 점수 내림차순 정렬 */
export function scoreAndRank(candidates, settings) {
  const scored = (candidates || []).map((c) => {
    const result = calculateScore(c, settings);
    return { ...c, total_score: result.total, score_result: result };
  });
  scored.sort((a, b) => (b.total_score ?? -1) - (a.total_score ?? -1));
  return scored.map((c, i) => ({ ...c, rank: i + 1 }));
}
