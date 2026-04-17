"use client";

/* ──────────────────────────────────────────
   content_type별 본문 렌더러
   - guide / cornerstone / research: 기본 prose
   - faq: Q&A 카드
   - checklist: 체크박스 리스트
   - comparison: 비교 테이블 강조
────────────────────────────────────────── */

function ImageParagraph({ html, title }) {
  let out = html;
  if (!/\salt=/.test(out)) out = out.replace(/<img/, `<img alt="${title.replace(/"/g, "&quot;")}"`);
  if (!/loading=/.test(out)) out = out.replace(/<img/, '<img loading="lazy"');
  out = out.replace(/<img([^>]*?)>/, '<img$1 style="max-width:100%;height:auto;border-radius:16px;margin:16px 0;" />');
  return <p dangerouslySetInnerHTML={{ __html: out }} />;
}

function Callout({ text, label = "전문가 인사이트", accent = false }) {
  return (
    <div style={{
      background: accent ? "linear-gradient(to right, #f4f7ff, #fff)" : "#f0f4ff",
      borderLeft: "4px solid #3268ff",
      borderRadius: "0 16px 16px 0",
      padding: "16px 20px",
      margin: "8px 0 20px",
    }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#3268ff", marginBottom: 6, letterSpacing: "0.04em", textTransform: "uppercase" }}>
        {label}
      </div>
      <p style={{ fontSize: 15, color: "#2a3a5c", margin: 0, lineHeight: 1.8, wordBreak: "keep-all" }}>
        {text}
      </p>
    </div>
  );
}

/* ── 기본 가이드 / 코너스톤 / 취재정리 ── */
function DefaultBody({ guide }) {
  return (
    <div className="sureline-prose">
      {guide.sections && guide.sections.map((section, idx) => (
        <section key={idx}>
          <h2>{section.title}</h2>
          {section.paragraphs.map((p, i) =>
            typeof p === "string" && p.startsWith("<img")
              ? <ImageParagraph key={i} html={p} title={guide.title} />
              : <p key={i}>{p}</p>
          )}
          {section.bullets && (
            <div style={{ background: "#f8f9fb", border: "1px solid #e1e5eb", borderRadius: 16, padding: "16px 18px", margin: "16px 0" }}>
              <ul>
                {section.bullets.map((b, i) => <li key={i}>{b}</li>)}
              </ul>
            </div>
          )}
          {section.table && <ComparisonTable table={section.table} />}
          {section.callout && <Callout text={section.callout} />}
        </section>
      ))}
    </div>
  );
}

/* ── FAQ ── */
const FAQ_COLORS = ["#3268ff", "#9333ea", "#0891b2", "#16a34a", "#b45309", "#dc2626"];

function FaqBody({ guide }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {guide.sections && guide.sections.map((section, idx) => {
        const color = FAQ_COLORS[idx % FAQ_COLORS.length];
        return (
          <div key={idx} style={{
            background: "#fff",
            border: "1px solid #e1e5eb",
            borderRadius: 20,
            overflow: "hidden",
          }}>
            {/* 질문 헤더 */}
            <div style={{
              background: "linear-gradient(to right, #f4f7ff, #fff)",
              borderBottom: "1px solid #eef2f7",
              padding: "18px 20px",
              display: "flex", gap: 12, alignItems: "flex-start",
            }}>
              <span style={{
                background: color, color: "#fff",
                fontSize: 11, fontWeight: 800,
                padding: "3px 10px", borderRadius: 999,
                flexShrink: 0, letterSpacing: "0.04em", marginTop: 2,
              }}>Q</span>
              <h2 style={{
                fontSize: "1.0625rem", fontWeight: 800, color: "#1c2741",
                margin: 0, lineHeight: 1.4, wordBreak: "keep-all",
              }}>{section.title}</h2>
            </div>

            {/* 답변 */}
            <div style={{ padding: "18px 20px" }}>
              {section.paragraphs.map((p, i) =>
                typeof p === "string" && p.startsWith("<img")
                  ? <ImageParagraph key={i} html={p} title={guide.title} />
                  : <p key={i} style={{ fontSize: 15, color: "#3a4a62", lineHeight: 1.85, marginBottom: 10, wordBreak: "keep-all" }}>{p}</p>
              )}
              {section.bullets && (
                <div style={{ background: "#f8f9fb", borderRadius: 12, padding: "12px 16px", marginTop: 8 }}>
                  {section.bullets.map((b, i) => (
                    <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "6px 0",
                      borderBottom: i < section.bullets.length - 1 ? "1px solid #eef2f7" : "none" }}>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: color, flexShrink: 0, marginTop: 8 }} />
                      <span style={{ fontSize: 14, color: "#3a4a62", lineHeight: 1.7 }}>{b}</span>
                    </div>
                  ))}
                </div>
              )}
              {section.callout && <Callout text={section.callout} />}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── 체크리스트 ── */
const CHECKLIST_COLORS = [
  { bg: "#f4f7ff", border: "#dde6ff", header: "#3268ff" },
  { bg: "#f0fff4", border: "#c3e6cb", header: "#16a34a" },
  { bg: "#faf5ff", border: "#e9d5ff", header: "#9333ea" },
  { bg: "#fff5f3", border: "#ffd6ce", header: "#ff6b57" },
  { bg: "#f0f9ff", border: "#bae6fd", header: "#0891b2" },
];

function ChecklistBody({ guide }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {guide.sections && guide.sections.map((section, idx) => {
        const c = CHECKLIST_COLORS[idx % CHECKLIST_COLORS.length];
        return (
          <div key={idx} style={{
            background: "#fff", border: `1px solid ${c.border}`,
            borderRadius: 20, overflow: "hidden",
          }}>
            {/* 섹션 헤더 */}
            <div style={{ background: c.bg, borderBottom: `1px solid ${c.border}`, padding: "14px 20px" }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: c.header, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                {section.title}
              </span>
            </div>

            <div style={{ padding: "16px 20px" }}>
              {/* 안내 문단 */}
              {section.paragraphs.map((p, i) =>
                typeof p === "string" && p.startsWith("<img")
                  ? <ImageParagraph key={i} html={p} title={guide.title} />
                  : <p key={i} style={{ fontSize: 14, color: "#5a6a85", lineHeight: 1.8, marginBottom: 8, wordBreak: "keep-all" }}>{p}</p>
              )}

              {/* 체크리스트 항목 */}
              {section.bullets && (
                <div style={{ marginTop: section.paragraphs.length > 0 ? 8 : 0 }}>
                  {section.bullets.map((item, i) => (
                    <div key={i} style={{
                      display: "flex", gap: 12, alignItems: "flex-start",
                      padding: "11px 0",
                      borderBottom: i < section.bullets.length - 1 ? "1px solid #f4f6f9" : "none",
                    }}>
                      <div style={{
                        width: 20, height: 20, borderRadius: 6,
                        border: `2px solid ${c.header}`, flexShrink: 0, marginTop: 1,
                      }} />
                      <span style={{ fontSize: 14, color: "#3a4a62", lineHeight: 1.65, wordBreak: "keep-all" }}>{item}</span>
                    </div>
                  ))}
                </div>
              )}

              {section.table && <ComparisonTable table={section.table} />}
              {section.callout && <Callout text={section.callout} />}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── 비교 분석 ── */
function ComparisonTable({ table }) {
  if (!table) return null;
  const isComparison = table.headers?.length === 3;
  return (
    <div style={{ overflowX: "auto", borderRadius: 16, border: "1px solid #dde6ff", margin: "20px 0" }}>
      <table style={{ width: "100%", fontSize: 14, borderCollapse: "collapse" }}>
        <thead>
          <tr>
            {table.headers.map((h, i) => (
              <th key={i} style={{
                background: i === 1 && isComparison ? "#f4f7ff"
                  : i === 2 && isComparison ? "#fff5f3" : "#f8f9fb",
                fontWeight: 700, fontSize: 12, textAlign: "left",
                padding: "10px 14px", letterSpacing: "0.04em",
                color: i === 1 && isComparison ? "#3268ff"
                  : i === 2 && isComparison ? "#ff6b57" : "#5a6a85",
                borderBottom: "2px solid #dde6ff",
              }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row, i) => (
            <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#fafbfc" }}>
              {row.map((cell, j) => (
                <td key={j} style={{
                  padding: "10px 14px", color: "#3a4a62",
                  borderBottom: "1px solid #eef2f7",
                  fontWeight: j === 0 ? 600 : 400,
                  color: j === 0 ? "#1c2741" : "#3a4a62",
                }}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ComparisonBody({ guide }) {
  return (
    <div className="sureline-prose">
      {guide.sections && guide.sections.map((section, idx) => (
        <section key={idx}>
          <h2>{section.title}</h2>
          {section.paragraphs.map((p, i) =>
            typeof p === "string" && p.startsWith("<img")
              ? <ImageParagraph key={i} html={p} title={guide.title} />
              : <p key={i}>{p}</p>
          )}
          {section.bullets && (
            <div style={{ background: "#f8f9fb", border: "1px solid #e1e5eb", borderRadius: 16, padding: "16px 18px", margin: "16px 0" }}>
              <ul>{section.bullets.map((b, i) => <li key={i}>{b}</li>)}</ul>
            </div>
          )}
          {section.table && <ComparisonTable table={section.table} />}
          {section.callout && <Callout text={section.callout} />}
        </section>
      ))}
    </div>
  );
}

/* ── 코너스톤: TOC + 기본 prose ── */
function CornerstoneBody({ guide }) {
  const hasSections = guide.sections && guide.sections.length > 0;
  return (
    <>
      {hasSections && (
        <div style={{
          background: "linear-gradient(to bottom right, #f4f7ff, #fff)",
          border: "1px solid #dde6ff", borderRadius: 20,
          padding: "24px 24px", marginBottom: 32,
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#9aa5b8", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 14 }}>
            목차
          </div>
          <ol style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 6 }}>
            {guide.sections.map((s, i) => (
              <li key={i} style={{ fontSize: 14, color: "#3268ff", fontWeight: 600, lineHeight: 1.5, wordBreak: "keep-all" }}>
                {s.title}
              </li>
            ))}
          </ol>
        </div>
      )}
      <DefaultBody guide={guide} />
    </>
  );
}

/* ── 메인 export ── */
export default function GuideBody({ guide }) {
  const type = guide.contentType || "guide";
  if (type === "faq") return <FaqBody guide={guide} />;
  if (type === "checklist") return <ChecklistBody guide={guide} />;
  if (type === "comparison") return <ComparisonBody guide={guide} />;
  if (type === "cornerstone") return <CornerstoneBody guide={guide} />;
  return <DefaultBody guide={guide} />;
}
