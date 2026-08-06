'use client';
/**
 * 직장인 관심제품 분석 — 공용 UI 조각
 * 기존 관리자 화면(app/admin/guides)의 인라인 스타일 토큰을 그대로 따른다.
 */
import { useEffect } from 'react';
import { ESTIMATED_SOURCE_KINDS } from '@/lib/product-research/constants.js';

export const T = {
  bg: '#f8f9fb',
  card: '#fff',
  border: '#e1e5eb',
  borderSoft: '#eef2f7',
  primary: '#3268ff',
  primarySoft: '#f4f7ff',
  primaryBorder: '#dde6ff',
  text: '#1c2741',
  sub: '#5a6a85',
  muted: '#9aa5b8',
  faint: '#c7d2e8',
  danger: '#e53e3e',
  success: '#059669',
  warn: '#d97706',
  warnBg: '#fef3c7',
  warnFg: '#92400e',
};

// ─── 버튼 ────────────────────────────────────────────────────────────────────

export function Button({ variant = 'default', size = 'md', children, style, ...props }) {
  const sizes = {
    sm: { padding: '4px 10px', fontSize: 12 },
    md: { padding: '7px 14px', fontSize: 13 },
  };
  const variants = {
    primary: { background: T.primary, color: '#fff', border: `1px solid ${T.primary}` },
    default: { background: '#fff', color: T.sub, border: `1px solid ${T.primaryBorder}` },
    soft: { background: T.primarySoft, color: T.primary, border: `1px solid ${T.primaryBorder}` },
    danger: { background: '#fff', color: T.danger, border: `1px solid ${T.danger}` },
    dangerSolid: { background: T.danger, color: '#fff', border: `1px solid ${T.danger}` },
    ghost: { background: 'transparent', color: T.sub, border: '1px solid transparent' },
  };
  return (
    <button
      type="button"
      {...props}
      style={{
        ...sizes[size], ...variants[variant],
        fontWeight: 700, borderRadius: 8, cursor: props.disabled ? 'not-allowed' : 'pointer',
        opacity: props.disabled ? 0.55 : 1, whiteSpace: 'nowrap', fontFamily: 'inherit',
        display: 'inline-flex', alignItems: 'center', gap: 5,
        ...style,
      }}
    >
      {children}
    </button>
  );
}

// ─── 배지 ────────────────────────────────────────────────────────────────────

export function Badge({ bg = '#f1f4f9', fg = T.sub, icon, children, style }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 999,
      background: bg, color: fg, whiteSpace: 'nowrap', ...style,
    }}>
      {icon && <span aria-hidden style={{ fontSize: 10 }}>{icon}</span>}
      {children}
    </span>
  );
}

/** 미입력 값 — 0으로 보여주지 않는다 */
export function Empty({ label = '미입력' }) {
  return (
    <span style={{
      fontSize: 11, fontWeight: 600, color: '#a1a1aa',
      background: '#f4f4f5', padding: '1px 7px', borderRadius: 999, whiteSpace: 'nowrap',
    }}>
      {label}
    </span>
  );
}

/** 공식 수치와 추정치를 화면에서 구별해 보여준다 */
export function EstimatedBadge({ kind }) {
  if (!kind) return null;
  const estimated = ESTIMATED_SOURCE_KINDS.has(kind);
  const unknown = kind === '확인 불가';
  return (
    <Badge
      bg={unknown ? '#f4f4f5' : estimated ? '#fef9c3' : '#e0f2fe'}
      fg={unknown ? '#71717a' : estimated ? '#854d0e' : '#075985'}
      icon={estimated ? '≈' : unknown ? '?' : '='}
    >
      {kind}
    </Badge>
  );
}

// ─── 폼 ──────────────────────────────────────────────────────────────────────

const inputStyle = {
  width: '100%', padding: '7px 10px', fontSize: 13, color: T.text,
  border: `1.5px solid ${T.primaryBorder}`, borderRadius: 8, outline: 'none',
  fontFamily: 'inherit', background: '#fff', boxSizing: 'border-box',
};

export function Field({ label, hint, error, children, span = 1 }) {
  return (
    <label style={{ display: 'block', gridColumn: `span ${span}`, minWidth: 0 }}>
      <span style={{ display: 'block', fontSize: 11, fontWeight: 700, color: T.sub, marginBottom: 4 }}>
        {label}
      </span>
      {children}
      {hint && !error && (
        <span style={{ display: 'block', fontSize: 10, color: T.muted, marginTop: 3 }}>{hint}</span>
      )}
      {error && (
        <span style={{ display: 'block', fontSize: 10, color: T.danger, marginTop: 3, fontWeight: 600 }}>{error}</span>
      )}
    </label>
  );
}

export function TextInput({ value, onChange, ...props }) {
  return (
    <input
      {...props}
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value === '' ? null : e.target.value)}
      style={{ ...inputStyle, ...props.style }}
    />
  );
}

/** 숫자 입력 — 빈 문자열은 null 로 유지한다 (0과 구별) */
export function NumberInput({ value, onChange, ...props }) {
  return (
    <input
      type="number"
      {...props}
      value={value ?? ''}
      onChange={(e) => {
        const v = e.target.value;
        onChange(v === '' ? null : Number(v));
      }}
      style={{ ...inputStyle, ...props.style }}
    />
  );
}

export function DateInput({ value, onChange, ...props }) {
  return (
    <input
      type="date"
      {...props}
      value={value ? String(value).slice(0, 10) : ''}
      onChange={(e) => onChange(e.target.value === '' ? null : e.target.value)}
      style={{ ...inputStyle, ...props.style }}
    />
  );
}

export function Select({ value, onChange, options, placeholder = '선택 안 함', ...props }) {
  return (
    <select
      {...props}
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value === '' ? null : e.target.value)}
      style={{ ...inputStyle, ...props.style }}
    >
      <option value="">{placeholder}</option>
      {options.map((o) => {
        const val = typeof o === 'string' ? o : o.value;
        const lab = typeof o === 'string' ? o : o.label;
        return <option key={val} value={val}>{lab}</option>;
      })}
    </select>
  );
}

/** 3상태 boolean — 미입력 / 예 / 아니오 */
export function TriToggle({ value, onChange }) {
  const opts = [[null, '미입력'], [true, '예'], [false, '아니오']];
  return (
    <div style={{ display: 'flex', border: `1.5px solid ${T.primaryBorder}`, borderRadius: 8, overflow: 'hidden' }}>
      {opts.map(([v, label]) => (
        <button
          key={String(v)}
          type="button"
          onClick={() => onChange(v)}
          style={{
            flex: 1, padding: '6px 4px', fontSize: 12, fontWeight: 600, border: 'none',
            cursor: 'pointer', fontFamily: 'inherit',
            background: value === v ? T.primary : '#fff',
            color: value === v ? '#fff' : T.sub,
          }}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

export function TextArea({ value, onChange, rows = 3, ...props }) {
  return (
    <textarea
      {...props}
      rows={rows}
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value === '' ? null : e.target.value)}
      style={{ ...inputStyle, resize: 'vertical', ...props.style }}
    />
  );
}

// ─── 레이아웃 ────────────────────────────────────────────────────────────────

export function Card({ children, style }) {
  return (
    <div style={{
      background: T.card, border: `1px solid ${T.border}`, borderRadius: 12,
      padding: 16, ...style,
    }}>
      {children}
    </div>
  );
}

export function SectionTitle({ children, right }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '4px 0 10px' }}>
      <h3 style={{ fontSize: 13, fontWeight: 800, color: T.text, margin: 0 }}>{children}</h3>
      <div style={{ flex: 1, height: 1, background: T.borderSoft }} />
      {right}
    </div>
  );
}

export function FieldGrid({ children, min = 170 }) {
  return (
    <div style={{
      display: 'grid', gap: 10,
      gridTemplateColumns: `repeat(auto-fill, minmax(${min}px, 1fr))`,
    }}>
      {children}
    </div>
  );
}

// ─── 모달 ────────────────────────────────────────────────────────────────────

export function Modal({ open, onClose, title, subtitle, width = 860, footer, children }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(28,39,65,0.35)',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        padding: '24px 12px', overflowY: 'auto',
      }}
    >
      <div style={{
        background: '#fff', borderRadius: 14, width: '100%', maxWidth: width,
        boxShadow: '0 20px 60px rgba(28,39,65,0.22)', overflow: 'hidden',
        display: 'flex', flexDirection: 'column', maxHeight: 'calc(100vh - 48px)',
      }}>
        <div style={{
          padding: '14px 18px', borderBottom: `1px solid ${T.borderSoft}`,
          display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0,
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: T.text }}>{title}</div>
            {subtitle && <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>{subtitle}</div>}
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="닫기">✕</Button>
        </div>

        <div style={{ padding: 18, overflowY: 'auto', flex: 1 }}>{children}</div>

        {footer && (
          <div style={{
            padding: '12px 18px', borderTop: `1px solid ${T.borderSoft}`,
            display: 'flex', justifyContent: 'flex-end', gap: 8, flexShrink: 0,
            background: '#fafbfc', flexWrap: 'wrap',
          }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── 점수 표시 ───────────────────────────────────────────────────────────────

export function scoreColor(ratio) {
  if (ratio >= 0.8) return '#059669';
  if (ratio >= 0.6) return '#3268ff';
  if (ratio >= 0.4) return '#d97706';
  return '#e11d48';
}

export function ScoreBar({ score, max, height = 8 }) {
  const ratio = max > 0 ? Math.min(1, score / max) : 0;
  return (
    <div style={{ background: '#eef2f7', borderRadius: 999, height, overflow: 'hidden', width: '100%' }}>
      <div style={{
        width: `${ratio * 100}%`, height: '100%',
        background: scoreColor(ratio), borderRadius: 999, transition: 'width 0.25s',
      }} />
    </div>
  );
}

/** 종합점수 강조 표시 */
export function ScorePill({ score, max = 100, size = 'md' }) {
  if (score === null || score === undefined) return <Empty label="점수 없음" />;
  const ratio = max > 0 ? score / max : 0;
  const big = size === 'lg';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'baseline', gap: 2,
      fontWeight: 900, color: scoreColor(ratio),
      fontSize: big ? 30 : 15, lineHeight: 1,
    }}>
      {Number(score).toLocaleString('ko-KR', { maximumFractionDigits: 1 })}
      <span style={{ fontSize: big ? 14 : 10, fontWeight: 700, opacity: 0.6 }}>/{max}</span>
    </span>
  );
}

// ─── 경량 라인 차트 (라이브러리 없이 SVG) ────────────────────────────────────

export function Sparkline({ points, width = 320, height = 90, unit = '', color = T.primary }) {
  const valid = (points || []).filter((p) => p.value !== null && p.value !== undefined && !Number.isNaN(Number(p.value)));
  if (valid.length === 0) {
    return <div style={{ fontSize: 11, color: T.muted, padding: '18px 0' }}>기록된 값이 없습니다.</div>;
  }
  if (valid.length === 1) {
    return (
      <div style={{ fontSize: 12, color: T.sub, padding: '18px 0' }}>
        기록 1건 — {valid[0].label} · {Number(valid[0].value).toLocaleString('ko-KR')}{unit}
        <span style={{ color: T.muted }}> (추이를 보려면 2건 이상 필요)</span>
      </div>
    );
  }

  const values = valid.map((p) => Number(p.value));
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const pad = { l: 8, r: 8, t: 10, b: 18 };
  const w = width - pad.l - pad.r;
  const h = height - pad.t - pad.b;

  const coords = valid.map((p, i) => ({
    x: pad.l + (i / (valid.length - 1)) * w,
    y: pad.t + h - ((Number(p.value) - min) / span) * h,
    ...p,
  }));
  const path = coords.map((c, i) => `${i === 0 ? 'M' : 'L'}${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' ');

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height} role="img"
         aria-label={`추이 그래프 — 최소 ${min}, 최대 ${max}`} style={{ display: 'block' }}>
      <line x1={pad.l} y1={pad.t + h} x2={width - pad.r} y2={pad.t + h} stroke={T.borderSoft} strokeWidth="1" />
      <path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      {coords.map((c, i) => (
        <g key={i}>
          <circle cx={c.x} cy={c.y} r="3" fill="#fff" stroke={color} strokeWidth="1.8" />
          <title>{`${c.label}: ${Number(c.value).toLocaleString('ko-KR')}${unit}`}</title>
        </g>
      ))}
      <text x={pad.l} y={height - 4} fontSize="9" fill={T.muted}>{coords[0].label}</text>
      <text x={width - pad.r} y={height - 4} fontSize="9" fill={T.muted} textAnchor="end">
        {coords[coords.length - 1].label}
      </text>
    </svg>
  );
}
