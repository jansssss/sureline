import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchGuideBySlug, fetchAdjacentGuides } from "@/lib/supabase-server";
import PostCTA from "@/components/PostCTA";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const SITE_URL = "https://sureline.kr";

function formatDate(dateStr) {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.slice(0, 10).split("-");
  return `${year}. ${parseInt(month)}. ${parseInt(day)}.`;
}

export async function generateMetadata({ params }) {
  const guide = await fetchGuideBySlug(params.slug);
  if (!guide) return { title: "글을 찾을 수 없습니다 — sureline" };
  return {
    title: `${guide.title} | sureline`,
    description: guide.description,
  };
}

export default async function GuideDetailPage({ params }) {
  const guide = await fetchGuideBySlug(params.slug);

  if (!guide) notFound();

  const { prev, next } = await fetchAdjacentGuides(params.slug, guide.publishedAt);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.title,
    description: guide.description,
    datePublished: guide.publishedAt,
    dateModified: guide.updatedAt,
    url: `${SITE_URL}/guides/${guide.slug}`,
    author: { "@type": "Organization", name: "sureline", url: SITE_URL },
    publisher: { "@type": "Organization", name: "sureline", url: SITE_URL },
  };

  return (
    <article className="mx-auto max-w-3xl px-4 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* 뒤로가기 */}
      <div className="mb-6">
        <Link
          href="/guides"
          className="inline-flex items-center gap-1 text-sm transition-colors"
          style={{ color: "#5a6a85" }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          목록으로
        </Link>
      </div>

      {/* 헤더 — Blogger 스타일 */}
      <header style={{ borderTop: "4px solid #ff6b57", padding: "32px 0 24px", wordBreak: "keep-all" }}>
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span style={{
            display: "inline-block",
            background: "#ff6b57",
            color: "#fff",
            fontSize: "13px",
            fontWeight: 700,
            padding: "4px 12px",
            borderRadius: "999px",
          }}>
            건강 가이드
          </span>
          <span style={{ color: "#3268ff", fontSize: "13px", fontWeight: 600 }}>
            {guide.category}
          </span>
        </div>

        <h1 style={{
          margin: "0 0 12px",
          fontSize: "clamp(1.625rem, 4vw, 1.875rem)",
          fontWeight: 800,
          lineHeight: 1.3,
          letterSpacing: "-0.02em",
          color: "#1c2741",
          wordBreak: "keep-all",
        }}>
          {guide.title}
        </h1>

        <p style={{
          fontSize: "1rem",
          color: "#5a6a85",
          margin: "0 0 14px",
          lineHeight: 1.6,
          wordBreak: "keep-all",
        }}>
          {guide.description}
        </p>

        <div style={{ fontSize: "13px", color: "#9aa5b8" }}>
          발행 {formatDate(guide.publishedAt)}&nbsp;·&nbsp;업데이트 {formatDate(guide.updatedAt)}&nbsp;·&nbsp;{guide.readTime} 읽기
        </div>
      </header>

      {/* 핵심 요약 — Blogger 스타일 */}
      {guide.keyPoints && guide.keyPoints.length > 0 && (
        <div style={{
          background: "#f4f7ff",
          borderLeft: "4px solid #3268ff",
          borderRadius: "0 12px 12px 0",
          padding: "20px 20px 16px",
          margin: "28px 0",
        }}>
          <div style={{ fontSize: "15px", fontWeight: 700, color: "#3268ff", marginBottom: "14px", letterSpacing: "0.01em" }}>
            이 글의 핵심 요약
          </div>
          <ol style={{ margin: 0, paddingLeft: "20px" }}>
            {guide.keyPoints.map((point, i) => (
              <li key={i} style={{
                fontSize: "15px",
                color: "#2a3a5c",
                lineHeight: 1.7,
                marginBottom: "8px",
                wordBreak: "keep-all",
              }}>
                {point}
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* 본문 — Blogger h2/paragraph/callout 스타일 */}
      <div className="sureline-prose">
        {guide.sections && guide.sections.map((section, idx) => (
          <section key={idx}>
            <h2>{section.title}</h2>

            {section.paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}

            {section.bullets && (
              <div style={{
                background: "#f8f9fb",
                border: "1px solid #e1e5eb",
                borderRadius: "12px",
                padding: "16px 18px",
                margin: "16px 0",
              }}>
                <ul>
                  {section.bullets.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              </div>
            )}

            {section.table && (
              <div className="my-4 overflow-x-auto" style={{ borderRadius: "12px", border: "1px solid #dde6ff" }}>
                <table>
                  <thead>
                    <tr>
                      {section.table.headers.map((h, i) => (
                        <th key={i}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {section.table.rows.map((row, i) => (
                      <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#f8f9fb" }}>
                        {row.map((cell, j) => (
                          <td key={j} style={j === 0 ? { fontWeight: 600, color: "#1c2741" } : {}}>
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {section.callout && (
              <div style={{
                background: "#f0f4ff",
                borderLeft: "4px solid #3268ff",
                borderRadius: "0 8px 8px 0",
                padding: "14px 18px",
                margin: "4px 0 20px",
              }}>
                <div style={{ fontSize: "12px", fontWeight: 700, color: "#3268ff", marginBottom: "6px", letterSpacing: "0.04em" }}>
                  전문가 인사이트
                </div>
                <p style={{ fontSize: "15px", color: "#2a3a5c", margin: 0, lineHeight: 1.75, wordBreak: "keep-all" }}>
                  {section.callout}
                </p>
              </div>
            )}
          </section>
        ))}
      </div>

      {/* 출처 — Blogger 스타일 */}
      {guide.sources && guide.sources.length > 0 && (
        <div style={{
          marginTop: "28px",
          padding: "16px 18px",
          borderRadius: "10px",
          background: "#f8f9fb",
          border: "1px solid #e1e5eb",
        }}>
          <div style={{ fontSize: "13px", fontWeight: 700, color: "#7a8699", marginBottom: "8px" }}>
            참고 자료
          </div>
          <ul style={{ margin: 0, paddingLeft: "16px" }}>
            {guide.sources.map((s, i) => (
              <li key={i} style={{ fontSize: "13px", color: "#7a8699", lineHeight: 1.6 }}>
                <a href={s.url} target="_blank" rel="noopener noreferrer"
                  className="sureline-source-link"
                >
                  {s.name}
                </a>
                {s.accessedAt && <span style={{ marginLeft: "4px" }}>({formatDate(s.accessedAt)} 기준)</span>}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* CTA */}
      <PostCTA category={guide.category} />

      {/* 함께 보면 좋은 글 */}
      {guide.relatedGuides && guide.relatedGuides.length > 0 && (
        <div style={{ marginTop: "40px", padding: "28px 24px", background: "#f4f7ff", borderRadius: "16px" }}>
          <div style={{ fontSize: "12px", fontWeight: 700, color: "#3268ff", letterSpacing: "0.08em", marginBottom: "16px" }}>
            함께 보면 좋은 글
          </div>
          <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
            {guide.relatedGuides.map((r) => (
              <li key={r.slug} style={{ borderBottom: "1px solid #dde6ff" }}>
                <Link href={`/guides/${r.slug}`} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  gap: "12px", padding: "13px 0",
                  fontSize: "15px", fontWeight: 600, color: "#1c2741",
                  textDecoration: "none", wordBreak: "keep-all", lineHeight: 1.4,
                }}>
                  <span>{r.title}</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3268ff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 이전/다음 글 */}
      <div className="mt-16 border-y divide-y border-gray-200">
        {prev ? (
          <Link
            href={`/guides/${prev.slug}`}
            className="flex items-center gap-3 py-4 group hover:bg-gray-50 transition-colors px-1"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#9aa5b8", flexShrink: 0 }}>
              <path d="M15 18l-6-6 6-6" />
            </svg>
            <span className="text-sm truncate" style={{ color: "#5a6a85" }}>{prev.title}</span>
          </Link>
        ) : (
          <div className="flex items-center gap-3 py-4 px-1" style={{ color: "#c8d0de" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <path d="M15 18l-6-6 6-6" />
            </svg>
            <span className="text-sm">이전 글이 없습니다</span>
          </div>
        )}

        {next ? (
          <Link
            href={`/guides/${next.slug}`}
            className="flex items-center justify-end gap-3 py-4 group hover:bg-gray-50 transition-colors px-1"
          >
            <span className="text-sm truncate text-right" style={{ color: "#5a6a85" }}>{next.title}</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#9aa5b8", flexShrink: 0 }}>
              <path d="M9 18l6-6-6-6" />
            </svg>
          </Link>
        ) : (
          <div className="flex items-center justify-end gap-3 py-4 px-1" style={{ color: "#c8d0de" }}>
            <span className="text-sm">다음 글이 없습니다</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <path d="M9 18l6-6-6-6" />
            </svg>
          </div>
        )}
      </div>

      {/* 목록으로 */}
      <div className="text-center mt-8">
        <Link
          href="/guides"
          className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-colors"
          style={{ border: "1px solid #dde6ff", color: "#3268ff", background: "#fff" }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          목록으로 돌아가기
        </Link>
      </div>
    </article>
  );
}
