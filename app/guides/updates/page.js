import Link from "next/link";

export const metadata = {
  title: "업데이트 노트 — sureline 수정 이력",
  description: "sureline 가이드의 수정·추가 이력을 날짜순으로 정리합니다. 건강 정보는 최신 근거를 반영해 지속 업데이트됩니다.",
  alternates: { canonical: "https://sureline.kr/guides/updates" },
  openGraph: { title: "업데이트 노트 | sureline", url: "https://sureline.kr/guides/updates", type: "article" },
};

const UPDATES = [
  {
    date: "2026-04-17",
    type: "추가",
    typeColor: "#16a34a",
    typeBg: "#f0fff4",
    typeBorder: "#c3e6cb",
    items: [
      { page: "직무별 가이드", href: "/guides/job", note: "디자이너·개발자·사무행정 직무별 통증 원인·대처법 추가" },
      { page: "상황별 가이드", href: "/guides/situation", note: "재택·출장·야근 상황별 가이드 추가" },
      { page: "계절별 가이드", href: "/guides/season", note: "봄·여름·가을·겨울 계절별 건강 이슈 추가" },
      { page: "연령대별 가이드", href: "/guides/age", note: "2030·4050 연령대별 건강 전략 추가" },
      { page: "용어 해설", href: "/guides/glossary", note: "거북목·VDT·근막통증·드퀘르벵·CTS·TOS 6개 용어 추가" },
      { page: "추천 순서", href: "/guides/start", note: "증상별 읽기 순서 가이드 추가" },
      { page: "다운로드 자료", href: "/guides/downloads", note: "책상 체크리스트·증상 기록표·병원 방문 메모 추가" },
    ],
  },
  {
    date: "2026-04-15",
    type: "추가",
    typeColor: "#16a34a",
    typeBg: "#f0fff4",
    typeBorder: "#c3e6cb",
    items: [
      { page: "오해 바로잡기", href: "/guides/myth", note: "직장인 건강 상식 오해 6가지 추가" },
      { page: "병원 가야 하는 기준", href: "/guides/hospital", note: "목어깨·허리·손목·눈 신호등 3단계 가이드 추가" },
      { page: "데일리 루틴", href: "/guides/routine", note: "출근 3분·점심 2분·퇴근 5분 루틴 추가" },
    ],
  },
  {
    date: "2026-04-01",
    type: "추가",
    typeColor: "#16a34a",
    typeBg: "#f0fff4",
    typeBorder: "#c3e6cb",
    items: [
      { page: "소개 페이지", href: "/about", note: "필자 소개, 취재 기준, 연락처 정보 추가" },
      { page: "편집 원칙", href: "/editorial", note: "6가지 편집 원칙 명시" },
      { page: "면책 기준", href: "/disclaimer", note: "의료 정보 한계, 긴급 증상 안내 추가" },
      { page: "광고 고지", href: "/disclosure", note: "쿠팡 파트너스 등 수익화 투명 고지 추가" },
    ],
  },
];

const TYPE_ICON = { 추가: "＋", 수정: "✎", 삭제: "✕" };

export default function UpdatesPage() {
  return (
    <main className="flex-1">
      <div style={{ borderTop: "4px solid #1c2741", background: "linear-gradient(to bottom, #f8f9fb, #fff)", padding: "40px 0 32px" }}>
        <div className="mx-auto max-w-4xl px-4">
          <span style={{ fontSize: 11, fontWeight: 700, color: "#9aa5b8", letterSpacing: "0.08em", textTransform: "uppercase" }}>sureline 업데이트 노트</span>
          <h1 style={{ fontSize: "clamp(1.625rem, 4vw, 2rem)", fontWeight: 800, color: "#1c2741", marginBottom: 12, marginTop: 14, lineHeight: 1.3 }}>
            수정·추가 이력
          </h1>
          <p style={{ fontSize: 15, color: "#5a6a85", lineHeight: 1.75, wordBreak: "keep-all", maxWidth: 560 }}>
            건강 정보는 새로운 근거가 나오면 업데이트됩니다. 모든 수정 이력을 날짜순으로 기록합니다.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-12" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {UPDATES.map((u, ui) => (
          <div key={ui} style={{ display: "flex", gap: 0 }}>
            {/* 타임라인 */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginRight: 20, flexShrink: 0 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: u.typeColor, marginTop: 6 }} />
              {ui < UPDATES.length - 1 && <div style={{ width: 2, flex: 1, background: "#eef2f7", minHeight: 24, margin: "6px 0" }} />}
            </div>

            {/* 카드 */}
            <div style={{ flex: 1, paddingBottom: ui < UPDATES.length - 1 ? 24 : 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <span style={{ fontSize: 13, fontWeight: 800, color: "#1c2741" }}>{u.date}</span>
                <span style={{
                  fontSize: 11, fontWeight: 700, color: u.typeColor,
                  background: u.typeBg, border: `1px solid ${u.typeBorder}`,
                  borderRadius: 999, padding: "2px 8px",
                }}>
                  {u.type}
                </span>
              </div>
              <div style={{ background: "#fff", border: "1px solid #eef2f7", borderRadius: 16, overflow: "hidden" }}>
                {u.items.map((item, ii) => (
                  <div key={ii} style={{
                    padding: "12px 18px",
                    borderBottom: ii < u.items.length - 1 ? "1px solid #f4f6f9" : "none",
                    display: "flex", gap: 12, alignItems: "flex-start",
                  }}>
                    <Link href={item.href} style={{ fontSize: 13, fontWeight: 700, color: "#3268ff", textDecoration: "none", flexShrink: 0, minWidth: 100 }}>
                      {item.page}
                    </Link>
                    <span style={{ fontSize: 13, color: "#5a6a85", lineHeight: 1.6 }}>{item.note}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}

        <div style={{ marginTop: 32, padding: "20px 24px", background: "#f4f7ff", border: "1px solid #dde6ff", borderRadius: 16, textAlign: "center" }}>
          <p style={{ fontSize: 13, color: "#5a6a85", margin: "0 0 12px", lineHeight: 1.7 }}>
            내용 오류나 수정이 필요한 부분을 발견하셨나요?
          </p>
          <Link href="/contact" style={{ fontSize: 13, fontWeight: 700, color: "#3268ff", textDecoration: "none" }}>
            제보하기 →
          </Link>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-start", marginTop: 8 }}>
          <Link href="/guides/monthly" style={{ fontSize: 13, fontWeight: 600, color: "#3268ff", textDecoration: "none" }}>← 월간 정리</Link>
        </div>
      </div>
    </main>
  );
}
