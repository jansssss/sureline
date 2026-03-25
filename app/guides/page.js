import Link from "next/link";
import { fetchAllGuides } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "전체 글 — sureline",
  description: "직장인 목·어깨·허리 통증, 눈 피로, 피로 회복 관련 모든 가이드 목록입니다.",
};

function formatDate(dateStr) {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.slice(0, 10).split("-");
  return `${year}. ${parseInt(month)}. ${parseInt(day)}.`;
}

export default async function GuidesPage() {
  const guides = await fetchAllGuides(200);

  return (
    <main className="flex-1">

      {/* 헤더 */}
      <div style={{ borderTop: "4px solid #3268ff", background: "#f4f7ff", padding: "28px 0 20px" }}>
        <div className="mx-auto max-w-3xl px-4">
          <h1 style={{ fontSize: "1.375rem", fontWeight: 800, color: "#1c2741", marginBottom: "4px" }}>전체 글</h1>
          <p style={{ fontSize: "13px", color: "#9aa5b8" }}>총 {guides.length}개의 가이드</p>
        </div>
      </div>

      {/* 글 피드 */}
      <div className="mx-auto max-w-3xl px-4 py-6">
        {guides.length > 0 ? (
          <div>
            {guides.map((guide) => (
              <article
                key={guide.slug}
                style={{ padding: "28px 0", borderBottom: "1px solid #eef2f7" }}
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
      </div>

    </main>
  );
}
