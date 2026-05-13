import Link from "next/link";

export const metadata = {
  title: "사이트 소개 | sureline",
  description: "sureline은 직장인이 겪는 근골격계 통증·피로 문제를 다루는 건강 정보 사이트입니다. 학회자료·공공기관 기준을 바탕으로 실용적인 정보를 제공합니다.",
  alternates: { canonical: "https://sureline.kr/about" },
  openGraph: {
    title: "사이트 소개 | sureline",
    description: "직장인 근골격계 통증·피로 정보 사이트 sureline 소개.",
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
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#1c2741", marginBottom: 8 }}>사이트 소개</h1>
          <p style={{ fontSize: 14, color: "#5a6a85", lineHeight: 1.7 }}>sureline이 무엇을 하는 곳인지, 어떤 기준으로 글을 쓰는지 설명합니다.</p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-12">

        {/* 사이트 소개 */}
        <section style={{ background: "#fff", border: "1px solid #e1e5eb", borderRadius: 16, padding: "32px 28px", marginBottom: 40 }}>
          <h2 style={{ fontSize: "1.125rem", fontWeight: 800, color: "#1c2741", marginBottom: 16 }}>sureline은 어떤 사이트인가요</h2>
          <p style={{ fontSize: 15, color: "#3a4a62", lineHeight: 1.9, wordBreak: "keep-all", marginBottom: 16 }}>
            sureline은 직장인이 겪는 근골격계 통증·피로 문제를 다루는 건강 정보 사이트입니다.
            목 통증, 허리 통증, 손목·어깨 부담, 눈 피로 등 업무 환경에서 자주 생기는 문제들을 다룹니다.
          </p>
          <p style={{ fontSize: 15, color: "#3a4a62", lineHeight: 1.9, wordBreak: "keep-all", margin: 0 }}>
            인터넷에 건강 정보가 넘쳐나지만, 논문 수준으로 전문적이거나 반대로 근거가 불분명한 경우가 많습니다.
            sureline은 그 사이에서 <strong>직장인이 오늘 당장 활용할 수 있는 정보</strong>를 공신력 있는 자료 기반으로 제공합니다.
          </p>
        </section>

        {/* 운영 목적 */}
        <section style={{ background: "#f8f9fb", borderRadius: 16, padding: "28px 28px", marginBottom: 40 }}>
          <h2 style={{ fontSize: "1.125rem", fontWeight: 800, color: "#1c2741", marginBottom: 16 }}>운영 목적</h2>
          <ul style={{ margin: 0, paddingLeft: 0, listStyle: "none" }}>
            {[
              { title: "맥락 있는 정보 제공", desc: "단순 증상 나열이 아니라, 원인·악화 요인·대응 방법·병원 기준을 함께 다룹니다." },
              { title: "과장 없는 서술", desc: "'이것만 하면 낫는다'는 표현 대신, 개인차를 인정하고 근거가 충분하지 않은 내용은 그렇다고 밝힙니다." },
              { title: "불필요한 병원 공포 줄이기", desc: "잘못된 정보로 인한 과도한 걱정을 줄이고, 실제로 전문의 진료가 필요한 기준을 명확히 안내합니다." },
            ].map(({ title, desc }) => (
              <li key={title} style={{ fontSize: 14, color: "#3a4a62", lineHeight: 1.8, marginBottom: 12, display: "flex", gap: 8 }}>
                <span style={{ color: "#3268ff", flexShrink: 0, fontWeight: 700 }}>▸</span>
                <span><strong>{title}</strong> — {desc}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* 콘텐츠 작성 기준 */}
        <section style={{ background: "#fff", border: "1px solid #e1e5eb", borderRadius: 16, padding: "28px 28px", marginBottom: 40 }}>
          <h2 style={{ fontSize: "1.125rem", fontWeight: 800, color: "#1c2741", marginBottom: 16 }}>콘텐츠 작성 기준</h2>
          <ul style={{ margin: 0, paddingLeft: 0, listStyle: "none" }}>
            {[
              { title: "학회·공공기관 자료 우선", desc: "대한정형외과학회, 대한재활의학회, 고용노동부, 산업안전보건공단, CDC·NIOSH 등 공신력 있는 기관의 자료와 학술지를 근거로 합니다." },
              { title: "원인 → 악화 요인 → 대응 → 병원 기준 구조", desc: "모든 글은 증상의 원인, 상황을 악화시키는 요인, 생활 속 대응법, 전문의 진료가 필요한 기준을 함께 다룹니다." },
              { title: "업데이트 기준 표기", desc: "가이드라인이 바뀌거나 새로운 연구 결과가 나오면 업데이트 일자와 함께 내용을 수정합니다." },
              { title: "오류 제보 환영", desc: "잘못된 정보나 개선이 필요한 내용을 발견하시면 언제든지 연락 주세요. 확인 후 수정합니다." },
            ].map(({ title, desc }) => (
              <li key={title} style={{ fontSize: 14, color: "#3a4a62", lineHeight: 1.8, marginBottom: 12, display: "flex", gap: 8 }}>
                <span style={{ color: "#3268ff", flexShrink: 0, fontWeight: 700 }}>•</span>
                <span><strong>{title}</strong> — {desc}</span>
              </li>
            ))}
          </ul>
          <div style={{ marginTop: 20, background: "#f8f9fb", borderRadius: 10, padding: "16px 20px", fontSize: 13, color: "#5a6a85" }}>
            <div><strong>운영:</strong> sureline</div>
            <div><strong>연락처:</strong> goooods@naver.com</div>
          </div>
        </section>

        {/* 면책 */}
        <section style={{ background: "#fffbef", border: "1px solid #f0e08a", borderRadius: 16, padding: "24px 28px", marginBottom: 40 }}>
          <h2 style={{ fontSize: "1.125rem", fontWeight: 800, color: "#6b5b1a", marginBottom: 12 }}>면책 사항</h2>
          <p style={{ fontSize: 14, color: "#6b5b1a", lineHeight: 1.85, wordBreak: "keep-all", margin: "0 0 12px" }}>
            이 사이트에서 제공하는 정보는 <strong>일반적인 건강 정보</strong>로, 개인의 증상에 대한 진단이나 처방이 아닙니다.
            통증이 심하거나 지속된다면 반드시 전문의 진료를 받으시기 바랍니다.
          </p>
          <Link href="/disclaimer" style={{ fontSize: 13, fontWeight: 600, color: "#9b7a0a", textDecoration: "underline" }}>
            건강 정보 면책 기준 전문 →
          </Link>
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
