'use client';
/**
 * 평가기준 설정
 * 배점(weight)과 구간(bands) · 등급 점수(map)를 관리자가 직접 수정한다.
 * 값의 원본은 DB(product_research_score_settings)다.
 */
import { useEffect, useMemo, useState } from 'react';
import { Modal, Button, Badge, T } from './ui';

export default function ScoreSettingsModal({ open, settings, onClose, onSaved, authFetch }) {
  const [draft, setDraft] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setDraft(JSON.parse(JSON.stringify(settings || [])));
    setError('');
  }, [open, settings]);

  const totalWeight = useMemo(
    () => draft.filter((s) => s.is_active !== false).reduce((acc, s) => acc + (Number(s.weight) || 0), 0),
    [draft]
  );

  const update = (key, patch) =>
    setDraft((prev) => prev.map((s) => (s.criterion_key === key ? { ...s, ...patch } : s)));

  const updateRules = (key, updater) =>
    setDraft((prev) => prev.map((s) => {
      if (s.criterion_key !== key) return s;
      const rules = JSON.parse(JSON.stringify(s.scoring_rules || {}));
      updater(rules);
      return { ...s, scoring_rules: rules };
    }));

  const handleSave = async () => {
    setBusy(true); setError('');
    try {
      const res = await authFetch('/api/admin/product-research/settings', {
        method: 'PUT',
        body: JSON.stringify({
          settings: draft.map((s) => ({
            criterion_key: s.criterion_key,
            weight: Number(s.weight),
            scoring_rules: s.scoring_rules,
            is_active: s.is_active !== false,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || '저장에 실패했습니다.'); return; }
      onSaved(data.settings, data.warning);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="평가기준 설정"
      subtitle="배점과 구간을 바꾸면 저장 후 '점수 다시 계산'을 실행해야 전체 순위에 반영됩니다."
      width={880}
      footer={
        <>
          {error && <span style={{ fontSize: 12, color: T.danger, fontWeight: 600, marginRight: 'auto' }}>{error}</span>}
          <span style={{ marginRight: 'auto', fontSize: 12, fontWeight: 700, color: totalWeight === 100 ? T.success : T.warn }}>
            활성 배점 합계 {totalWeight}점 {totalWeight !== 100 && '(권장 100점)'}
          </span>
          <Button onClick={onClose} disabled={busy}>취소</Button>
          <Button variant="primary" onClick={handleSave} disabled={busy}>{busy ? '저장 중…' : '저장'}</Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {draft.map((s) => (
          <div key={s.criterion_key} style={{
            border: `1px solid ${T.border}`, borderRadius: 12, padding: 14,
            opacity: s.is_active === false ? 0.55 : 1,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 10 }}>
              <span style={{ fontSize: 13.5, fontWeight: 800, color: T.text }}>{s.criterion_name}</span>
              <code style={{ fontSize: 10.5, color: T.muted, background: '#f1f5f9', padding: '1px 5px', borderRadius: 4 }}>
                {s.criterion_key}
              </code>
              <div style={{ flex: 1 }} />
              <label style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11.5, color: T.sub, fontWeight: 600 }}>
                배점
                <input
                  type="number" min={0} step={1}
                  value={s.weight ?? ''}
                  onChange={(e) => update(s.criterion_key, { weight: e.target.value === '' ? 0 : Number(e.target.value) })}
                  style={{ width: 68, padding: '4px 7px', fontSize: 12, border: `1.5px solid ${T.primaryBorder}`, borderRadius: 6 }}
                />
                점
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11.5, color: T.sub, fontWeight: 600 }}>
                <input
                  type="checkbox"
                  checked={s.is_active !== false}
                  onChange={(e) => update(s.criterion_key, { is_active: e.target.checked })}
                  style={{ accentColor: T.primary }}
                />
                사용
              </label>
            </div>

            <RuleEditor
              rules={s.scoring_rules}
              onBandChange={(path, index, field, value) =>
                updateRules(s.criterion_key, (r) => {
                  const target = path === null ? r : r.parts[path];
                  target.bands[index][field] = value;
                })}
              onMapChange={(path, mapKey, value) =>
                updateRules(s.criterion_key, (r) => {
                  const target = path === null ? r : r.parts[path];
                  target.map[mapKey] = value;
                })}
              onPointsChange={(path, value) =>
                updateRules(s.criterion_key, (r) => {
                  const target = path === null ? r : r.parts[path];
                  target.points = value;
                })}
              onPartMaxChange={(path, value) =>
                updateRules(s.criterion_key, (r) => { r.parts[path].max = value; })}
            />
          </div>
        ))}
      </div>
    </Modal>
  );
}

function RuleEditor({ rules, onBandChange, onMapChange, onPointsChange, onPartMaxChange }) {
  if (!rules) return null;

  if (rules.type === 'composite') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {(rules.parts || []).map((part, i) => (
          <div key={part.key} style={{ background: '#f8fafc', borderRadius: 9, padding: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: T.sub }}>{part.name || part.key}</span>
              <div style={{ flex: 1 }} />
              <label style={{ fontSize: 11, color: T.muted, display: 'flex', alignItems: 'center', gap: 4 }}>
                최대
                <input
                  type="number" step={0.1} min={0}
                  value={part.max ?? ''}
                  onChange={(e) => onPartMaxChange(i, e.target.value === '' ? 0 : Number(e.target.value))}
                  style={numInput}
                />
                점
              </label>
            </div>
            <SingleRule
              rule={part}
              path={i}
              onBandChange={onBandChange}
              onMapChange={onMapChange}
              onPointsChange={onPointsChange}
            />
          </div>
        ))}
      </div>
    );
  }

  return (
    <SingleRule
      rule={rules}
      path={null}
      onBandChange={onBandChange}
      onMapChange={onMapChange}
      onPointsChange={onPointsChange}
    />
  );
}

function SingleRule({ rule, path, onBandChange, onMapChange, onPointsChange }) {
  if (rule.type === 'bands') {
    return (
      <div>
        <FieldHint>기준 필드 <code>{rule.field}</code> — 위에서부터 첫 매치. 마지막 구간은 상한 없음.</FieldHint>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          {(rule.bands || []).map((b, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 11, color: T.muted, minWidth: 22 }}>≤</span>
              <input
                type="number" step="any"
                value={b.max ?? ''}
                placeholder="상한 없음"
                onChange={(e) => onBandChange(path, i, 'max', e.target.value === '' ? undefined : Number(e.target.value))}
                style={{ ...numInput, width: 96 }}
              />
              <input
                value={b.label ?? ''}
                onChange={(e) => onBandChange(path, i, 'label', e.target.value)}
                style={{ ...numInput, width: 150, textAlign: 'left' }}
              />
              <input
                type="number" step={0.1}
                value={b.points ?? ''}
                onChange={(e) => onBandChange(path, i, 'points', e.target.value === '' ? 0 : Number(e.target.value))}
                style={numInput}
              />
              <span style={{ fontSize: 11, color: T.muted }}>점</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (rule.type === 'map') {
    return (
      <div>
        <FieldHint>
          기준 필드 <code>{rule.field}</code>
          {rule.lowerIsBetter && <Badge bg="#fef3c7" fg={T.warnFg} style={{ marginLeft: 6 }}>낮을수록 유리</Badge>}
        </FieldHint>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {Object.entries(rule.map || {}).map(([k, v]) => (
            <label key={k} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11.5, color: T.sub }}>
              {k}
              <input
                type="number" step={0.1}
                value={v ?? ''}
                onChange={(e) => onMapChange(path, k, e.target.value === '' ? 0 : Number(e.target.value))}
                style={numInput}
              />
              점
            </label>
          ))}
        </div>
      </div>
    );
  }

  if (rule.type === 'boolean' || rule.type === 'any_boolean') {
    return (
      <div>
        <FieldHint>기준 필드 <code>{rule.field || (rule.fields || []).join(', ')}</code> — 해당 시 부여 점수</FieldHint>
        <input
          type="number" step={0.1}
          value={rule.points ?? ''}
          onChange={(e) => onPointsChange(path, e.target.value === '' ? 0 : Number(e.target.value))}
          style={numInput}
        />
        <span style={{ fontSize: 11, color: T.muted, marginLeft: 4 }}>점</span>
      </div>
    );
  }

  return <FieldHint>지원하지 않는 규칙 타입: {rule.type}</FieldHint>;
}

function FieldHint({ children }) {
  return <div style={{ fontSize: 11, color: T.muted, marginBottom: 6 }}>{children}</div>;
}

const numInput = {
  width: 66, padding: '4px 7px', fontSize: 12, textAlign: 'right',
  border: `1.5px solid ${T.primaryBorder}`, borderRadius: 6, fontFamily: 'inherit',
};
