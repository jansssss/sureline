import Link from "next/link";

export default function CategorySidebar({ categories = [], currentCategory = null, variant = "both" }) {
  const items = [
    { category: "전체 글", count: categories.reduce((s, c) => s + c.count, 0), href: "/guides" },
    ...categories.map((c) => ({
      category: c.category,
      count: c.count,
      href: `/guides/category/${encodeURIComponent(c.category)}`,
    })),
  ];

  const isActive = (item) =>
    item.category === "전체 글" ? currentCategory === null : item.category === currentCategory;

  if (variant === "mobile") {
    return (
      <div className="cat-mobile" style={{ gap: 8, padding: "12px 16px", background: "#fff", borderBottom: "1px solid #eef2f7" }}>
        {items.map((item) => (
          <Link key={item.category} href={item.href} style={{
            flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 5,
            padding: "6px 14px", borderRadius: 999, fontSize: 13, textDecoration: "none",
            fontWeight: isActive(item) ? 700 : 500, whiteSpace: "nowrap",
            background: isActive(item) ? "#3268ff" : "#f4f7ff",
            color: isActive(item) ? "#fff" : "#5a6a85",
            border: isActive(item) ? "none" : "1px solid #e1e5eb",
          }}>
            {item.category}
            <span style={{
              fontSize: 11, fontWeight: 600, borderRadius: 999, padding: "1px 6px",
              background: isActive(item) ? "rgba(255,255,255,0.25)" : "#e1e5eb",
              color: isActive(item) ? "#fff" : "#9aa5b8",
            }}>{item.count}</span>
          </Link>
        ))}
      </div>
    );
  }

  return (
    <aside className="cat-desktop" style={{ width: 220, flexShrink: 0, position: "sticky", top: 80, alignSelf: "flex-start", maxHeight: "calc(100vh - 100px)", overflowY: "auto", scrollbarWidth: "none" }}>
      <div style={{ background: "#fff", border: "1px solid #e1e5eb", borderRadius: 16, overflow: "hidden" }}>
        <div style={{ padding: "14px 18px", borderBottom: "1px solid #eef2f7", fontSize: 11, fontWeight: 700, color: "#9aa5b8", letterSpacing: "0.08em" }}>
          CATEGORIES
        </div>
        <ul style={{ margin: 0, padding: "8px 0", listStyle: "none" }}>
          {items.map((item) => (
            <li key={item.category}>
              <Link href={item.href} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "9px 18px", fontSize: 13, textDecoration: "none",
                fontWeight: isActive(item) ? 700 : 500,
                color: isActive(item) ? "#3268ff" : "#3a4a62",
                background: isActive(item) ? "#f0f4ff" : "transparent",
                borderLeft: isActive(item) ? "3px solid #3268ff" : "3px solid transparent",
                wordBreak: "keep-all",
              }}>
                <span>{item.category}</span>
                <span style={{
                  fontSize: 11, fontWeight: 600, borderRadius: 999, padding: "2px 7px",
                  flexShrink: 0, marginLeft: 6,
                  color: isActive(item) ? "#3268ff" : "#b0bac8",
                  background: isActive(item) ? "#dde8ff" : "#f4f6f9",
                }}>{item.count}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
