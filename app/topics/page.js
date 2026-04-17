import Link from "next/link";
import { fetchAllGuides, fetchAllCategories } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "주제별 가이드",
  description: "목·어깨, 허리, 손목·팔꿈치, 눈 피로, 만성 피로·수면 — 5가지 주제별로 핵심 가이드를 정리했습니다.",
  alternates: { canonical: "https://sureline.kr/topics" },
  openGraph: {
    title: "주제별 가이드 | sureline",
    url: "https://sureline.kr/topics",
    type: "website",
  },
};

const TOPIC_META = [
  {
    key: "목·어깨",
    icon: "💆",
    title: "목·어깨 통증",
    intro: "장시간 화면 작업으로 굳어가는 목과 어깨. 원인부터 매일 할 수 있는 대처법, 전문의가 필요한 시점까지.",
    color: "#3268ff",
    bg: "#f4f7ff",
    border: "#dde6ff",
  },
  {
    key: "허리",
    icon: "🪑",
    title: "허리 통증",
    intro: "오래 앉는 직업에서 피하기 어려운 허리 통증. 앉는 자세, 의자 환경, 코어 관리까지 실용적으로 다룹니다.",
    color: "#ff6b57",
    bg: "#fff5f3",
    border: "#ffd6ce",
  },
  {
    key: "손목",
    icon: "⌨️",
    title: "손목·팔꿈치 통증",
    intro: "키보드·마우스 장시간 사용으로 나타나는 손목 저림, 팔꿈치 통증. 초기에 잡아야 만성이 되지 않습니다.",
    color: "#9333ea",
    bg: "#faf5ff",
    border: "#e9d5ff",
  },
  {
    key: "눈",
    icon: "👁️",
    title: "눈 피로",
    intro: "모니터 작업이 많아질수록 심해지는 눈 피로·건조증. 환경 설정부터 습관 개선까지.",
    color: "#0891b2",
    bg: "#f0f9ff",
    border: "#bae6fd",
  },
  {
    key: "피로",
    icon: "😴",
    title: "만성 피로·수면",
    intro: "충분히 자도 피곤한 이유, 수면 질을 높이는 방법, 번아웃 초기 신호 확인.",
    color: "#16a34a",
    bg: "#f0fff4",
    border: "#c3e6cb",
  },
];

function matchTopic(category, topicKey) {
  if (!category) return false;
  return category.includes(topicKey);
}

export default async function TopicsPage() {
  const [guides, categories] = await Promise.all([
    fetchAllGuides(200),
    fetchAllCategories(),
  ]);

  const topicsWithGuides = TOPIC_META.map((topic) => {
    const related = guides.filter((g) => matchTopic(g.category, topic.key)).slice(0, 4);
    const catEntry = categories.find((c) => c.category.includes(topic.key));
    return { ...topic, guides: related, total: catEntry?.count ?? related.length };
  });

  return (
    <main className="flex-1">

      <div style={{ borderTop: "4px solid #3268ff", background: "#f4f7ff", padding: "32px 0 24px" }}>
        <div className="mx-auto max-w-3xl px-4">
          <p style={{ fontSize: 13, color: "#9aa5b8", marginBottom: 6 }}>sureline</p>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#1c2741", marginBottom: 8 }}>주제별 가이드</h1>
          <p style={{ fontSize: 14, color: "#5a6a85", lineHeight: 1.7 }}>처음 방문했다면 아래에서 가장 가까운 증상부터 읽어보세요.</p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-12">

        {topicsWithGuides.map((topic) => (
          <section key={topic.key} style={{
            background: "#fff", border: `1px solid ${topic.border}`,
            borderRadius: 16, marginBottom: 32, overflow: "hidden",
          }}>
            {/* 주제 헤더 */}
            <div style={{ background: topic.bg, borderBottom: `1px solid ${topic.border}`, padding: "24px 28px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                <span style={{ fontSize: 28 }}>{topic.icon}</span>
                <div>
                  <h2 style={{ fontSize: "1.125rem", fontWeight: 800, color: "#1c2741", margin: 0 }}>{topic.title}</h2>
                  {topic.total > 0 && (
                    <span style={{ fontSize: 12, color: topic.color, fontWeight: 600 }}>가이드 {topic.total}개</span>
                  )}
                </div>
              </div>
              <p style={{ fontSize: 14, color: "#5a6a85", lineHeight: 1.75, wordBreak: "keep-all", margin: 0 }}>
                {topic.intro}
              </p>
            </div>

            {/* 대표 가이드 목록 */}
            <div style={{ padding: "8px 0" }}>
              {topic.guides.length > 0 ? (
                topic.guides.map((guide) => (
                  <Link
                    key={guide.slug}
                    href={`/guides/${guide.slug}`}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "13px 28px", textDecoration: "none",
                      borderBottom: "1px solid #f4f6f9",
                      gap: 12,
                    }}
                  >
                    <span style={{ fontSize: 14, fontWeight: 600, color: "#1c2741", lineHeight: 1.45, wordBreak: "keep-all" }}>
                      {guide.title}
                    </span>
                    <span style={{ fontSize: 12, color: "#9aa5b8", flexShrink: 0 }}>{guide.readTime}</span>
                  </Link>
                ))
              ) : (
                <p style={{ fontSize: 14, color: "#9aa5b8", padding: "20px 28px", margin: 0 }}>준비 중입니다.</p>
              )}

              {/* 전체 보기 */}
              <div style={{ padding: "14px 28px" }}>
                <Link
                  href={`/guides/category/${encodeURIComponent(
                    categories.find((c) => c.category.includes(topic.key))?.category ?? topic.title
                  )}`}
                  style={{ fontSize: 13, fontWeight: 700, color: topic.color, textDecoration: "none" }}
                >
                  {topic.title} 전체 보기 →
                </Link>
              </div>
            </div>
          </section>
        ))}

        {/* 전체 가이드 보기 */}
        <div style={{ textAlign: "center", paddingTop: 16 }}>
          <Link href="/guides" style={{
            display: "inline-block",
            background: "#1c2741", color: "#fff",
            fontWeight: 700, fontSize: 14,
            padding: "12px 32px", borderRadius: 999,
            textDecoration: "none",
          }}>
            전체 가이드 보기
          </Link>
        </div>

      </div>
    </main>
  );
}
