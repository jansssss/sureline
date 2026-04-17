import Link from "next/link";

export const metadata = {
  title: "직장인 건강 용어 해설",
  description: "거북목, VDT증후군, 근막통증증후군, 드퀘르벵 건초염, 손목터널증후군. 직장인이 자주 접하는 건강 용어를 쉽게 설명합니다.",
  alternates: { canonical: "https://sureline.kr/guides/glossary" },
  openGraph: { title: "건강 용어 해설 | sureline", url: "https://sureline.kr/guides/glossary", type: "article" },
};

const TERMS = [
  {
    term: "거북목 증후군",
    eng: "Forward Head Posture",
    accent: "#3268ff",
    bg: "#f4f7ff",
    border: "#dde6ff",
    simple: "귀가 어깨보다 앞으로 나온 자세",
    detail: "머리 무게(약 5–6kg)가 앞으로 기울수록 목 근육에 가해지는 부하가 급격히 증가합니다. 15° 기울면 12kg, 45° 기울면 22kg에 해당하는 부하가 발생합니다. 모니터·스마트폰 장시간 사용이 주원인입니다.",
    check: "귀와 어깨가 같은 수직선에 있으면 정상. 귀가 어깨 앞에 있으면 거북목.",
  },
  {
    term: "VDT 증후군",
    eng: "Visual Display Terminal Syndrome",
    accent: "#0891b2",
    bg: "#ecfeff",
    border: "#a5f3fc",
    simple: "화면 장시간 작업으로 생기는 증상 묶음",
    detail: "눈 피로, 두통, 목·어깨 통증, 손목 통증, 집중력 저하를 아우르는 포괄적인 증후군입니다. 특정 질환이 아니라 복합적인 증상의 집합이므로 '원인별 대응'이 필요합니다.",
    check: "화면 작업 2시간 이후 눈·목·어깨 중 하나라도 불편하면 VDT 증후군 범주에 해당합니다.",
  },
  {
    term: "근막통증 증후군",
    eng: "Myofascial Pain Syndrome",
    accent: "#ff6b57",
    bg: "#fff5f0",
    border: "#ffd5cc",
    simple: "근육 안에 딱딱한 '통증 유발점'이 생기는 상태",
    detail: "근막(근육을 감싸는 막)의 특정 부위가 과부하로 단단하게 굳으면서 눌렀을 때 통증이 퍼지는 상태입니다. 목 근처의 유발점은 두통·눈 통증으로 느껴지기도 합니다. 만성 어깨·목 통증의 흔한 원인입니다.",
    check: "어깨를 꾹 눌렀을 때 다른 곳(머리·팔)까지 통증이 퍼지면 근막통증 유발점 가능성이 있습니다.",
  },
  {
    term: "드퀘르벵 건초염",
    eng: "de Quervain's Tenosynovitis",
    accent: "#9333ea",
    bg: "#faf5ff",
    border: "#e9d5ff",
    simple: "엄지손가락 힘줄에 생기는 염증",
    detail: "엄지를 벌리거나 움직일 때 사용하는 두 힘줄(단무지외전근, 장무지신근)의 건초에 염증이 생긴 상태입니다. 스마트폰 타이핑, 마우스 클릭, 쥐는 동작의 반복이 주원인입니다. 핀켈스테인 검사로 간단히 확인할 수 있습니다.",
    check: "핀켈스테인 검사: 엄지를 손바닥 안에 감싸 쥔 뒤 손목을 새끼손가락 방향으로 꺾었을 때 극심한 통증이 오면 양성.",
  },
  {
    term: "손목터널 증후군",
    eng: "Carpal Tunnel Syndrome (CTS)",
    accent: "#16a34a",
    bg: "#f0fff4",
    border: "#c3e6cb",
    simple: "손목 신경이 눌려 엄지~약지가 저린 상태",
    detail: "손목 안쪽 좁은 터널(수근관)을 지나는 정중신경이 압박되어 생깁니다. 새끼손가락을 제외한 4개 손가락(엄지~약지)의 저림·무감각·야간 통증이 특징입니다. 키보드·마우스 집중 사용이 주원인이나 경추 신경 문제와 혼동될 수 있습니다.",
    check: "새끼손가락은 저리지 않으면서 나머지 손가락이 저리면 CTS 가능성이 높습니다. 야간에 심해지면 더욱.",
  },
  {
    term: "흉곽출구 증후군",
    eng: "Thoracic Outlet Syndrome (TOS)",
    accent: "#b45309",
    bg: "#fef3c7",
    border: "#fde68a",
    simple: "목~어깨~팔로 이어지는 신경·혈관이 눌리는 상태",
    detail: "쇄골과 첫 번째 갈비뼈 사이(흉곽 출구)에서 신경·혈관이 압박되어 팔 전체가 저리거나 힘이 빠지는 상태입니다. 어깨 거상 자세(팔을 들어올린 채 작업)나 심한 거북목에서 발생할 수 있습니다.",
    check: "팔을 머리 위로 들어올렸을 때 저림이 심해지면 TOS 가능성. 신경과·정형외과 진단 필요.",
  },
];

export default function GlossaryPage() {
  return (
    <main className="flex-1">
      <div style={{ borderTop: "4px solid #3268ff", background: "linear-gradient(to bottom, #f4f7ff, #fff)", padding: "40px 0 32px" }}>
        <div className="mx-auto max-w-4xl px-4">
          <span style={{ fontSize: 11, fontWeight: 700, color: "#9aa5b8", letterSpacing: "0.08em", textTransform: "uppercase" }}>sureline 용어 해설</span>
          <h1 style={{ fontSize: "clamp(1.625rem, 4vw, 2rem)", fontWeight: 800, color: "#1c2741", marginBottom: 12, marginTop: 14, lineHeight: 1.3, wordBreak: "keep-all" }}>
            직장인 건강 용어, 쉽게 이해하기
          </h1>
          <p style={{ fontSize: 15, color: "#5a6a85", lineHeight: 1.75, wordBreak: "keep-all", maxWidth: 560 }}>
            병원에서 듣거나 검색할 때 자주 나오는 용어들을 직장인 관점에서 쉽게 풀어 설명합니다.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-12" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {TERMS.map((t) => (
          <div key={t.term} style={{ background: "#fff", border: "1px solid #eef2f7", borderRadius: 20, overflow: "hidden" }}>
            <div style={{ padding: "16px 24px", background: t.bg, borderBottom: `1px solid ${t.border}`, display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 800, color: "#1c2741", margin: "0 0 2px" }}>{t.term}</h2>
                <span style={{ fontSize: 12, color: "#9aa5b8" }}>{t.eng}</span>
              </div>
              <span style={{ fontSize: 13, fontWeight: 700, color: t.accent, background: "#fff", border: `1px solid ${t.border}`, borderRadius: 999, padding: "4px 12px" }}>
                {t.simple}
              </span>
            </div>
            <div style={{ padding: "16px 24px", display: "flex", flexDirection: "column", gap: 12 }}>
              <p style={{ fontSize: 14, color: "#5a6a85", lineHeight: 1.85, margin: 0, wordBreak: "keep-all" }}>{t.detail}</p>
              <div style={{ display: "flex", gap: 8, alignItems: "flex-start", background: "#f8f9fb", borderRadius: 10, padding: "10px 14px" }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: t.accent, flexShrink: 0, marginTop: 1, letterSpacing: "0.06em" }}>확인</span>
                <span style={{ fontSize: 13, color: "#3a4a62", lineHeight: 1.7 }}>{t.check}</span>
              </div>
            </div>
          </div>
        ))}

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16 }}>
          <Link href="/guides/age" style={{ fontSize: 13, fontWeight: 600, color: "#3268ff", textDecoration: "none" }}>← 연령대별 가이드</Link>
          <Link href="/guides/start" style={{ fontSize: 13, fontWeight: 600, color: "#3268ff", textDecoration: "none" }}>어디서 시작할까 →</Link>
        </div>
      </div>
    </main>
  );
}
