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
      {/* 아바타 */}
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
        🧬
      </div>

      {/* 텍스트 */}
      <div style={{ flex: 1, minWidth: 220 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
          <span style={{ fontSize: 15, fontWeight: 800, color: "#1c2741" }}>sureline 편집장</span>
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
            생명과학 전문가
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
          국내 바이오 특화 기관에서 10년 이상 재직하며 Red·Green·Blue·White Bio
          전 분야 R&D 및 연구 프로젝트를 수행해 왔습니다.
          국내외 컨퍼런스와 전문가 회의에서 축적한 근거 중심 지식을 직장인이
          일상에서 바로 적용할 수 있는 건강 정보로 전달합니다.
        </p>

        <Link
          href="/about"
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "#3268ff",
            textDecoration: "none",
          }}
        >
          편집장 소개 보기 →
        </Link>
      </div>
    </aside>
  );
}
