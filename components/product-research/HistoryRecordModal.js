'use client';
/**
 * 데이터 기록 추가 — 날짜별 스냅샷을 이력 테이블에 남긴다.
 * 비워둔 항목은 현재 후보 값이 그대로 기록된다.
 */
import { useEffect, useState } from 'react';
import { Modal, Button, Field, FieldGrid, NumberInput, DateInput, Select, TextArea, T } from './ui';
import { STOCK_STATUSES } from '@/lib/product-research/constants.js';

export default function HistoryRecordModal({ open, candidate, onClose, onSaved, authFetch }) {
  const [form, setForm] = useState({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open || !candidate) return;
    setError('');
    setForm({
      recorded_at: new Date().toISOString().slice(0, 10),
      total_monthly_search: candidate.total_monthly_search ?? null,
      search_trend_3_month: candidate.search_trend_3_month ?? null,
      shopping_click_index: candidate.shopping_click_index ?? null,
      review_count: candidate.current_review_count ?? candidate.review_count ?? null,
      price: candidate.price ?? null,
      rating: candidate.rating ?? null,
      stock_status: candidate.stock_status ?? null,
      total_score: candidate.total_score ?? null,
      memo: null,
    });
  }, [open, candidate]);

  const set = (key) => (value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    setBusy(true); setError('');
    try {
      const res = await authFetch(`/api/admin/product-research/${candidate.id}/history`, {
        method: 'POST',
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '저장에 실패했습니다.');
      onSaved(data.record);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  if (!candidate) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="데이터 기록 추가"
      subtitle={`${candidate.product_name} — 날짜별 변화 이력에 남깁니다`}
      width={620}
      footer={
        <>
          {error && <span style={{ fontSize: 12, color: T.danger, fontWeight: 600, marginRight: 'auto' }}>{error}</span>}
          <Button onClick={onClose} disabled={busy}>취소</Button>
          <Button variant="primary" onClick={handleSave} disabled={busy}>{busy ? '저장 중…' : '기록 저장'}</Button>
        </>
      }
    >
      <FieldGrid>
        <Field label="기록일"><DateInput value={form.recorded_at} onChange={set('recorded_at')} /></Field>
        <Field label="월간 총검색량"><NumberInput value={form.total_monthly_search} onChange={set('total_monthly_search')} min={0} /></Field>
        <Field label="검색 관심도 증감률 (%)"><NumberInput value={form.search_trend_3_month} onChange={set('search_trend_3_month')} step={0.1} /></Field>
        <Field label="쇼핑 클릭지수"><NumberInput value={form.shopping_click_index} onChange={set('shopping_click_index')} step={0.1} /></Field>
        <Field label="쿠팡 후기 수"><NumberInput value={form.review_count} onChange={set('review_count')} min={0} /></Field>
        <Field label="가격 (원)"><NumberInput value={form.price} onChange={set('price')} min={0} /></Field>
        <Field label="평점"><NumberInput value={form.rating} onChange={set('rating')} min={0} max={5} step={0.1} /></Field>
        <Field label="품절 여부"><Select value={form.stock_status} onChange={set('stock_status')} options={STOCK_STATUSES} /></Field>
        <Field label="종합점수"><NumberInput value={form.total_score} onChange={set('total_score')} step={0.1} /></Field>
      </FieldGrid>
      <div style={{ marginTop: 10 }}>
        <Field label="메모"><TextArea value={form.memo} onChange={set('memo')} rows={2} /></Field>
      </div>
    </Modal>
  );
}
