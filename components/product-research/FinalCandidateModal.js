'use client';
/**
 * 최종 후보 지정 확인 모달
 * 데이터가 부족해도 지정은 가능하되, 무엇이 부족한지 반드시 보여준다.
 */
import { useEffect, useState } from 'react';
import { Modal, Button, Badge, Empty, T, ScorePill } from './ui';

export default function FinalCandidateModal({ open, candidateId, onClose, onDone, authFetch }) {
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open || !candidateId) return;
    setLoading(true); setError(''); setInfo(null);
    authFetch(`/api/admin/product-research/${candidateId}/final`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || '정보를 불러오지 못했습니다.');
        setInfo(data);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [open, candidateId, authFetch]);

  const handleConfirm = async () => {
    setBusy(true); setError('');
    try {
      const res = await authFetch(`/api/admin/product-research/${candidateId}/final`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '지정에 실패했습니다.');
      onDone();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const c = info?.candidate;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="최종 후보로 지정"
      subtitle="최종 후보는 하나만 유지됩니다. 기존 최종 후보는 '분석 완료'로 바뀝니다."
      width={620}
      footer={
        <>
          {error && <span style={{ fontSize: 12, color: T.danger, fontWeight: 600, marginRight: 'auto' }}>{error}</span>}
          <Button onClick={onClose} disabled={busy}>취소</Button>
          <Button variant="primary" onClick={handleConfirm} disabled={busy || loading || !c}>
            {busy ? '처리 중…' : '최종 후보로 지정'}
          </Button>
        </>
      }
    >
      {loading && <div style={{ padding: 30, textAlign: 'center', color: T.muted, fontSize: 13 }}>불러오는 중…</div>}

      {c && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap',
            background: '#f8fafc', borderRadius: 12, padding: 14,
          }}>
            <div style={{ flex: 1, minWidth: 160 }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: T.text }}>{c.product_name}</div>
              <div style={{ fontSize: 12, color: T.muted }}>{c.primary_keyword}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <ScorePill score={c.total_score} max={info.scoreResult?.maxTotal ?? 100} size="lg" />
              <div style={{ fontSize: 11, color: T.muted, marginTop: 4 }}>
                전체 {info.totalCandidates}개 중 {info.rank}위
              </div>
            </div>
          </div>

          {info.currentFinal && Number(info.currentFinal.id) !== Number(candidateId) && (
            <div style={{
              background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10,
              padding: '10px 12px', fontSize: 12.5, color: '#1e40af',
            }}>
              현재 최종 후보인 <strong>{info.currentFinal.product_name}</strong>은(는) &lsquo;분석 완료&rsquo; 상태로 변경됩니다.
            </div>
          )}

          <div>
            <div style={{ fontSize: 12, fontWeight: 800, color: T.sub, marginBottom: 8 }}>확인 항목</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <CheckRow ok={Boolean(c.affiliate_url)} label="쿠팡파트너스 URL" value={c.affiliate_url ? '입력됨' : null} />
              <CheckRow ok={c.direct_purchase_possible === true} label="직접 구매 가능" value={boolLabel(c.direct_purchase_possible)} />
              <CheckRow ok={c.direct_review_possible === true} label="직접 사용 후기 작성 가능" value={boolLabel(c.direct_review_possible)} />
              <CheckRow
                ok={c.medical_claim_risk === '낮음'}
                label="의료효능 과장 위험"
                value={c.medical_claim_risk}
              />
              <CheckRow ok={Boolean(c.last_checked_at)} label="최종 확인일" value={c.last_checked_at} />
            </div>
          </div>

          {info.warnings.length > 0 && (
            <div style={{
              background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, padding: '10px 12px',
            }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: T.warnFg, marginBottom: 5 }}>
                ! 경고 {info.warnings.length}건 — 데이터가 부족해도 지정은 가능합니다
              </div>
              <ul style={{ margin: 0, paddingLeft: 16, fontSize: 11.5, color: T.warnFg, lineHeight: 1.7 }}>
                {info.warnings.map((w, i) => <li key={i}>{w}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}

function boolLabel(v) {
  if (v === null || v === undefined) return null;
  return v ? '예' : '아니오';
}

function CheckRow({ ok, label, value }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5 }}>
      <Badge bg={ok ? '#d1fae5' : '#fef3c7'} fg={ok ? '#065f46' : T.warnFg} icon={ok ? '✓' : '!'}>
        {ok ? '확인' : '주의'}
      </Badge>
      <span style={{ color: T.sub, fontWeight: 600, flex: 1 }}>{label}</span>
      <span style={{ color: T.text }}>{value ? value : <Empty label="미입력" />}</span>
    </div>
  );
}
