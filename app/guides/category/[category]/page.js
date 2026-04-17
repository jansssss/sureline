import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchGuidesByCategory, fetchAllCategories } from "@/lib/supabase-server";
import CategorySidebar from "@/components/CategorySidebar";

export const dynamic = "force-dynamic";

const SITE_URL = "https://sureline.kr";

function formatDate(dateStr) {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.slice(0, 10).split("-");
  return `${year}. ${parseInt(month)}. ${parseInt(day)}.`;
}

export async function generateMetadata({ params }) {
  const category = decodeURIComponent(params.category);
  const url = `${SITE_URL}/guides/category/${encodeURIComponent(category)}`;
  return {
    title: `${category} 가이드`,
    description: `직장인 건강 가이드 — ${category} 관련 모든 글 목록입니다.`,
    alternates: { canonical: url },
    openGraph: { title: `${category} 가이드 | sureline`, url, type: "website" },
  };
}

export default async function CategoryPage({ params }) {
  const category = decodeURIComponent(params.category);
  const [guides, categories] = await Promise.all([
    fetchGuidesByCategory(category),
    fetchAllCategories(),
  ]);

  if (!guides.length) notFound();

  return (
    <main className="flex-1">

      {/* 헤더 */}
      <div style={{ borderTop: "4px solid #3268ff", background: "#f4f7ff", padding: "28px 0 20px" }}>
        <div className="mx-auto max-w-5xl px-4">
          <div className="mb-3">
            <Link
              href="/guides"
              style={{ fontSize: 13, color: "#5a6a85", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4 }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 5l-7 7 7 7" />
              </svg>
              전체 글
            </Link>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <span style={{
              background: "#ff6b57", color: "#fff",
              fontSize: 12, fontWeight: 700,
              padding: "4px 12px", borderRadius: 999,
            }}>
              카테고리
            </span>
            <h1 style={{ fontSize: "1.375rem", fontWeight: 800, color: "#1c2741", margin: 0 }}>
              {category}
            </h1>
          </div>
          <p style={{ fontSize: 13, color: "#9aa5b8", marginTop: 6 }}>총 {guides.length}개의 가이드</p>
        </div>
      </div>

      <CategorySidebar categories={categories} currentCategory={category} variant="mobile" />

      <div className="mx-auto max-w-5xl px-4 py-6 cat-layout">
        <CategorySidebar categories={categories} currentCategory={category} variant="desktop" />
        <div style={{ flex: 1, minWidth: 0 }}>
        {guides.map((guide, idx) => (
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
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
              <span style={{ fontSize: 12, color: "#9aa5b8" }}>{formatDate(guide.publishedAt)}</span>
              <span style={{ fontSize: 12, color: "#9aa5b8" }}>·</span>
              <span style={{ fontSize: 12, color: "#9aa5b8" }}>{guide.readTime} 읽기</span>
            </div>

            <h2 style={{ margin: "0 0 8px" }}>
              <Link
                href={`/guides/${guide.slug}`}
                style={{
                  fontSize: "1.125rem", fontWeight: 800, color: "#1c2741",
                  textDecoration: "none", lineHeight: 1.4,
                  letterSpacing: "-0.01em", wordBreak: "keep-all",
                }}
              >
                {guide.title}
              </Link>
            </h2>

            <p style={{ fontSize: 14, color: "#5a6a85", lineHeight: 1.75, margin: "0 0 14px", wordBreak: "keep-all" }}>
              {guide.description}
            </p>

            <Link
              href={`/guides/${guide.slug}`}
              style={{ fontSize: 13, fontWeight: 600, color: "#3268ff", textDecoration: "none" }}
            >
              자세히 보기 →
            </Link>
          </article>
        ))}
        </div> {/* 글 목록 end */}
      </div> {/* 본문 + 사이드바 end */}
    </main>
  );
}
