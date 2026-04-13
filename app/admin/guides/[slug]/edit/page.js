'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAdmin } from '@/components/AdminProvider';

// ─── 유틸: sections ↔ HTML 변환 ────────────────────────────────────────────

function sectionsToHtml(sections) {
  return (sections || []).map((s) => {
    let html = `<h2>${s.title || ''}</h2>\n`;
    for (const p of s.paragraphs || []) {
      html += `<p>${p}</p>\n`;
    }
    if (s.bullets && s.bullets.length) {
      html += `<ul>\n${s.bullets.map((b) => `  <li>${b}</li>`).join('\n')}\n</ul>\n`;
    }
    if (s.callout) {
      html += `<div class="callout">${s.callout}</div>\n`;
    }
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
    } else if (tag === 'DIV' && el.className.includes('callout') && current) {
      current.callout = el.textContent.trim();
    }
  }
  if (current) sections.push(current);
  return sections;
}

function buildPreviewHtml(guide) {
  const sections = guide.sections || [];
  return sections.map((s) => {
    let html = `<h2>${s.title || ''}</h2>`;
    for (const p of s.paragraphs || []) html += `<p>${p}</p>`;
    if (s.bullets && s.bullets.length) {
      html += `<ul>${s.bullets.map((b) => `<li>${b}</li>`).join('')}</ul>`;
    }
    if (s.table) {
      const { headers = [], rows = [] } = s.table;
      html += `<div class="my-4 overflow-x-auto" style="border-radius:12px;border:1px solid #dde6ff"><table>
        <thead><tr>${headers.map((h) => `<th>${h}</th>`).join('')}</tr></thead>
        <tbody>${rows.map((row, ri) => `<tr style="background:${ri % 2 === 0 ? '#fff' : '#f8f9fb'}">${row.map((cell, ci) => `<td ${ci === 0 ? 'style="font-weight:600;color:#1c2741"' : ''}>${cell}</td>`).join('')}</tr>`).join('')}</tbody>
      </table></div>`;
    }
    if (s.callout) {
      html += `<div style="background:#f0f4ff;border-left:4px solid #3268ff;border-radius:0 8px 8px 0;padding:14px 18px;margin:4px 0 20px">
        <div style="font-size:12px;font-weight:700;color:#3268ff;margin-bottom:6px;letter-spacing:.04em">전문가 인사이트</div>
        <p style="font-size:15px;color:#2a3a5c;margin:0;line-height:1.75;word-break:keep-all">${s.callout}</p>
      </div>`;
    }
    return html;
  }).join('');
}

// ─── 에디터 페이지 ──────────────────────────────────────────────────────────

export default function EditPage({ params }) {
  const { slug } = params;
  const router = useRouter();
  const { isAdmin } = useAdmin();

  const [guide, setGuide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mode, setMode] = useState('visual'); // 'visual' | 'html'
  const [htmlContent, setHtmlContent] = useState('');
  const [saveMsg, setSaveMsg] = useState('');

  // 미인증 시 홈으로
  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) { router.replace('/'); }
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

  // HTML 모드 → 비주얼로 전환 시 파싱
  const switchToVisual = useCallback(() => {
    if (mode === 'html') {
      const parsed = htmlToSections(htmlContent);
      setGuide((g) => ({ ...g, sections: parsed }));
    }
    setMode('visual');
  }, [mode, htmlContent]);

  // 비주얼 모드 → HTML로 전환 시 직렬화
  const switchToHtml = useCallback(() => {
    if (mode === 'visual' && guide) {
      setHtmlContent(sectionsToHtml(guide.sections));
    }
    setMode('html');
  }, [mode, guide]);

  // 저장
  const handleSave = useCallback(async () => {
    if (!guide) return;
    setSaving(true);
    setSaveMsg('');
    const sections = mode === 'html' ? htmlToSections(htmlContent) : guide.sections;
    const token = localStorage.getItem('admin_token');
    const res = await fetch(`/api/admin/guides/${slug}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
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
  }, [guide, mode, htmlContent, slug]);

  // ─── 비주얼 에디터 헬퍼 ───────────────────────────────────────────────────

  function updateSection(idx, field, value) {
    setGuide((g) => {
      const sections = g.sections.map((s, i) => i === idx ? { ...s, [field]: value } : s);
      return { ...g, sections };
    });
  }

  function addSection() {
    setGuide((g) => ({
      ...g,
      sections: [...(g.sections || []), { title: '', paragraphs: [''], bullets: null, callout: null, table: null }],
    }));
  }

  function removeSection(idx) {
    setGuide((g) => ({ ...g, sections: g.sections.filter((_, i) => i !== idx) }));
  }

  function moveSection(idx, dir) {
    setGuide((g) => {
      const arr = [...g.sections];
      const to = idx + dir;
      if (to < 0 || to >= arr.length) return g;
      [arr[idx], arr[to]] = [arr[to], arr[idx]];
      return { ...g, sections: arr };
    });
  }

  // ─── 렌더 ─────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: '#5a6a85' }}>
        불러오는 중…
      </div>
    );
  }

  if (!guide) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: '#e53e3e' }}>
        글을 찾을 수 없습니다.
      </div>
    );
  }

  const previewHtml = buildPreviewHtml(
    mode === 'html' ? { sections: htmlToSections(htmlContent) } : guide
  );

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fb' }}>
      {/* 툴바 */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: '#fff', borderBottom: '1px solid #e1e5eb',
        padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '12px',
        flexWrap: 'wrap',
      }}>
        <button
          onClick={() => router.back()}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#5a6a85', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          뒤로
        </button>

        <span style={{ flex: 1, fontSize: '14px', fontWeight: 700, color: '#1c2741', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {guide.title}
        </span>

        {/* 모드 전환 */}
        <div style={{ display: 'flex', border: '1.5px solid #dde6ff', borderRadius: '8px', overflow: 'hidden' }}>
          {[['visual', '비주얼'], ['html', 'HTML']].map(([key, label]) => (
            <button
              key={key}
              onClick={key === 'visual' ? switchToVisual : switchToHtml}
              style={{
                padding: '6px 14px', fontSize: '13px', fontWeight: 600,
                background: mode === key ? '#3268ff' : '#fff',
                color: mode === key ? '#fff' : '#5a6a85',
                border: 'none', cursor: 'pointer',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {saveMsg && (
          <span style={{ fontSize: '13px', color: saveMsg.startsWith('저장') ? '#38a169' : '#e53e3e' }}>
            {saveMsg}
          </span>
        )}

        <button
          onClick={() => router.push(`/guides/${slug}`)}
          style={{ padding: '7px 14px', fontSize: '13px', fontWeight: 600, background: '#f4f7ff', color: '#3268ff', border: '1.5px solid #dde6ff', borderRadius: '8px', cursor: 'pointer' }}
        >
          미리보기
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{ padding: '7px 18px', fontSize: '14px', fontWeight: 700, background: '#3268ff', color: '#fff', border: 'none', borderRadius: '8px', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}
        >
          {saving ? '저장 중…' : '저장'}
        </button>
      </div>

      {/* 본문 — 좌우 분할 */}
      <div style={{ display: 'flex', gap: 0, maxWidth: '100%', height: 'calc(100vh - 57px)' }}>

        {/* ── 왼쪽: 편집 영역 ── */}
        <div style={{ flex: 1, overflow: 'auto', padding: '24px 20px', borderRight: '1px solid #e1e5eb' }}>

          {mode === 'visual' ? (
            <div style={{ maxWidth: '600px', margin: '0 auto' }}>
              {/* 메타 편집 */}
              <section style={{ marginBottom: '28px', background: '#fff', borderRadius: '12px', padding: '20px', border: '1px solid #e1e5eb' }}>
                <h3 style={{ margin: '0 0 16px', fontSize: '13px', fontWeight: 700, color: '#3268ff', letterSpacing: '.06em' }}>기본 정보</h3>
                <label style={labelStyle}>제목</label>
                <input style={inputStyle} value={guide.title || ''} onChange={(e) => setGuide((g) => ({ ...g, title: e.target.value }))} />
                <label style={labelStyle}>설명</label>
                <textarea style={{ ...inputStyle, height: '72px', resize: 'vertical' }} value={guide.description || ''} onChange={(e) => setGuide((g) => ({ ...g, description: e.target.value }))} />
                <label style={labelStyle}>카테고리</label>
                <input style={inputStyle} value={guide.category || ''} onChange={(e) => setGuide((g) => ({ ...g, category: e.target.value }))} />
              </section>

              {/* 핵심 요약 */}
              <section style={{ marginBottom: '28px', background: '#fff', borderRadius: '12px', padding: '20px', border: '1px solid #e1e5eb' }}>
                <h3 style={{ margin: '0 0 12px', fontSize: '13px', fontWeight: 700, color: '#3268ff', letterSpacing: '.06em' }}>핵심 요약</h3>
                {(guide.keyPoints || []).map((kp, i) => (
                  <div key={i} style={{ display: 'flex', gap: '6px', marginBottom: '6px' }}>
                    <input
                      style={{ ...inputStyle, flex: 1, marginBottom: 0 }}
                      value={kp}
                      onChange={(e) => {
                        const arr = [...(guide.keyPoints || [])];
                        arr[i] = e.target.value;
                        setGuide((g) => ({ ...g, keyPoints: arr }));
                      }}
                    />
                    <button onClick={() => setGuide((g) => ({ ...g, keyPoints: g.keyPoints.filter((_, j) => j !== i) }))} style={iconBtnStyle}>✕</button>
                  </div>
                ))}
                <button onClick={() => setGuide((g) => ({ ...g, keyPoints: [...(g.keyPoints || []), ''] }))} style={addBtnStyle}>+ 추가</button>
              </section>

              {/* 섹션 편집 */}
              <h3 style={{ margin: '0 0 12px', fontSize: '13px', fontWeight: 700, color: '#3268ff', letterSpacing: '.06em' }}>본문 섹션</h3>
              {(guide.sections || []).map((sec, idx) => (
                <SectionEditor
                  key={idx}
                  idx={idx}
                  section={sec}
                  total={(guide.sections || []).length}
                  onChange={(field, val) => updateSection(idx, field, val)}
                  onRemove={() => removeSection(idx)}
                  onMove={(dir) => moveSection(idx, dir)}
                />
              ))}
              <button onClick={addSection} style={{ ...addBtnStyle, width: '100%', padding: '12px', fontSize: '14px', marginTop: '8px' }}>
                + 섹션 추가
              </button>
            </div>
          ) : (
            /* HTML 모드 */
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <p style={{ margin: '0 0 8px', fontSize: '13px', color: '#5a6a85' }}>
                {'<h2>'} 섹션제목 {'</h2>'}, {'<p>'} 문단 {'</p>'}, {'<ul><li>'} 불렛 {'</li></ul>'}, {'<div class="callout">'} 인사이트 {'</div>'}
              </p>
              <textarea
                value={htmlContent}
                onChange={(e) => setHtmlContent(e.target.value)}
                style={{
                  flex: 1, width: '100%', padding: '16px', fontSize: '13px',
                  fontFamily: '"Fira Code", "Courier New", monospace',
                  border: '1.5px solid #dde6ff', borderRadius: '10px',
                  resize: 'none', outline: 'none', lineHeight: 1.7,
                  color: '#1c2741', background: '#fafbff',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          )}
        </div>

        {/* ── 오른쪽: CSS 프리뷰 ── */}
        <div style={{ flex: 1, overflow: 'auto', padding: '24px 24px', background: '#fff' }}>
          <div style={{ maxWidth: '680px', margin: '0 auto' }}>
            <p style={{ margin: '0 0 16px', fontSize: '11px', fontWeight: 700, color: '#9aa5b8', letterSpacing: '.08em' }}>PREVIEW</p>
            <div
              className="sureline-prose"
              dangerouslySetInnerHTML={{ __html: previewHtml }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── 섹션 편집 카드 ──────────────────────────────────────────────────────────

function SectionEditor({ idx, section, total, onChange, onRemove, onMove }) {
  const [open, setOpen] = useState(idx === 0);

  return (
    <div style={{ marginBottom: '12px', background: '#fff', borderRadius: '12px', border: '1px solid #e1e5eb', overflow: 'hidden' }}>
      {/* 헤더 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 14px', background: '#f8f9fb', borderBottom: open ? '1px solid #e1e5eb' : 'none' }}>
        <button onClick={() => setOpen((o) => !o)} style={{ flex: 1, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', fontSize: '14px', fontWeight: 700, color: '#1c2741' }}>
          {open ? '▾' : '▸'} {section.title || `섹션 ${idx + 1}`}
        </button>
        <button onClick={() => onMove(-1)} disabled={idx === 0} style={iconBtnStyle}>↑</button>
        <button onClick={() => onMove(1)} disabled={idx === total - 1} style={iconBtnStyle}>↓</button>
        <button onClick={onRemove} style={{ ...iconBtnStyle, color: '#e53e3e' }}>✕</button>
      </div>

      {open && (
        <div style={{ padding: '16px 14px' }}>
          <label style={labelStyle}>섹션 제목</label>
          <input style={inputStyle} value={section.title || ''} onChange={(e) => onChange('title', e.target.value)} />

          <label style={labelStyle}>문단</label>
          {(section.paragraphs || []).map((p, pi) => (
            <div key={pi} style={{ display: 'flex', gap: '6px', marginBottom: '6px' }}>
              <textarea
                style={{ ...inputStyle, flex: 1, marginBottom: 0, height: '64px', resize: 'vertical' }}
                value={p}
                onChange={(e) => {
                  const arr = [...(section.paragraphs || [])];
                  arr[pi] = e.target.value;
                  onChange('paragraphs', arr);
                }}
              />
              <button onClick={() => onChange('paragraphs', section.paragraphs.filter((_, j) => j !== pi))} style={iconBtnStyle}>✕</button>
            </div>
          ))}
          <button onClick={() => onChange('paragraphs', [...(section.paragraphs || []), ''])} style={addBtnStyle}>+ 문단 추가</button>

          <label style={{ ...labelStyle, marginTop: '12px' }}>불렛 (한 줄에 하나)</label>
          <textarea
            style={{ ...inputStyle, height: '80px', resize: 'vertical' }}
            value={(section.bullets || []).join('\n')}
            onChange={(e) => {
              const val = e.target.value;
              onChange('bullets', val ? val.split('\n') : null);
            }}
            placeholder="없으면 비워두세요"
          />

          <label style={{ ...labelStyle, marginTop: '4px' }}>전문가 인사이트 (callout)</label>
          <textarea
            style={{ ...inputStyle, height: '64px', resize: 'vertical' }}
            value={section.callout || ''}
            onChange={(e) => onChange('callout', e.target.value || null)}
            placeholder="없으면 비워두세요"
          />
        </div>
      )}
    </div>
  );
}

// ─── 스타일 상수 ─────────────────────────────────────────────────────────────

const labelStyle = {
  display: 'block', fontSize: '12px', fontWeight: 700, color: '#5a6a85',
  marginBottom: '4px', letterSpacing: '.02em',
};

const inputStyle = {
  display: 'block', width: '100%', padding: '8px 10px', fontSize: '14px',
  border: '1.5px solid #dde6ff', borderRadius: '8px', outline: 'none',
  marginBottom: '10px', boxSizing: 'border-box', color: '#1c2741',
  lineHeight: 1.6,
};

const iconBtnStyle = {
  padding: '4px 8px', fontSize: '12px', background: '#f4f7ff',
  color: '#5a6a85', border: '1px solid #dde6ff', borderRadius: '6px',
  cursor: 'pointer', flexShrink: 0,
};

const addBtnStyle = {
  padding: '6px 12px', fontSize: '13px', fontWeight: 600,
  background: '#f4f7ff', color: '#3268ff', border: '1.5px solid #dde6ff',
  borderRadius: '8px', cursor: 'pointer',
};
