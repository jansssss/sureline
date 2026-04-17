import Link from "next/link";

export const metadata = {
  title: "직무별 건강 가이드 — 디자이너·개발자·사무행정",
  description: "디자이너의 손목·눈, 개발자의 목·눈 피로, 사무행정의 허리 통증. 직무별로 가장 자주 생기는 통증과 대처법을 정리했습니다.",
  alternates: { canonical: "https://sureline.kr/guides/job" },
  openGraph: { title: "직무별 건강 가이드 | sureline", url: "https://sureline.kr/guides/job", type: "article" },
};

const JOBS = [
  {
    job: "디자이너",
    icon: "🎨",
    accent: "#9333ea",
    bg: "#faf5ff",
    border: "#e9d5ff",
    tagBg: "#9333ea",
    pains: ["손목 반복 동작 (마우스·타블렛)", "눈 피로 — 색 교정, 세밀 작업", "목·어깨 — 모니터 근접 작업"],
    tips: [
      { title: "타블렛 각도", desc: "타블렛은 모니터 정면, 기울기 15° 이하. 팔꿈치가 90° 이상 펴진 채로 작업하면 손목 부담이 줄어듭니다." },
      { title: "색 작업 휴식", desc: "색 교정 작업은 20분마다 중단하고 창밖 먼 곳(6m 이상)을 20초 바라보세요. 모양체근 긴장을 직접 풀 수 있습니다." },
      { title: "모니터 거리", desc: "디자이너는 세밀 작업을 위해 화면에 가까이 붙는 경향이 있습니다. 60cm 이상 거리를 유지하고, 확대 기능을 적극 사용하세요." },
      { title: "손목 중립 자세", desc: "드로잉 시 손목이 꺾이지 않도록 손목받침대를 사용하거나 타블렛 높이를 테이블 레벨에 맞추세요." },
    ],
    watch: "손목 저림(엄지~약지)이 2주 이상이면 손목터널증후군 검사 권장.",
  },
  {
    job: "개발자",
    icon: "💻",
    accent: "#3268ff",
    bg: "#f4f7ff",
    border: "#dde6ff",
    tagBg: "#3268ff",
    pains: ["목·어깨 — 장시간 타이핑 + 모니터 집중", "눈 피로 — 코드 집중, 어두운 테마", "허리 — 오랜 집중으로 자세 무너짐"],
    tips: [
      { title: "듀얼 모니터 높이", desc: "주 모니터는 눈높이 정중앙, 보조 모니터는 약간 옆이나 낮게. 고개를 자주 돌리게 되는 구조는 목 근육 불균형을 만듭니다." },
      { title: "다크 테마 함정", desc: "다크 테마가 눈에 항상 편한 건 아닙니다. 주변 조명이 밝을 때 다크 테마를 쓰면 대비가 높아져 더 피로합니다. 조명에 맞춰 전환하세요." },
      { title: "포모도로 + 스트레칭", desc: "25분 집중 후 5분 쉴 때 의자에서 일어나 어깨를 3회 크게 돌리고 목을 좌우로 천천히 기울여 주세요. 코드 중단이 아닌 '회복 사이클'로 인식하면 지속 가능합니다." },
      { title: "키보드 높이", desc: "키보드는 팔꿈치 높이와 같거나 약간 낮게. 키보드가 너무 높으면 어깨를 들어올린 채로 작업하게 되어 승모근이 만성 긴장 상태가 됩니다." },
    ],
    watch: "목 통증 + 팔 저림이 함께 오면 경추 신경 압박 가능성. 정형외과 확인.",
  },
  {
    job: "사무행정",
    icon: "📋",
    accent: "#16a34a",
    bg: "#f0fff4",
    border: "#c3e6cb",
    tagBg: "#16a34a",
    pains: ["허리 — 하루 종일 앉아서 서류·전화 업무", "목·어깨 — 전화 끼워 들기, 서류 숙임", "피로 — 멀티태스킹, 감정 노동"],
    tips: [
      { title: "전화할 때 자세", desc: "어깨와 귀 사이에 수화기를 끼우는 자세는 경추 측만의 주원인입니다. 핸즈프리 또는 스피커폰을 사용하세요." },
      { title: "서류 작업 각도", desc: "책상 위 서류는 몸 정면에 놓고, 독서대나 클립보드 스탠드를 사용해 고개 숙임을 줄이세요." },
      { title: "앉는 시간 쪼개기", desc: "45분 앉으면 반드시 3분 이상 서거나 걷기. 사무행정은 앉아있는 시간이 길수록 허리 디스크 압력이 누적됩니다." },
      { title: "피로 회복 우선순위", desc: "감정 노동 후 뇌 피로가 신체 피로보다 크게 느껴집니다. 점심시간 10분 자연광 산책이 오후 집중력과 신체 회복 모두에 효과적입니다." },
    ],
    watch: "허리 통증 + 다리 저림이 함께 오면 추간판 탈출증 가능성. 2주 이상 시 정형외과.",
  },
];

export default function JobPage() {
  return (
    <main className="flex-1">
      <div style={{ borderTop: "4px solid #9333ea", background: "linear-gradient(to bottom, #faf5ff, #fff)", padding: "40px 0 32px" }}>
        <div className="mx-auto max-w-4xl px-4">
          <span style={{ fontSize: 11, fontWeight: 700, color: "#9aa5b8", letterSpacing: "0.08em", textTransform: "uppercase" }}>sureline 직무별 가이드</span>
          <h1 style={{ fontSize: "clamp(1.625rem, 4vw, 2rem)", fontWeight: 800, color: "#1c2741", marginBottom: 12, marginTop: 14, lineHeight: 1.3, wordBreak: "keep-all" }}>
            내 직무에 맞는 통증 관리
          </h1>
          <p style={{ fontSize: 15, color: "#5a6a85", lineHeight: 1.75, wordBreak: "keep-all", maxWidth: 560 }}>
            직무마다 반복되는 자세와 동작이 다릅니다. 디자이너·개발자·사무행정 각각에 맞는 원인과 대처법을 정리했습니다.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-12" style={{ display: "flex", flexDirection: "column", gap: 32 }}>
        {JOBS.map((j) => (
          <div key={j.job} style={{ background: "#fff", border: "1px solid #eef2f7", borderRadius: 20, overflow: "hidden" }}>
            <div style={{ padding: "20px 24px", background: j.bg, borderBottom: `1px solid ${j.border}`, display: "flex", alignItems: "center", gap: 14 }}>
              <span style={{ fontSize: 28 }}>{j.icon}</span>
              <div>
                <span style={{ background: j.tagBg, color: "#fff", fontSize: 12, fontWeight: 700, padding: "3px 12px", borderRadius: 999, display: "inline-block", marginBottom: 8 }}>{j.job}</span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {j.pains.map((p, i) => (
                    <span key={i} style={{ fontSize: 12, color: j.accent, background: "#fff", border: `1px solid ${j.border}`, borderRadius: 999, padding: "2px 10px" }}>{p}</span>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
              {j.tips.map((tip, i) => (
                <div key={i} style={{ display: "flex", gap: 14 }}>
                  <div style={{ flexShrink: 0, width: 24, height: 24, borderRadius: 8, background: j.bg, border: `1px solid ${j.border}`, display: "flex", alignItems: "center", justifyContent: "center", marginTop: 2 }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: j.accent }}>{i + 1}</span>
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#1c2741", marginBottom: 4 }}>{tip.title}</div>
                    <p style={{ fontSize: 14, color: "#5a6a85", lineHeight: 1.75, margin: 0, wordBreak: "keep-all" }}>{tip.desc}</p>
                  </div>
                </div>
              ))}
              <div style={{ display: "flex", gap: 8, alignItems: "flex-start", background: "#fff5f5", border: "1px solid #fecaca", borderRadius: 10, padding: "10px 14px", marginTop: 4 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#dc2626", flexShrink: 0, marginTop: 1 }}>주의</span>
                <span style={{ fontSize: 13, color: "#3a4a62", lineHeight: 1.6 }}>{j.watch}</span>
              </div>
            </div>
          </div>
        ))}

        <BottomNav prev={{ href: "/guides/routine", label: "데일리 루틴" }} next={{ href: "/guides/situation", label: "상황별 가이드" }} />
      </div>
    </main>
  );
}

function BottomNav({ prev, next }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginTop: 16 }}>
      {prev && <Link href={prev.href} style={{ fontSize: 13, fontWeight: 600, color: "#3268ff", textDecoration: "none" }}>← {prev.label}</Link>}
      {next && <Link href={next.href} style={{ fontSize: 13, fontWeight: 600, color: "#3268ff", textDecoration: "none" }}>{next.label} →</Link>}
    </div>
  );
}
