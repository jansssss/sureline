import Link from "next/link";

export const metadata = {
  title: "직장인 3분 루틴 — 출근·점심·퇴근",
  description: "출근 후 3분, 점심 후 2분, 퇴근 전 5분. 책상에서 바로 할 수 있는 직장인 통증 예방 루틴입니다.",
  alternates: { canonical: "https://sureline.kr/guides/routine" },
  openGraph: { title: "직장인 3분 루틴 | sureline", url: "https://sureline.kr/guides/routine", type: "article" },
};

const ROUTINES = [
  {
    chip: "출근 후 3분",
    icon: "☀️",
    accent: "#3268ff",
    bg: "#f4f7ff",
    border: "#dde6ff",
    tagBg: "#3268ff",
    subtitle: "하루를 시작하기 전, 몸을 깨우는 준비 루틴",
    steps: [
      {
        time: "1분",
        title: "의자·모니터 셋업",
        desc: "등받이에 허리 전체가 닿도록 앉고, 모니터를 눈높이에 맞춰 조정합니다. 이 30초가 하루 자세의 기준점이 됩니다.",
        tip: "주먹 하나 들어갈 공간이 허리와 등받이 사이에 있으면 OK.",
      },
      {
        time: "1분",
        title: "목·어깨 웜업",
        desc: "턱을 당겨 뒷목을 늘이는 '턱 당기기'를 10회, 어깨를 뒤로 5회 크게 돌립니다.",
        tip: "빠르게 하지 말고 각 자세에서 2초 유지.",
      },
      {
        time: "1분",
        title: "손목 풀기",
        desc: "두 손을 깍지 껴서 앞으로 뻗은 뒤, 손목을 위·아래로 천천히 10회 꺾어줍니다.",
        tip: "타이핑이 많은 날은 이 동작을 오전·오후 각 한 번씩.",
      },
    ],
  },
  {
    chip: "점심 후 2분",
    icon: "🌤️",
    accent: "#16a34a",
    bg: "#f0fff4",
    border: "#c3e6cb",
    tagBg: "#16a34a",
    subtitle: "식사 후 잠깐, 오후 집중력을 살리는 리셋 루틴",
    steps: [
      {
        time: "1분",
        title: "짧은 걷기",
        desc: "식당·커피 머신까지 천천히 걸어갑니다. 허리 디스크는 걸을 때 압력이 낮아집니다.",
        tip: "엘리베이터 대신 계단 한 층만 올라도 충분.",
      },
      {
        time: "1분",
        title: "눈 휴식",
        desc: "창밖 먼 곳(최소 6m 이상)을 20초 바라봅니다. 모양체근의 긴장을 풀어 오후 눈 피로를 줄입니다.",
        tip: "스마트폰을 보는 건 휴식이 아닙니다.",
      },
    ],
  },
  {
    chip: "퇴근 전 5분",
    icon: "🌙",
    accent: "#9333ea",
    bg: "#faf5ff",
    border: "#e9d5ff",
    tagBg: "#9333ea",
    subtitle: "하루 쌓인 긴장을 풀고 퇴근하는 마무리 루틴",
    steps: [
      {
        time: "1분",
        title: "흉추 스트레칭",
        desc: "의자에 앉아 양손을 머리 뒤로 깍지 끼고, 상체를 천천히 뒤로 젖혀 등 중간(흉추)을 늘입니다. 5~6회.",
        tip: "허리가 아닌 등 중간이 늘어나는 느낌이 맞습니다.",
      },
      {
        time: "2분",
        title: "고관절·허벅지 앞쪽 스트레칭",
        desc: "한 발을 뒤로 빼고 런지 자세로 30초씩 앉아 있습니다. 오래 앉아 단축된 장요근을 풀어줍니다.",
        tip: "뒤로 뺀 발 무릎이 바닥에 살짝 닿아도 OK.",
      },
      {
        time: "2분",
        title: "어깨·팔꿈치 내리기",
        desc: "한 팔을 반대편 어깨 방향으로 당겨 20초 유지. 좌우 2세트. 종일 긴장된 삼각근·승모근을 이완합니다.",
        tip: "당길 때 어깨를 으쓱하지 말고 내려뜨린 채로.",
      },
    ],
  },
];

export default function RoutinePage() {
  return (
    <main className="flex-1">

      {/* 헤더 */}
      <div style={{ borderTop: "4px solid #9333ea", background: "linear-gradient(to bottom, #faf5ff, #fff)", padding: "40px 0 32px" }}>
        <div className="mx-auto max-w-4xl px-4">
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#9aa5b8", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              sureline 데일리 루틴
            </span>
          </div>
          <h1 style={{ fontSize: "clamp(1.625rem, 4vw, 2rem)", fontWeight: 800, color: "#1c2741", marginBottom: 12, lineHeight: 1.3, wordBreak: "keep-all" }}>
            하루 10분, 책상에서 바로 하는 직장인 루틴
          </h1>
          <p style={{ fontSize: 15, color: "#5a6a85", lineHeight: 1.75, wordBreak: "keep-all", maxWidth: 560, marginBottom: 24 }}>
            출근 후 3분 → 점심 후 2분 → 퇴근 전 5분. 특별한 장비 없이 자리에서 바로 할 수 있습니다.
          </p>

          {/* 시간 칩 플로우 */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            {[
              { label: "출근 후 3분", color: "#3268ff", bg: "#e8effe" },
              { label: "점심 후 2분", color: "#16a34a", bg: "#dcfce7" },
              { label: "퇴근 전 5분", color: "#9333ea", bg: "#f3e8ff" },
            ].map(({ label, color, bg }, i, arr) => (
              <>
                <span key={label} style={{
                  fontSize: 13, fontWeight: 700, color,
                  background: bg, padding: "6px 14px",
                  borderRadius: 999,
                }}>
                  {label}
                </span>
                {i < arr.length - 1 && (
                  <span key={`arrow-${i}`} style={{ fontSize: 16, color: "#c4cdd9", fontWeight: 300 }}>→</span>
                )}
              </>
            ))}
            <span style={{ fontSize: 13, color: "#9aa5b8", marginLeft: 4 }}>= 하루 10분</span>
          </div>
        </div>
      </div>

      {/* 루틴 섹션 */}
      <div className="mx-auto max-w-4xl px-4 py-12">
        <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
          {ROUTINES.map((routine) => (
            <div key={routine.chip} style={{ background: "#fff", border: "1px solid #eef2f7", borderRadius: 20, overflow: "hidden" }}>

              {/* 섹션 헤더 */}
              <div style={{
                padding: "20px 24px",
                background: routine.bg,
                borderBottom: `1px solid ${routine.border}`,
                display: "flex", alignItems: "flex-start", gap: 14,
              }}>
                <span style={{ fontSize: 28, lineHeight: 1 }}>{routine.icon}</span>
                <div>
                  <div style={{ display: "inline-block", background: routine.tagBg, color: "#fff", fontSize: 12, fontWeight: 700, padding: "3px 12px", borderRadius: 999, marginBottom: 8 }}>
                    {routine.chip}
                  </div>
                  <p style={{ fontSize: 14, color: "#5a6a85", margin: 0, wordBreak: "keep-all" }}>{routine.subtitle}</p>
                </div>
              </div>

              {/* 스텝 목록 */}
              <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
                {routine.steps.map((step, si) => (
                  <div key={si} style={{ display: "flex", gap: 14 }}>
                    {/* 시간 뱃지 */}
                    <div style={{
                      flexShrink: 0, width: 48,
                      fontSize: 11, fontWeight: 700, color: routine.accent,
                      background: routine.bg, border: `1px solid ${routine.border}`,
                      borderRadius: 8, padding: "4px 0",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      height: 28, marginTop: 2,
                    }}>
                      {step.time}
                    </div>

                    {/* 내용 */}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: "#1c2741", marginBottom: 4 }}>
                        {step.title}
                      </div>
                      <p style={{ fontSize: 14, color: "#5a6a85", lineHeight: 1.75, margin: "0 0 8px", wordBreak: "keep-all" }}>
                        {step.desc}
                      </p>
                      <div style={{ display: "flex", gap: 8, alignItems: "flex-start", background: "#f8f9fb", borderRadius: 10, padding: "8px 12px" }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: routine.accent, flexShrink: 0, marginTop: 1, letterSpacing: "0.06em" }}>TIP</span>
                        <span style={{ fontSize: 13, color: "#3a4a62", lineHeight: 1.6 }}>{step.tip}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          ))}
        </div>

        {/* 하단 안내 */}
        <div style={{ marginTop: 48, padding: "24px", background: "#f4f7ff", border: "1px solid #dde6ff", borderRadius: 20, textAlign: "center" }}>
          <p style={{ fontSize: 14, color: "#5a6a85", lineHeight: 1.8, wordBreak: "keep-all", marginBottom: 20 }}>
            통증이 2주 이상 지속되거나 루틴 이후에도 나빠진다면 전문의 진료를 먼저 받으세요.
          </p>
          <Link href="/guides/hospital" style={{ fontSize: 14, fontWeight: 700, color: "#3268ff", textDecoration: "none" }}>
            병원 가야 하는 기준 확인하기 →
          </Link>
        </div>
      </div>
    </main>
  );
}
