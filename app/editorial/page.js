import Link from "next/link";

export const metadata = {
  title: "편집 원칙",
  description: "sureline 글이 어떤 기준으로 만들어지는지, 어떤 출처를 신뢰하는지, AI는 어디까지 보조 수단인지를 설명합니다.",
  alternates: { canonical: "https://sureline.kr/editorial" },
  openGraph: {
    title: "편집 원칙 | sureline",
    url: "https://sureline.kr/editorial",
    type: "website",
  },
};

const principles = [
  {
    num: "01",
    title: "사람이 먼저, 검색량은 그 다음",
    body: "글의 주제는 검색량이 아니라 직장인이 실제로 겪는 문제에서 시작합니다. 많이 검색된다는 이유만으로 쓰지 않고, 이 글이 실제로 도움이 되는 사람이 있는지를 먼저 봅니다.",
    color: "#3268ff",
  },
  {
    num: "02",
    title: "원인 → 악화 요인 → 대응 → 병원 가야 할 기준 순서",
    body: "모든 글은 증상의 원인, 상황을 악화시키는 요인, 생활 속 대응법, 전문의 진료가 필요한 기준을 함께 다루는 것을 원칙으로 합니다. 단순 증상 나열이나 홍보성 치료법 소개는 쓰지 않습니다.",
    color: "#ff6b57",
  },
  {
    num: "03",
    title: "출처 기준 — 학회·공공기관·학술자료 우선",
    body: "대한정형외과학회, 대한재활의학회, CDC·NIOSH 같은 공신력 있는 기관 자료와 학술지를 우선합니다. 단순 화제성 기사, 업체 보도자료, 검증되지 않은 민간요법은 근거로 쓰지 않습니다.",
    color: "#16a34a",
  },
  {
    num: "04",
    title: "과장과 단정을 피합니다",
    body: "\"이 동작 하나면 낫는다\", \"이것만 하면 된다\" 같은 표현은 쓰지 않습니다. 개인차가 있는 정보, 아직 근거가 충분하지 않은 내용은 그렇다고 밝힙니다.",
    color: "#9333ea",
  },
  {
    num: "05",
    title: "중복 주제는 업데이트로 통합",
    body: "같은 주제를 다루는 글이 생길 경우 새 글을 추가하기보다 기존 글을 업데이트하는 방식을 선호합니다. 가이드라인이 바뀌거나 새로운 연구 결과가 나오면 발행일·업데이트일을 함께 수정합니다.",
    color: "#b45309",
  },
  {
    num: "06",
    title: "AI는 보조 수단, 판단은 사람이",
    body: "글 구성 초안이나 자료 정리에 AI 도구를 보조적으로 활용할 수 있습니다. 그러나 최종 게시 전에는 취재 관점의 사람 검토를 거칩니다. 주제 중복, 표현 적절성, 출처 적합성, 실용성 여부를 직접 확인합니다.",
    color: "#0891b2",
  },
];

export default function EditorialPage() {
  return (
    <main className="flex-1">

      <div style={{ borderTop: "4px solid #3268ff", background: "#f4f7ff", padding: "32px 0 24px" }}>
        <div className="mx-auto max-w-3xl px-4">
          <p style={{ fontSize: 13, color: "#9aa5b8", marginBottom: 6 }}>sureline</p>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#1c2741", marginBottom: 8 }}>편집 원칙</h1>
          <p style={{ fontSize: 14, color: "#5a6a85", lineHeight: 1.7 }}>이 사이트의 글은 어떤 기준으로 만들어지는가.</p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-12">

        <p style={{ fontSize: 15, color: "#3a4a62", lineHeight: 1.9, wordBreak: "keep-all", marginBottom: 40 }}>
          sureline은 직장인이 겪는 통증과 피로 문제를 다룹니다.
          건강 정보는 잘못 전달되면 해가 될 수 있고, 지나치게 조심하면 아무 도움이 안 됩니다.
          아래는 그 사이에서 글을 쓸 때 지키려고 노력하는 기준입니다.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 20, marginBottom: 48 }}>
          {principles.map((p) => (
            <div key={p.num} style={{
              background: "#fff", border: "1px solid #e1e5eb",
              borderRadius: 12, padding: "24px 24px",
              borderLeft: `4px solid ${p.color}`,
            }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: p.color, letterSpacing: "0.06em", flexShrink: 0, paddingTop: 3 }}>{p.num}</span>
                <div>
                  <h2 style={{ fontSize: 15, fontWeight: 800, color: "#1c2741", marginBottom: 8 }}>{p.title}</h2>
                  <p style={{ fontSize: 14, color: "#5a6a85", lineHeight: 1.8, wordBreak: "keep-all", margin: 0 }}>{p.body}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 다루지 않는 주제 */}
        <section style={{ background: "#f8f9fb", borderRadius: 16, padding: "28px 28px", marginBottom: 40 }}>
          <h2 style={{ fontSize: "1.125rem", fontWeight: 800, color: "#1c2741", marginBottom: 16 }}>다루지 않는 주제</h2>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            {[
              "특정 병원·의사·제품에 대한 구체적인 추천 (제휴 목적 제외)",
              "수술·주사·약물 등 의료 시술의 세부 방법",
              "근거가 충분하지 않은 대체요법·민간요법",
              "개인 증상에 대한 진단 및 치료 안내",
            ].map((item) => (
              <li key={item} style={{ fontSize: 14, color: "#5a6a85", lineHeight: 1.8, marginBottom: 4 }}>{item}</li>
            ))}
          </ul>
        </section>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link href="/about" style={{ fontSize: 14, fontWeight: 600, color: "#3268ff", textDecoration: "none" }}>필자 소개 →</Link>
          <Link href="/disclaimer" style={{ fontSize: 14, fontWeight: 600, color: "#3268ff", textDecoration: "none" }}>건강 정보 면책 기준 →</Link>
        </div>

      </div>
    </main>
  );
}
