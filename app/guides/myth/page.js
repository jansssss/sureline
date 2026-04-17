import Link from "next/link";

export const metadata = {
  title: "오해 바로잡기 — 직장인 건강 상식 점검",
  description: "거북목엔 스트레칭이 답일까, 손목 저림이 다 손목터널증후군일까. 흔히 잘못 알려진 직장인 건강 상식 6가지를 바로잡습니다.",
  alternates: { canonical: "https://sureline.kr/guides/myth" },
  openGraph: { title: "오해 바로잡기 | sureline", url: "https://sureline.kr/guides/myth", type: "article" },
};

const MYTHS = [
  {
    category: "목·어깨",
    myth: "거북목이면 스트레칭을 매일 하면 낫는다",
    fact: "자세 교정 없이 스트레칭만 반복하면 일시적 완화에 그친다",
    detail: "거북목의 근본 원인은 모니터 높이·의자 높이·화면 거리 등 환경 문제입니다. 구조적 문제가 해결되지 않은 상태에서 스트레칭만 하면 잠깐 풀리다 바로 재발합니다. 스트레칭은 환경 교정 이후의 보조 수단입니다.",
    tip: "모니터를 눈높이에 맞추고 의자 깊이를 먼저 조정하세요.",
    tipColor: "#3268ff",
  },
  {
    category: "손목",
    myth: "손목이 저리면 손목터널증후군이다",
    fact: "손목 저림의 원인은 목 신경, 팔꿈치, 흉곽출구 등 다양하다",
    detail: "손목터널증후군은 새끼손가락을 제외한 손가락(엄지~약지)의 저림이 특징입니다. 새끼손가락까지 저리면 팔꿈치 척골신경 문제일 가능성이 높고, 팔 전체가 저리면 경추 신경 압박을 먼저 확인해야 합니다.",
    tip: "새끼손가락 포함 여부로 원인을 1차로 구분할 수 있습니다.",
    tipColor: "#9333ea",
  },
  {
    category: "눈",
    myth: "눈이 피로하면 인공눈물을 넣으면 된다",
    fact: "눈 피로의 주 원인은 건조함이 아니라 조절근 과부하다",
    detail: "화면 작업 시 눈 피로의 핵심은 수정체 두께를 조절하는 모양체근의 지속적 긴장입니다. 인공눈물은 건조감은 완화하지만 이 근육의 피로엔 효과가 없습니다. 20-20-20 규칙(20분마다 6m 거리를 20초 바라보기)이 더 직접적입니다.",
    tip: "20분마다 창밖 먼 곳을 20초 바라보세요.",
    tipColor: "#0891b2",
  },
  {
    category: "허리",
    myth: "허리가 아프면 무조건 쉬어야 한다",
    fact: "48시간 이후엔 가벼운 움직임이 장기 안정기보다 회복에 도움이 된다",
    detail: "급성 허리 통증 후 48시간은 안정이 필요합니다. 그 이후 주요 학회들은 장기간 안정기보다 가벼운 활동 유지를 권장합니다. 오래 누워있으면 주변 근육이 약해져 회복이 오히려 늦어집니다.",
    tip: "48시간 후엔 천천히 걷는 것부터 시작하세요.",
    tipColor: "#16a34a",
  },
  {
    category: "목·어깨",
    myth: "마사지를 받으면 뭉친 근육이 풀린다",
    fact: "마사지는 일시적 완화일 뿐, 원인이 해결되지 않으면 며칠 내 재발한다",
    detail: "마사지는 혈류를 일시적으로 개선해 통증을 줄여줍니다. 하지만 잘못된 자세나 반복 동작이 계속되면 바로 재발합니다. 만성화된 경우엔 마사지보다 근력 강화 운동과 자세 교정이 더 효과적이라는 근거가 많습니다.",
    tip: "마사지 후엔 자세 점검을 함께 하세요.",
    tipColor: "#f59e0b",
  },
  {
    category: "전신",
    myth: "스탠딩 데스크를 쓰면 건강해진다",
    fact: "오래 서 있는 것도 하체·허리에 부담을 준다. 핵심은 자세 변화다",
    detail: "스탠딩 데스크는 앉아서 일하는 시간을 줄이는 데 유용하지만, 장시간 서있는 것도 하지정맥류·발바닥 피로·허리 통증의 원인이 됩니다. 핵심은 앉기와 서기를 주기적으로 전환하고 30~45분마다 자세를 바꾸는 것입니다.",
    tip: "앉기 45분 → 서기 15분 → 2~3분 걷기 사이클을 권장합니다.",
    tipColor: "#dc2626",
  },
];

export default function MythPage() {
  return (
    <main className="flex-1">

      {/* 헤더 */}
      <div style={{ borderTop: "4px solid #dc2626", background: "linear-gradient(to bottom, #fff5f5, #fff)", padding: "40px 0 32px" }}>
        <div className="mx-auto max-w-4xl px-4">
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#9aa5b8", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              sureline 오해 바로잡기
            </span>
          </div>
          <h1 style={{ fontSize: "clamp(1.625rem, 4vw, 2rem)", fontWeight: 800, color: "#1c2741", marginBottom: 12, lineHeight: 1.3, wordBreak: "keep-all" }}>
            직장인 건강, 이렇게 알고 있으면 틀렸다
          </h1>
          <p style={{ fontSize: 15, color: "#5a6a85", lineHeight: 1.75, wordBreak: "keep-all", maxWidth: 560, marginBottom: 24 }}>
            흔히 알려진 직장인 건강 상식 중 잘못 이해되거나 불완전한 내용들을 실제 근거와 함께 바로잡습니다.
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {["목·어깨", "손목", "눈", "허리", "전신"].map((tag) => (
              <span key={tag} style={{ fontSize: 12, fontWeight: 600, color: "#5a6a85", background: "#fff", border: "1px solid #e1e5eb", borderRadius: 999, padding: "4px 12px" }}>
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 오해 카드 목록 */}
      <div className="mx-auto max-w-4xl px-4 py-12">
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {MYTHS.map((item, i) => (
            <div key={i} style={{ background: "#fff", border: "1px solid #eef2f7", borderRadius: 20, overflow: "hidden" }}>

              {/* 카드 헤더 */}
              <div style={{ padding: "16px 24px", borderBottom: "1px solid #f4f6f9", display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#fff", background: "#1c2741", padding: "3px 10px", borderRadius: 999, letterSpacing: "0.04em" }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#9aa5b8" }}>{item.category}</span>
              </div>

              {/* 오해 / 사실 분할 */}
              <div className="myth-grid" style={{ padding: "20px 24px", gap: 12 }}>
                <div style={{ background: "#fff5f5", border: "1px solid #fecaca", borderRadius: 16, padding: "18px 20px" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#dc2626", letterSpacing: "0.08em", marginBottom: 10, textTransform: "uppercase" }}>
                    ✗ 오해
                  </div>
                  <p style={{ fontSize: 15, fontWeight: 700, color: "#1c2741", lineHeight: 1.5, margin: 0, wordBreak: "keep-all" }}>
                    {item.myth}
                  </p>
                </div>
                <div style={{ background: "#f0fff4", border: "1px solid #c3e6cb", borderRadius: 16, padding: "18px 20px" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#16a34a", letterSpacing: "0.08em", marginBottom: 10, textTransform: "uppercase" }}>
                    ✓ 사실
                  </div>
                  <p style={{ fontSize: 15, fontWeight: 700, color: "#1c2741", lineHeight: 1.5, margin: 0, wordBreak: "keep-all" }}>
                    {item.fact}
                  </p>
                </div>
              </div>

              {/* 설명 + 팁 */}
              <div style={{ padding: "0 24px 24px" }}>
                <p style={{ fontSize: 14, color: "#5a6a85", lineHeight: 1.85, wordBreak: "keep-all", marginBottom: 14 }}>
                  {item.detail}
                </p>
                <div style={{ display: "flex", gap: 10, alignItems: "flex-start", background: "#f8f9fb", borderRadius: 12, padding: "12px 16px" }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: item.tipColor, letterSpacing: "0.06em", flexShrink: 0, marginTop: 1 }}>
                    TIP
                  </span>
                  <span style={{ fontSize: 13, color: "#3a4a62", lineHeight: 1.7 }}>{item.tip}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 하단 안내 */}
        <div style={{ marginTop: 48, padding: "24px", background: "#f4f7ff", border: "1px solid #dde6ff", borderRadius: 20, textAlign: "center" }}>
          <p style={{ fontSize: 14, color: "#5a6a85", lineHeight: 1.8, wordBreak: "keep-all", marginBottom: 20 }}>
            이 글에서 다룬 내용은 일반적인 경향이며, 개인 상태에 따라 다를 수 있습니다.<br />
            증상이 2주 이상 지속되거나 악화된다면 전문의 진료를 먼저 받으세요.
          </p>
          <Link href="/guides/hospital" style={{ fontSize: 14, fontWeight: 700, color: "#3268ff", textDecoration: "none" }}>
            병원 가야 하는 기준 확인하기 →
          </Link>
        </div>

      </div>
    </main>
  );
}
