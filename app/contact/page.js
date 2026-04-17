export const metadata = {
  title: "문의",
  description: "오탈자 제보, 정보 오류 수정 요청, 제휴·협업 문의. sureline 운영자에게 직접 연락하는 방법을 안내합니다.",
  alternates: { canonical: "https://sureline.kr/contact" },
  openGraph: {
    title: "문의 | sureline",
    url: "https://sureline.kr/contact",
    type: "website",
  },
};

const contacts = [
  {
    icon: "🔍",
    title: "오탈자·오류 제보",
    body: "글에서 잘못된 정보, 오래된 내용, 오탈자를 발견하셨다면 알려주세요. 확인 후 수정하겠습니다.",
    tag: "빠르게 답변",
    tagColor: "#16a34a",
  },
  {
    icon: "🤝",
    title: "제휴·협업 문의",
    body: "콘텐츠 협업, 제품 리뷰, 광고 문의는 이메일로 보내주시면 검토 후 답변드립니다.",
    tag: "검토 후 답변",
    tagColor: "#3268ff",
  },
  {
    icon: "💬",
    title: "사이트 관련 의견",
    body: "다뤄주셨으면 하는 주제, 사이트 개선 의견, 기타 피드백 모두 환영합니다.",
    tag: "환영",
    tagColor: "#9333ea",
  },
];

export default function ContactPage() {
  return (
    <main className="flex-1">

      <div style={{ borderTop: "4px solid #3268ff", background: "#f4f7ff", padding: "32px 0 24px" }}>
        <div className="mx-auto max-w-3xl px-4">
          <p style={{ fontSize: 13, color: "#9aa5b8", marginBottom: 6 }}>sureline</p>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#1c2741", marginBottom: 8 }}>문의</h1>
          <p style={{ fontSize: 14, color: "#5a6a85", lineHeight: 1.7 }}>운영자에게 직접 연락하는 창구입니다.</p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-12">

        {/* 이메일 카드 */}
        <div style={{
          background: "linear-gradient(135deg, #1c2741 0%, #2a3a62 100%)",
          borderRadius: 16, padding: "40px 32px",
          textAlign: "center", marginBottom: 48,
        }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>✉️</div>
          <p style={{ fontSize: 14, color: "#a8b8d0", marginBottom: 20 }}>이메일로 문의하세요</p>
          <a
            href="mailto:goooods@naver.com"
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "#3268ff", color: "#fff",
              fontWeight: 700, fontSize: 15,
              padding: "14px 32px", borderRadius: 999,
              textDecoration: "none", letterSpacing: "0.01em",
            }}
          >
            goooods@naver.com
          </a>
          <p style={{ fontSize: 13, color: "#7a8699", marginTop: 16 }}>
            영업일 기준 2–3일 이내 답변을 드립니다
          </p>
        </div>

        {/* 문의 유형 */}
        <h2 style={{ fontSize: "1.125rem", fontWeight: 800, color: "#1c2741", marginBottom: 20 }}>어떤 문의든 환영합니다</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 48 }}>
          {contacts.map((c) => (
            <div key={c.title} style={{
              background: "#fff", border: "1px solid #e1e5eb",
              borderRadius: 12, padding: "20px 24px",
              display: "flex", gap: 16, alignItems: "flex-start",
            }}>
              <div style={{ fontSize: 24, flexShrink: 0, paddingTop: 2 }}>{c.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: "#1c2741" }}>{c.title}</span>
                  <span style={{
                    fontSize: 11, fontWeight: 700, padding: "2px 8px",
                    borderRadius: 999, color: "#fff",
                    background: c.tagColor,
                  }}>{c.tag}</span>
                </div>
                <p style={{ fontSize: 14, color: "#5a6a85", lineHeight: 1.75, wordBreak: "keep-all", margin: 0 }}>{c.body}</p>
              </div>
            </div>
          ))}
        </div>

        {/* 답변 불가 안내 */}
        <div style={{
          background: "#f8f9fb", border: "1px solid #e1e5eb",
          borderRadius: 12, padding: "20px 24px",
        }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: "#1c2741", marginBottom: 10 }}>답변드리기 어려운 문의</h3>
          <p style={{ fontSize: 14, color: "#5a6a85", lineHeight: 1.75, wordBreak: "keep-all", margin: 0 }}>
            개별 증상에 대한 진단, 처방, 치료 방법 상담은 이 채널에서 제공하지 않습니다.
            증상이 있다면 반드시 전문의와 상담하시기 바랍니다.
          </p>
        </div>

      </div>
    </main>
  );
}
