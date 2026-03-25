import Link from "next/link";
import { fetchAllGuides } from "@/lib/supabase-server";
import PostCTA from "@/components/PostCTA";

export const dynamic = "force-dynamic";

function formatDate(dateStr) {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.slice(0, 10).split("-");
  return `${year}. ${parseInt(month)}. ${parseInt(day)}.`;
}

export default async function HomePage() {
  const guides = await fetchAllGuides(10);
  const featured = guides.slice(0, 3);
  const rest = guides.slice(3);

  return (
    <main className="flex-1">

      {/* 히어로 */}
      <div style={{ borderTop: "4px solid #3268ff", background: "#f4f7ff", padding: "32px 0 24px" }}>
        <div className="mx-auto max-w-3xl px-4">
          <p style={{ fontSize: "12px", fontWeight: 700, color: "#3268ff", letterSpacing: "0.1em", marginBottom: "8px" }}>
            SURELINE
          </p>
          <h1 style={{ fontSize: "clamp(1.375rem, 4vw, 1.75rem)", fontWeight: 800, color: "#1c2741", marginBottom: "8px", lineHeight: 1.3, wordBreak: "keep-all" }}>
            직장인 통증·피로, 원인부터 해결까지
          </h1>
          <p style={{ fontSize: "14px", color: "#5a6a85", lineHeight: 1.7, wordBreak: "keep-all" }}>
            목·어깨·허리 통증, 눈 피로, 만성 피로를 직접 해결하는 실용 가이드 모음입니다.
          </p>
        </div>
      </div>

      {/* 글 피드 — 최신 3개 전체 본문 노출 (Blogger 스타일) */}
      <div className="mx-auto max-w-3xl px-4 py-6">
        {guides.length === 0 && (
          <p className="text-center py-16 text-sm" style={{ color: "#9aa5b8" }}>아직 작성된 글이 없습니다.</p>
        )}

        {featured.map((guide) => (
          <article key={guide.slug} style={{ paddingBottom: "48px", marginBottom: "48px", borderBottom: "2px solid #eef2f7" }}>

            {/* 헤더 */}
            <header style={{ borderTop: "4px solid #ff6b57", padding: "32px 0 24px", wordBreak: "keep-all" }}>
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                <span style={{
                  display: "inline-block", background: "#ff6b57", color: "#fff",
                  fontSize: "13px", fontWeight: 700, padding: "4px 12px", borderRadius: "999px",
                }}>
                  건강 가이드
                </span>
                <span style={{ fontSize: "13px", color: "#3268ff", fontWeight: 600 }}>{guide.category}</span>
              </div>

              <h2 style={{ margin: "0 0 12px" }}>
                <Link href={`/guides/${guide.slug}`} style={{
                  fontSize: "clamp(1.625rem, 4vw, 1.875rem)",
                  fontWeight: 800, color: "#1c2741", textDecoration: "none",
                  lineHeight: 1.3, letterSpacing: "-0.02em", wordBreak: "keep-all",
                }}>
                  {guide.title}
                </Link>
              </h2>

              <p style={{ fontSize: "1rem", color: "#5a6a85", margin: "0 0 14px", lineHeight: 1.6, wordBreak: "keep-all" }}>
                {guide.description}
              </p>

              <div style={{ fontSize: "13px", color: "#9aa5b8" }}>
                발행 {formatDate(guide.publishedAt)}&nbsp;·&nbsp;업데이트 {formatDate(guide.updatedAt)}&nbsp;·&nbsp;{guide.readTime} 읽기
              </div>
            </header>

            {/* 핵심 요약 */}
            {guide.keyPoints && guide.keyPoints.length > 0 && (
              <div style={{
                background: "#f4f7ff", borderLeft: "4px solid #3268ff",
                borderRadius: "0 12px 12px 0", padding: "20px 20px 16px", margin: "28px 0",
              }}>
                <div style={{ fontSize: "15px", fontWeight: 700, color: "#3268ff", marginBottom: "14px", letterSpacing: "0.01em" }}>
                  이 글의 핵심 요약
                </div>
                <ol style={{ margin: 0, paddingLeft: "20px" }}>
                  {guide.keyPoints.map((point, i) => (
                    <li key={i} style={{ fontSize: "15px", color: "#2a3a5c", lineHeight: 1.7, marginBottom: "8px", wordBreak: "keep-all" }}>
                      {point}
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* 본문 */}
            <div className="sureline-prose">
              {guide.sections && guide.sections.map((section, idx) => (
                <section key={idx}>
                  <h2>{section.title}</h2>

                  {section.paragraphs.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}

                  {section.bullets && (
                    <div style={{
                      background: "#f8f9fb", border: "1px solid #e1e5eb",
                      borderRadius: "12px", padding: "16px 18px", margin: "16px 0",
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
                      background: "#f0f4ff", borderLeft: "4px solid #3268ff",
                      borderRadius: "0 8px 8px 0", padding: "14px 18px", margin: "4px 0 20px",
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

            {/* 출처 */}
            {guide.sources && guide.sources.length > 0 && (
              <div style={{
                marginTop: "28px", padding: "16px 18px",
                borderRadius: "10px", background: "#f8f9fb", border: "1px solid #e1e5eb",
              }}>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "#7a8699", marginBottom: "8px" }}>
                  참고 자료
                </div>
                <ul style={{ margin: 0, paddingLeft: "16px" }}>
                  {guide.sources.map((s, i) => (
                    <li key={i} style={{ fontSize: "13px", color: "#7a8699", lineHeight: 1.6 }}>
                      <a href={s.url} target="_blank" rel="noopener noreferrer" className="sureline-source-link">
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

          </article>
        ))}

        {/* 더 읽을거리 */}
        {rest.length > 0 && (
          <div style={{ padding: "32px 0 24px" }}>
            <div style={{ fontSize: "12px", fontWeight: 700, color: "#9aa5b8", letterSpacing: "0.08em", marginBottom: "16px" }}>
              더 읽을거리
            </div>
            <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
              {rest.map((guide) => (
                <li key={guide.slug} style={{ borderBottom: "1px solid #eef2f7" }}>
                  <Link href={`/guides/${guide.slug}`} style={{
                    display: "block", padding: "13px 0",
                    fontSize: "15px", fontWeight: 600, color: "#1c2741",
                    textDecoration: "none", wordBreak: "keep-all", lineHeight: 1.4,
                  }}>
                    {guide.title}
                  </Link>
                </li>
              ))}
            </ul>
            <div style={{ marginTop: "20px" }}>
              <Link href="/guides" style={{
                fontSize: "13px", fontWeight: 600, color: "#3268ff", textDecoration: "none",
              }}>
                전체 글 보기 →
              </Link>
            </div>
          </div>
        )}

        {/* 글이 3개 이하일 때 전체 보기 버튼 */}
        {rest.length === 0 && guides.length > 0 && (
          <div className="text-center mt-4">
            <Link href="/guides" style={{
              display: "inline-block", border: "1px solid #dde6ff",
              color: "#3268ff", fontWeight: 600, fontSize: "14px",
              padding: "10px 28px", borderRadius: "999px",
              textDecoration: "none", background: "#fff",
            }}>
              전체 글 보기
            </Link>
          </div>
        )}
      </div>

    </main>
  );
}
