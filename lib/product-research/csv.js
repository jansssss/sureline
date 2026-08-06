/**
 * CSV 가져오기 / 내보내기 (의존성 없는 순수 구현)
 * 따옴표 이스케이프, 줄바꿈 포함 필드, BOM 을 처리한다.
 */

import {
  CSV_COLUMNS, CSV_TO_DB, CSV_COLUMN_TYPES, CSV_REQUIRED,
  COMPETITION_LEVELS, LEVEL_3,
} from './constants.js';
import { hasValue, toNumber, toBoolean, applyDerivedFields } from './calc.js';
import { validateCandidate } from './validation.js';

// ─── 파싱 ────────────────────────────────────────────────────────────────────

/** CSV 문자열 → 2차원 배열 */
export function parseCsv(text) {
  const src = String(text ?? '').replace(/^﻿/, '');
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  let i = 0;

  while (i < src.length) {
    const ch = src[i];
    if (inQuotes) {
      if (ch === '"') {
        if (src[i + 1] === '"') { field += '"'; i += 2; continue; }
        inQuotes = false; i += 1; continue;
      }
      field += ch; i += 1; continue;
    }
    if (ch === '"') { inQuotes = true; i += 1; continue; }
    if (ch === ',') { row.push(field); field = ''; i += 1; continue; }
    if (ch === '\r') { i += 1; continue; }
    if (ch === '\n') { row.push(field); rows.push(row); row = []; field = ''; i += 1; continue; }
    field += ch; i += 1;
  }
  row.push(field);
  rows.push(row);

  // 완전히 빈 줄 제거
  return rows.filter((r) => r.some((cell) => String(cell).trim() !== ''));
}

/** 헤더 행을 CSV_COLUMNS 에 매핑. 알 수 없는 헤더는 null */
export function mapHeaders(headerRow) {
  const known = new Set(CSV_COLUMNS);
  return (headerRow || []).map((h) => {
    const key = String(h || '').trim().toLowerCase().replace(/\s+/g, '_');
    return known.has(key) ? key : null;
  });
}

function coerce(type, raw) {
  const v = typeof raw === 'string' ? raw.trim() : raw;
  if (!hasValue(v)) return { value: null };

  switch (type) {
    case 'text':
      return { value: String(v) };
    case 'text[]':
      return { value: String(v).split(/[;|]/).map((s) => s.trim()).filter(Boolean) };
    case 'int': {
      const n = toNumber(v);
      if (n === null) return { error: '숫자 형식이 아닙니다' };
      if (n < 0) return { error: '0 이상이어야 합니다' };
      if (!Number.isInteger(n)) return { error: '정수여야 합니다' };
      return { value: n };
    }
    case 'number': {
      const n = toNumber(v);
      if (n === null) return { error: '숫자 형식이 아닙니다' };
      return { value: n };
    }
    case 'money': {
      const n = toNumber(v);
      if (n === null) return { error: '숫자 형식이 아닙니다' };
      if (n < 0) return { error: '0 이상이어야 합니다' };
      return { value: n };
    }
    case 'ratio': {
      const n = toNumber(v);
      if (n === null) return { error: '숫자 형식이 아닙니다' };
      if (n < 0 || n > 100) return { error: '0~100 범위여야 합니다' };
      return { value: n };
    }
    case 'rating': {
      const n = toNumber(v);
      if (n === null) return { error: '숫자 형식이 아닙니다' };
      if (n < 0 || n > 5) return { error: '0~5 범위여야 합니다' };
      return { value: n };
    }
    case 'bool': {
      const b = toBoolean(v);
      if (b === null) return { error: 'Y/N 또는 true/false 로 입력하세요' };
      return { value: b };
    }
    case 'date': {
      const s = String(v).slice(0, 10);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return { error: 'YYYY-MM-DD 형식이어야 합니다' };
      if (Number.isNaN(new Date(`${s}T00:00:00Z`).getTime())) return { error: '존재하지 않는 날짜입니다' };
      return { value: s };
    }
    case 'url': {
      try {
        const u = new URL(String(v));
        if (u.protocol !== 'http:' && u.protocol !== 'https:') return { error: 'http/https URL 이어야 합니다' };
        return { value: String(v) };
      } catch { return { error: 'URL 형식이 올바르지 않습니다' }; }
    }
    case 'enum:competition':
      if (!COMPETITION_LEVELS.includes(String(v))) return { error: `${COMPETITION_LEVELS.join('/')} 중 하나여야 합니다` };
      return { value: String(v) };
    case 'enum:level3':
      if (!LEVEL_3.includes(String(v))) return { error: `${LEVEL_3.join('/')} 중 하나여야 합니다` };
      return { value: String(v) };
    default:
      return { value: String(v) };
  }
}

/**
 * CSV 텍스트 → 미리보기 결과
 * @param {string} text
 * @param {Array}  existing  이미 등록된 후보 [{product_name, primary_keyword}]
 * @returns {{ headers, mapping, unknownHeaders, rows, validCount, errorCount }}
 */
export function previewCsv(text, existing = []) {
  const table = parseCsv(text);
  if (!table.length) {
    return { headers: [], mapping: [], unknownHeaders: [], rows: [], validCount: 0, errorCount: 0, fatal: 'CSV 내용이 비어 있습니다.' };
  }

  const headers = table[0].map((h) => String(h || '').trim());
  const mapping = mapHeaders(headers);
  const unknownHeaders = headers.filter((h, i) => mapping[i] === null && h !== '');

  const missingRequired = CSV_REQUIRED.filter((col) => !mapping.includes(col));
  if (missingRequired.length) {
    return {
      headers, mapping, unknownHeaders, rows: [], validCount: 0, errorCount: 0,
      fatal: `필수 컬럼이 없습니다: ${missingRequired.join(', ')}`,
    };
  }

  const existingKeys = new Set(
    (existing || []).map((e) => `${String(e.product_name).trim()}|${String(e.primary_keyword).trim()}`)
  );
  const seenInFile = new Set();

  const rows = table.slice(1).map((cells, idx) => {
    const rowNumber = idx + 2; // 1-base + 헤더
    const errors = [];
    const warnings = [];
    const data = {};
    const sourceMeta = {};

    mapping.forEach((col, colIdx) => {
      if (!col) return;
      const raw = cells[colIdx];
      const type = CSV_COLUMN_TYPES[col] || 'text';
      const { value, error } = coerce(type, raw);
      if (error) { errors.push({ column: col, message: error, raw: String(raw ?? '') }); return; }

      if (col === 'source_name' || col === 'source_url' || col === 'checked_at') {
        sourceMeta[col] = value;
        if (col === 'checked_at') data.last_checked_at = value;
        return;
      }
      const dbCol = CSV_TO_DB[col] || col;
      data[dbCol] = value;
    });

    for (const req of CSV_REQUIRED) {
      const dbCol = CSV_TO_DB[req] || req;
      if (!hasValue(data[dbCol])) errors.push({ column: req, message: '필수값이 비어 있습니다' });
    }

    const key = `${String(data.product_name ?? '').trim()}|${String(data.primary_keyword ?? '').trim()}`;
    if (errors.length === 0) {
      if (existingKeys.has(key)) warnings.push({ column: 'product_name', message: '이미 등록된 제품명+대표 키워드입니다 (중복 후보)' });
      if (seenInFile.has(key)) warnings.push({ column: 'product_name', message: 'CSV 안에서 중복된 행입니다' });
      seenInFile.add(key);
    }

    const withDerived = applyDerivedFields(data, { respectManualTotal: false });
    const { errors: vErrors, warnings: vWarnings } = validateCandidate(withDerived);
    for (const e of vErrors) errors.push({ column: e.field, message: e.message });
    for (const w of vWarnings) warnings.push({ column: w.field, message: w.message });

    return {
      rowNumber,
      data: withDerived,
      sourceMeta,
      errors,
      warnings,
      valid: errors.length === 0,
      duplicate: existingKeys.has(key),
    };
  });

  return {
    headers,
    mapping,
    unknownHeaders,
    rows,
    validCount: rows.filter((r) => r.valid).length,
    errorCount: rows.filter((r) => !r.valid).length,
  };
}

// ─── 내보내기 ────────────────────────────────────────────────────────────────

function escapeCell(value) {
  if (value === null || value === undefined) return '';
  let s = Array.isArray(value) ? value.join(';') : String(value);
  if (typeof value === 'boolean') s = value ? 'Y' : 'N';
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

/** 후보 배열 → CSV 문자열 (엑셀 호환 BOM 포함) */
export function candidatesToCsv(candidates) {
  const lines = [CSV_COLUMNS.join(',')];
  for (const c of candidates || []) {
    const row = CSV_COLUMNS.map((col) => {
      if (col === 'checked_at') return escapeCell(c.last_checked_at);
      if (col === 'source_name' || col === 'source_url') return '';
      const dbCol = CSV_TO_DB[col] || col;
      return escapeCell(c[dbCol]);
    });
    lines.push(row.join(','));
  }
  return `﻿${lines.join('\r\n')}\r\n`;
}

/** 빈 템플릿 (헤더 + 예시 주석 없는 1행) */
export function csvTemplate() {
  return `﻿${CSV_COLUMNS.join(',')}\r\n${CSV_COLUMNS.map(() => '').join(',')}\r\n`;
}
