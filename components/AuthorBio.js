import Link from "next/link";

export default function AuthorBio() {
  return (
    <aside
      style={{
        marginTop: "48px",
        padding: "24px",
        background: "#f8f9fb",
        border: "1px solid #e1e5eb",
        borderRadius: "16px",
        display: "flex",
        gap: "20px",
        alignItems: "flex-start",
        flexWrap: "wrap",
      }}
    >
      {/* 아이콘 */}
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #3268ff 0%, #ff6b57 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 28,
          flexShrink: 0,
        }}
      >
        ✍️
      </div>

      {/* 텍스트 */}
      <div style={{ flex: 1, minWidth: 220 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
          <span style={{ fontSize: 15, fontWeight: 800, color: "#1c2741" }}>sureline</span>
          <span
            style={{
              background: "#f4f7ff",
              color: "#3268ff",
              fontSize: 11,
              fontWeight: 700,
              padding: "2px 9px",
              borderRadius: 999,
              border: "1px solid #dde6ff",
            }}
          >
            직장인 건강 정보
          </span>
        </div>

        <p
          style={{
            fontSize: 13,
            color: "#5a6a85",
            lineHeight: 1.75,
            wordBreak: "keep-all",
            margin: "0 0 12px",
          }}
        >
          학회·공공기관 자료와 전문의 자문을 바탕으로 직장인이 바로 활용할 수 있는
          근골격계 통증·피로 정보를 제공합니다.
        </p>

        <Link
          href="/editorial"
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "#3268ff",
            textDecoration: "none",
          }}
        >
          편집 원칙 보기 →
        </Link>
      </div>
    </aside>
  );
}
