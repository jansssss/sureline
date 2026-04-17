import Link from "next/link";

export const metadata = {
  title: "상황별 건강 가이드 — 재택·출장·야근",
  description: "재택근무 책상 환경, 출장 많은 직장인의 허리 관리, 야근이 잦을 때 피로 회복법을 상황별로 정리했습니다.",
  alternates: { canonical: "https://sureline.kr/guides/situation" },
  openGraph: { title: "상황별 건강 가이드 | sureline", url: "https://sureline.kr/guides/situation", type: "article" },
};

const SITUATIONS = [
  {
    situation: "재택근무",
    icon: "🏠",
    accent: "#3268ff",
    bg: "#f4f7ff",
    border: "#dde6ff",
    tagBg: "#3268ff",
    problem: "사무실보다 환경이 제멋대로 구성되기 쉽고, 화장실·식사 외 이동이 없어 신체 활동이 극단적으로 줄어듭니다.",
    checks: [
      { item: "모니터 높이", fix: "눈높이와 화면 상단이 일치하도록. 노트북만 쓰면 거북목 불가피 — 별도 모니터 또는 스탠드 필수." },
      { item: "의자", fix: "소파나 식탁 의자 장시간 사용은 요추 지지가 전혀 없습니다. 최소한 허리 쿠션으로 보완하세요." },
      { item: "조명", fix: "등 뒤나 옆에 창이 있으면 화면 반사·눈부심 발생. 빛 방향은 모니터 측면에서 오도록." },
      { item: "이동 부재", fix: "출근 없이 시작하는 날은 의도적으로 1분 걷기 알람을 시간마다 맞추세요. 이동 없이 8시간은 허리에 축적 부담입니다." },
    ],
    tip: "재택 첫 1주일은 환경 셋업에 투자하세요. 장비 하나가 6개월치 통증을 예방합니다.",
    tipColor: "#3268ff",
  },
  {
    situation: "출장·이동 잦은 직장인",
    icon: "✈️",
    accent: "#d97706",
    bg: "#fffbeb",
    border: "#fcd34d",
    tagBg: "#d97706",
    problem: "비행기·KTX·차량 장시간 탑승은 허리 추간판에 지속적 압력을 가합니다. 낯선 호텔 침대·베개도 목·허리에 악영향을 줍니다.",
    checks: [
      { item: "탑승 자세", fix: "등받이에 허리를 완전히 붙이고, 발이 바닥에 닿도록. 90분 이상 탑승 시 통로 쪽 좌석으로 중간 일어서기를 확보하세요." },
      { item: "캐리어 무게", fix: "짐은 양쪽에 나눠 들거나 기내 짐은 머리 위 선반에. 한쪽 어깨에만 무거운 짐을 지속적으로 메면 척추 측만이 생깁니다." },
      { item: "호텔 침대", fix: "너무 푹신한 침대는 허리 지지가 없습니다. 딱딱한 쪽이 낫고, 옆으로 잘 때는 무릎 사이 베개를 끼우면 허리 비틀림이 줄어듭니다." },
      { item: "도착 후", fix: "장시간 이동 후 바로 업무 시작보다 5분 스트레칭 먼저. 눕기 전 고관절 앞쪽(장요근) 스트레칭이 특히 효과적입니다." },
    ],
    tip: "여행용 허리 쿠션 하나가 출장 통증을 크게 줄여줍니다. 부피 대비 효과 1위 아이템.",
    tipColor: "#d97706",
  },
  {
    situation: "야근·장시간 업무",
    icon: "🌙",
    accent: "#7c3aed",
    bg: "#f5f3ff",
    border: "#ddd6fe",
    tagBg: "#7c3aed",
    problem: "야근은 단순한 피로 누적이 아닙니다. 수면 부족은 근육 회복을 막고, 집중력 저하로 자세가 더 무너지는 악순환을 만듭니다.",
    checks: [
      { item: "빛 관리", fix: "밤 10시 이후 화면 블루라이트를 줄이세요(Night Shift / f.lux). 멜라토닌 억제를 막아 퇴근 후 수면 품질이 달라집니다." },
      { item: "야식·카페인", fix: "야근 카페인은 수면 6시간 전까지만. 자기 직전 카페인은 얕은 수면을 만들어 다음날 피로를 더 누적시킵니다." },
      { item: "눈 보호", fix: "야간 작업 시 주변 조명을 화면 밝기와 맞추세요. 어두운 방에서 밝은 화면만 보는 것이 눈 피로의 핵심 원인입니다." },
      { item: "짧은 회복", fix: "야근 후 다음날 출근 전 15분이라도 햇빛을 받으며 걷기. 체내 시계를 리셋하고 피로 회복 속도를 높입니다." },
    ],
    tip: "야근 후 수면 부채는 주말에 몰아 자는 것보다 매일 30분씩 일찍 자는 것이 회복에 더 효과적입니다.",
    tipColor: "#7c3aed",
  },
];

export default function SituationPage() {
  return (
    <main className="flex-1">
      <div style={{ borderTop: "4px solid #3268ff", background: "linear-gradient(to bottom, #f4f7ff, #fff)", padding: "40px 0 32px" }}>
        <div className="mx-auto max-w-4xl px-4">
          <span style={{ fontSize: 11, fontWeight: 700, color: "#9aa5b8", letterSpacing: "0.08em", textTransform: "uppercase" }}>sureline 상황별 가이드</span>
          <h1 style={{ fontSize: "clamp(1.625rem, 4vw, 2rem)", fontWeight: 800, color: "#1c2741", marginBottom: 12, marginTop: 14, lineHeight: 1.3, wordBreak: "keep-all" }}>
            상황이 다르면 관리법도 달라야 한다
          </h1>
          <p style={{ fontSize: 15, color: "#5a6a85", lineHeight: 1.75, wordBreak: "keep-all", maxWidth: 560 }}>
            재택근무·출장·야근은 각각 다른 방식으로 몸을 무너뜨립니다. 상황별 원인과 대처법을 정리했습니다.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-12" style={{ display: "flex", flexDirection: "column", gap: 32 }}>
        {SITUATIONS.map((s) => (
          <div key={s.situation} style={{ background: "#fff", border: "1px solid #eef2f7", borderRadius: 20, overflow: "hidden" }}>
            <div style={{ padding: "20px 24px", background: s.bg, borderBottom: `1px solid ${s.border}`, display: "flex", alignItems: "center", gap: 14 }}>
              <span style={{ fontSize: 28 }}>{s.icon}</span>
              <div>
                <span style={{ background: s.tagBg, color: "#fff", fontSize: 12, fontWeight: 700, padding: "3px 12px", borderRadius: 999, display: "inline-block", marginBottom: 8 }}>{s.situation}</span>
                <p style={{ fontSize: 13, color: "#5a6a85", margin: 0, wordBreak: "keep-all", lineHeight: 1.6 }}>{s.problem}</p>
              </div>
            </div>
            <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 12 }}>
              {s.checks.map((c, i) => (
                <div key={i} style={{ display: "flex", gap: 12, padding: "12px 14px", background: "#f8f9fb", borderRadius: 12 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: s.accent, flexShrink: 0, minWidth: 64, marginTop: 1 }}>{c.item}</span>
                  <span style={{ fontSize: 14, color: "#3a4a62", lineHeight: 1.7 }}>{c.fix}</span>
                </div>
              ))}
              <div style={{ display: "flex", gap: 8, alignItems: "flex-start", background: s.bg, border: `1px solid ${s.border}`, borderRadius: 10, padding: "10px 14px", marginTop: 4 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: s.tipColor, flexShrink: 0, marginTop: 1, letterSpacing: "0.06em" }}>TIP</span>
                <span style={{ fontSize: 13, color: "#3a4a62", lineHeight: 1.6 }}>{s.tip}</span>
              </div>
            </div>
          </div>
        ))}

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16 }}>
          <Link href="/guides/job" style={{ fontSize: 13, fontWeight: 600, color: "#3268ff", textDecoration: "none" }}>← 직무별 가이드</Link>
          <Link href="/guides/season" style={{ fontSize: 13, fontWeight: 600, color: "#3268ff", textDecoration: "none" }}>계절별 가이드 →</Link>
        </div>
      </div>
    </main>
  );
}
