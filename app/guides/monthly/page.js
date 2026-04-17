import Link from "next/link";

export const metadata = {
  title: "월간 직장인 건강 정리 — 2025년 4월",
  description: "이번 달 직장인이 주의해야 할 건강 이슈와 최근 업데이트된 sureline 가이드를 정리합니다.",
  alternates: { canonical: "https://sureline.kr/guides/monthly" },
  openGraph: { title: "월간 건강 정리 | sureline", url: "https://sureline.kr/guides/monthly", type: "article" },
};

const CURRENT = {
  year: 2025,
  month: 4,
  label: "2025년 4월",
  season: "봄 환절기",
  seasonIcon: "🌸",
  highlights: [
    {
      title: "봄철 알레르기 + 냉방 시작",
      accent: "#ec4899",
      bg: "#fdf2f8",
      border: "#fbcfe8",
      body: "4월은 꽃가루 농도가 높고, 냉방이 간헐적으로 시작되는 시기입니다. 알레르기로 눈을 자주 비비면 각막 상처와 충혈이 생길 수 있습니다. 인공눈물로 씻어내는 것이 안전합니다.",
    },
    {
      title: "낮밤 기온 차 10°C — 목·어깨 주의",
      accent: "#3268ff",
      bg: "#f4f7ff",
      border: "#dde6ff",
      body: "환절기 기온 차가 크면 근육이 수축-이완을 반복합니다. 아침 출근 시 외풍이 목·어깨에 직접 닿지 않도록 주의하고, 출근 직후 웜업 루틴을 챙기세요.",
    },
    {
      title: "환기 시 자세 주의",
      accent: "#16a34a",
      bg: "#f0fff4",
      border: "#c3e6cb",
      body: "봄에는 창문을 자주 열게 됩니다. 측면 환기를 통해 찬 바람이 목·어깨에 직접 닿지 않도록 루버 방향을 조정하세요.",
    },
  ],
  tips: [
    "콘택트 착용자는 알레르기 시즌에 안경으로 전환 추천",
    "미세먼지 나쁜 날 창문 환기 시 짧게 집중적으로 (10분 이내)",
    "점심시간 햇빛 노출 10분이 봄 피로 회복에 효과적",
  ],
  updatedGuides: [
    { label: "오해 바로잡기", href: "/guides/myth" },
    { label: "병원 가야 하는 기준", href: "/guides/hospital" },
    { label: "데일리 루틴", href: "/guides/routine" },
    { label: "계절별 가이드", href: "/guides/season" },
  ],
};

export default function MonthlyPage() {
  return (
    <main className="flex-1">
      <div style={{ borderTop: "4px solid #3268ff", background: "linear-gradient(to bottom, #f4f7ff, #fff)", padding: "40px 0 32px" }}>
        <div className="mx-auto max-w-4xl px-4">
          <span style={{ fontSize: 11, fontWeight: 700, color: "#9aa5b8", letterSpacing: "0.08em", textTransform: "uppercase" }}>sureline 월간 정리</span>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 14, marginBottom: 8 }}>
            <span style={{ fontSize: 22 }}>{CURRENT.seasonIcon}</span>
            <h1 style={{ fontSize: "clamp(1.625rem, 4vw, 2rem)", fontWeight: 800, color: "#1c2741", margin: 0, lineHeight: 1.3 }}>
              {CURRENT.label} 직장인 건강 이슈
            </h1>
          </div>
          <p style={{ fontSize: 15, color: "#5a6a85", lineHeight: 1.75, wordBreak: "keep-all", maxWidth: 560 }}>
            {CURRENT.season} 시기에 특히 주의해야 할 직장인 건강 포인트와 이번 달 추가·업데이트된 가이드를 정리합니다.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-12" style={{ display: "flex", flexDirection: "column", gap: 32 }}>

        {/* 이번 달 이슈 */}
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#9aa5b8", letterSpacing: "0.08em", marginBottom: 16 }}>이번 달 주요 이슈</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {CURRENT.highlights.map((h, i) => (
              <div key={i} style={{ background: h.bg, border: `1px solid ${h.border}`, borderRadius: 16, padding: "18px 20px" }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: h.accent, marginBottom: 8 }}>{h.title}</div>
                <p style={{ fontSize: 14, color: "#5a6a85", lineHeight: 1.8, margin: 0, wordBreak: "keep-all" }}>{h.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 이달의 팁 */}
        <div style={{ background: "#fff", border: "1px solid #eef2f7", borderRadius: 20, padding: "20px 24px" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#9aa5b8", letterSpacing: "0.08em", marginBottom: 14 }}>이달의 실천 팁</div>
          {CURRENT.tips.map((tip, i) => (
            <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 10 }}>
              <span style={{ fontSize: 14, color: "#3268ff", fontWeight: 700, flexShrink: 0 }}>·</span>
              <span style={{ fontSize: 14, color: "#3a4a62", lineHeight: 1.7 }}>{tip}</span>
            </div>
          ))}
        </div>

        {/* 업데이트된 가이드 */}
        <div style={{ background: "#fff", border: "1px solid #eef2f7", borderRadius: 20, padding: "20px 24px" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#9aa5b8", letterSpacing: "0.08em", marginBottom: 14 }}>이번 달 추가·업데이트 가이드</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {CURRENT.updatedGuides.map((g) => (
              <Link key={g.href} href={g.href} style={{
                fontSize: 13, fontWeight: 600, color: "#3268ff",
                background: "#f4f7ff", border: "1px solid #dde6ff",
                borderRadius: 999, padding: "6px 14px", textDecoration: "none",
              }}>
                {g.label}
              </Link>
            ))}
          </div>
        </div>

        <div style={{ padding: "20px 24px", background: "#f8f9fb", borderRadius: 16, textAlign: "center" }}>
          <p style={{ fontSize: 13, color: "#9aa5b8", margin: "0 0 12px" }}>매월 초 업데이트됩니다.</p>
          <Link href="/guides/updates" style={{ fontSize: 13, fontWeight: 600, color: "#3268ff", textDecoration: "none" }}>
            전체 업데이트 노트 보기 →
          </Link>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Link href="/guides/downloads" style={{ fontSize: 13, fontWeight: 600, color: "#3268ff", textDecoration: "none" }}>← 다운로드 자료</Link>
          <Link href="/guides/updates" style={{ fontSize: 13, fontWeight: 600, color: "#3268ff", textDecoration: "none" }}>업데이트 노트 →</Link>
        </div>
      </div>
    </main>
  );
}
