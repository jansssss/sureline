import Link from "next/link";

export const metadata = {
  title: "필자 소개",
  description: "sureline을 만드는 사람 — 8년차 직업 건강 전문 취재작가의 소개와 이 블로그를 시작한 이유.",
  alternates: { canonical: "https://sureline.kr/about" },
  openGraph: {
    title: "필자 소개 | sureline",
    description: "8년차 직업 건강 전문 취재작가가 운영하는 직장인 건강 가이드.",
    url: "https://sureline.kr/about",
    type: "website",
  },
};

export default function AboutPage() {
  return (
    <main className="flex-1">

      <div style={{ borderTop: "4px solid #3268ff", background: "#f4f7ff", padding: "32px 0 24px" }}>
        <div className="mx-auto max-w-3xl px-4">
          <p style={{ fontSize: 13, color: "#9aa5b8", marginBottom: 6 }}>sureline</p>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#1c2741", marginBottom: 8 }}>필자 소개</h1>
          <p style={{ fontSize: 14, color: "#5a6a85", lineHeight: 1.7 }}>이 블로그를 만드는 사람과 만드는 방식에 대해 솔직하게 씁니다.</p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-12">

        {/* 운영자 카드 */}
        <section style={{ background: "#fff", border: "1px solid #e1e5eb", borderRadius: 16, padding: "32px 28px", marginBottom: 40 }}>
          <div style={{ display: "flex", gap: 24, alignItems: "flex-start", flexWrap: "wrap" }}>
            <div style={{
              width: 72, height: 72, borderRadius: "50%", flexShrink: 0,
              background: "linear-gradient(135deg, #3268ff 0%, #ff6b57 100%)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 30,
            }}>
              ✍️
            </div>
            <div style={{ flex: 1, minWidth: 220 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, flexWrap: "wrap" }}>
                <span style={{ fontSize: 18, fontWeight: 800, color: "#1c2741" }}>sureline 편집장</span>
                <span style={{
                  background: "#f4f7ff", color: "#3268ff",
                  fontSize: 12, fontWeight: 700,
                  padding: "3px 10px", borderRadius: 999, border: "1px solid #dde6ff",
                }}>
                  직업 건강 전문 취재작가
                </span>
              </div>
              <p style={{ fontSize: 13, color: "#3268ff", fontWeight: 600, marginBottom: 12 }}>
                직업 건강·근골격계·피로 분야 취재 8년 이상
              </p>
              <p style={{ fontSize: 14, color: "#3a4a62", lineHeight: 1.85, wordBreak: "keep-all", margin: 0 }}>
                복잡한 의학 자료를 직장인이 바로 쓸 수 있는 언어로 정리하는 일을 8년 이상 해왔습니다.
                정형외과·산업의학 전문의, 물리치료사, 작업환경 전문가를 직접 인터뷰하고
                학술 자료와 실제 임상 사이의 간극을 메우는 글을 씁니다.
              </p>
            </div>
          </div>
        </section>

        {/* 왜 이 블로그를 시작했나 */}
        <section style={{ marginBottom: 40 }}>
          <h2 style={{ fontSize: "1.125rem", fontWeight: 800, color: "#1c2741", marginBottom: 16 }}>왜 이 블로그를 시작했나</h2>
          <div style={{ fontSize: 15, color: "#3a4a62", lineHeight: 1.9, wordBreak: "keep-all" }}>
            <p style={{ marginBottom: 16 }}>
              취재를 오래 하다 보면 전문의가 하는 말과 인터넷에 돌아다니는 건강 정보 사이에
              얼마나 큰 차이가 있는지 보입니다. 둘 다 맞는 말이지만 맥락이 다른 경우가 대부분입니다.
            </p>
            <p style={{ marginBottom: 16 }}>
              직장인에게 필요한 건 논문 수준의 정밀도가 아닙니다.
              &ldquo;지금 내 상황에서 오늘 당장 할 수 있는 게 뭔지&rdquo;를 알고 싶은 사람에게
              실제로 도움이 되는 정보를 쓰고 싶었습니다.
            </p>
            <p style={{ margin: 0 }}>
              sureline은 그 목적 하나로 운영됩니다.
            </p>
          </div>
        </section>

        {/* 주로 참고하는 자료 */}
        <section style={{ background: "#f8f9fb", borderRadius: 16, padding: "28px 28px", marginBottom: 40 }}>
          <h2 style={{ fontSize: "1.125rem", fontWeight: 800, color: "#1c2741", marginBottom: 16 }}>주로 참고하는 자료</h2>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            {[
              "대한정형외과학회, 대한재활의학회, 대한산업의학회 자료",
              "미국 CDC·NIOSH, 유럽 직업건강연구기관 발행 자료",
              "정형외과·물리치료 분야 국내외 학술지",
              "전문의·물리치료사 직접 인터뷰 내용",
              "고용노동부, 산업안전보건공단 가이드라인",
            ].map((item) => (
              <li key={item} style={{ fontSize: 14, color: "#3a4a62", lineHeight: 1.8, marginBottom: 4 }}>{item}</li>
            ))}
          </ul>
        </section>

        {/* 한계 */}
        <section style={{ marginBottom: 40 }}>
          <h2 style={{ fontSize: "1.125rem", fontWeight: 800, color: "#1c2741", marginBottom: 16 }}>이 블로그의 한계</h2>
          <div style={{
            background: "#fffbef", border: "1px solid #f0e08a",
            borderRadius: 12, padding: "20px 24px",
          }}>
            <p style={{ fontSize: 14, color: "#6b5b1a", lineHeight: 1.85, wordBreak: "keep-all", margin: 0 }}>
              이 블로그는 취재 기반의 일반 건강 정보를 제공하는 곳입니다.
              필자는 의사가 아니며, 개인의 증상에 대한 진단이나 처방을 할 수 없습니다.
              글의 내용은 일반적인 상황을 기준으로 쓰며, 개인 상태에 따라 적합하지 않을 수 있습니다.
              통증이 심하거나 지속된다면 반드시 전문의 진료를 받으시기 바랍니다.
            </p>
          </div>
        </section>

        {/* 인용구 */}
        <section style={{
          borderLeft: "4px solid #3268ff",
          background: "linear-gradient(135deg, #f4f7ff 0%, #fff5f3 100%)",
          borderRadius: "0 12px 12px 0",
          padding: "20px 24px", marginBottom: 40,
        }}>
          <p style={{ fontSize: 15, color: "#2a3a5c", lineHeight: 1.85, fontStyle: "italic", wordBreak: "keep-all", margin: "0 0 12px" }}>
            &ldquo;전문의에게 직접 들은 이야기와 논문에 나온 내용이 왜 이렇게 다른지,
            취재를 시작하고 나서야 알았습니다. 둘 다 맞지만 맥락이 다릅니다.
            그 맥락을 제대로 전달하는 것 — 그게 sureline이 하려는 일입니다.&rdquo;
          </p>
          <div style={{ fontSize: 13, color: "#7a8699", fontWeight: 600 }}>— sureline 편집장</div>
        </section>

        {/* 관련 페이지 링크 */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link href="/editorial" style={{ fontSize: 14, fontWeight: 600, color: "#3268ff", textDecoration: "none" }}>편집 원칙 →</Link>
          <Link href="/disclaimer" style={{ fontSize: 14, fontWeight: 600, color: "#3268ff", textDecoration: "none" }}>건강 정보 면책 기준 →</Link>
          <Link href="/contact" style={{ fontSize: 14, fontWeight: 600, color: "#3268ff", textDecoration: "none" }}>문의 →</Link>
        </div>

      </div>
    </main>
  );
}
