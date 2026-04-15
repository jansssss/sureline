'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAdmin } from '@/components/AdminProvider';

// ─── sections ↔ HTML 변환 ────────────────────────────────────────────────────

function sectionsToHtml(sections) {
  return (sections || []).map((s) => {
    let html = `<h2>${s.title || ''}</h2>\n`;
    for (const p of s.paragraphs || []) html += `<p>${p}</p>\n`;
    if (s.bullets && s.bullets.length) {
      html += `<ul>\n${s.bullets.map((b) => `  <li>${b}</li>`).join('\n')}\n</ul>\n`;
    }
    if (s.table) {
      const { headers = [], rows = [] } = s.table;
      html += `<table>\n  <thead><tr>${headers.map((h) => `<th>${h}</th>`).join('')}</tr></thead>\n`;
      html += `  <tbody>${rows.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join('')}</tr>`).join('')}</tbody>\n</table>\n`;
    }
    if (s.callout) html += `<div class="callout">${s.callout}</div>\n`;
    return html;
  }).join('\n');
}

function htmlToSections(html) {
  if (typeof window === 'undefined') return [];
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const sections = [];
  let current = null;

  for (const el of doc.body.children) {
    const tag = el.tagName;
    if (tag === 'H2') {
      if (current) sections.push(current);
      current = { title: el.textContent.trim(), paragraphs: [], bullets: null, callout: null, table: null };
    } else if (tag === 'P' && current) {
      const text = el.textContent.trim();
      if (text) current.paragraphs.push(text);
    } else if ((tag === 'UL' || tag === 'OL') && current) {
      current.bullets = Array.from(el.querySelectorAll('li')).map((li) => li.textContent.trim()).filter(Boolean);
    } else if (tag === 'TABLE' && current) {
      const headers = Array.from(el.querySelectorAll('thead th')).map((th) => th.textContent.trim());
      const rows = Array.from(el.querySelectorAll('tbody tr')).map((tr) =>
        Array.from(tr.querySelectorAll('td')).map((td) => td.textContent.trim())
      );
      current.table = { headers, rows };
    } else if (tag === 'DIV' && el.className.includes('callout') && current) {
      current.callout = el.textContent.trim();
    }
  }
  if (current) sections.push(current);
  return sections;
}

// ─── 실제 발행 페이지와 동일한 프리뷰 렌더러 ────────────────────────────────

function formatDate(dateStr) {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.slice(0, 10).split('-');
  return `${year}. ${parseInt(month)}. ${parseInt(day)}.`;
}

function ArticlePreview({ guide, htmlContent }) {
  const sections = htmlToSections(htmlContent);

  return (
    <article style={{ maxWidth: 720, margin: '0 auto', padding: '40px 24px', fontFamily: 'inherit' }}>
      {/* 뒤로가기 (장식) */}
      <div style={{ marginBottom: 24 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 14, color: '#5a6a85' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          목록으로
        </span>
      </div>

      {/* 헤더 */}
      <header style={{ borderTop: '4px solid #ff6b57', padding: '32px 0 24px', wordBreak: 'keep-all' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <span style={{ background: '#ff6b57', color: '#fff', fontSize: 13, fontWeight: 700, padding: '4px 12px', borderRadius: 999 }}>
            건강 가이드
          </span>
          <span style={{ color: '#3268ff', fontSize: 13, fontWeight: 600 }}>
            {guide.category || '카테고리'}
          </span>
        </div>
        <h1 style={{ margin: '0 0 12px', fontSize: 'clamp(1.625rem, 4vw, 1.875rem)', fontWeight: 800, lineHeight: 1.3, letterSpacing: '-0.02em', color: '#1c2741', wordBreak: 'keep-all' }}>
          {guide.title || '제목'}
        </h1>
        <p style={{ fontSize: '1rem', color: '#5a6a85', margin: '0 0 14px', lineHeight: 1.6, wordBreak: 'keep-all' }}>
          {guide.description || '설명'}
        </p>
        <div style={{ fontSize: 13, color: '#9aa5b8' }}>
          발행 {formatDate(guide.publishedAt)}&nbsp;·&nbsp;업데이트 {formatDate(guide.updatedAt)}&nbsp;·&nbsp;{guide.readTime} 읽기
        </div>
      </header>

      {/* 핵심 요약 */}
      {guide.keyPoints && guide.keyPoints.filter(Boolean).length > 0 && (
        <div style={{ background: '#f4f7ff', borderLeft: '4px solid #3268ff', borderRadius: '0 12px 12px 0', padding: '20px 20px 16px', margin: '28px 0' }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#3268ff', marginBottom: 14, letterSpacing: '0.01em' }}>
            이 글의 핵심 요약
          </div>
          <ol style={{ margin: 0, paddingLeft: 20 }}>
            {guide.keyPoints.filter(Boolean).map((point, i) => (
              <li key={i} style={{ fontSize: 15, color: '#2a3a5c', lineHeight: 1.7, marginBottom: 8, wordBreak: 'keep-all' }}>
                {point}
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* 본문 */}
      <div className="sureline-prose">
        {sections.map((section, idx) => (
          <section key={idx}>
            <h2>{section.title}</h2>
            {section.paragraphs.map((p, i) => <p key={i}>{p}</p>)}
            {section.bullets && (
              <div style={{ background: '#f8f9fb', border: '1px solid #e1e5eb', borderRadius: 12, padding: '16px 18px', margin: '16px 0' }}>
                <ul>
                  {section.bullets.map((b, i) => <li key={i}>{b}</li>)}
                </ul>
              </div>
            )}
            {section.table && (
              <div style={{ borderRadius: 12, border: '1px solid #dde6ff', overflowX: 'auto', margin: '16px 0' }}>
                <table>
                  <thead>
                    <tr>{section.table.headers.map((h, i) => <th key={i}>{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {section.table.rows.map((row, i) => (
                      <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : '#f8f9fb' }}>
                        {row.map((cell, j) => <td key={j} style={j === 0 ? { fontWeight: 600, color: '#1c2741' } : {}}>{cell}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {section.callout && (
              <div style={{ background: '#f0f4ff', borderLeft: '4px solid #3268ff', borderRadius: '0 8px 8px 0', padding: '14px 18px', margin: '4px 0 20px' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#3268ff', marginBottom: 6, letterSpacing: '0.04em' }}>전문가 인사이트</div>
                <p style={{ fontSize: 15, color: '#2a3a5c', margin: 0, lineHeight: 1.75, wordBreak: 'keep-all' }}>{section.callout}</p>
              </div>
            )}
          </section>
        ))}
      </div>

      {/* 출처 */}
      {guide.sources && guide.sources.length > 0 && (
        <div style={{ marginTop: 28, padding: '16px 18px', borderRadius: 10, background: '#f8f9fb', border: '1px solid #e1e5eb' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#7a8699', marginBottom: 8 }}>참고 자료</div>
          <ul style={{ margin: 0, paddingLeft: 16 }}>
            {guide.sources.map((s, i) => (
              <li key={i} style={{ fontSize: 13, color: '#7a8699', lineHeight: 1.6 }}>
                {s.name}{s.url ? ` (${s.url})` : ''}{s.accessedAt ? ` · ${formatDate(s.accessedAt)} 기준` : ''}
              </li>
            ))}
          </ul>
        </div>
      )}
    </article>
  );
}

// ─── 에디터 페이지 ────────────────────────────────────────────────────────────

export default function EditPage({ params }) {
  const { slug } = params;
  const router = useRouter();
  const { isAdmin } = useAdmin();

  const [guide, setGuide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [htmlContent, setHtmlContent] = useState('');
  const [saveMsg, setSaveMsg] = useState('');
  const textareaRef = useRef(null);

  // 미인증 시 홈으로
  useEffect(() => {
    if (!localStorage.getItem('admin_token')) router.replace('/');
  }, [router]);

  // 가이드 데이터 로드
  useEffect(() => {
    if (!slug) return;
    fetch(`/api/admin/guides/${slug}/load`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data) {
          setGuide(data);
          setHtmlContent(sectionsToHtml(data.sections));
        }
        setLoading(false);
      });
  }, [slug]);

  // 저장
  const handleSave = useCallback(async () => {
    if (!guide) return;
    setSaving(true);
    setSaveMsg('');
    const sections = htmlToSections(htmlContent);
    const token = localStorage.getItem('admin_token');
    const res = await fetch(`/api/admin/guides/${slug}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        title: guide.title,
        description: guide.description,
        category: guide.category,
        keyPoints: guide.keyPoints,
        sources: guide.sources,
        sections,
      }),
    });
    setSaving(false);
    if (res.ok) {
      setSaveMsg('저장되었습니다.');
      setTimeout(() => setSaveMsg(''), 3000);
    } else {
      const err = await res.json().catch(() => ({}));
      setSaveMsg(`저장 실패: ${err.error || res.status}`);
    }
  }, [guide, htmlContent, slug]);

  // Ctrl+S 단축키
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleSave]);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: '#5a6a85' }}>
      불러오는 중…
    </div>
  );

  if (!guide) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: '#e53e3e' }}>
      글을 찾을 수 없습니다.
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#f8f9fb', overflow: 'hidden' }}>

      {/* ── 툴바 ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: '0 16px',
        height: 52, background: '#fff', borderBottom: '1px solid #e1e5eb',
        flexShrink: 0, flexWrap: 'wrap',
      }}>
        <button
          onClick={() => router.back()}
          style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 14, color: '#5a6a85', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 6px' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          뒤로
        </button>

        <span style={{ flex: 1, fontSize: 14, fontWeight: 700, color: '#1c2741', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {guide.title}
        </span>

        <span style={{ fontSize: 12, color: '#9aa5b8' }}>Ctrl+S로 저장</span>

        {saveMsg && (
          <span style={{ fontSize: 13, fontWeight: 600, color: saveMsg.startsWith('저장') ? '#38a169' : '#e53e3e' }}>
            {saveMsg}
          </span>
        )}

        <button
          onClick={() => window.open(`/guides/${slug}`, '_blank')}
          style={{ padding: '6px 12px', fontSize: 13, fontWeight: 600, background: '#f4f7ff', color: '#3268ff', border: '1.5px solid #dde6ff', borderRadius: 8, cursor: 'pointer' }}
        >
          발행 페이지
        </button>

        <button
          onClick={handleSave}
          disabled={saving}
          style={{ padding: '6px 18px', fontSize: 14, fontWeight: 700, background: '#3268ff', color: '#fff', border: 'none', borderRadius: 8, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}
        >
          {saving ? '저장 중…' : '저장'}
        </button>
      </div>

      {/* ── 본문 2분할 ── */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* 왼쪽: 편집 패널 */}
        <div style={{ width: '42%', display: 'flex', flexDirection: 'column', borderRight: '1px solid #e1e5eb', overflow: 'hidden' }}>

          {/* 메타 정보 */}
          <div style={{ padding: '16px 16px 0', overflowY: 'auto', flexShrink: 0, maxHeight: '44%', borderBottom: '1px solid #e8ecf2' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#3268ff', letterSpacing: '.08em', marginBottom: 12 }}>메타 정보</div>

            <Field label="제목">
              <input style={inputSt} value={guide.title || ''} onChange={(e) => setGuide((g) => ({ ...g, title: e.target.value }))} />
            </Field>
            <Field label="설명">
              <textarea style={{ ...inputSt, height: 60, resize: 'none' }} value={guide.description || ''} onChange={(e) => setGuide((g) => ({ ...g, description: e.target.value }))} />
            </Field>
            <Field label="카테고리">
              <input style={inputSt} value={guide.category || ''} onChange={(e) => setGuide((g) => ({ ...g, category: e.target.value }))} />
            </Field>

            <Field label="핵심 요약">
              {(guide.keyPoints || []).map((kp, i) => (
                <div key={i} style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                  <input
                    style={{ ...inputSt, flex: 1, marginBottom: 0 }}
                    value={kp}
                    onChange={(e) => {
                      const arr = [...(guide.keyPoints || [])];
                      arr[i] = e.target.value;
                      setGuide((g) => ({ ...g, keyPoints: arr }));
                    }}
                  />
                  <button
                    onClick={() => setGuide((g) => ({ ...g, keyPoints: g.keyPoints.filter((_, j) => j !== i) }))}
                    style={rmBtnSt}
                  >✕</button>
                </div>
              ))}
              <button
                onClick={() => setGuide((g) => ({ ...g, keyPoints: [...(g.keyPoints || []), ''] }))}
                style={addBtnSt}
              >+ 요약 추가</button>
            </Field>
          </div>

          {/* 본문 HTML 편집 */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '12px 16px 16px', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#3268ff', letterSpacing: '.08em' }}>본문 HTML</div>
              <div style={{ fontSize: 11, color: '#9aa5b8' }}>
                {'<h2>'} 섹션제목 {'<p>'} 문단 {'<ul><li>'} 불렛 {'<div class="callout">'}
              </div>
            </div>
            <textarea
              ref={textareaRef}
              value={htmlContent}
              onChange={(e) => setHtmlContent(e.target.value)}
              spellCheck={false}
              style={{
                flex: 1,
                width: '100%',
                padding: '12px',
                fontSize: 13,
                fontFamily: '"Fira Code", "Consolas", "Courier New", monospace',
                lineHeight: 1.75,
                border: '1.5px solid #dde6ff',
                borderRadius: 8,
                outline: 'none',
                resize: 'none',
                color: '#1c2741',
                background: '#fafbff',
                boxSizing: 'border-box',
              }}
            />
          </div>
        </div>

        {/* 오른쪽: 실제 발행 페이지와 동일한 프리뷰 */}
        <div style={{ flex: 1, overflowY: 'auto', background: '#fff' }}>
          <div style={{ borderBottom: '1px solid #f0f2f5', padding: '6px 16px', background: '#fafbff', display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ff6b57' }} />
            <div style={{ fontSize: 11, color: '#9aa5b8', fontWeight: 600, letterSpacing: '.06em' }}>
              실시간 프리뷰 — sureline.kr/guides/{slug}
            </div>
          </div>
          <ArticlePreview guide={guide} htmlContent={htmlContent} />
        </div>

      </div>
    </div>
  );
}

// ─── 작은 헬퍼 컴포넌트 ─────────────────────────────────────────────────────

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#7a8699', marginBottom: 3, letterSpacing: '.03em' }}>{label}</div>
      {children}
    </div>
  );
}

// ─── 스타일 상수 ─────────────────────────────────────────────────────────────

const inputSt = {
  display: 'block', width: '100%', padding: '7px 9px', fontSize: 13,
  border: '1.5px solid #dde6ff', borderRadius: 7, outline: 'none',
  marginBottom: 4, boxSizing: 'border-box', color: '#1c2741', lineHeight: 1.5,
  background: '#fff',
};

const rmBtnSt = {
  padding: '4px 8px', fontSize: 12, background: '#fff0f0', color: '#e53e3e',
  border: '1px solid #fcc', borderRadius: 6, cursor: 'pointer', flexShrink: 0,
};

const addBtnSt = {
  padding: '4px 10px', fontSize: 12, fontWeight: 600,
  background: '#f4f7ff', color: '#3268ff', border: '1.5px solid #dde6ff',
  borderRadius: 7, cursor: 'pointer', marginTop: 2,
};
