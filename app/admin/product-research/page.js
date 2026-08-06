'use client';
/**
 * /admin/product-research — 직장인 관심제품 분석 대시보드
 * 관리자 인증(localStorage admin_token)을 통과한 사용자만 접근할 수 있다.
 */
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminNav from '@/components/admin/AdminNav';
import {
  Button, Badge, Empty, Card, Modal, T, ScorePill, ScoreBar,
} from '@/components/product-research/ui';
import CandidateFormModal from '@/components/product-research/CandidateFormModal';
import CompareModal from '@/components/product-research/CompareModal';
import CsvImportModal from '@/components/product-research/CsvImportModal';
import ScoreSettingsModal from '@/components/product-research/ScoreSettingsModal';
import FinalCandidateModal from '@/components/product-research/FinalCandidateModal';
import HistoryRecordModal from '@/components/product-research/HistoryRecordModal';
import {
  STATUSES, STATUS_STYLES, CATEGORIES, COMPETITION_LEVELS, STALE_DAYS,
} from '@/lib/product-research/constants.js';
import { hasValue, daysSince } from '@/lib/product-research/calc.js';
import { fmtNumber, fmtPercent, fmtMoney, fmtDate } from '@/lib/product-research/format.js';

const MAX_COMPARE = 5;

const SORT_COLUMNS = [
  { key: 'rank',                   label: '순위',        width: 52,  numeric: false },
  { key: 'product_name',           label: '제품명',      width: 170, numeric: false },
  { key: 'primary_keyword',        label: '대표 키워드', width: 130, numeric: false },
  { key: 'category',               label: '카테고리',    width: 110, numeric: false },
  { key: 'total_monthly_search',   label: '월간 검색량', width: 100, numeric: true },
  { key: 'age_25_54_ratio',        label: '25~54세',     width: 78,  numeric: true },
  { key: 'search_trend_3_month',   label: '3개월 추세',  width: 88,  numeric: true },
  { key: 'shopping_click_index',   label: '쇼핑 관심도', width: 88,  numeric: true },
  { key: 'normalized_30_day_review_increase', label: '후기 증가(30일)', width: 108, numeric: true },
  { key: 'search_competition',     label: '경쟁도',      width: 82,  numeric: true },
  { key: 'price',                  label: '판매가격',    width: 96,  numeric: true },
  { key: 'total_score',            label: '종합점수',    width: 96,  numeric: true },
  { key: 'status',                 label: '상태',        width: 92,  numeric: false },
  { key: 'last_checked_at',        label: '최종 확인일', width: 100, numeric: false },
];

/** 모바일에서도 보여줄 핵심 컬럼 */
const CORE_COLUMNS = new Set(['rank', 'product_name', 'total_score', 'status']);

export default function ProductResearchPage() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [candidates, setCandidates] = useState([]);
  const [settings, setSettings] = useState([]);
  const [providers, setProviders] = useState([]);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  // 필터
  const [search, setSearch] = useState('');
  const [fCategory, setFCategory] = useState('all');
  const [fStatus, setFStatus] = useState('all');
  const [fCompetition, setFCompetition] = useState('all');
  const [fRocket, setFRocket] = useState('all');
  const [fScore, setFScore] = useState('all');
  const [fChecked, setFChecked] = useState('all');

  const [sort, setSort] = useState({ key: 'total_score', dir: 'desc' });
  const [selected, setSelected] = useState(new Set());

  // 모달
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [compareOpen, setCompareOpen] = useState(false);
  const [csvOpen, setCsvOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [finalId, setFinalId] = useState(null);
  const [historyTarget, setHistoryTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [busy, setBusy] = useState('');
  const [diagnosis, setDiagnosis] = useState(null);
  const [fetchProgress, setFetchProgress] = useState(null);

  const authFetch = useCallback(async (url, init = {}) => {
    const token = localStorage.getItem('admin_token');
    return fetch(url, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(init.headers || {}),
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    });
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await authFetch('/api/admin/product-research');
      if (res.status === 401) { router.replace('/'); return; }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '데이터를 불러오지 못했습니다.');
      setCandidates(data.candidates || []);
      setSettings(data.settings || []);
      setProviders(data.providers || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [authFetch, router]);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) { router.replace('/'); return; }
    setAuthChecked(true);
    load();
  }, [load, router]);

  const flash = (text) => { setMsg(text); setTimeout(() => setMsg(''), 3500); };

  // ─── 순위 부여 (점수 내림차순) ───────────────────────────────────────────
  const ranked = useMemo(() => {
    const withScore = [...candidates].sort(
      (a, b) => (hasValue(b.total_score) ? Number(b.total_score) : -1) - (hasValue(a.total_score) ? Number(a.total_score) : -1)
    );
    return withScore.map((c, i) => ({ ...c, rank: i + 1 }));
  }, [candidates]);

  // ─── 필터 ────────────────────────────────────────────────────────────────
  const filtered = useMemo(() => ranked.filter((c) => {
    if (search) {
      const q = search.toLowerCase();
      const hit = [c.product_name, c.primary_keyword, c.category, (c.secondary_keywords || []).join(' ')]
        .some((v) => String(v ?? '').toLowerCase().includes(q));
      if (!hit) return false;
    }
    if (fCategory !== 'all' && c.category !== fCategory) return false;
    if (fStatus !== 'all' && c.status !== fStatus) return false;
    if (fCompetition !== 'all' && c.search_competition !== fCompetition) return false;
    if (fRocket === 'yes' && c.rocket_delivery !== true) return false;
    if (fRocket === 'no' && c.rocket_delivery !== false) return false;
    if (fRocket === 'unknown' && hasValue(c.rocket_delivery)) return false;

    if (fScore !== 'all') {
      const s = hasValue(c.total_score) ? Number(c.total_score) : null;
      if (fScore === 'none' && s !== null) return false;
      if (fScore === '80' && (s === null || s < 80)) return false;
      if (fScore === '60' && (s === null || s < 60 || s >= 80)) return false;
      if (fScore === '40' && (s === null || s < 40 || s >= 60)) return false;
      if (fScore === 'low' && (s === null || s >= 40)) return false;
    }

    if (fChecked !== 'all') {
      const age = daysSince(c.last_checked_at);
      if (fChecked === 'none' && age !== null) return false;
      if (fChecked === 'fresh' && (age === null || age >= STALE_DAYS)) return false;
      if (fChecked === 'stale' && (age === null || age < STALE_DAYS)) return false;
    }
    return true;
  }), [ranked, search, fCategory, fStatus, fCompetition, fRocket, fScore, fChecked]);

  // ─── 정렬 ────────────────────────────────────────────────────────────────
  const sorted = useMemo(() => {
    const col = SORT_COLUMNS.find((c) => c.key === sort.key);
    const arr = [...filtered];
    arr.sort((a, b) => {
      let av = a[sort.key];
      let bv = b[sort.key];
      if (sort.key === 'search_competition') {
        av = COMPETITION_LEVELS.indexOf(String(av));
        bv = COMPETITION_LEVELS.indexOf(String(bv));
        if (av === -1) av = null;
        if (bv === -1) bv = null;
      }
      const aEmpty = !hasValue(av);
      const bEmpty = !hasValue(bv);
      if (aEmpty && bEmpty) return 0;
      if (aEmpty) return 1;   // 미입력은 항상 뒤로
      if (bEmpty) return -1;

      let cmp;
      if (col?.numeric || typeof av === 'number') cmp = Number(av) - Number(bv);
      else cmp = String(av).localeCompare(String(bv), 'ko');
      return sort.dir === 'asc' ? cmp : -cmp;
    });
    return arr;
  }, [filtered, sort]);

  /** 일괄 수집 대상 — 선택이 있으면 선택분, 없으면 현재 필터에 걸린 전체 */
  const fetchTargets = useMemo(
    () => (selected.size > 0 ? sorted.filter((c) => selected.has(c.id)) : sorted),
    [sorted, selected]
  );

  const toggleSort = (key) =>
    setSort((prev) => (prev.key === key
      ? { key, dir: prev.dir === 'desc' ? 'asc' : 'desc' }
      : { key, dir: key === 'product_name' || key === 'primary_keyword' || key === 'category' ? 'asc' : 'desc' }));

  // ─── 요약 ────────────────────────────────────────────────────────────────
  const summary = useMemo(() => {
    const total = candidates.length;
    const done = candidates.filter((c) => c.status === '분석 완료' || c.status === '최종 후보').length;
    const needCheck = candidates.filter((c) => {
      const age = daysSince(c.last_checked_at);
      return age === null || age >= STALE_DAYS || !hasValue(c.total_monthly_search);
    }).length;
    const top = ranked.find((c) => hasValue(c.total_score)) ?? null;
    const recent = candidates.filter((c) => {
      const age = daysSince(c.created_at);
      return age !== null && age <= 7;
    }).length;
    const lastUpdated = candidates
      .map((c) => c.updated_at)
      .filter(Boolean)
      .sort()
      .pop();
    return { total, done, needCheck, top, recent, lastUpdated };
  }, [candidates, ranked]);

  // ─── 액션 ────────────────────────────────────────────────────────────────
  const handleCreate = async (form) => {
    const res = await authFetch('/api/admin/product-research', {
      method: 'POST', body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || '저장에 실패했습니다.');
    setFormOpen(false);
    flash(`"${data.candidate.product_name}" 후보를 추가했습니다.`);
    load();
  };

  const handleUpdate = async (form) => {
    const res = await authFetch(`/api/admin/product-research/${editing.id}`, {
      method: 'PATCH', body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || '저장에 실패했습니다.');
    setFormOpen(false);
    setEditing(null);
    flash('수정 내용을 저장했습니다.');
    load();
  };

  const changeStatus = async (candidate, status) => {
    setBusy(`status-${candidate.id}`);
    try {
      const res = await authFetch(`/api/admin/product-research/${candidate.id}`, {
        method: 'PATCH', body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '상태 변경 실패');
      setCandidates((prev) => prev.map((c) => (c.id === candidate.id ? { ...c, status } : c)));
      flash(`"${candidate.product_name}" 상태를 ${status}(으)로 변경했습니다.`);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy('');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setBusy('delete');
    try {
      const res = await authFetch(`/api/admin/product-research/${deleteTarget.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error((await res.json()).error || '삭제 실패');
      setCandidates((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      setSelected((prev) => { const n = new Set(prev); n.delete(deleteTarget.id); return n; });
      flash(`"${deleteTarget.product_name}" 후보를 삭제했습니다.`);
      setDeleteTarget(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy('');
    }
  };

  const handleRecalculate = async () => {
    setBusy('recalc');
    try {
      const res = await authFetch('/api/admin/product-research/recalculate', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '재계산 실패');
      flash(`점수 재계산 완료 — 후보 ${data.total}건 중 ${data.changed}건 변경`);
      load();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy('');
    }
  };

  const handleExport = async () => {
    setBusy('export');
    try {
      const res = await authFetch('/api/admin/product-research/export');
      if (!res.ok) throw new Error('내보내기에 실패했습니다.');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `product-research-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy('');
    }
  };

  /**
   * 네이버 검색 지표 일괄 수집.
   * 선택한 후보가 있으면 그것만, 없으면 현재 필터에 걸린 후보 전체를 대상으로 한다.
   * 네이버 호출 한도를 배려해 순차로 보내고 사이에 짧은 간격을 둔다.
   */
  const fetchNaverBulk = async () => {
    const targets = fetchTargets;
    if (targets.length === 0) return;

    setBusy('fetch');
    setError('');
    setFetchProgress({ done: 0, total: targets.length });
    const failed = [];
    let done = 0;

    for (const c of targets) {
      try {
        const res = await authFetch(`/api/admin/product-research/${c.id}/fetch`, { method: 'POST' });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || '수집 실패');
        done += 1;
      } catch (e) {
        failed.push(`${c.product_name}: ${e.message}`);
      }
      setFetchProgress({ done: done + failed.length, total: targets.length });
      await new Promise((r) => setTimeout(r, 250));
    }

    setBusy('');
    setFetchProgress(null);
    if (failed.length) setError(`수집 실패 ${failed.length}건 — ${failed.join(' / ')}`);
    flash(`네이버 검색량 수집 완료 — ${done}건 반영${failed.length ? `, ${failed.length}건 실패` : ''}`);
    load();
  };

  const runDiagnose = async () => {
    setBusy('diagnose');
    setDiagnosis(null);
    try {
      const res = await authFetch('/api/admin/product-research/diagnose');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '진단에 실패했습니다.');
      setDiagnosis(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy('');
    }
  };

  const toggleSelect = (id) => setSelected((prev) => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    return next;
  });

  // 화면에 보이는(필터 적용된) 후보 전체 선택 / 해제
  const allVisibleSelected = sorted.length > 0 && sorted.every((c) => selected.has(c.id));
  const someVisibleSelected = sorted.some((c) => selected.has(c.id));

  const toggleSelectAllVisible = () =>
    setSelected((prev) => {
      if (allVisibleSelected) {
        const next = new Set(prev);
        for (const c of sorted) next.delete(c.id);
        return next;
      }
      return new Set([...prev, ...sorted.map((c) => c.id)]);
    });

  const selectedCandidates = ranked.filter((c) => selected.has(c.id));
  const canCompare = selected.size >= 2 && selected.size <= MAX_COMPARE;
  const notConnected = providers.filter((p) => !p.connected);

  if (!authChecked) return null;

  return (
    <div style={{ minHeight: '100vh', background: T.bg }}>
      {/* 헤더 */}
      <div style={{
        background: '#fff', borderBottom: `1px solid ${T.border}`,
        padding: '0 16px', minHeight: 52,
        display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
      }}>
        <Link href="/" style={{ fontSize: 13, color: T.sub, textDecoration: 'none' }}>← 홈</Link>
        <AdminNav />
        <div style={{ flex: 1 }} />
        {msg && <span style={{ fontSize: 12, fontWeight: 700, color: T.success }}>{msg}</span>}
        <Button onClick={load} size="sm">새로고침</Button>
      </div>

      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '20px 14px 60px' }}>
        {/* 타이틀 */}
        <header style={{ marginBottom: 16 }}>
          <h1 style={{ fontSize: 20, fontWeight: 900, color: T.text, margin: 0, letterSpacing: '-0.02em' }}>
            직장인 관심제품 분석
          </h1>
          <p style={{ fontSize: 13, color: T.sub, margin: '6px 0 0', lineHeight: 1.6, wordBreak: 'keep-all' }}>
            검색량, 연령 적합도, 쇼핑 관심도, 쿠팡 판매 신호와 경쟁도를 종합해 sureline.kr에서 다룰 단일 추천제품을 선정합니다.
          </p>
        </header>

        {error && (
          <div style={{
            background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10,
            padding: '10px 12px', marginBottom: 14, fontSize: 12.5, color: '#b91c1c', fontWeight: 600,
          }}>
            ✕ {error}
          </div>
        )}

        {/* 요약 카드 */}
        <div style={{
          display: 'grid', gap: 10, marginBottom: 16,
          gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
        }}>
          <SummaryCard label="전체 후보" value={summary.total} unit="개" />
          <SummaryCard label="분석 완료" value={summary.done} unit="개" color={T.success} />
          <SummaryCard label="데이터 확인 필요" value={summary.needCheck} unit="개" color={T.warn} />
          <SummaryCard
            label="종합점수 1위"
            text={summary.top ? summary.top.product_name : null}
            sub={summary.top ? `${summary.top.total_score}점` : null}
          />
          <SummaryCard label="최근 7일 추가" value={summary.recent} unit="개" />
          <SummaryCard label="마지막 데이터 갱신" text={fmtDate(summary.lastUpdated)} />
        </div>

        {/* 상단 버튼 */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
          <Button variant="primary" onClick={() => { setEditing(null); setFormOpen(true); }}>＋ 제품 후보 추가</Button>
          <Button onClick={() => setCsvOpen(true)}>CSV 가져오기</Button>
          <Button onClick={handleExport} disabled={busy === 'export'}>
            {busy === 'export' ? '내보내는 중…' : 'CSV 내보내기'}
          </Button>
          <Button onClick={() => setSettingsOpen(true)}>평가기준 설정</Button>
          <Button variant="soft" onClick={handleRecalculate} disabled={busy === 'recalc'}>
            {busy === 'recalc' ? '계산 중…' : '점수 다시 계산'}
          </Button>
          <div style={{ flex: 1 }} />
          <Button
            variant="soft"
            onClick={fetchNaverBulk}
            disabled={fetchTargets.length === 0 || busy === 'fetch'}
            title={selected.size > 0
              ? '선택한 후보의 대표 키워드로 네이버 검색량을 가져옵니다'
              : '현재 필터에 걸린 후보 전체의 검색량을 가져옵니다'}
          >
            {busy === 'fetch' && fetchProgress
              ? `수집 중… ${fetchProgress.done}/${fetchProgress.total}`
              : `네이버 검색량 수집 (${selected.size > 0 ? `선택 ${fetchTargets.length}` : `전체 ${fetchTargets.length}`})`}
          </Button>
          <Button
            variant={canCompare ? 'primary' : 'default'}
            onClick={() => setCompareOpen(true)}
            disabled={!canCompare}
            title={selected.size > MAX_COMPARE
              ? `비교는 최대 ${MAX_COMPARE}개까지입니다. 현재 ${selected.size}개 선택됨`
              : '2~5개를 선택하면 가로로 비교합니다'}
          >
            선택 비교 ({selected.size}/{MAX_COMPARE})
          </Button>
          {selected.size > 0 && (
            <Button variant="ghost" onClick={() => setSelected(new Set())}>선택 해제</Button>
          )}
        </div>

        {/* 필터 */}
        <Card style={{ marginBottom: 14, padding: 12 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="제품명 · 키워드 검색…"
              style={{
                flex: '1 1 200px', minWidth: 160, padding: '7px 12px', fontSize: 13,
                border: `1.5px solid ${T.primaryBorder}`, borderRadius: 8, outline: 'none',
              }}
            />
            <FilterSelect value={fCategory} onChange={setFCategory} label="카테고리" options={CATEGORIES} />
            <FilterSelect value={fStatus} onChange={setFStatus} label="분석 상태" options={STATUSES} />
            <FilterSelect value={fCompetition} onChange={setFCompetition} label="경쟁도" options={COMPETITION_LEVELS} />
            <FilterSelect
              value={fRocket} onChange={setFRocket} label="로켓배송"
              options={[{ value: 'yes', label: '로켓배송' }, { value: 'no', label: '미적용' }, { value: 'unknown', label: '미입력' }]}
            />
            <FilterSelect
              value={fScore} onChange={setFScore} label="종합점수"
              options={[
                { value: '80', label: '80점 이상' },
                { value: '60', label: '60~79점' },
                { value: '40', label: '40~59점' },
                { value: 'low', label: '40점 미만' },
                { value: 'none', label: '점수 없음' },
              ]}
            />
            <FilterSelect
              value={fChecked} onChange={setFChecked} label="데이터 확인일"
              options={[
                { value: 'fresh', label: `${STALE_DAYS}일 이내` },
                { value: 'stale', label: `${STALE_DAYS}일 경과` },
                { value: 'none', label: '확인일 없음' },
              ]}
            />
            <span style={{ fontSize: 11.5, color: T.muted, marginLeft: 'auto' }}>
              {filtered.length} / {candidates.length}개 표시
            </span>
          </div>
        </Card>

        {/* 테이블 */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: T.muted, fontSize: 14 }}>불러오는 중…</div>
        ) : sorted.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: T.muted, fontSize: 14 }}>
            조건에 맞는 후보가 없습니다.
          </div>
        ) : (
          <div style={{
            background: '#fff', border: `1px solid ${T.border}`, borderRadius: 12,
            overflowX: 'auto',
          }}>
            <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: 1180, fontSize: 12.5 }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  <th style={{ ...thStyle, width: 36 }}>
                    <input
                      type="checkbox"
                      checked={allVisibleSelected}
                      ref={(el) => { if (el) el.indeterminate = someVisibleSelected && !allVisibleSelected; }}
                      onChange={toggleSelectAllVisible}
                      aria-label={allVisibleSelected ? '전체 선택 해제' : '전체 선택'}
                      title={allVisibleSelected ? '전체 선택 해제' : '보이는 후보 전체 선택'}
                      style={{ width: 14, height: 14, accentColor: T.primary, cursor: 'pointer' }}
                    />
                  </th>
                  {SORT_COLUMNS.map((col) => (
                    <th
                      key={col.key}
                      className={CORE_COLUMNS.has(col.key) ? '' : 'pr-optional-col'}
                      style={{ ...thStyle, width: col.width, cursor: 'pointer', userSelect: 'none' }}
                      onClick={() => toggleSort(col.key)}
                      aria-sort={sort.key === col.key ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'}
                    >
                      {col.label}
                      <span style={{ marginLeft: 3, opacity: sort.key === col.key ? 1 : 0.25 }}>
                        {sort.key === col.key ? (sort.dir === 'asc' ? '▲' : '▼') : '▼'}
                      </span>
                    </th>
                  ))}
                  <th style={{ ...thStyle, width: 230 }}>관리</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((c) => {
                  const excluded = c.status === '제외';
                  const age = daysSince(c.last_checked_at);
                  const stale = age !== null && age >= STALE_DAYS;
                  const st = STATUS_STYLES[c.status] ?? STATUS_STYLES['조사 전'];
                  const checked = selected.has(c.id);

                  return (
                    <tr
                      key={c.id}
                      style={{
                        borderTop: `1px solid ${T.borderSoft}`,
                        background: c.is_final_candidate ? '#fffbeb' : checked ? '#f0f4ff' : '#fff',
                        opacity: excluded ? 0.5 : 1,
                      }}
                    >
                      <td style={tdStyle}>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleSelect(c.id)}
                          aria-label={`${c.product_name} 선택`}
                          style={{ width: 14, height: 14, accentColor: T.primary, cursor: 'pointer' }}
                        />
                      </td>

                      <td style={{ ...tdStyle, fontWeight: 800, color: T.muted }}>{c.rank}</td>

                      <td style={tdStyle}>
                        <Link
                          href={`/admin/product-research/${c.id}`}
                          style={{ fontWeight: 700, color: T.text, textDecoration: 'none' }}
                        >
                          {c.product_name}
                        </Link>
                        <div style={{ display: 'flex', gap: 4, marginTop: 3, flexWrap: 'wrap' }}>
                          {c.is_final_candidate && <Badge bg="#fef3c7" fg={T.warnFg} icon="★">최종 후보</Badge>}
                          {stale && <Badge bg="#fff7ed" fg="#9a3412" icon="!">{age}일 경과</Badge>}
                        </div>
                      </td>

                      <td className="pr-optional-col" style={{ ...tdStyle, color: T.sub }}>{c.primary_keyword}</td>
                      <td className="pr-optional-col" style={tdStyle}><Val>{c.category}</Val></td>
                      <td className="pr-optional-col" style={tdNum}><Val>{fmtNumber(c.total_monthly_search)}</Val></td>
                      <td className="pr-optional-col" style={tdNum}>
                        <Val>{hasValue(c.age_25_54_ratio) ? `${Number(c.age_25_54_ratio)}%` : null}</Val>
                      </td>
                      <td className="pr-optional-col" style={tdNum}>
                        <Trend value={c.search_trend_3_month} />
                      </td>
                      <td className="pr-optional-col" style={tdNum}><Val>{fmtNumber(c.shopping_click_index)}</Val></td>
                      <td className="pr-optional-col" style={tdNum}>
                        <Val>{fmtNumber(c.normalized_30_day_review_increase)}</Val>
                      </td>
                      <td className="pr-optional-col" style={tdStyle}><Val>{c.search_competition}</Val></td>
                      <td className="pr-optional-col" style={tdNum}><Val>{fmtMoney(c.price)}</Val></td>

                      <td style={tdStyle}>
                        {hasValue(c.total_score) ? (
                          <div style={{ minWidth: 74 }}>
                            <ScorePill score={Number(c.total_score)} max={100} />
                            <div style={{ marginTop: 3 }}>
                              <ScoreBar score={Number(c.total_score)} max={100} height={5} />
                            </div>
                          </div>
                        ) : <Empty label="계산 전" />}
                      </td>

                      <td style={tdStyle}>
                        <Badge bg={st.bg} fg={st.fg} icon={st.icon}>{c.status}</Badge>
                      </td>

                      <td className="pr-optional-col" style={tdStyle}>
                        <Val>{fmtDate(c.last_checked_at)}</Val>
                      </td>

                      <td style={tdStyle}>
                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                          <Button size="sm" onClick={() => router.push(`/admin/product-research/${c.id}`)}>상세</Button>
                          <Button size="sm" variant="soft" onClick={() => { setEditing(c); setFormOpen(true); }}>수정</Button>
                          <Button size="sm" onClick={() => setHistoryTarget(c)}>기록</Button>
                          <Button size="sm" onClick={() => setFinalId(c.id)} disabled={c.is_final_candidate}>
                            최종 후보
                          </Button>
                          <select
                            value=""
                            onChange={(e) => { if (e.target.value) changeStatus(c, e.target.value); }}
                            disabled={busy === `status-${c.id}`}
                            aria-label="상태 변경"
                            style={{
                              fontSize: 11, padding: '4px 6px', borderRadius: 7,
                              border: `1px solid ${T.primaryBorder}`, color: T.sub, cursor: 'pointer',
                            }}
                          >
                            <option value="">상태…</option>
                            {STATUSES.filter((s) => s !== c.status).map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                          <Button size="sm" variant="danger" onClick={() => setDeleteTarget(c)}>삭제</Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* 외부 데이터 연결 상태 */}
        {notConnected.length > 0 && (
          <Card style={{ marginTop: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: T.sub }}>외부 데이터 연결 상태</span>
              <div style={{ flex: 1 }} />
              <Button size="sm" onClick={runDiagnose} disabled={busy === 'diagnose'}>
                {busy === 'diagnose' ? '진단 중…' : '연결 진단'}
              </Button>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {providers.map((p) => (
                <span key={p.id} style={{
                  display: 'inline-flex', flexDirection: 'column', gap: 2,
                  border: `1px solid ${T.border}`, borderRadius: 9, padding: '7px 10px',
                  background: p.connected ? '#f0fdf4' : '#fafafa', minWidth: 180,
                }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Badge bg={p.connected ? '#d1fae5' : '#f4f4f5'} fg={p.connected ? '#065f46' : '#71717a'} icon={p.connected ? '✓' : '—'}>
                      {p.connected ? '사용 가능' : '미연결'}
                    </Badge>
                    <span style={{ fontSize: 12, fontWeight: 700, color: T.text }}>{p.name}</span>
                  </span>
                  <span style={{ fontSize: 10.5, color: T.muted }}>{p.note}</span>
                </span>
              ))}
            </div>
            <p style={{ fontSize: 11, color: T.muted, margin: '10px 0 0', lineHeight: 1.6 }}>
              미연결 데이터원은 값을 생성하지 않습니다. 현재는 관리자 직접 입력과 CSV 가져오기만 실제로 동작합니다.
            </p>

            {diagnosis && <DiagnosisResult data={diagnosis} />}
          </Card>
        )}
      </div>

      {/* ─── 모달 ──────────────────────────────────────────────────────────── */}
      <CandidateFormModal
        open={formOpen}
        initial={editing}
        settings={settings}
        onClose={() => { setFormOpen(false); setEditing(null); }}
        onSubmit={editing ? handleUpdate : handleCreate}
      />

      <CompareModal
        open={compareOpen && canCompare}
        candidates={selectedCandidates}
        onClose={() => setCompareOpen(false)}
      />

      <CsvImportModal
        open={csvOpen}
        onClose={() => setCsvOpen(false)}
        onImported={() => { load(); flash('CSV 가져오기를 반영했습니다.'); }}
        authFetch={authFetch}
      />

      <ScoreSettingsModal
        open={settingsOpen}
        settings={settings}
        onClose={() => setSettingsOpen(false)}
        onSaved={(next, warning) => {
          setSettings(next);
          setSettingsOpen(false);
          flash(warning ? `평가기준 저장 — ${warning}` : '평가기준을 저장했습니다. "점수 다시 계산"을 실행하세요.');
        }}
        authFetch={authFetch}
      />

      <FinalCandidateModal
        open={Boolean(finalId)}
        candidateId={finalId}
        onClose={() => setFinalId(null)}
        onDone={() => { setFinalId(null); flash('최종 후보를 지정했습니다.'); load(); }}
        authFetch={authFetch}
      />

      <HistoryRecordModal
        open={Boolean(historyTarget)}
        candidate={historyTarget}
        onClose={() => setHistoryTarget(null)}
        onSaved={() => { setHistoryTarget(null); flash('데이터 기록을 추가했습니다.'); }}
        authFetch={authFetch}
      />

      <Modal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="후보 삭제"
        width={440}
        footer={
          <>
            <Button onClick={() => setDeleteTarget(null)} disabled={busy === 'delete'}>취소</Button>
            <Button variant="dangerSolid" onClick={handleDelete} disabled={busy === 'delete'}>
              {busy === 'delete' ? '삭제 중…' : '삭제'}
            </Button>
          </>
        }
      >
        <p style={{ fontSize: 13.5, color: T.text, lineHeight: 1.7, margin: 0 }}>
          <strong>{deleteTarget?.product_name}</strong> 후보를 삭제할까요?<br />
          연결된 데이터 이력과 출처 기록도 함께 삭제되며 복구할 수 없습니다.
        </p>
      </Modal>

      <style>{`
        @media (max-width: 720px) {
          .pr-optional-col { display: none; }
        }
      `}</style>
    </div>
  );
}

// ─── 작은 조각들 ─────────────────────────────────────────────────────────────

function SummaryCard({ label, value, unit, text, sub, color = T.text }) {
  return (
    <div style={{
      background: '#fff', border: `1px solid ${T.border}`, borderRadius: 12, padding: '12px 14px',
    }}>
      <div style={{ fontSize: 10.5, color: T.muted, fontWeight: 700, marginBottom: 4 }}>{label}</div>
      {value !== undefined ? (
        <div style={{ fontSize: 22, fontWeight: 900, color, lineHeight: 1.1 }}>
          {value}<span style={{ fontSize: 11, fontWeight: 700, color: T.muted, marginLeft: 2 }}>{unit}</span>
        </div>
      ) : (
        <div style={{ fontSize: 14, fontWeight: 800, color, lineHeight: 1.3, wordBreak: 'keep-all' }}>
          {text ?? <Empty label="없음" />}
        </div>
      )}
      {sub && <div style={{ fontSize: 11, color: T.primary, fontWeight: 700, marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

/** 외부 API 키 진단 결과 — 값이 아니라 통과 여부만 보여준다 */
function DiagnosisResult({ data }) {
  return (
    <div style={{ marginTop: 12, borderTop: `1px solid ${T.borderSoft}`, paddingTop: 12 }}>
      <div style={{ fontSize: 11.5, fontWeight: 800, color: T.sub, marginBottom: 6 }}>
        진단 결과 <span style={{ fontWeight: 500, color: T.muted }}>· 테스트 키워드 &quot;{data.testedKeyword}&quot;</span>
      </div>

      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 10 }}>
        {Object.entries(data.env).map(([key, present]) => (
          <Badge key={key} bg={present ? '#d1fae5' : '#fee2e2'} fg={present ? '#065f46' : '#b91c1c'} icon={present ? '✓' : '✕'}>
            {key}
          </Badge>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {data.checks.map((c) => (
          <div key={c.id} style={{
            border: `1px solid ${c.ok ? '#a7f3d0' : c.skipped ? T.border : '#fecaca'}`,
            background: c.ok ? '#f0fdf4' : c.skipped ? '#fafafa' : '#fef2f2',
            borderRadius: 9, padding: '9px 11px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
              <Badge
                bg={c.ok ? '#d1fae5' : c.skipped ? '#f4f4f5' : '#fee2e2'}
                fg={c.ok ? '#065f46' : c.skipped ? '#71717a' : '#b91c1c'}
                icon={c.ok ? '✓' : c.skipped ? '—' : '✕'}
              >
                {c.ok ? '통과' : c.skipped ? '건너뜀' : '실패'}
              </Badge>
              <span style={{ fontSize: 12.5, fontWeight: 700, color: T.text }}>{c.name}</span>
              {c.status && <span style={{ fontSize: 11, color: T.muted }}>HTTP {c.status}</span>}
            </div>

            <div style={{ fontSize: 11.5, color: T.sub, marginTop: 4, lineHeight: 1.6 }}>{c.message}</div>
            {c.hint && <div style={{ fontSize: 11, color: T.warnFg, marginTop: 3 }}>힌트: {c.hint}</div>}

            {c.sample && (
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
                {Object.entries(c.sample).map(([k, v]) => (
                  <span key={k} style={{
                    fontSize: 11, background: '#fff', border: `1px solid ${T.border}`,
                    borderRadius: 6, padding: '2px 7px', color: T.text,
                  }}>
                    <span style={{ color: T.muted }}>{k}</span> <strong>{String(v)}</strong>
                  </span>
                ))}
              </div>
            )}

            {c.body && (
              <pre style={{
                fontSize: 10.5, color: '#b91c1c', background: '#fff', margin: '6px 0 0',
                padding: '6px 8px', borderRadius: 6, overflowX: 'auto', whiteSpace: 'pre-wrap',
                wordBreak: 'break-all', border: '1px solid #fecaca',
              }}>{c.body}</pre>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function FilterSelect({ value, onChange, label, options }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label={label}
      style={{
        padding: '7px 9px', fontSize: 12, borderRadius: 8, color: T.sub,
        border: `1.5px solid ${T.primaryBorder}`, background: '#fff', cursor: 'pointer',
        fontWeight: value === 'all' ? 500 : 700,
      }}
    >
      <option value="all">{label} 전체</option>
      {options.map((o) => {
        const v = typeof o === 'string' ? o : o.value;
        const l = typeof o === 'string' ? o : o.label;
        return <option key={v} value={v}>{l}</option>;
      })}
    </select>
  );
}

function Val({ children }) {
  if (children === null || children === undefined || children === '') return <Empty />;
  return <>{children}</>;
}

function Trend({ value }) {
  if (!hasValue(value)) return <Empty />;
  const n = Number(value);
  const color = n > 0 ? T.success : n < 0 ? T.danger : T.sub;
  const icon = n > 0 ? '▲' : n < 0 ? '▼' : '—';
  return (
    <span style={{ color, fontWeight: 700, whiteSpace: 'nowrap' }}>
      {icon} {fmtPercent(n)}
    </span>
  );
}

const thStyle = {
  padding: '9px 8px', textAlign: 'left', fontSize: 11, fontWeight: 700,
  color: T.sub, borderBottom: `1px solid ${T.border}`, whiteSpace: 'nowrap',
};
const tdStyle = { padding: '9px 8px', textAlign: 'left', verticalAlign: 'middle' };
const tdNum = { ...tdStyle, textAlign: 'right', whiteSpace: 'nowrap' };
