import Link from "next/link";
import { fetchAllGuides, fetchAllCategories } from "@/lib/supabase-server";
import CategorySidebar from "@/components/CategorySidebar";

export const dynamic = "force-dynamic";

const SITE_URL = "https://sureline.kr";

export async function generateMetadata({ searchParams }) {
  const page = Math.max(Number(searchParams?.page) || 1, 1);
  const canonical = page === 1 ? `${SITE_URL}/guides` : `${SITE_URL}/guides?page=${page}`;
  const title = page === 1 ? "전체 글" : `전체 글 (${page}페이지)`;
  const description = page === 1
    ? "직장인 목·어깨·허리 통증, 눈 피로, 피로 회복 관련 모든 가이드 목록입니다."
    : `직장인 건강 가이드 ${page}페이지 목록입니다.`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical, type: "website" },
    robots: { index: true, follow: true },
  };
}

const PAGE_SIZE = 5;

function formatDate(dateStr) {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.slice(0, 10).split("-");
  return `${year}. ${parseInt(month)}. ${parseInt(day)}.`;
}

export default async function GuidesPage({ searchParams }) {
  const [guides, categories] = await Promise.all([fetchAllGuides(200), fetchAllCategories()]);
  const totalPages = Math.ceil(guides.length / PAGE_SIZE);
  const currentPage = Math.min(Math.max(Number(searchParams?.page) || 1, 1), totalPages || 1);
  const paged = guides.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <main className="flex-1">

      {/* 헤더 */}
      <div style={{ borderTop: "4px solid #3268ff", background: "#f4f7ff", padding: "28px 0 20px" }}>
        <div className="mx-auto max-w-5xl px-4">
          <h1 style={{ fontSize: "1.375rem", fontWeight: 800, color: "#1c2741", marginBottom: "4px" }}>전체 글</h1>
          <p style={{ fontSize: "13px", color: "#9aa5b8" }}>총 {guides.length}개의 가이드</p>
        </div>
      </div>

      <CategorySidebar categories={categories} currentCategory={null} variant="mobile" />

      <div className="mx-auto max-w-5xl px-4 py-6 cat-layout">
        <CategorySidebar categories={categories} currentCategory={null} variant="desktop" />
        <div style={{ flex: 1, minWidth: 0 }}>
        {paged.length > 0 ? (
          <div>
            {paged.map((guide, idx) => (
              <article
                key={guide.slug}
                style={{
                  padding: "28px 16px",
                  borderBottom: "1px solid #eef2f7",
                  background: idx % 2 === 0 ? "#f8f9fb" : "#fff",
                  borderRadius: "8px",
                  marginBottom: "4px",
                }}
              >
                {/* 카테고리 + 날짜 */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px", flexWrap: "wrap" }}>
                  <Link
                    href={`/guides/category/${encodeURIComponent(guide.category)}`}
                    style={{
                      display: "inline-block",
                      background: "#ff6b57",
                      color: "#fff",
                      fontSize: "11px",
                      fontWeight: 700,
                      padding: "3px 10px",
                      borderRadius: "999px",
                      textDecoration: "none",
                    }}
                  >
                    {guide.category}
                  </Link>
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

        {/* 페이지네이션 — 6개 이상일 때만 노출 */}
        {totalPages > 1 && (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "4px", marginTop: "40px" }}>
            {/* 이전 */}
            {currentPage > 1 && (
              <Link href={`/guides?page=${currentPage - 1}`} style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                width: "36px", height: "36px", borderRadius: "8px",
                border: "1px solid #dde6ff", color: "#3268ff", textDecoration: "none", fontSize: "14px",
              }}>
                ‹
              </Link>
            )}

            {/* 페이지 번호 */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Link
                key={p}
                href={`/guides?page=${p}`}
                style={{
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  width: "36px", height: "36px", borderRadius: "8px",
                  fontSize: "14px", fontWeight: p === currentPage ? 700 : 400,
                  textDecoration: "none",
                  background: p === currentPage ? "#3268ff" : "#fff",
                  color: p === currentPage ? "#fff" : "#5a6a85",
                  border: p === currentPage ? "1px solid #3268ff" : "1px solid #dde6ff",
                }}
              >
                {p}
              </Link>
            ))}

            {/* 다음 */}
            {currentPage < totalPages && (
              <Link href={`/guides?page=${currentPage + 1}`} style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                width: "36px", height: "36px", borderRadius: "8px",
                border: "1px solid #dde6ff", color: "#3268ff", textDecoration: "none", fontSize: "14px",
              }}>
                ›
              </Link>
            )}
          </div>
        )}
        </div> {/* 글 피드 end */}
      </div> {/* 본문 + 사이드바 end */}

    </main>
  );
}
