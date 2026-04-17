import Link from "next/link";

export const metadata = {
  title: "병원 가야 하는 기준 — 직장인 통증 신호등",
  description: "목·어깨·허리·손목·눈 통증, 지금 병원에 가야 할까 집에서 기다려도 될까. 신호등 3단계로 기준을 정리했습니다.",
  alternates: { canonical: "https://sureline.kr/guides/hospital" },
  openGraph: { title: "병원 가야 하는 기준 | sureline", url: "https://sureline.kr/guides/hospital", type: "article" },
};

const AREAS = [
  {
    area: "목·어깨",
    icon: "🧍",
    levels: [
      {
        tier: "green",
        label: "집에서 관리 가능",
        dot: "#16a34a",
        bg: "#f0fff4",
        border: "#c3e6cb",
        labelColor: "#16a34a",
        items: [
          "뒷목·어깨 뻐근함, 하루 이틀 내 좋아짐",
          "장시간 작업 후 생긴 피로감",
          "스트레칭 후 일시적으로 완화됨",
        ],
        action: "자세 교정 + 스트레칭 + 충분한 수면으로 관리하세요.",
      },
      {
        tier: "yellow",
        label: "1~2주 지켜보기",
        dot: "#d97706",
        bg: "#fffbeb",
        border: "#fcd34d",
        labelColor: "#d97706",
        items: [
          "2주 이상 지속되는 목 통증",
          "아침에 일어날 때마다 뻐근함",
          "어깨 한쪽이 계속 당김",
        ],
        action: "생활 습관 점검. 2주 지나도 안 나아지면 정형외과·재활의학과 방문.",
      },
      {
        tier: "red",
        label: "지금 병원 가세요",
        dot: "#dc2626",
        bg: "#fff5f5",
        border: "#fecaca",
        labelColor: "#dc2626",
        items: [
          "팔·손까지 저리거나 힘이 빠짐",
          "목을 특정 방향으로 돌리면 극심한 통증",
          "두통·어지럼증·구역감 동반",
          "외상(충격) 이후 갑작스러운 통증",
        ],
        action: "신경·혈관 관련 가능성. 정형외과 또는 신경과 빠른 진료.",
      },
    ],
  },
  {
    area: "허리",
    icon: "🦴",
    levels: [
      {
        tier: "green",
        label: "집에서 관리 가능",
        dot: "#16a34a",
        bg: "#f0fff4",
        border: "#c3e6cb",
        labelColor: "#16a34a",
        items: [
          "장시간 앉아있다가 생긴 허리 뻐근함",
          "가벼운 움직임(걷기)으로 완화됨",
          "2~3일 안에 호전",
        ],
        action: "48시간 안정 후 가벼운 스트레칭·걷기 시작. 오래 누워있지 마세요.",
      },
      {
        tier: "yellow",
        label: "1~2주 지켜보기",
        dot: "#d97706",
        bg: "#fffbeb",
        border: "#fcd34d",
        labelColor: "#d97706",
        items: [
          "2주 이상 지속되는 둔한 허리 통증",
          "특정 자세(앞으로 숙일 때)에서 심해짐",
          "아침 기상 후 1시간 이내 뻣뻣함",
        ],
        action: "정형외과·재활의학과 방문 권장. 코어 근력 운동 시작.",
      },
      {
        tier: "red",
        label: "지금 병원 가세요",
        dot: "#dc2626",
        bg: "#fff5f5",
        border: "#fecaca",
        labelColor: "#dc2626",
        items: [
          "다리까지 저리거나 힘이 빠짐 (디스크 의심)",
          "소변·대변 조절 어려움 (응급)",
          "외상 후 극심한 통증",
          "야간에 누워도 통증이 심해짐",
          "발열·체중감소 동반",
        ],
        action: "마미증후군·골절 가능성. 응급실 또는 즉시 정형외과·신경외과 방문.",
      },
    ],
  },
  {
    area: "손목",
    icon: "✋",
    levels: [
      {
        tier: "green",
        label: "집에서 관리 가능",
        dot: "#16a34a",
        bg: "#f0fff4",
        border: "#c3e6cb",
        labelColor: "#16a34a",
        items: [
          "타이핑 많은 날 손목이 뻐근함",
          "휴식 후 괜찮아짐",
          "손가락 저림이 없음",
        ],
        action: "손목 스트레칭, 마우스 패드 교체, 키보드 높이 조정.",
      },
      {
        tier: "yellow",
        label: "1~2주 지켜보기",
        dot: "#d97706",
        bg: "#fffbeb",
        border: "#fcd34d",
        labelColor: "#d97706",
        items: [
          "손가락(엄지~약지)이 가끔 저림",
          "아침에 손이 뻣뻣하고 붓는 느낌",
          "반복 동작 시 통증",
        ],
        action: "손목터널증후군 초기 가능성. 정형외과·재활의학과 방문.",
      },
      {
        tier: "red",
        label: "지금 병원 가세요",
        dot: "#dc2626",
        bg: "#fff5f5",
        border: "#fecaca",
        labelColor: "#dc2626",
        items: [
          "엄지~약지 저림이 밤에 심해 잠을 깸",
          "엄지두덩(무지구근) 위축",
          "새끼손가락까지 저림 (팔꿈치 척골신경 의심)",
          "손가락 힘이 빠져 물건을 자꾸 떨어뜨림",
        ],
        action: "신경 손상 진행 가능성. 정형외과 또는 신경과 빠른 진료.",
      },
    ],
  },
  {
    area: "눈",
    icon: "👁",
    levels: [
      {
        tier: "green",
        label: "집에서 관리 가능",
        dot: "#16a34a",
        bg: "#f0fff4",
        border: "#c3e6cb",
        labelColor: "#16a34a",
        items: [
          "화면 장시간 작업 후 뻑뻑하고 피로함",
          "휴식하면 괜찮아짐",
          "시야 흐림이 일시적 (오후에만)",
        ],
        action: "20-20-20 규칙. 조명·화면 밝기 조정. 인공눈물.",
      },
      {
        tier: "yellow",
        label: "1~2주 지켜보기",
        dot: "#d97706",
        bg: "#fffbeb",
        border: "#fcd34d",
        labelColor: "#d97706",
        items: [
          "2주 이상 지속되는 건조감·이물감",
          "두통이 눈 피로와 함께 반복됨",
          "최근 시력이 떨어진 것 같음",
        ],
        action: "안과 방문 권장. 안구건조증·굴절 이상 확인.",
      },
      {
        tier: "red",
        label: "지금 병원 가세요",
        dot: "#dc2626",
        bg: "#fff5f5",
        border: "#fecaca",
        labelColor: "#dc2626",
        items: [
          "갑자기 시야 일부가 가려지거나 커튼이 드리운 느낌",
          "빛 번쩍임, 날파리증 갑자기 심해짐",
          "심한 안통 + 두통 + 구역감",
          "눈이 빨개지면서 갑자기 시력 저하",
        ],
        action: "망막박리·급성 녹내장 가능성. 당일 안과 응급 진료.",
      },
    ],
  },
];

const TIER_ICON = { green: "●", yellow: "●", red: "●" };

export default function HospitalPage() {
  return (
    <main className="flex-1">

      {/* 헤더 */}
      <div style={{ borderTop: "4px solid #dc2626", background: "linear-gradient(to bottom, #fff5f5, #fff)", padding: "40px 0 32px" }}>
        <div className="mx-auto max-w-4xl px-4">
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#9aa5b8", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              sureline 병원 가야 하는 기준
            </span>
          </div>
          <h1 style={{ fontSize: "clamp(1.625rem, 4vw, 2rem)", fontWeight: 800, color: "#1c2741", marginBottom: 12, lineHeight: 1.3, wordBreak: "keep-all" }}>
            지금 병원 가야 할까, 집에서 기다려도 될까
          </h1>
          <p style={{ fontSize: 15, color: "#5a6a85", lineHeight: 1.75, wordBreak: "keep-all", maxWidth: 560, marginBottom: 24 }}>
            직장인 통증 부위별로 신호등 3단계(초록·노랑·빨강)를 기준으로 정리했습니다.
          </p>
          {/* 신호등 범례 */}
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            {[
              { color: "#16a34a", label: "집에서 관리" },
              { color: "#d97706", label: "1~2주 지켜보기" },
              { color: "#dc2626", label: "지금 병원으로" },
            ].map(({ color, label }) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 12, height: 12, borderRadius: "50%", background: color, display: "inline-block", flexShrink: 0 }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: "#5a6a85" }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 부위별 신호등 */}
      <div className="mx-auto max-w-4xl px-4 py-12">
        <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
          {AREAS.map((area) => (
            <div key={area.area}>
              {/* 부위 제목 */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <span style={{ fontSize: 22 }}>{area.icon}</span>
                <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#1c2741", margin: 0 }}>{area.area}</h2>
              </div>

              {/* 신호등 3단계 — 세로 타임라인 */}
              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                {area.levels.map((level, li) => (
                  <div key={level.tier} style={{ display: "flex", gap: 0 }}>

                    {/* 타임라인 도트 + 선 */}
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginRight: 16, flexShrink: 0 }}>
                      <div style={{
                        width: 20, height: 20, borderRadius: "50%",
                        background: level.dot, flexShrink: 0,
                        boxShadow: `0 0 0 4px ${level.bg}`,
                        marginTop: 2,
                      }} />
                      {li < area.levels.length - 1 && (
                        <div style={{ width: 2, flex: 1, background: "#eef2f7", minHeight: 24, margin: "4px 0" }} />
                      )}
                    </div>

                    {/* 카드 */}
                    <div style={{
                      flex: 1, background: level.bg,
                      border: `1px solid ${level.border}`,
                      borderRadius: 16, padding: "16px 20px",
                      marginBottom: li < area.levels.length - 1 ? 12 : 0,
                    }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: level.labelColor, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>
                        {level.label}
                      </div>
                      <ul style={{ margin: "0 0 12px", paddingLeft: 18 }}>
                        {level.items.map((item, i) => (
                          <li key={i} style={{ fontSize: 14, color: "#3a4a62", lineHeight: 1.75, marginBottom: 4 }}>
                            {item}
                          </li>
                        ))}
                      </ul>
                      <div style={{
                        fontSize: 13, color: level.labelColor, fontWeight: 600,
                        background: "#fff", borderRadius: 8, padding: "8px 12px",
                        display: "inline-block",
                      }}>
                        → {level.action}
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
            위 기준은 일반적인 참고 가이드이며, 개인의 상태와 병력에 따라 다를 수 있습니다.<br />
            판단이 어렵다면 병원 방문을 우선하세요.
          </p>
          <Link href="/guides/myth" style={{ fontSize: 14, fontWeight: 700, color: "#3268ff", textDecoration: "none" }}>
            직장인 건강 오해 바로잡기 →
          </Link>
        </div>
      </div>
    </main>
  );
}
