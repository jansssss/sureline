import Link from "next/link";

export const metadata = {
  title: "제휴 및 광고 고지",
  description: "sureline의 쿠팡 파트너스 운영 방식, 제품 추천 기준, 협찬 표기 원칙을 투명하게 안내합니다.",
  alternates: { canonical: "https://sureline.kr/disclosure" },
  openGraph: {
    title: "제휴 및 광고 고지 | sureline",
    url: "https://sureline.kr/disclosure",
    type: "website",
  },
};

export default function DisclosurePage() {
  return (
    <main className="flex-1">

      <div style={{ borderTop: "4px solid #3268ff", background: "#f4f7ff", padding: "32px 0 24px" }}>
        <div className="mx-auto max-w-3xl px-4">
          <p style={{ fontSize: 13, color: "#9aa5b8", marginBottom: 6 }}>sureline</p>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#1c2741", marginBottom: 8 }}>제휴 및 광고 고지</h1>
          <p style={{ fontSize: 14, color: "#5a6a85", lineHeight: 1.7 }}>수익화 요소와 편집 독립성에 대해 투명하게 밝힙니다.</p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-12">

        {/* 쿠팡 파트너스 */}
        <section style={{ background: "#fff", border: "1px solid #e1e5eb", borderRadius: 16, padding: "28px 28px", marginBottom: 28 }}>
          <h2 style={{ fontSize: "1.125rem", fontWeight: 800, color: "#1c2741", marginBottom: 14 }}>쿠팡 파트너스 운영</h2>
          <p style={{ fontSize: 14, color: "#3a4a62", lineHeight: 1.85, wordBreak: "keep-all", marginBottom: 14 }}>
            sureline은 쿠팡 파트너스 제휴 프로그램에 참여하고 있습니다.
            일부 글에서 제품 링크를 클릭하고 구매가 이루어질 경우, sureline이 일정 수수료를 받을 수 있습니다.
          </p>
          <p style={{ fontSize: 14, color: "#3a4a62", lineHeight: 1.85, wordBreak: "keep-all", margin: 0 }}>
            이 수수료는 독자에게 추가 비용을 발생시키지 않습니다.
            제휴 링크 여부는 독자의 구매 금액에 영향을 주지 않습니다.
          </p>
        </section>

        {/* 추천 기준 */}
        <section style={{ background: "#fff", border: "1px solid #e1e5eb", borderRadius: 16, padding: "28px 28px", marginBottom: 28 }}>
          <h2 style={{ fontSize: "1.125rem", fontWeight: 800, color: "#1c2741", marginBottom: 14 }}>제품 추천 기준</h2>
          <p style={{ fontSize: 14, color: "#3a4a62", lineHeight: 1.85, wordBreak: "keep-all", marginBottom: 14 }}>
            sureline의 제품 추천은 글의 주제 연관성과 독자 실용성을 기준으로 합니다.
          </p>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            {[
              "글에서 다루는 통증·피로 문제와 직접 연관된 제품만 포함합니다",
              "수수료 수익만을 목적으로 무관한 제품을 삽입하지 않습니다",
              "특정 제품의 효과를 보장하거나 과장하지 않습니다",
              "가격 대비 실용성을 기준으로 여러 선택지를 제시하는 것을 원칙으로 합니다",
            ].map((item) => (
              <li key={item} style={{ fontSize: 14, color: "#3a4a62", lineHeight: 1.8, marginBottom: 4 }}>{item}</li>
            ))}
          </ul>
        </section>

        {/* 편집 독립성 */}
        <section style={{ background: "#f4f7ff", border: "1px solid #dde6ff", borderRadius: 16, padding: "28px 28px", marginBottom: 28 }}>
          <h2 style={{ fontSize: "1.125rem", fontWeight: 800, color: "#1c2741", marginBottom: 14 }}>편집 독립성</h2>
          <p style={{ fontSize: 14, color: "#3a4a62", lineHeight: 1.85, wordBreak: "keep-all", margin: 0 }}>
            수익화 요소는 글의 내용과 독립적으로 운영됩니다.
            외부 업체로부터 금전이나 물품을 제공받고 작성한 글이 있을 경우에는
            해당 글 안에서 명확히 표시합니다.
            현재 sureline에는 협찬 또는 유료 기재 콘텐츠가 없습니다.
          </p>
        </section>

        {/* 애드센스 */}
        <section style={{ background: "#fff", border: "1px solid #e1e5eb", borderRadius: 16, padding: "28px 28px", marginBottom: 40 }}>
          <h2 style={{ fontSize: "1.125rem", fontWeight: 800, color: "#1c2741", marginBottom: 14 }}>Google 광고</h2>
          <p style={{ fontSize: 14, color: "#3a4a62", lineHeight: 1.85, wordBreak: "keep-all", margin: 0 }}>
            sureline은 Google AdSense를 통해 자동 배치 광고를 운영할 수 있습니다.
            Google은 쿠키와 방문 기록을 기반으로 광고를 표시할 수 있습니다.
            광고 개인 맞춤 설정은{" "}
            <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" style={{ color: "#3268ff", fontWeight: 600, textDecoration: "none" }}>
              Google 광고 설정
            </a>
            에서 관리할 수 있습니다.
          </p>
        </section>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link href="/about" style={{ fontSize: 14, fontWeight: 600, color: "#3268ff", textDecoration: "none" }}>필자 소개 →</Link>
          <Link href="/contact" style={{ fontSize: 14, fontWeight: 600, color: "#3268ff", textDecoration: "none" }}>문의 →</Link>
        </div>

      </div>
    </main>
  );
}
