import Link from "next/link";

export const metadata = {
  title: "다운로드 자료 — 체크리스트·기록표",
  description: "책상 환경 체크리스트, 증상 기록표, 병원 방문 전 메모 양식. 인쇄하거나 메모앱에 복사해서 사용하세요.",
  alternates: { canonical: "https://sureline.kr/guides/downloads" },
  openGraph: { title: "다운로드 자료 | sureline", url: "https://sureline.kr/guides/downloads", type: "article" },
};

const RESOURCES = [
  {
    title: "책상 환경 체크리스트",
    icon: "🖥️",
    accent: "#3268ff",
    bg: "#f4f7ff",
    border: "#dde6ff",
    desc: "지금 내 책상 환경이 통증의 원인인지 10가지 항목으로 점검합니다.",
    items: [
      { check: "모니터 상단이 눈높이와 일치한다", tip: "노트북만 쓴다면 별도 모니터 또는 스탠드 필수" },
      { check: "화면까지 거리가 60cm 이상이다", tip: "팔을 뻗었을 때 손끝이 화면에 닿으면 대략 적정" },
      { check: "의자에 앉았을 때 발이 바닥에 완전히 닿는다", tip: "" },
      { check: "등받이에 허리 전체가 닿는다", tip: "등받이가 너무 뒤로 기울어도 좋지 않음" },
      { check: "키보드 입력 시 팔꿈치가 90° 이상이다", tip: "" },
      { check: "마우스가 키보드와 같은 높이에 있다", tip: "" },
      { check: "모니터에 빛 반사(창·조명)가 없다", tip: "빛 방향은 모니터 측면에서 와야 함" },
      { check: "화면 밝기가 주변 밝기와 비슷하다", tip: "어두운 방에서 밝은 화면만 보는 것이 눈 피로 원인" },
      { check: "마우스를 오른손만 쓰지 않는다", tip: "왼쪽 마우스로 교대하거나 트랙패드 병행 추천" },
      { check: "헤드셋 없이 어깨에 수화기를 끼우지 않는다", tip: "" },
    ],
  },
  {
    title: "증상 기록표",
    icon: "📝",
    accent: "#ff6b57",
    bg: "#fff5f0",
    border: "#ffd5cc",
    desc: "병원 방문 전 증상을 날짜별로 기록해두면 진단 정확도가 높아집니다.",
    fields: [
      { label: "날짜", placeholder: "예: 2025-04-15" },
      { label: "통증 부위", placeholder: "예: 오른쪽 어깨, 손목" },
      { label: "통증 강도", placeholder: "0(없음) ~ 10(극심) 숫자로" },
      { label: "언제 심해지나", placeholder: "예: 오후 3시 이후, 타이핑 중, 잠들 때" },
      { label: "언제 완화되나", placeholder: "예: 스트레칭 후, 휴식 후, 아침" },
      { label: "동반 증상", placeholder: "예: 저림, 두통, 열감, 부종" },
      { label: "오늘 특이사항", placeholder: "예: 회의 많음, 수면 부족, 장거리 운전" },
    ],
  },
  {
    title: "병원 방문 전 메모",
    icon: "🏥",
    accent: "#16a34a",
    bg: "#f0fff4",
    border: "#c3e6cb",
    desc: "진료 전 미리 정리해두면 짧은 진료 시간을 훨씬 효율적으로 쓸 수 있습니다.",
    checklist: [
      "증상이 처음 시작된 날짜",
      "통증 부위 (가능하면 신체 그림에 표시)",
      "통증 강도 (0–10)",
      "어떤 동작/상황에서 심해지나",
      "어떤 동작/상황에서 완화되나",
      "저림·감각 저하·힘 빠짐 여부",
      "지금까지 해본 처치 (파스, 마사지, 스트레칭 등)",
      "복용 중인 약 있으면 이름",
      "최근 외상(충격) 여부",
      "같은 증상이 이전에도 있었는지",
    ],
  },
];

export default function DownloadsPage() {
  return (
    <main className="flex-1">
      <div style={{ borderTop: "4px solid #ff6b57", background: "linear-gradient(to bottom, #fff5f0, #fff)", padding: "40px 0 32px" }}>
        <div className="mx-auto max-w-4xl px-4">
          <span style={{ fontSize: 11, fontWeight: 700, color: "#9aa5b8", letterSpacing: "0.08em", textTransform: "uppercase" }}>sureline 자료 모음</span>
          <h1 style={{ fontSize: "clamp(1.625rem, 4vw, 2rem)", fontWeight: 800, color: "#1c2741", marginBottom: 12, marginTop: 14, lineHeight: 1.3, wordBreak: "keep-all" }}>
            인쇄하거나 복사해서 바로 쓰는 자료
          </h1>
          <p style={{ fontSize: 15, color: "#5a6a85", lineHeight: 1.75, wordBreak: "keep-all", maxWidth: 560 }}>
            체크리스트·기록표·메모 양식을 메모앱이나 노트에 복사해 사용하세요.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-12" style={{ display: "flex", flexDirection: "column", gap: 32 }}>

        {/* 책상 체크리스트 */}
        <div style={{ background: "#fff", border: "1px solid #eef2f7", borderRadius: 20, overflow: "hidden" }}>
          <div style={{ padding: "18px 24px", background: RESOURCES[0].bg, borderBottom: `1px solid ${RESOURCES[0].border}`, display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 24 }}>{RESOURCES[0].icon}</span>
            <div>
              <h2 style={{ fontSize: 15, fontWeight: 800, color: "#1c2741", margin: "0 0 2px" }}>{RESOURCES[0].title}</h2>
              <p style={{ fontSize: 13, color: "#5a6a85", margin: 0 }}>{RESOURCES[0].desc}</p>
            </div>
          </div>
          <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 10 }}>
            {RESOURCES[0].items.map((item, i) => (
              <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <div style={{ flexShrink: 0, width: 20, height: 20, border: `2px solid ${RESOURCES[0].border}`, borderRadius: 4, marginTop: 1 }} />
                <div>
                  <span style={{ fontSize: 14, color: "#1c2741" }}>{item.check}</span>
                  {item.tip && <p style={{ fontSize: 12, color: "#9aa5b8", margin: "2px 0 0" }}>{item.tip}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 증상 기록표 */}
        <div style={{ background: "#fff", border: "1px solid #eef2f7", borderRadius: 20, overflow: "hidden" }}>
          <div style={{ padding: "18px 24px", background: RESOURCES[1].bg, borderBottom: `1px solid ${RESOURCES[1].border}`, display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 24 }}>{RESOURCES[1].icon}</span>
            <div>
              <h2 style={{ fontSize: 15, fontWeight: 800, color: "#1c2741", margin: "0 0 2px" }}>{RESOURCES[1].title}</h2>
              <p style={{ fontSize: 13, color: "#5a6a85", margin: 0 }}>{RESOURCES[1].desc}</p>
            </div>
          </div>
          <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 12 }}>
            {RESOURCES[1].fields.map((f, i) => (
              <div key={i}>
                <div style={{ fontSize: 12, fontWeight: 700, color: RESOURCES[1].accent, marginBottom: 4 }}>{f.label}</div>
                <div style={{ border: "1px solid #e1e5eb", borderRadius: 8, padding: "10px 12px", background: "#f8f9fb", fontSize: 13, color: "#c4cdd9" }}>{f.placeholder}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 병원 방문 전 메모 */}
        <div style={{ background: "#fff", border: "1px solid #eef2f7", borderRadius: 20, overflow: "hidden" }}>
          <div style={{ padding: "18px 24px", background: RESOURCES[2].bg, borderBottom: `1px solid ${RESOURCES[2].border}`, display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 24 }}>{RESOURCES[2].icon}</span>
            <div>
              <h2 style={{ fontSize: 15, fontWeight: 800, color: "#1c2741", margin: "0 0 2px" }}>{RESOURCES[2].title}</h2>
              <p style={{ fontSize: 13, color: "#5a6a85", margin: 0 }}>{RESOURCES[2].desc}</p>
            </div>
          </div>
          <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 10 }}>
            {RESOURCES[2].checklist.map((item, i) => (
              <div key={i} style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <div style={{ flexShrink: 0, width: 20, height: 20, border: `2px solid ${RESOURCES[2].border}`, borderRadius: 4 }} />
                <span style={{ fontSize: 14, color: "#3a4a62" }}>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16 }}>
          <Link href="/guides/start" style={{ fontSize: 13, fontWeight: 600, color: "#3268ff", textDecoration: "none" }}>← 어디서 시작할까</Link>
          <Link href="/guides/monthly" style={{ fontSize: 13, fontWeight: 600, color: "#3268ff", textDecoration: "none" }}>월간 정리 →</Link>
        </div>
      </div>
    </main>
  );
}
