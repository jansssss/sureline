import Link from "next/link";

export const metadata = {
  title: "계절별 직장인 건강 — 봄·여름·가을·겨울",
  description: "봄철 알레르기와 눈 피로, 여름 냉방과 목·어깨 결림, 가을 환절기 피로, 겨울 건조와 안구 불편감을 계절별로 정리했습니다.",
  alternates: { canonical: "https://sureline.kr/guides/season" },
  openGraph: { title: "계절별 건강 가이드 | sureline", url: "https://sureline.kr/guides/season", type: "article" },
};

const SEASONS = [
  {
    season: "봄",
    period: "3–5월",
    icon: "🌸",
    accent: "#ec4899",
    bg: "#fdf2f8",
    border: "#fbcfe8",
    tagBg: "#ec4899",
    issues: [
      { title: "알레르기와 눈 피로", desc: "꽃가루·미세먼지 시즌에 눈이 가렵고 충혈되면 콘택트 대신 안경을 우선 착용하세요. 가려워도 비비지 말고 인공눈물로 씻어내는 것이 안전합니다." },
      { title: "환절기 피로", desc: "낮밤 기온 차가 10°C 이상 벌어지면 자율신경계가 과부하 상태가 됩니다. 수면 시간이 일정해야 이 부담을 줄일 수 있습니다." },
      { title: "창문 환기 시 자세", desc: "봄에는 환기를 위해 창을 자주 열게 되는데, 외풍이 목·어깨에 직접 닿으면 근육이 수축합니다. 측면 환기를 선택하세요." },
    ],
  },
  {
    season: "여름",
    period: "6–8월",
    icon: "☀️",
    accent: "#d97706",
    bg: "#fffbeb",
    border: "#fcd34d",
    tagBg: "#d97706",
    issues: [
      { title: "냉방과 목·어깨 결림", desc: "에어컨 냉기가 목·어깨에 직접 닿으면 근육이 수축해 굳어집니다. 에어컨이 정면이나 등 뒤를 향하지 않도록 루버 방향을 조정하고, 여름에도 카디건을 준비하세요." },
      { title: "냉방 안구건조증", desc: "에어컨은 실내 습도를 급격히 낮춥니다. 눈 깜박임 횟수를 의식적으로 늘리고(화면 집중 시 눈을 덜 깜박임), 습도계를 두고 40–60% 유지를 목표로 하세요." },
      { title: "더위와 집중력 저하", desc: "실내 온도가 26°C 이상이면 집중력이 떨어지고 잘못된 자세를 더 오래 유지하게 됩니다. 업무 공간 온도는 22–24°C를 권장합니다." },
    ],
  },
  {
    season: "가을",
    period: "9–11월",
    icon: "🍂",
    accent: "#b45309",
    bg: "#fef3c7",
    border: "#fde68a",
    tagBg: "#b45309",
    issues: [
      { title: "환절기 면역 저하", desc: "여름 피로가 누적된 상태에서 기온이 급격히 낮아지면 면역이 떨어집니다. 수면·식사 규칙성을 가을부터 다시 세우는 것이 겨울 감기 예방의 핵심입니다." },
      { title: "건조 시작과 눈", desc: "가을부터 습도가 낮아지기 시작합니다. 인공눈물을 출근 전·퇴근 후 1일 2회로 루틴화하기 좋은 시기입니다." },
      { title: "일조량 감소와 피로", desc: "일조량이 줄면 세로토닌이 감소합니다. 점심시간 10–15분 햇빛 노출이 오후 집중력과 기분 안정에 실질적인 효과가 있습니다." },
    ],
  },
  {
    season: "겨울",
    period: "12–2월",
    icon: "❄️",
    accent: "#0891b2",
    bg: "#ecfeff",
    border: "#a5f3fc",
    tagBg: "#0891b2",
    issues: [
      { title: "난방 건조와 안구 불편감", desc: "난방기 가동 시 실내 습도가 30% 이하로 떨어지는 경우가 많습니다. 가습기 사용 또는 작은 컵에 물을 책상에 두는 것만으로도 눈 건조감이 줄어듭니다." },
      { title: "추위와 근육 수축", desc: "추운 날 아침 출근 직후 바로 컴퓨터 작업을 시작하면 이미 수축된 목·어깨 근육이 더 굳습니다. 출근 후 3분 웜업 루틴이 겨울에 특히 중요합니다." },
      { title: "두꺼운 옷과 자세", desc: "두꺼운 패딩을 입은 채 의자에 앉으면 어깨가 말리고 등받이가 제대로 지지되지 않습니다. 실내에서는 얇은 옷으로 갈아입는 것이 자세 유지에 유리합니다." },
    ],
  },
];

export default function SeasonPage() {
  return (
    <main className="flex-1">
      <div style={{ borderTop: "4px solid #ec4899", background: "linear-gradient(to bottom, #fdf2f8, #fff)", padding: "40px 0 32px" }}>
        <div className="mx-auto max-w-4xl px-4">
          <span style={{ fontSize: 11, fontWeight: 700, color: "#9aa5b8", letterSpacing: "0.08em", textTransform: "uppercase" }}>sureline 계절별 가이드</span>
          <h1 style={{ fontSize: "clamp(1.625rem, 4vw, 2rem)", fontWeight: 800, color: "#1c2741", marginBottom: 12, marginTop: 14, lineHeight: 1.3, wordBreak: "keep-all" }}>
            계절마다 달라지는 직장인 건강 이슈
          </h1>
          <p style={{ fontSize: 15, color: "#5a6a85", lineHeight: 1.75, wordBreak: "keep-all", maxWidth: 560 }}>
            온도·습도·일조량이 바뀌면 몸이 받는 부담도 달라집니다. 계절별로 주의해야 할 포인트를 정리했습니다.
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 20 }}>
            {SEASONS.map((s) => (
              <span key={s.season} style={{ fontSize: 12, fontWeight: 600, color: s.accent, background: s.bg, border: `1px solid ${s.border}`, borderRadius: 999, padding: "4px 12px" }}>
                {s.icon} {s.season} ({s.period})
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-12" style={{ display: "flex", flexDirection: "column", gap: 32 }}>
        {SEASONS.map((s) => (
          <div key={s.season} style={{ background: "#fff", border: "1px solid #eef2f7", borderRadius: 20, overflow: "hidden" }}>
            <div style={{ padding: "16px 24px", background: s.bg, borderBottom: `1px solid ${s.border}`, display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 24 }}>{s.icon}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ background: s.tagBg, color: "#fff", fontSize: 12, fontWeight: 700, padding: "3px 12px", borderRadius: 999 }}>{s.season}</span>
                <span style={{ fontSize: 12, color: "#9aa5b8" }}>{s.period}</span>
              </div>
            </div>
            <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
              {s.issues.map((issue, i) => (
                <div key={i}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#1c2741", marginBottom: 6 }}>{issue.title}</div>
                  <p style={{ fontSize: 14, color: "#5a6a85", lineHeight: 1.75, margin: 0, wordBreak: "keep-all" }}>{issue.desc}</p>
                  {i < s.issues.length - 1 && <div style={{ borderTop: "1px solid #f4f6f9", marginTop: 16 }} />}
                </div>
              ))}
            </div>
          </div>
        ))}

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16 }}>
          <Link href="/guides/situation" style={{ fontSize: 13, fontWeight: 600, color: "#3268ff", textDecoration: "none" }}>← 상황별 가이드</Link>
          <Link href="/guides/age" style={{ fontSize: 13, fontWeight: 600, color: "#3268ff", textDecoration: "none" }}>연령대별 가이드 →</Link>
        </div>
      </div>
    </main>
  );
}
