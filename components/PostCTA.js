/**
 * PostCTA — 글 하단 쿠팡 파트너스 제품 CTA
 * Blogger render_html.py의 _pick_products + _build_cta_section 패턴을 Next.js에 적용.
 * 글의 category와 가장 많이 겹치는 상품 최대 2개를 자동 선택해 카드로 노출.
 */
import { SHOP_PRODUCTS, COUPANG_PARTNERS_NOTICE } from "@/data/shop-products";

/** 카테고리 키워드와 가장 많이 겹치는 상품 최대 2개 반환. 매칭 0이면 rank 1·2 기본. */
function pickProducts(category) {
  const scored = SHOP_PRODUCTS.map((p) => {
    const score = p.keywords.filter((k) => k === category || k.includes(category)).length;
    return { product: p, score };
  });
  scored.sort((a, b) => b.score - a.score || a.product.rank - b.product.rank);
  const top = scored.slice(0, 2).filter((x) => x.score > 0).map((x) => x.product);
  return top.length > 0 ? top : SHOP_PRODUCTS.slice(0, 2);
}

export default function PostCTA({ category }) {
  const products = pickProducts(category);

  return (
    <aside
      style={{
        marginTop: "48px",
        padding: "24px 22px 20px",
        background: "linear-gradient(135deg, #f0f4ff 0%, #fff5f3 100%)",
        borderRadius: "20px",
      }}
    >
      {/* 상단 레이블 */}
      <p
        style={{
          fontFamily: "'Apple SD Gothic Neo', 'Malgun Gothic', 'Segoe UI', sans-serif",
          fontSize: "11px",
          fontWeight: 700,
          color: "#3268ff",
          letterSpacing: "0.12em",
          marginBottom: "6px",
        }}
      >
        HEALTH PRODUCT
      </p>

      {/* 섹션 제목 */}
      <p
        style={{
          fontFamily: "'Apple SD Gothic Neo', 'Malgun Gothic', 'Segoe UI', sans-serif",
          fontSize: "18px",
          fontWeight: 800,
          color: "#1c2741",
          marginBottom: "18px",
          letterSpacing: "-0.02em",
          lineHeight: 1.4,
          wordBreak: "keep-all",
        }}
      >
        이 글과 함께 챙기면 좋은 것
      </p>

      {/* 카드 그리드 */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "14px" }}>
        {products.map((p) => (
          <div
            key={p.id}
            style={{
              background: "#ffffff",
              border: "2px solid #dde6ff",
              borderRadius: "16px",
              padding: "20px 20px 18px",
              flex: 1,
              minWidth: "260px",
              boxSizing: "border-box",
            }}
          >
            {/* 배지 */}
            <div
              style={{
                display: "inline-block",
                background: "#ebf0ff",
                color: "#3268ff",
                fontFamily: "'Apple SD Gothic Neo', 'Malgun Gothic', 'Segoe UI', sans-serif",
                fontSize: "11px",
                fontWeight: 700,
                padding: "3px 10px",
                borderRadius: "99px",
                marginBottom: "12px",
                letterSpacing: "0.04em",
              }}
            >
              추천 제품
            </div>

            {/* 이모지 + 상품명 */}
            <div
              style={{
                fontFamily: "'Apple SD Gothic Neo', 'Malgun Gothic', 'Segoe UI', sans-serif",
                fontSize: "16px",
                fontWeight: 800,
                color: "#1c2741",
                marginBottom: "6px",
                lineHeight: 1.4,
                wordBreak: "keep-all",
              }}
            >
              {p.emoji} {p.name}
            </div>

            {/* 설명 */}
            <div
              style={{
                fontFamily: "'Apple SD Gothic Neo', 'Malgun Gothic', 'Segoe UI', sans-serif",
                fontSize: "13px",
                color: "#5a6a85",
                lineHeight: 1.65,
                wordBreak: "keep-all",
                marginBottom: "18px",
              }}
            >
              {p.description}
            </div>

            {/* CTA 버튼 */}
            <a
              href={p.affiliate}
              target="_blank"
              rel="noopener noreferrer sponsored"
              style={{
                display: "block",
                textAlign: "center",
                background: "#ff5c42",
                color: "#ffffff",
                fontFamily: "'Apple SD Gothic Neo', 'Malgun Gothic', 'Segoe UI', sans-serif",
                fontSize: "14px",
                fontWeight: 700,
                padding: "13px 0",
                borderRadius: "10px",
                textDecoration: "none",
                letterSpacing: "0.01em",
              }}
            >
              쿠팡에서 구매하기 →
            </a>
          </div>
        ))}
      </div>

      {/* 쿠팡 파트너스 고지 */}
      <p
        style={{
          fontFamily: "'Apple SD Gothic Neo', 'Malgun Gothic', 'Segoe UI', sans-serif",
          fontSize: "11px",
          color: "#aab3c6",
          margin: "16px 0 0",
          lineHeight: 1.6,
          paddingTop: "14px",
          borderTop: "1px solid rgba(50,104,255,0.1)",
        }}
      >
        ※ {COUPANG_PARTNERS_NOTICE}
      </p>
    </aside>
  );
}
