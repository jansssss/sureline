import Link from "next/link";

export const metadata = {
  title: "연령대별 직장인 건강 — 2030 vs 4050",
  description: "2030 사무직의 초기 통증 관리와 4050 직장인의 회복 속도 저하 대응. 나이에 따라 달라지는 직장인 건강 전략을 정리했습니다.",
  alternates: { canonical: "https://sureline.kr/guides/age" },
  openGraph: { title: "연령대별 건강 가이드 | sureline", url: "https://sureline.kr/guides/age", type: "article" },
};

const AGES = [
  {
    group: "2030 사무직",
    range: "20대·30대",
    icon: "🌱",
    accent: "#16a34a",
    bg: "#f0fff4",
    border: "#c3e6cb",
    tagBg: "#16a34a",
    summary: "지금의 통증을 '젊어서 금방 낫겠지'로 넘기면 40대에 만성 통증으로 돌아옵니다.",
    chars: [
      "회복 속도가 빠르지만 나쁜 자세를 오래 유지해도 당장 크게 아프지 않아 방치하기 쉬움",
      "스마트폰 병행 사용으로 목에 이중 부하",
      "장시간 집중 후 보상으로 소파·침대에 누워 더 나쁜 자세 유지",
    ],
    strategies: [
      { title: "지금 환경부터", desc: "2030은 회복력이 있어 나쁜 환경을 버티지만, 그게 10년이면 누적됩니다. 모니터 높이·의자 세팅에 지금 투자하세요." },
      { title: "스마트폰 자세 분리", desc: "업무 중 스마트폰 사용은 목에 추가 부하를 줍니다. 폰 확인은 자리에서 일어났을 때로 분리하면 목 부담이 줄어듭니다." },
      { title: "초기 통증 신호 무시 금지", desc: "처음 어깨가 뻐근할 때 환경 교정을 시작하면 1~2주면 해결됩니다. 넘기면 3개월이 됩니다." },
      { title: "코어 근력 선행", desc: "허리가 아프기 전 코어 운동을 시작하는 것이 가장 효율적입니다. 플랭크 30초 하루 2회부터 시작하세요." },
    ],
  },
  {
    group: "4050 사무직",
    range: "40대·50대",
    icon: "🌳",
    accent: "#3268ff",
    bg: "#f4f7ff",
    border: "#dde6ff",
    tagBg: "#3268ff",
    summary: "근육량 감소, 회복 속도 저하, 기존 통증 누적. 관리 방식이 달라져야 합니다.",
    chars: [
      "근육량이 30대 대비 감소 시작, 같은 자세도 더 빨리 피로 축적",
      "수면 중 회복 효율이 낮아져 다음날 피로가 더 오래 남음",
      "기존에 방치한 통증이 만성화 단계로 진입하기 쉬운 시기",
    ],
    strategies: [
      { title: "회복 시간 더 확보", desc: "4050은 같은 운동을 해도 2030보다 회복에 2배 시간이 필요합니다. 스트레칭 후 '괜찮아졌다'의 기준을 더 높게 잡으세요." },
      { title: "근력 운동 우선", desc: "유연성보다 근력이 먼저입니다. 허리 주변 근력(코어·고관절)이 약해지면 자세가 무너집니다. 주 2회 근력 운동을 루틴에 포함하세요." },
      { title: "수면 품질 투자", desc: "수면 부채가 근골격계 회복을 직접 방해합니다. 취침·기상 시간 고정, 취침 1시간 전 화면 차단이 실질적 변화를 만듭니다." },
      { title: "통증 신호 즉시 대응", desc: "4050에서 2주 이상 통증이 지속되면 병원을 늦추지 마세요. 만성화 속도가 빠르고, 빨리 개입할수록 회복이 짧습니다." },
    ],
  },
];

export default function AgePage() {
  return (
    <main className="flex-1">
      <div style={{ borderTop: "4px solid #3268ff", background: "linear-gradient(to bottom, #f4f7ff, #fff)", padding: "40px 0 32px" }}>
        <div className="mx-auto max-w-4xl px-4">
          <span style={{ fontSize: 11, fontWeight: 700, color: "#9aa5b8", letterSpacing: "0.08em", textTransform: "uppercase" }}>sureline 연령대별 가이드</span>
          <h1 style={{ fontSize: "clamp(1.625rem, 4vw, 2rem)", fontWeight: 800, color: "#1c2741", marginBottom: 12, marginTop: 14, lineHeight: 1.3, wordBreak: "keep-all" }}>
            나이에 따라 달라지는 건강 전략
          </h1>
          <p style={{ fontSize: 15, color: "#5a6a85", lineHeight: 1.75, wordBreak: "keep-all", maxWidth: 560 }}>
            2030은 예방이 핵심, 4050은 회복 전략이 달라야 합니다. 연령대별로 다른 접근법을 정리했습니다.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-12" style={{ display: "flex", flexDirection: "column", gap: 32 }}>
        {AGES.map((a) => (
          <div key={a.group} style={{ background: "#fff", border: "1px solid #eef2f7", borderRadius: 20, overflow: "hidden" }}>
            <div style={{ padding: "20px 24px", background: a.bg, borderBottom: `1px solid ${a.border}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                <span style={{ fontSize: 24 }}>{a.icon}</span>
                <div>
                  <span style={{ background: a.tagBg, color: "#fff", fontSize: 12, fontWeight: 700, padding: "3px 12px", borderRadius: 999, display: "inline-block" }}>{a.group}</span>
                  <span style={{ fontSize: 12, color: "#9aa5b8", marginLeft: 8 }}>{a.range}</span>
                </div>
              </div>
              <p style={{ fontSize: 14, color: a.accent, fontWeight: 600, margin: "0 0 10px", wordBreak: "keep-all" }}>{a.summary}</p>
              <ul style={{ margin: 0, paddingLeft: 16 }}>
                {a.chars.map((c, i) => (
                  <li key={i} style={{ fontSize: 13, color: "#5a6a85", lineHeight: 1.7, marginBottom: 2 }}>{c}</li>
                ))}
              </ul>
            </div>
            <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
              {a.strategies.map((s, i) => (
                <div key={i} style={{ display: "flex", gap: 14 }}>
                  <div style={{ flexShrink: 0, width: 24, height: 24, borderRadius: 8, background: a.bg, border: `1px solid ${a.border}`, display: "flex", alignItems: "center", justifyContent: "center", marginTop: 2 }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: a.accent }}>{i + 1}</span>
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#1c2741", marginBottom: 4 }}>{s.title}</div>
                    <p style={{ fontSize: 14, color: "#5a6a85", lineHeight: 1.75, margin: 0, wordBreak: "keep-all" }}>{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16 }}>
          <Link href="/guides/season" style={{ fontSize: 13, fontWeight: 600, color: "#3268ff", textDecoration: "none" }}>← 계절별 가이드</Link>
          <Link href="/guides/glossary" style={{ fontSize: 13, fontWeight: 600, color: "#3268ff", textDecoration: "none" }}>용어 해설 →</Link>
        </div>
      </div>
    </main>
  );
}
