import Link from "next/link";
import { fetchAllGuides } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

function formatDate(dateStr) {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.slice(0, 10).split("-");
  return `${year}. ${parseInt(month)}. ${parseInt(day)}.`;
}

export default async function HomePage() {
  const guides = await fetchAllGuides(10);

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

      {/* 글 피드 */}
      <div className="mx-auto max-w-3xl px-4 py-6">
        {guides.length > 0 ? (
          <div>
            {guides.map((guide, i) => (
              <article
                key={guide.slug}
                style={{
                  padding: "28px 0",
                  borderBottom: "1px solid #eef2f7",
                }}
              >
                {/* 카테고리 + 날짜 */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px", flexWrap: "wrap" }}>
                  <span style={{
                    display: "inline-block",
                    background: "#ff6b57",
                    color: "#fff",
                    fontSize: "11px",
                    fontWeight: 700,
                    padding: "3px 10px",
                    borderRadius: "999px",
                  }}>
                    {guide.category}
                  </span>
                  <span style={{ fontSize: "12px", color: "#9aa5b8" }}>{formatDate(guide.publishedAt)}</span>
                  <span style={{ fontSize: "12px", color: "#9aa5b8" }}>·</span>
                  <span style={{ fontSize: "12px", color: "#9aa5b8" }}>{guide.readTime} 읽기</span>
                </div>

                {/* 제목 */}
                <h2 style={{ margin: "0 0 8px" }}>
                  <Link
                    href={`/guides/${guide.slug}`}
                    style={{
                      fontSize: "1.125rem",
                      fontWeight: 800,
                      color: "#1c2741",
                      textDecoration: "none",
                      lineHeight: 1.4,
                      letterSpacing: "-0.01em",
                      wordBreak: "keep-all",
                    }}
                  >
                    {guide.title}
                  </Link>
                </h2>

                {/* 설명 */}
                <p style={{
                  fontSize: "14px",
                  color: "#5a6a85",
                  lineHeight: 1.75,
                  margin: "0 0 14px",
                  wordBreak: "keep-all",
                }}>
                  {guide.description}
                </p>

                {/* 더 읽기 */}
                <Link
                  href={`/guides/${guide.slug}`}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#3268ff",
                    textDecoration: "none",
                  }}
                >
                  자세히 보기 →
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <p className="text-center py-16 text-sm" style={{ color: "#9aa5b8" }}>아직 작성된 글이 없습니다.</p>
        )}

        {/* 전체 보기 */}
        {guides.length > 0 && (
          <div className="text-center mt-8">
            <Link
              href="/guides"
              style={{
                display: "inline-block",
                border: "1px solid #dde6ff",
                color: "#3268ff",
                fontWeight: 600,
                fontSize: "14px",
                padding: "10px 28px",
                borderRadius: "999px",
                textDecoration: "none",
                background: "#fff",
              }}
            >
              전체 글 보기
            </Link>
          </div>
        )}
      </div>

    </main>
  );
}
