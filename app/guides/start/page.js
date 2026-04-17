import Link from "next/link";
import { fetchAllGuides } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "어디서 시작할까 — 증상별 추천 읽기 순서",
  description: "목 통증, 손목 저림, 눈 피로, 허리 통증. 증상별로 먼저 읽어야 할 글 순서를 안내합니다.",
  alternates: { canonical: "https://sureline.kr/guides/start" },
  openGraph: { title: "어디서 시작할까 | sureline", url: "https://sureline.kr/guides/start", type: "article" },
};

const PATHS = [
  {
    symptom: "목·어깨가 아파요",
    icon: "🧍",
    accent: "#3268ff",
    bg: "#f4f7ff",
    border: "#dde6ff",
    tagBg: "#3268ff",
    category: "목·어깨",
    steps: [
      { step: 1, label: "원인 확인", hint: "자세인지 환경인지 먼저 구분" },
      { step: 2, label: "오해 바로잡기", href: "/guides/myth", hint: "스트레칭만으로 낫는다는 믿음 체크" },
      { step: 3, label: "병원 기준 확인", href: "/guides/hospital", hint: "지금 병원이 필요한지 확인" },
      { step: 4, label: "루틴 시작", href: "/guides/routine", hint: "출근 후 3분 목·어깨 웜업" },
    ],
  },
  {
    symptom: "손목이 저리거나 아파요",
    icon: "✋",
    accent: "#9333ea",
    bg: "#faf5ff",
    border: "#e9d5ff",
    tagBg: "#9333ea",
    category: "손목",
    steps: [
      { step: 1, label: "저림 원인 확인", href: "/guides/myth", hint: "CTS인지 다른 문제인지 구분하기" },
      { step: 2, label: "용어 이해", href: "/guides/glossary", hint: "CTS·드퀘르벵 차이 파악" },
      { step: 3, label: "병원 기준", href: "/guides/hospital", hint: "새끼손가락 포함 여부로 1차 판단" },
      { step: 4, label: "직무별 팁", href: "/guides/job", hint: "디자이너·개발자 손목 세팅" },
    ],
  },
  {
    symptom: "눈이 피로하고 뻑뻑해요",
    icon: "👁",
    accent: "#0891b2",
    bg: "#ecfeff",
    border: "#a5f3fc",
    tagBg: "#0891b2",
    category: "눈",
    steps: [
      { step: 1, label: "오해 체크", href: "/guides/myth", hint: "인공눈물이 만능이 아닌 이유" },
      { step: 2, label: "계절 요인 확인", href: "/guides/season", hint: "냉방·난방 건조 시즌 대응" },
      { step: 3, label: "병원 기준", href: "/guides/hospital", hint: "응급 증상과 아닌 것 구분" },
      { step: 4, label: "루틴 적용", href: "/guides/routine", hint: "점심 후 2분 눈 휴식" },
    ],
  },
  {
    symptom: "허리가 자주 아파요",
    icon: "🦴",
    accent: "#16a34a",
    bg: "#f0fff4",
    border: "#c3e6cb",
    tagBg: "#16a34a",
    category: "허리",
    steps: [
      { step: 1, label: "오해 확인", href: "/guides/myth", hint: "쉬면 낫는다는 믿음은 48시간까지만" },
      { step: 2, label: "상황 점검", href: "/guides/situation", hint: "재택·출장·야근 중 어떤 상황?" },
      { step: 3, label: "병원 기준", href: "/guides/hospital", hint: "다리 저림 여부가 핵심 판단 기준" },
      { step: 4, label: "연령 전략", href: "/guides/age", hint: "2030은 예방, 4050은 근력 우선" },
    ],
  },
];

export default async function StartPage() {
  const guides = await fetchAllGuides(200);

  return (
    <main className="flex-1">
      <div style={{ borderTop: "4px solid #ff6b57", background: "linear-gradient(to bottom, #fff5f0, #fff)", padding: "40px 0 32px" }}>
        <div className="mx-auto max-w-4xl px-4">
          <span style={{ fontSize: 11, fontWeight: 700, color: "#9aa5b8", letterSpacing: "0.08em", textTransform: "uppercase" }}>sureline 추천 순서</span>
          <h1 style={{ fontSize: "clamp(1.625rem, 4vw, 2rem)", fontWeight: 800, color: "#1c2741", marginBottom: 12, marginTop: 14, lineHeight: 1.3, wordBreak: "keep-all" }}>
            어디서 시작해야 할지 모르겠다면
          </h1>
          <p style={{ fontSize: 15, color: "#5a6a85", lineHeight: 1.75, wordBreak: "keep-all", maxWidth: 560 }}>
            증상별로 먼저 읽어야 할 순서를 정리했습니다. 지금 가장 불편한 부위를 선택하세요.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-12" style={{ display: "flex", flexDirection: "column", gap: 32 }}>
        {PATHS.map((path) => {
          const related = guides.filter((g) => g.category === path.category).slice(0, 3);
          return (
            <div key={path.symptom} style={{ background: "#fff", border: "1px solid #eef2f7", borderRadius: 20, overflow: "hidden" }}>
              <div style={{ padding: "18px 24px", background: path.bg, borderBottom: `1px solid ${path.border}`, display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 24 }}>{path.icon}</span>
                <span style={{ fontSize: 15, fontWeight: 800, color: "#1c2741" }}>{path.symptom}</span>
              </div>

              {/* 단계 플로우 */}
              <div style={{ padding: "20px 24px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {path.steps.map((s, i) => (
                    <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                      <div style={{
                        flexShrink: 0, width: 24, height: 24, borderRadius: "50%",
                        background: path.tagBg, display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <span style={{ fontSize: 11, fontWeight: 800, color: "#fff" }}>{s.step}</span>
                      </div>
                      <div style={{ flex: 1 }}>
                        {s.href ? (
                          <Link href={s.href} style={{ fontSize: 14, fontWeight: 700, color: path.accent, textDecoration: "none" }}>
                            {s.label} →
                          </Link>
                        ) : (
                          <span style={{ fontSize: 14, fontWeight: 700, color: "#1c2741" }}>{s.label}</span>
                        )}
                        <p style={{ fontSize: 13, color: "#9aa5b8", margin: "2px 0 0", lineHeight: 1.5 }}>{s.hint}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 관련 글 */}
                {related.length > 0 && (
                  <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid #f4f6f9" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#9aa5b8", letterSpacing: "0.06em", marginBottom: 10 }}>관련 가이드</div>
                    {related.map((g) => (
                      <Link key={g.slug} href={`/guides/${g.slug}`} style={{
                        display: "block", fontSize: 13, fontWeight: 600, color: "#3a4a62",
                        textDecoration: "none", padding: "6px 0",
                        borderBottom: "1px solid #f4f6f9", lineHeight: 1.4, wordBreak: "keep-all",
                      }}>
                        {g.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16 }}>
          <Link href="/guides/glossary" style={{ fontSize: 13, fontWeight: 600, color: "#3268ff", textDecoration: "none" }}>← 용어 해설</Link>
          <Link href="/guides" style={{ fontSize: 13, fontWeight: 600, color: "#3268ff", textDecoration: "none" }}>전체 글 보기 →</Link>
        </div>
      </div>
    </main>
  );
}
