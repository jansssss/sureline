'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

function formatDate(dateStr) {
  if (!dateStr) return '-';
  const [y, m, d] = dateStr.slice(0, 10).split('-');
  return `${y}.${parseInt(m)}.${parseInt(d)}`;
}

export default function AdminGuidesPage() {
  const router = useRouter();
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // 'all' | 'published' | 'draft'
  const [togglingSlug, setTogglingSlug] = useState(null);
  const [msg, setMsg] = useState('');

  const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;

  useEffect(() => {
    if (!localStorage.getItem('admin_token')) {
      router.replace('/');
      return;
    }
    loadGuides();
  }, []);

  const loadGuides = async () => {
    setLoading(true);
    const t = localStorage.getItem('admin_token');
    const res = await fetch('/api/admin/guides', {
      headers: { Authorization: `Bearer ${t}` },
      cache: 'no-store',
    });
    if (res.ok) {
      setGuides(await res.json());
    }
    setLoading(false);
  };

  const handleTogglePublish = useCallback(async (slug, currentPublished) => {
    setTogglingSlug(slug);
    const t = localStorage.getItem('admin_token');
    const res = await fetch(`/api/admin/guides/${slug}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${t}` },
      body: JSON.stringify({ published: !currentPublished }),
    });
    if (res.ok) {
      setGuides((prev) =>
        prev.map((g) => g.slug === slug ? { ...g, published: !currentPublished } : g)
      );
      setMsg(!currentPublished ? `"${slug}" 발행 완료` : `"${slug}" 임시저장으로 변경`);
      setTimeout(() => setMsg(''), 3000);
    }
    setTogglingSlug(null);
  }, []);

  const filtered = guides.filter((g) => {
    const matchSearch = !search || g.title?.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === 'all' ||
      (filter === 'published' && g.published) ||
      (filter === 'draft' && !g.published);
    return matchSearch && matchFilter;
  });

  const publishedCount = guides.filter((g) => g.published).length;
  const draftCount = guides.filter((g) => !g.published).length;

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fb' }}>
      {/* 헤더 */}
      <div style={{
        background: '#fff', borderBottom: '1px solid #e1e5eb',
        padding: '0 20px', height: 52,
        display: 'flex', alignItems: 'center', gap: 16,
      }}>
        <Link href="/" style={{ fontSize: 13, color: '#5a6a85', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          홈
        </Link>
        <span style={{ fontSize: 15, fontWeight: 800, color: '#1c2741', flex: 1 }}>가이드 관리</span>

        {msg && (
          <span style={{ fontSize: 12, fontWeight: 600, color: '#059669' }}>{msg}</span>
        )}

        <button
          onClick={loadGuides}
          style={{ fontSize: 12, color: '#7a8699', background: 'none', border: '1px solid #dde6ff', borderRadius: 6, padding: '4px 12px', cursor: 'pointer' }}
        >
          새로고침
        </button>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 16px' }}>
        {/* 통계 */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
          {[
            { label: '전체', value: guides.length, color: '#1c2741' },
            { label: '발행됨', value: publishedCount, color: '#059669' },
            { label: '임시저장', value: draftCount, color: '#d97706' },
          ].map(({ label, value, color }) => (
            <div key={label} style={{
              flex: 1, background: '#fff', border: '1px solid #e1e5eb',
              borderRadius: 12, padding: '14px 16px', textAlign: 'center',
            }}>
              <div style={{ fontSize: 22, fontWeight: 800, color }}>{value}</div>
              <div style={{ fontSize: 11, color: '#9aa5b8', marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* 검색 + 필터 */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="제목 검색…"
            style={{
              flex: 1, minWidth: 180, padding: '8px 14px', fontSize: 14,
              border: '1.5px solid #dde6ff', borderRadius: 8, outline: 'none',
            }}
          />
          <div style={{ display: 'flex', border: '1.5px solid #dde6ff', borderRadius: 8, overflow: 'hidden' }}>
            {[['all', '전체'], ['published', '발행됨'], ['draft', '임시저장']].map(([key, label]) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                style={{
                  padding: '8px 14px', fontSize: 13, fontWeight: 600,
                  background: filter === key ? '#3268ff' : '#fff',
                  color: filter === key ? '#fff' : '#5a6a85',
                  border: 'none', cursor: 'pointer',
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* 목록 */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#9aa5b8', fontSize: 14 }}>불러오는 중…</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#9aa5b8', fontSize: 14 }}>결과가 없습니다.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filtered.map((g) => (
              <div
                key={g.slug}
                style={{
                  background: '#fff', border: '1px solid #e1e5eb', borderRadius: 12,
                  padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12,
                }}
              >
                {/* 발행 상태 */}
                <span style={{
                  flexShrink: 0, fontSize: 10, fontWeight: 700, padding: '3px 8px',
                  borderRadius: 999,
                  background: g.published ? '#d1fae5' : '#fef3c7',
                  color: g.published ? '#065f46' : '#92400e',
                }}>
                  {g.published ? '발행' : '임시저장'}
                </span>

                {/* 본문 */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#1c2741', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {g.title || g.slug}
                  </div>
                  <div style={{ fontSize: 11, color: '#9aa5b8', display: 'flex', gap: 8 }}>
                    <span style={{ color: '#3268ff', fontWeight: 600 }}>{g.category}</span>
                    <span>{formatDate(g.published_at)}</span>
                  </div>
                </div>

                {/* 버튼 */}
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <button
                    onClick={() => handleTogglePublish(g.slug, g.published)}
                    disabled={togglingSlug === g.slug}
                    style={{
                      padding: '5px 12px', fontSize: 12, fontWeight: 600, borderRadius: 7,
                      background: g.published ? '#fff' : '#059669',
                      color: g.published ? '#e53e3e' : '#fff',
                      border: g.published ? '1px solid #e53e3e' : '1px solid #059669',
                      cursor: togglingSlug === g.slug ? 'not-allowed' : 'pointer',
                      opacity: togglingSlug === g.slug ? 0.6 : 1,
                    }}
                  >
                    {togglingSlug === g.slug ? '…' : g.published ? '발행 취소' : '발행하기'}
                  </button>
                  <Link
                    href={`/admin/guides/${g.slug}/edit`}
                    style={{
                      padding: '5px 12px', fontSize: 12, fontWeight: 600, borderRadius: 7,
                      background: '#f4f7ff', color: '#3268ff',
                      border: '1px solid #dde6ff', textDecoration: 'none',
                    }}
                  >
                    편집
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
