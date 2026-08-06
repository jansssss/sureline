'use client';
/**
 * 제품 후보 등록 · 수정 모달
 * 파생값(총검색량, 후기 증가량, 30일 환산, 건당 예상 수익)은 입력 즉시 자동 계산해 보여준다.
 */
import { useMemo, useState, useEffect } from 'react';
import {
  Modal, Field, FieldGrid, TextInput, NumberInput, DateInput, Select, TextArea,
  TriToggle, Button, SectionTitle, Empty, T, ScorePill,
} from './ui';
import {
  CATEGORIES, STATUSES, COMPETITION_LEVELS, LEVEL_3, STOCK_STATUSES, SOURCE_KINDS,
} from '@/lib/product-research/constants.js';
import { applyDerivedFields, hasValue } from '@/lib/product-research/calc.js';
import { validateCandidate } from '@/lib/product-research/validation.js';
import { calculateScore } from '@/lib/product-research/scoring.js';
import { fmtNumber, fmtMoney } from '@/lib/product-research/format.js';

const EMPTY = {
  product_name: null, primary_keyword: null, secondary_keywords: [], category: null,
  description: null, research_purpose: null,
  coupang_product_name: null, coupang_url: null, affiliate_url: null, image_url: null,
  price: null, rating: null, review_count: null, rocket_delivery: null,
  seller_name: null, brand_name: null, status: '조사 전', admin_memo: null,

  pc_monthly_search: null, mobile_monthly_search: null, total_monthly_search: null,
  average_click_count: null, average_click_rate: null, age_25_54_ratio: null,
  search_trend_3_month: null, search_trend_12_month: null,
  search_competition: null, ad_competition: null, related_product_count: null,
  search_source_kind: null,

  shopping_click_index: null, shopping_index_note: null,
  shopping_trend_3_month: null, shopping_trend_12_month: null,
  shopping_main_age_group: null, shopping_mobile_ratio: null, shopping_source_kind: null,

  current_review_count: null, previous_review_count: null,
  measurement_start_date: null, measurement_end_date: null,
  stock_status: null, stock_memo: null,
  recommendation_badge: null, category_best: null, coupang_source_kind: null,

  estimated_price: null, estimated_commission_rate: null,
  return_risk: null, seller_stability: null, product_page_stability: null,
  seasonality: null, direct_purchase_possible: null, direct_review_possible: null,
  sureline_relevance: null, medical_claim_risk: null, profitability_memo: null,

  last_checked_at: null,
};

const TABS = [
  { key: 'basic',   label: '기본정보' },
  { key: 'search',  label: '검색 데이터' },
  { key: 'shopping', label: '쇼핑 관심도' },
  { key: 'coupang', label: '쿠팡 판매 신호' },
  { key: 'profit',  label: '수익성·적합성' },
];

export default function CandidateFormModal({ open, initial, settings, onClose, onSubmit }) {
  const [form, setForm] = useState(EMPTY);
  const [tab, setTab] = useState('basic');
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState('');
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm({ ...EMPTY, ...(initial || {}) });
    setTab('basic');
    setServerError('');
    setTouched(false);
  }, [open, initial]);

  const set = (key) => (value) => setForm((prev) => ({ ...prev, [key]: value }));

  const derived = useMemo(() => applyDerivedFields(form, { respectManualTotal: true }), [form]);
  const { errors, warnings } = useMemo(() => validateCandidate(derived), [derived]);
  const score = useMemo(() => calculateScore(derived, settings || []), [derived, settings]);
  const errorFor = (field) => (touched ? errors.find((e) => e.field === field)?.message : null);

  const autoTotal = applyDerivedFields(form, { respectManualTotal: false }).total_monthly_search;

  const handleSubmit = async () => {
    setTouched(true);
    if (errors.length) { setServerError('입력값을 확인해 주세요.'); return; }
    setSaving(true);
    setServerError('');
    try {
      await onSubmit(form);
    } catch (e) {
      setServerError(e.message || '저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial?.id ? '제품 후보 수정' : '제품 후보 추가'}
      subtitle="실제로 확인한 값만 입력하세요. 비워두면 '미입력'으로 저장되며 0으로 계산하지 않습니다."
      width={900}
      footer={
        <>
          {serverError && (
            <span style={{ fontSize: 12, color: T.danger, fontWeight: 600, marginRight: 'auto' }}>
              {serverError}
            </span>
          )}
          <span style={{ fontSize: 11, color: T.muted, marginRight: 'auto' }}>
            현재 입력 기준 예상 점수 <ScorePill score={score.total} max={score.maxTotal} />
            {score.missingCount > 0 && ` · 미입력 항목 ${score.missingCount}개`}
          </span>
          <Button onClick={onClose} disabled={saving}>취소</Button>
          <Button variant="primary" onClick={handleSubmit} disabled={saving}>
            {saving ? '저장 중…' : '저장'}
          </Button>
        </>
      }
    >
      {/* 탭 */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 14, flexWrap: 'wrap' }}>
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            style={{
              padding: '6px 12px', fontSize: 12.5, fontWeight: tab === t.key ? 800 : 600,
              borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit',
              border: `1px solid ${tab === t.key ? T.primary : T.primaryBorder}`,
              background: tab === t.key ? T.primary : '#fff',
              color: tab === t.key ? '#fff' : T.sub,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {touched && errors.length > 0 && (
        <div style={{
          background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10,
          padding: '10px 12px', marginBottom: 14,
        }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: '#b91c1c', marginBottom: 4 }}>
            ✕ 저장할 수 없는 입력 {errors.length}건
          </div>
          <ul style={{ margin: 0, paddingLeft: 16, fontSize: 11.5, color: '#b91c1c' }}>
            {errors.map((e, i) => <li key={i}>{e.message}</li>)}
          </ul>
        </div>
      )}
      {warnings.length > 0 && (
        <div style={{
          background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10,
          padding: '10px 12px', marginBottom: 14,
        }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: T.warnFg, marginBottom: 4 }}>
            ! 확인이 필요한 항목 {warnings.length}건 (저장은 가능합니다)
          </div>
          <ul style={{ margin: 0, paddingLeft: 16, fontSize: 11.5, color: T.warnFg }}>
            {warnings.map((w, i) => <li key={i}>{w.message}</li>)}
          </ul>
        </div>
      )}

      {/* ─── 기본정보 ─────────────────────────────────────────────────────── */}
      {tab === 'basic' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <SectionTitle>제품 기본정보</SectionTitle>
          <FieldGrid>
            <Field label="제품명 *" error={errorFor('product_name')}>
              <TextInput value={form.product_name} onChange={set('product_name')} placeholder="예) 버티컬 마우스" />
            </Field>
            <Field label="대표 키워드 *" error={errorFor('primary_keyword')}>
              <TextInput value={form.primary_keyword} onChange={set('primary_keyword')} />
            </Field>
            <Field label="카테고리">
              <Select value={form.category} onChange={set('category')} options={CATEGORIES} />
            </Field>
            <Field label="상태" error={errorFor('status')}>
              <Select value={form.status} onChange={set('status')} options={STATUSES} placeholder="조사 전" />
            </Field>
            <Field label="보조 키워드" hint="쉼표로 구분" span={2}>
              <TextInput
                value={(form.secondary_keywords || []).join(', ')}
                onChange={(v) => set('secondary_keywords')(
                  v === null ? [] : v.split(',').map((s) => s.trim()).filter(Boolean)
                )}
              />
            </Field>
            <Field label="브랜드명"><TextInput value={form.brand_name} onChange={set('brand_name')} /></Field>
            <Field label="판매자명"><TextInput value={form.seller_name} onChange={set('seller_name')} /></Field>
          </FieldGrid>

          <FieldGrid min={260}>
            <Field label="제품 설명"><TextArea value={form.description} onChange={set('description')} /></Field>
            <Field label="조사 목적"><TextArea value={form.research_purpose} onChange={set('research_purpose')} /></Field>
          </FieldGrid>

          <SectionTitle>쿠팡 상품 정보</SectionTitle>
          <FieldGrid>
            <Field label="쿠팡 상품명" span={2}>
              <TextInput value={form.coupang_product_name} onChange={set('coupang_product_name')} />
            </Field>
            <Field label="쿠팡 상품 URL" error={errorFor('coupang_url')} span={2}>
              <TextInput value={form.coupang_url} onChange={set('coupang_url')} placeholder="https://www.coupang.com/..." />
            </Field>
            <Field label="쿠팡파트너스 URL" error={errorFor('affiliate_url')} span={2}
                   hint="상품 URL과 별도로 관리합니다">
              <TextInput value={form.affiliate_url} onChange={set('affiliate_url')} placeholder="https://link.coupang.com/..." />
            </Field>
            <Field label="대표 이미지 URL" error={errorFor('image_url')} span={2}>
              <TextInput value={form.image_url} onChange={set('image_url')} />
            </Field>
            <Field label="판매가격 (원)" error={errorFor('price')}>
              <NumberInput value={form.price} onChange={set('price')} min={0} />
            </Field>
            <Field label="평점 (0~5)" error={errorFor('rating')}>
              <NumberInput value={form.rating} onChange={set('rating')} min={0} max={5} step={0.1} />
            </Field>
            <Field label="후기 총수" error={errorFor('review_count')}>
              <NumberInput value={form.review_count} onChange={set('review_count')} min={0} />
            </Field>
            <Field label="로켓배송 여부">
              <TriToggle value={form.rocket_delivery} onChange={set('rocket_delivery')} />
            </Field>
            <Field label="최종 확인일" hint="30일 이상 지나면 경고가 표시됩니다">
              <DateInput value={form.last_checked_at} onChange={set('last_checked_at')} />
            </Field>
          </FieldGrid>

          <Field label="관리자 메모">
            <TextArea value={form.admin_memo} onChange={set('admin_memo')} />
          </Field>
        </div>
      )}

      {/* ─── 검색 데이터 ──────────────────────────────────────────────────── */}
      {tab === 'search' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <SectionTitle right={<DerivedChip label="자동 합계" value={fmtNumber(autoTotal, '회')} />}>
            검색량
          </SectionTitle>
          <FieldGrid>
            <Field label="PC 월간 검색량" error={errorFor('pc_monthly_search')}>
              <NumberInput value={form.pc_monthly_search} onChange={set('pc_monthly_search')} min={0} />
            </Field>
            <Field label="모바일 월간 검색량" error={errorFor('mobile_monthly_search')}>
              <NumberInput value={form.mobile_monthly_search} onChange={set('mobile_monthly_search')} min={0} />
            </Field>
            <Field
              label="월간 총검색량"
              error={errorFor('total_monthly_search')}
              hint="비워두면 PC+모바일 자동 합계를 사용합니다"
            >
              <NumberInput
                value={form.total_monthly_search}
                onChange={set('total_monthly_search')}
                min={0}
                placeholder={autoTotal !== null ? String(autoTotal) : '자동 계산'}
              />
            </Field>
            <Field label="월평균 클릭수">
              <NumberInput value={form.average_click_count} onChange={set('average_click_count')} min={0} step={0.1} />
            </Field>
            <Field label="월평균 클릭률 (%)" error={errorFor('average_click_rate')}>
              <NumberInput value={form.average_click_rate} onChange={set('average_click_rate')} min={0} max={100} step={0.01} />
            </Field>
            <Field label="25~54세 비중 (%)" error={errorFor('age_25_54_ratio')}>
              <NumberInput value={form.age_25_54_ratio} onChange={set('age_25_54_ratio')} min={0} max={100} step={0.1} />
            </Field>
            <Field label="최근 3개월 검색 증감률 (%)" hint="감소는 음수로 입력">
              <NumberInput value={form.search_trend_3_month} onChange={set('search_trend_3_month')} step={0.1} />
            </Field>
            <Field label="최근 12개월 검색 추세 (%)">
              <NumberInput value={form.search_trend_12_month} onChange={set('search_trend_12_month')} step={0.1} />
            </Field>
            <Field label="검색 경쟁도" error={errorFor('search_competition')} hint="낮을수록 점수가 높습니다">
              <Select value={form.search_competition} onChange={set('search_competition')} options={COMPETITION_LEVELS} />
            </Field>
            <Field label="검색광고 경쟁 정도" error={errorFor('ad_competition')}>
              <Select value={form.ad_competition} onChange={set('ad_competition')} options={COMPETITION_LEVELS} />
            </Field>
            <Field label="관련 상품 수" error={errorFor('related_product_count')}>
              <NumberInput value={form.related_product_count} onChange={set('related_product_count')} min={0} />
            </Field>
            <Field label="검색 데이터 성격" hint="공식 수치와 추정치를 구분합니다">
              <Select value={form.search_source_kind} onChange={set('search_source_kind')} options={SOURCE_KINDS} />
            </Field>
          </FieldGrid>
          <SourceNote>
            출처명 · 원본 URL · 확인일 · 증빙 이미지는 <strong>상세 화면의 &quot;데이터 출처&quot;</strong>에서 항목별로 기록합니다.
          </SourceNote>
        </div>
      )}

      {/* ─── 쇼핑 관심도 ──────────────────────────────────────────────────── */}
      {tab === 'shopping' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <SectionTitle>네이버 쇼핑 관심도</SectionTitle>
          <FieldGrid>
            <Field label="네이버 쇼핑 클릭지수">
              <NumberInput value={form.shopping_click_index} onChange={set('shopping_click_index')} step={0.1} />
            </Field>
            <Field label="데이터 성격" error={errorFor('shopping_source_kind')}>
              <Select value={form.shopping_source_kind} onChange={set('shopping_source_kind')} options={SOURCE_KINDS} />
            </Field>
            <Field label="최근 3개월 쇼핑 클릭 증감률 (%)">
              <NumberInput value={form.shopping_trend_3_month} onChange={set('shopping_trend_3_month')} step={0.1} />
            </Field>
            <Field label="최근 12개월 쇼핑 추세 (%)">
              <NumberInput value={form.shopping_trend_12_month} onChange={set('shopping_trend_12_month')} step={0.1} />
            </Field>
            <Field label="주요 관심 연령대">
              <TextInput value={form.shopping_main_age_group} onChange={set('shopping_main_age_group')} placeholder="예) 30대" />
            </Field>
            <Field label="모바일 비중 (%)" error={errorFor('shopping_mobile_ratio')}>
              <NumberInput value={form.shopping_mobile_ratio} onChange={set('shopping_mobile_ratio')} min={0} max={100} step={0.1} />
            </Field>
            <Field
              label="클릭지수 성격 메모"
              span={2}
              hint="절대값인지 상대지수인지, 기준 기간은 언제인지 기록하세요"
            >
              <TextInput value={form.shopping_index_note} onChange={set('shopping_index_note')}
                         placeholder="예) 데이터랩 상대지수(최대 100 기준), 2026-07 기준" />
            </Field>
          </FieldGrid>
          <SourceNote>클릭지수는 플랫폼 상대지수일 수 있습니다. 절대 판매량으로 해석하지 마세요.</SourceNote>
        </div>
      )}

      {/* ─── 쿠팡 판매 신호 ───────────────────────────────────────────────── */}
      {tab === 'coupang' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <SectionTitle
            right={
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <DerivedChip label="측정 기간" value={derived.measurement_days === null ? null : `${derived.measurement_days}일`} emptyLabel="기간 확인 필요" />
                <DerivedChip label="후기 증가량" value={fmtNumber(derived.review_increase, '개')} />
                <DerivedChip label="30일 환산" value={fmtNumber(derived.normalized_30_day_review_increase, '개')} emptyLabel="기간 확인 필요" />
              </div>
            }
          >
            후기 증가 측정
          </SectionTitle>
          <FieldGrid>
            <Field label="현재 후기 수" error={errorFor('current_review_count')}>
              <NumberInput value={form.current_review_count} onChange={set('current_review_count')} min={0} />
            </Field>
            <Field label="이전 측정 후기 수" error={errorFor('previous_review_count')}>
              <NumberInput value={form.previous_review_count} onChange={set('previous_review_count')} min={0} />
            </Field>
            <Field label="측정 기간 시작일">
              <DateInput value={form.measurement_start_date} onChange={set('measurement_start_date')} />
            </Field>
            <Field label="측정 기간 종료일" error={errorFor('measurement_end_date')}>
              <DateInput value={form.measurement_end_date} onChange={set('measurement_end_date')} />
            </Field>
            <Field label="상품 평점 (0~5)" error={errorFor('rating')} hint="기본정보 탭과 같은 값입니다">
              <NumberInput value={form.rating} onChange={set('rating')} min={0} max={5} step={0.1} />
            </Field>
            <Field label="품절 여부">
              <Select value={form.stock_status} onChange={set('stock_status')} options={STOCK_STATUSES} />
            </Field>
            <Field label="쿠팡 추천상품 노출">
              <TriToggle value={form.recommendation_badge} onChange={set('recommendation_badge')} />
            </Field>
            <Field label="카테고리 베스트">
              <TriToggle value={form.category_best} onChange={set('category_best')} />
            </Field>
            <Field label="쿠팡 데이터 성격">
              <Select value={form.coupang_source_kind} onChange={set('coupang_source_kind')} options={SOURCE_KINDS} />
            </Field>
            <Field label="품절 · 재입고 메모" span={2}>
              <TextInput value={form.stock_memo} onChange={set('stock_memo')} />
            </Field>
          </FieldGrid>
          <SourceNote>
            후기 증가량 = 현재 후기 수 − 이전 측정 후기 수 · 30일 환산 = 증가량 ÷ 측정 일수 × 30
            (측정 기간이 0일이면 계산하지 않습니다)
          </SourceNote>
        </div>
      )}

      {/* ─── 수익성 · 적합성 ──────────────────────────────────────────────── */}
      {tab === 'profit' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <SectionTitle right={<DerivedChip label="건당 예상 수익" value={fmtMoney(derived.estimated_commission_amount)} />}>
            수익성
          </SectionTitle>
          <FieldGrid>
            <Field label="예상 상품가격 (원)" error={errorFor('estimated_price')} hint="비우면 판매가격을 사용합니다">
              <NumberInput value={form.estimated_price} onChange={set('estimated_price')} min={0} />
            </Field>
            <Field label="예상 제휴 수수료율 (%)" error={errorFor('estimated_commission_rate')} hint="퍼센트로 입력">
              <NumberInput value={form.estimated_commission_rate} onChange={set('estimated_commission_rate')} min={0} max={100} step={0.1} />
            </Field>
            <Field label="반품 위험도" error={errorFor('return_risk')} hint="낮을수록 유리">
              <Select value={form.return_risk} onChange={set('return_risk')} options={LEVEL_3} />
            </Field>
            <Field label="판매자 안정성" error={errorFor('seller_stability')}>
              <Select value={form.seller_stability} onChange={set('seller_stability')} options={LEVEL_3} />
            </Field>
            <Field label="상품 페이지 안정성" error={errorFor('product_page_stability')}>
              <Select value={form.product_page_stability} onChange={set('product_page_stability')} options={LEVEL_3} />
            </Field>
            <Field label="계절성">
              <TextInput value={form.seasonality} onChange={set('seasonality')} placeholder="예) 겨울 수요 집중" />
            </Field>
            <Field label="직접 구매 가능 여부">
              <TriToggle value={form.direct_purchase_possible} onChange={set('direct_purchase_possible')} />
            </Field>
            <Field label="직접 사용 후기 작성 가능">
              <TriToggle value={form.direct_review_possible} onChange={set('direct_review_possible')} />
            </Field>
            <Field label="sureline 기존 콘텐츠 관련성" error={errorFor('sureline_relevance')}>
              <Select value={form.sureline_relevance} onChange={set('sureline_relevance')} options={LEVEL_3} />
            </Field>
            <Field label="의료효능 과장 위험" error={errorFor('medical_claim_risk')} hint="높을수록 주의">
              <Select value={form.medical_claim_risk} onChange={set('medical_claim_risk')} options={LEVEL_3} />
            </Field>
          </FieldGrid>
          <Field label="종합 메모">
            <TextArea value={form.profitability_memo} onChange={set('profitability_memo')} />
          </Field>
        </div>
      )}
    </Modal>
  );
}

function DerivedChip({ label, value, emptyLabel = '미입력' }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 999,
      background: '#eff6ff', color: '#1d4ed8', border: '1px solid #dbeafe',
    }}>
      <span style={{ opacity: 0.7 }}>{label}</span>
      {hasValue(value) ? value : <Empty label={emptyLabel} />}
    </span>
  );
}

function SourceNote({ children }) {
  return (
    <div style={{
      fontSize: 11, color: T.sub, background: '#f8fafc',
      border: `1px solid ${T.borderSoft}`, borderRadius: 8, padding: '8px 10px', lineHeight: 1.6,
    }}>
      {children}
    </div>
  );
}
