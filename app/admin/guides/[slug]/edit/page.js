'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';

// ─── sections ↔ HTML 변환 ────────────────────────────────────────────────────

function sectionsToHtml(sections) {
  return (sections || []).map((s) => {
    let html = `<h2>${escapeHtml(s.title || '')}</h2>\n`;
    for (const p of s.paragraphs || []) {
      if (typeof p === 'string' && p.startsWith('<img')) html += `<p>${p}</p>\n`;
      else html += `<p>${escapeHtml(p)}</p>\n`;
    }
    if (s.bullets && s.bullets.length) {
      html += `<ul>\n${s.bullets.map((b) => `  <li>${escapeHtml(b)}</li>`).join('\n')}\n</ul>\n`;
    }
    if (s.table) {
      const { headers = [], rows = [] } = s.table;
      html += `<table>\n  <thead><tr>${headers.map((h) => `<th>${escapeHtml(h)}</th>`).join('')}</tr></thead>\n`;
      html += `  <tbody>${rows.map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join('')}</tr>`).join('')}</tbody>\n</table>\n`;
    }
    if (s.callout) html += `<div class="callout">${escapeHtml(s.callout)}</div>\n`;
    return html;
  }).join('\n');
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function htmlToSections(html) {
  if (typeof window === 'undefined') return [];
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const sections = [];
  let current = null;

  function flush() {
    if (current) sections.push(current);
    current = null;
  }
  function ensureCurrent() {
    if (!current) current = { title: '', paragraphs: [], bullets: null, callout: null, table: null };
  }

  for (const el of doc.body.children) {
    const tag = el.tagName;
    if (tag === 'H2') {
      flush();
      current = { title: el.textContent.trim(), paragraphs: [], bullets: null, callout: null, table: null };
    } else if (tag === 'P') {
      ensureCurrent();
      const img = el.querySelector('img');
      if (img && img.src) {
        const alt = (img.getAttribute('alt') || '').replace(/"/g, '&quot;');
        current.paragraphs.push(`<img src="${img.src}" alt="${alt}">`);
      } else {
        const text = el.textContent.trim();
        if (text) current.paragraphs.push(text);
      }
    } else if (tag === 'FIGURE' || tag === 'IMG') {
      ensureCurrent();
      const img = tag === 'IMG' ? el : el.querySelector('img');
      if (img && img.src) {
        const alt = (img.getAttribute('alt') || '').replace(/"/g, '&quot;');
        current.paragraphs.push(`<img src="${img.src}" alt="${alt}">`);
      }
    } else if (tag === 'UL' || tag === 'OL') {
      ensureCurrent();
      current.bullets = Array.from(el.querySelectorAll('li')).map((li) => li.textContent.trim()).filter(Boolean);
    } else if (tag === 'TABLE') {
      ensureCurrent();
      const headers = Array.from(el.querySelectorAll('thead th')).map((th) => th.textContent.trim());
      const rows = Array.from(el.querySelectorAll('tbody tr')).map((tr) =>
        Array.from(tr.querySelectorAll('td')).map((td) => td.textContent.trim())
      );
      current.table = { headers, rows };
    } else if (tag === 'DIV' && el.className.includes('callout')) {
      ensureCurrent();
      current.callout = el.textContent.trim();
    }
  }
  flush();
  return sections;
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.slice(0, 10).split('-');
  return `${year}. ${parseInt(month)}. ${parseInt(day)}.`;
}

// ─── 에디터 페이지 ────────────────────────────────────────────────────────────

export default function EditPage({ params }) {
  const { slug } = params;
  const router = useRouter();

  const [guide, setGuide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mode, setMode] = useState('visual'); // 'visual' | 'html'
  const [htmlContent, setHtmlContent] = useState('');
  const [saveMsg, setSaveMsg] = useState('');
  const [unsplashOpen, setUnsplashOpen] = useState(false);
  const [unsplashQuery, setUnsplashQuery] = useState('');
  const [unsplashResults, setUnsplashResults] = useState([]);
  const [unsplashLoading, setUnsplashLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);

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

  // 비주얼 에디터 초기화: htmlContent가 변경되면 contentEditable에 반영
  // (단, 사용자가 비주얼 편집 중일 때는 덮어쓰지 않음)
  useEffect(() => {
    if (mode === 'visual' && editorRef.current && editorRef.current.innerHTML !== htmlContent) {
      editorRef.current.innerHTML = htmlContent;
    }
  }, [mode, htmlContent]);

  // 저장
  const handleSave = useCallback(async () => {
    if (!guide) return;
    // 비주얼 모드면 contentEditable에서 최신 HTML 수집
    let latestHtml = htmlContent;
    if (mode === 'visual' && editorRef.current) {
      latestHtml = editorRef.current.innerHTML;
      setHtmlContent(latestHtml);
    }
    setSaving(true);
    setSaveMsg('');
    const sections = htmlToSections(latestHtml);
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
        contentType: guide.contentType,
        seriesId: guide.seriesId || null,
        seriesOrder: guide.seriesOrder ? Number(guide.seriesOrder) : null,
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
  }, [guide, htmlContent, mode, slug]);

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

  // 모드 전환
  const switchToVisual = () => {
    setMode('visual');
    // useEffect가 contentEditable에 htmlContent 설정
  };
  const switchToHtml = () => {
    // 비주얼 편집 내용을 htmlContent로 동기화
    if (editorRef.current) {
      setHtmlContent(editorRef.current.innerHTML);
    }
    setMode('html');
  };

  // 포맷 명령 (document.execCommand 사용 — 여전히 대부분의 브라우저에서 동작)
  const exec = (command, value = null) => {
    if (editorRef.current) editorRef.current.focus();
    document.execCommand(command, false, value);
  };
  const formatBlock = (tag) => exec('formatBlock', tag);
  const insertCallout = () => {
    const text = window.prompt('인사이트 내용을 입력하세요');
    if (text) {
      const safe = escapeHtml(text);
      exec('insertHTML', `<div class="callout">${safe}</div><p><br></p>`);
    }
  };
  const insertLink = () => {
    const url = window.prompt('URL을 입력하세요', 'https://');
    if (url) exec('createLink', url);
  };
  const clearFormat = () => exec('removeFormat');

  const insertImage = (url, alt = '') => {
    const safeAlt = (alt || '').replace(/"/g, '&quot;');
    exec('insertHTML', `<p><img src="${url}" alt="${safeAlt}" style="max-width:100%;height:auto;border-radius:12px;"></p><p><br></p>`);
    if (editorRef.current) setHtmlContent(editorRef.current.innerHTML);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const token = localStorage.getItem('admin_token');
      const form = new FormData();
      form.append('file', file);
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      const data = await res.json();
      if (res.ok && data.url) insertImage(data.url, file.name);
      else setSaveMsg(`업로드 실패: ${data.error || res.status}`);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const searchUnsplash = async () => {
    if (!unsplashQuery.trim()) return;
    setUnsplashLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch(`/api/admin/unsplash?q=${encodeURIComponent(unsplashQuery)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setUnsplashResults(data.results || []);
      else setSaveMsg(`Unsplash 실패: ${data.error || res.status}`);
    } finally {
      setUnsplashLoading(false);
    }
  };

  const pickUnsplash = (photo) => {
    insertImage(photo.full, photo.alt);
    setUnsplashOpen(false);
    setUnsplashResults([]);
    setUnsplashQuery('');
  };

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
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileUpload}
      />

      {unsplashOpen && (
        <div
          onClick={() => setUnsplashOpen(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)',
            zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff', borderRadius: 16, width: '100%', maxWidth: 880,
              maxHeight: '85vh', display: 'flex', flexDirection: 'column', overflow: 'hidden',
            }}
          >
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e1e5eb', display: 'flex', gap: 8, alignItems: 'center' }}>
              <strong style={{ fontSize: 15, color: '#1c2741', flex: 1 }}>📷 Unsplash 이미지 검색</strong>
              <button onClick={() => setUnsplashOpen(false)} style={rmBtnSt}>✕</button>
            </div>
            <div style={{ padding: '14px 20px', display: 'flex', gap: 8, borderBottom: '1px solid #f0f2f7' }}>
              <input
                style={{ ...inputSt, marginBottom: 0, flex: 1 }}
                value={unsplashQuery}
                onChange={(e) => setUnsplashQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') searchUnsplash(); }}
                placeholder="예: wrist pain, office ergonomic, healthy food…"
                autoFocus
              />
              <button onClick={searchUnsplash} disabled={unsplashLoading} style={primaryBtnSt}>
                {unsplashLoading ? '검색 중…' : '검색'}
              </button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
              {unsplashResults.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#9aa5b8', fontSize: 13, padding: '40px 0' }}>
                  검색어를 입력하세요. 결과는 Unsplash에서 가져옵니다.
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10 }}>
                  {unsplashResults.map((p) => (
                    <div key={p.id} style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid #e1e5eb', background: '#f8f9fb' }}>
                      <img
                        src={p.thumb}
                        alt={p.alt}
                        onClick={() => pickUnsplash(p)}
                        style={{ width: '100%', height: 130, objectFit: 'cover', cursor: 'pointer', display: 'block' }}
                      />
                      <div style={{ padding: '6px 8px', fontSize: 11, color: '#7a8699' }}>
                        📸 <a href={p.authorUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#3268ff' }}>{p.author}</a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}


      {/* ── 최상단 툴바 ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: '0 16px',
        height: 52, background: '#fff', borderBottom: '1px solid #e1e5eb',
        flexShrink: 0, flexWrap: 'wrap',
      }}>
        <button onClick={() => router.back()} style={navBtnSt}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          뒤로
        </button>

        <span style={{ flex: 1, fontSize: 14, fontWeight: 700, color: '#1c2741', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {guide.title}
        </span>

        {/* 모드 전환 */}
        <div style={{ display: 'flex', border: '1.5px solid #dde6ff', borderRadius: 8, overflow: 'hidden' }}>
          {[['visual', '비주얼'], ['html', 'HTML']].map(([key, label]) => (
            <button
              key={key}
              onClick={key === 'visual' ? switchToVisual : switchToHtml}
              style={{
                padding: '6px 14px', fontSize: 13, fontWeight: 600,
                background: mode === key ? '#3268ff' : '#fff',
                color: mode === key ? '#fff' : '#5a6a85',
                border: 'none', cursor: 'pointer',
              }}
            >{label}</button>
          ))}
        </div>

        {saveMsg && (
          <span style={{ fontSize: 13, fontWeight: 600, color: saveMsg.startsWith('저장') ? '#38a169' : '#e53e3e' }}>
            {saveMsg}
          </span>
        )}

        <button onClick={() => window.open(`/guides/${slug}`, '_blank')} style={outlineBtnSt}>
          발행 페이지
        </button>
        <button onClick={handleSave} disabled={saving} style={{ ...primaryBtnSt, opacity: saving ? 0.7 : 1, cursor: saving ? 'not-allowed' : 'pointer' }}>
          {saving ? '저장 중…' : '저장'}
        </button>
      </div>

      {/* ── 본문: 좌측 메타 사이드 + 메인 에디터 ── */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* 왼쪽: 메타 정보 사이드바 */}
        <div style={{ width: 320, background: '#fff', borderRight: '1px solid #e1e5eb', overflowY: 'auto', padding: '16px', flexShrink: 0 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#3268ff', letterSpacing: '.08em', marginBottom: 12 }}>메타 정보</div>

          <Field label="제목">
            <input style={inputSt} value={guide.title || ''} onChange={(e) => setGuide((g) => ({ ...g, title: e.target.value }))} />
          </Field>
          <Field label="설명">
            <textarea style={{ ...inputSt, height: 60, resize: 'vertical' }} value={guide.description || ''} onChange={(e) => setGuide((g) => ({ ...g, description: e.target.value }))} />
          </Field>
          <Field label="카테고리">
            <input style={inputSt} value={guide.category || ''} onChange={(e) => setGuide((g) => ({ ...g, category: e.target.value }))} />
          </Field>

          <Field label="글 타입">
            <select
              style={{ ...inputSt, marginBottom: 0 }}
              value={guide.contentType || 'guide'}
              onChange={(e) => setGuide((g) => ({ ...g, contentType: e.target.value }))}
            >
              <option value="guide">건강 가이드 (기본)</option>
              <option value="cornerstone">완전 가이드 (코너스톤)</option>
              <option value="faq">FAQ</option>
              <option value="checklist">체크리스트</option>
              <option value="comparison">비교 분석</option>
              <option value="research">취재 정리</option>
            </select>
          </Field>

          <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px dashed #e1e5eb' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#3268ff', letterSpacing: '.08em', marginBottom: 10 }}>시리즈 연재</div>
            <Field label="시리즈 ID">
              <input
                style={inputSt}
                type="number"
                placeholder="없으면 비워두세요"
                value={guide.seriesId || ''}
                onChange={(e) => setGuide((g) => ({ ...g, seriesId: e.target.value ? Number(e.target.value) : null }))}
              />
            </Field>
            <Field label="시리즈 순서">
              <input
                style={inputSt}
                type="number"
                placeholder="1, 2, 3…"
                value={guide.seriesOrder || ''}
                onChange={(e) => setGuide((g) => ({ ...g, seriesOrder: e.target.value ? Number(e.target.value) : null }))}
              />
            </Field>
          </div>

          <Field label="핵심 요약">
            {(guide.keyPoints || []).map((kp, i) => (
              <div key={i} style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                <textarea
                  style={{ ...inputSt, flex: 1, marginBottom: 0, height: 44, resize: 'vertical' }}
                  value={kp}
                  onChange={(e) => {
                    const arr = [...(guide.keyPoints || [])];
                    arr[i] = e.target.value;
                    setGuide((g) => ({ ...g, keyPoints: arr }));
                  }}
                />
                <button onClick={() => setGuide((g) => ({ ...g, keyPoints: g.keyPoints.filter((_, j) => j !== i) }))} style={rmBtnSt}>✕</button>
              </div>
            ))}
            <button onClick={() => setGuide((g) => ({ ...g, keyPoints: [...(g.keyPoints || []), ''] }))} style={addBtnSt}>+ 요약 추가</button>
          </Field>

          <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px dashed #e1e5eb', fontSize: 12, color: '#9aa5b8', lineHeight: 1.6 }}>
            <div>발행일: {formatDate(guide.publishedAt)}</div>
            <div>수정 시에도 발행일은 유지됩니다.</div>
          </div>
        </div>

        {/* 오른쪽: 메인 에디터 */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#fff' }}>

          {/* 포맷 툴바 (비주얼 모드만) */}
          {mode === 'visual' && (
            <div style={{
              display: 'flex', flexWrap: 'wrap', gap: 4, padding: '8px 16px',
              borderBottom: '1px solid #e1e5eb', background: '#fafbff', flexShrink: 0,
            }}>
              <ToolBtn onClick={() => formatBlock('h2')} title="섹션 제목 (H2)"><strong>H2</strong></ToolBtn>
              <ToolBtn onClick={() => formatBlock('h3')} title="소제목 (H3)"><strong>H3</strong></ToolBtn>
              <ToolBtn onClick={() => formatBlock('p')} title="본문 문단">P</ToolBtn>
              <Sep />
              <ToolBtn onClick={() => exec('bold')} title="굵게"><strong>B</strong></ToolBtn>
              <ToolBtn onClick={() => exec('italic')} title="기울임"><em>I</em></ToolBtn>
              <ToolBtn onClick={() => exec('underline')} title="밑줄"><u>U</u></ToolBtn>
              <Sep />
              <ToolBtn onClick={() => exec('insertUnorderedList')} title="글머리 기호">• 목록</ToolBtn>
              <ToolBtn onClick={() => exec('insertOrderedList')} title="번호 매기기">1. 목록</ToolBtn>
              <Sep />
              <ToolBtn onClick={insertLink} title="링크">🔗 링크</ToolBtn>
              <ToolBtn onClick={insertCallout} title="인사이트 박스">💡 인사이트</ToolBtn>
              <ToolBtn onClick={() => fileInputRef.current?.click()} title="이미지 업로드">
                {uploading ? '⏳' : '🖼️'} 이미지
              </ToolBtn>
              <ToolBtn onClick={() => setUnsplashOpen(true)} title="Unsplash에서 검색">📷 Unsplash</ToolBtn>
              <Sep />
              <ToolBtn onClick={() => exec('undo')} title="실행 취소">↶</ToolBtn>
              <ToolBtn onClick={() => exec('redo')} title="다시 실행">↷</ToolBtn>
              <ToolBtn onClick={clearFormat} title="서식 지우기">✕ 서식</ToolBtn>
            </div>
          )}

          {/* 편집 영역 */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '24px 32px' }}>
            <div style={{ maxWidth: 720, margin: '0 auto' }}>

              {/* 미리보기 헤더 (편집 불가, 참고용) */}
              <div style={{ borderTop: '4px solid #ff6b57', padding: '24px 0 20px', marginBottom: 12, wordBreak: 'keep-all' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <span style={{ background: '#ff6b57', color: '#fff', fontSize: 13, fontWeight: 700, padding: '4px 12px', borderRadius: 999 }}>건강 가이드</span>
                  <span style={{ color: '#3268ff', fontSize: 13, fontWeight: 600 }}>{guide.category || '카테고리'}</span>
                </div>
                <h1 style={{ margin: '0 0 12px', fontSize: 'clamp(1.625rem, 4vw, 1.875rem)', fontWeight: 800, lineHeight: 1.3, letterSpacing: '-0.02em', color: '#1c2741' }}>
                  {guide.title || '제목'}
                </h1>
                <p style={{ fontSize: '1rem', color: '#5a6a85', margin: '0 0 14px', lineHeight: 1.6 }}>
                  {guide.description || '설명'}
                </p>
                <div style={{ fontSize: 13, color: '#9aa5b8' }}>
                  발행 {formatDate(guide.publishedAt)} · 업데이트 {formatDate(guide.updatedAt)} · {guide.readTime} 읽기
                </div>
              </div>

              {/* 핵심 요약 박스 (편집 불가, 왼쪽 사이드에서 편집) */}
              {guide.keyPoints && guide.keyPoints.filter(Boolean).length > 0 && (
                <div style={{ background: '#f4f7ff', borderLeft: '4px solid #3268ff', borderRadius: '0 12px 12px 0', padding: '20px 20px 16px', margin: '0 0 28px' }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#3268ff', marginBottom: 14 }}>이 글의 핵심 요약</div>
                  <ol style={{ margin: 0, paddingLeft: 20 }}>
                    {guide.keyPoints.filter(Boolean).map((point, i) => (
                      <li key={i} style={{ fontSize: 15, color: '#2a3a5c', lineHeight: 1.7, marginBottom: 8, wordBreak: 'keep-all' }}>{point}</li>
                    ))}
                  </ol>
                </div>
              )}

              {/* ─── 본문 편집 영역 (핵심) ─── */}
              {mode === 'visual' ? (
                <div
                  ref={editorRef}
                  className="sureline-prose"
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={() => {
                    if (editorRef.current) setHtmlContent(editorRef.current.innerHTML);
                  }}
                  style={{
                    outline: 'none',
                    minHeight: 400,
                    padding: '8px 0',
                    caretColor: '#3268ff',
                  }}
                />
              ) : (
                <div>
                  <div style={{ fontSize: 11, color: '#9aa5b8', marginBottom: 8 }}>
                    {'<h2>'} 섹션제목 {'<p>'} 문단 {'<ul><li>'} 불렛 {'<div class="callout">'} 인사이트
                  </div>
                  <textarea
                    value={htmlContent}
                    onChange={(e) => setHtmlContent(e.target.value)}
                    spellCheck={false}
                    style={{
                      width: '100%',
                      minHeight: 500,
                      padding: 14,
                      fontSize: 13,
                      fontFamily: '"Fira Code", "Consolas", "Courier New", monospace',
                      lineHeight: 1.75,
                      border: '1.5px solid #dde6ff',
                      borderRadius: 8,
                      outline: 'none',
                      resize: 'vertical',
                      color: '#1c2741',
                      background: '#fafbff',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

// ─── 작은 헬퍼 ────────────────────────────────────────────────────────────────

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#7a8699', marginBottom: 4, letterSpacing: '.03em' }}>{label}</div>
      {children}
    </div>
  );
}

function ToolBtn({ onClick, title, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseDown={(e) => e.preventDefault()}
      title={title}
      style={{
        padding: '5px 10px', fontSize: 13,
        background: '#fff', color: '#1c2741',
        border: '1px solid #dde6ff', borderRadius: 6,
        cursor: 'pointer', minWidth: 32,
      }}
    >
      {children}
    </button>
  );
}

function Sep() {
  return <div style={{ width: 1, background: '#dde6ff', margin: '0 4px' }} />;
}

// ─── 스타일 상수 ─────────────────────────────────────────────────────────────

const inputSt = {
  display: 'block', width: '100%', padding: '7px 9px', fontSize: 13,
  border: '1.5px solid #dde6ff', borderRadius: 7, outline: 'none',
  marginBottom: 4, boxSizing: 'border-box', color: '#1c2741', lineHeight: 1.5,
  background: '#fff', fontFamily: 'inherit',
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

const navBtnSt = {
  display: 'flex', alignItems: 'center', gap: 4, fontSize: 14, color: '#5a6a85',
  background: 'none', border: 'none', cursor: 'pointer', padding: '4px 6px',
};

const outlineBtnSt = {
  padding: '6px 12px', fontSize: 13, fontWeight: 600,
  background: '#f4f7ff', color: '#3268ff',
  border: '1.5px solid #dde6ff', borderRadius: 8, cursor: 'pointer',
};

const primaryBtnSt = {
  padding: '6px 18px', fontSize: 14, fontWeight: 700,
  background: '#3268ff', color: '#fff',
  border: 'none', borderRadius: 8,
};
