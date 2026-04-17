import Link from "next/link";

export const metadata = {
  title: "건강 정보 면책 기준",
  description: "sureline의 건강 정보는 진단·처방을 대체하지 않습니다. 이 페이지는 정보 이용 기준과 병원 진료가 필요한 경우를 안내합니다.",
  alternates: { canonical: "https://sureline.kr/disclaimer" },
  openGraph: {
    title: "건강 정보 면책 기준 | sureline",
    url: "https://sureline.kr/disclaimer",
    type: "website",
  },
};

export default function DisclaimerPage() {
  return (
    <main className="flex-1">

      <div style={{ borderTop: "4px solid #3268ff", background: "#f4f7ff", padding: "32px 0 24px" }}>
        <div className="mx-auto max-w-3xl px-4">
          <p style={{ fontSize: 13, color: "#9aa5b8", marginBottom: 6 }}>sureline</p>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#1c2741", marginBottom: 8 }}>건강 정보 면책 기준</h1>
          <p style={{ fontSize: 14, color: "#5a6a85", lineHeight: 1.7 }}>이 사이트의 정보를 어떻게 활용해야 하는지, 어느 시점에 전문의를 찾아야 하는지를 안내합니다.</p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-12">

        {/* 핵심 고지 */}
        <div style={{
          background: "#fffbef", border: "1px solid #f0e08a",
          borderRadius: 12, padding: "24px 24px", marginBottom: 40,
        }}>
          <div style={{ fontSize: 20, marginBottom: 12 }}>⚠️</div>
          <p style={{ fontSize: 15, color: "#6b5b1a", lineHeight: 1.85, wordBreak: "keep-all", margin: 0, fontWeight: 500 }}>
            sureline의 모든 글은 일반적인 건강 정보를 제공하기 위한 콘텐츠입니다.
            이 사이트는 의료기관이 아니며, 글의 내용은 전문 의료인의 진단·처방·치료를 대체하지 않습니다.
          </p>
        </div>

        {/* 섹션: 정보 제공 범위 */}
        <section style={{ marginBottom: 40 }}>
          <h2 style={{ fontSize: "1.125rem", fontWeight: 800, color: "#1c2741", marginBottom: 16 }}>이 사이트가 제공하는 것</h2>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            {[
              "직장인이 자주 겪는 근골격계 통증·피로의 일반적인 원인과 악화 요인",
              "생활 속에서 실천할 수 있는 자세 개선, 스트레칭, 환경 조정 방법",
              "전문의 진료를 받아야 하는 일반적인 기준 (개인 상황에 따라 다를 수 있음)",
              "신뢰할 수 있는 외부 자료와 학회 가이드라인 링크",
            ].map((item) => (
              <li key={item} style={{ fontSize: 14, color: "#3a4a62", lineHeight: 1.8, marginBottom: 6 }}>{item}</li>
            ))}
          </ul>
        </section>

        {/* 섹션: 병원에 가야 할 때 */}
        <section style={{ marginBottom: 40 }}>
          <h2 style={{ fontSize: "1.125rem", fontWeight: 800, color: "#1c2741", marginBottom: 16 }}>병원에 가야 할 때</h2>
          <div style={{ background: "#fff5f3", border: "1px solid #ffd6ce", borderRadius: 12, padding: "24px 24px" }}>
            <p style={{ fontSize: 14, color: "#5a2a1a", marginBottom: 14, fontWeight: 700 }}>
              아래 증상이 있다면 이 사이트 글이 아니라 전문의를 먼저 찾으십시오.
            </p>
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              {[
                "팔·다리로 뻗치는 통증 또는 저림 증상",
                "손발에 근력 저하나 감각 둔화가 동반되는 경우",
                "안정 시에도 통증이 지속되거나 밤에 심해지는 경우",
                "낙상·충격 등 명확한 외상 이후 통증이 생긴 경우",
                "3주 이상 증상이 지속되거나 악화되는 경우",
                "눈 통증·시력 변화·두통이 동반되는 경우",
                "극심한 피로, 설명되지 않는 체중 감소, 발열이 동반되는 경우",
              ].map((item) => (
                <li key={item} style={{ fontSize: 14, color: "#5a2a1a", lineHeight: 1.8, marginBottom: 4 }}>{item}</li>
              ))}
            </ul>
          </div>
        </section>

        {/* 섹션: 개인차 */}
        <section style={{ marginBottom: 40 }}>
          <h2 style={{ fontSize: "1.125rem", fontWeight: 800, color: "#1c2741", marginBottom: 16 }}>개인차에 대해</h2>
          <p style={{ fontSize: 14, color: "#3a4a62", lineHeight: 1.85, wordBreak: "keep-all" }}>
            같은 증상이라도 개인의 병력, 나이, 체형, 업무 환경, 생활 습관에 따라 원인과 적절한 대응 방법이 달라집니다.
            이 사이트의 정보는 일반적인 상황을 전제로 작성되며, 특정 개인에게 적합하지 않을 수 있습니다.
          </p>
        </section>

        {/* 섹션: 업데이트 원칙 */}
        <section style={{ marginBottom: 40 }}>
          <h2 style={{ fontSize: "1.125rem", fontWeight: 800, color: "#1c2741", marginBottom: 16 }}>정보 업데이트 원칙</h2>
          <p style={{ fontSize: 14, color: "#3a4a62", lineHeight: 1.85, wordBreak: "keep-all" }}>
            의학 지식과 가이드라인은 새로운 연구에 따라 바뀔 수 있습니다.
            sureline은 중요한 변경이 있을 경우 해당 글의 업데이트일을 표기하고 내용을 수정합니다.
            오류나 오래된 정보를 발견하신 경우{" "}
            <Link href="/contact" style={{ color: "#3268ff", fontWeight: 600, textDecoration: "none" }}>문의</Link>
            를 통해 알려주시면 검토 후 수정하겠습니다.
          </p>
        </section>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link href="/editorial" style={{ fontSize: 14, fontWeight: 600, color: "#3268ff", textDecoration: "none" }}>편집 원칙 →</Link>
          <Link href="/contact" style={{ fontSize: 14, fontWeight: 600, color: "#3268ff", textDecoration: "none" }}>오류 제보 →</Link>
        </div>

      </div>
    </main>
  );
}
