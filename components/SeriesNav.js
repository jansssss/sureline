import Link from "next/link";

export default function SeriesNav({ series, seriesGuides = [], currentSlug }) {
  if (!series || seriesGuides.length < 2) return null;

  const currentIdx = seriesGuides.findIndex((g) => g.slug === currentSlug);

  return (
    <div style={{
      background: "linear-gradient(to right, #f4f7ff, #fff)",
      border: "1px solid #dde6ff",
      borderRadius: 20,
      padding: "20px 24px",
      marginBottom: 32,
    }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#9aa5b8", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>
        시리즈 연재
      </div>
      <div style={{ fontSize: 15, fontWeight: 800, color: "#1c2741", marginBottom: 14 }}>
        {series.title}
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {seriesGuides.map((g, i) => {
          const isCurrent = g.slug === currentSlug;
          return (
            <Link
              key={g.slug}
              href={`/guides/${g.slug}`}
              title={g.title}
              style={{
                display: "inline-flex", alignItems: "center", gap: 7,
                padding: "7px 14px", borderRadius: 10, textDecoration: "none",
                background: isCurrent ? "#3268ff" : "#fff",
                color: isCurrent ? "#fff" : "#5a6a85",
                fontWeight: isCurrent ? 700 : 500, fontSize: 13,
                border: isCurrent ? "none" : "1px solid #dde6ff",
                whiteSpace: "nowrap", maxWidth: 200,
                overflow: "hidden", textOverflow: "ellipsis",
              }}
            >
              <span style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                width: 20, height: 20, borderRadius: 6, flexShrink: 0,
                background: isCurrent ? "rgba(255,255,255,0.25)" : "#f4f7ff",
                fontSize: 11, fontWeight: 800,
                color: isCurrent ? "#fff" : "#3268ff",
              }}>
                {i + 1}
              </span>
              <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{g.title}</span>
            </Link>
          );
        })}
      </div>

      {currentIdx >= 0 && (
        <div style={{ marginTop: 14, display: "flex", gap: 8, fontSize: 13 }}>
          {currentIdx > 0 && (
            <Link href={`/guides/${seriesGuides[currentIdx - 1].slug}`} style={{
              color: "#3268ff", fontWeight: 600, textDecoration: "none",
              display: "flex", alignItems: "center", gap: 4,
            }}>
              ← 이전편
            </Link>
          )}
          {currentIdx < seriesGuides.length - 1 && (
            <Link href={`/guides/${seriesGuides[currentIdx + 1].slug}`} style={{
              color: "#3268ff", fontWeight: 600, textDecoration: "none",
              display: "flex", alignItems: "center", gap: 4,
              marginLeft: currentIdx > 0 ? "auto" : 0,
            }}>
              다음편 →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
