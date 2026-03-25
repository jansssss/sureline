import Link from "next/link";

export const metadata = {
  title: "소개 — sureline",
  description: "sureline은 사무직 직장인의 목·어깨·허리 통증, 눈 피로, 만성 피로를 과학적 근거로 해결하는 건강 가이드 사이트입니다.",
};

export default function AboutPage() {
  return (
    <main className="flex-1">

      {/* Hero */}
      <section style={{ background: "linear-gradient(135deg, #1c2741 0%, #2a3a62 100%)", color: "#fff" }}>
        <div className="mx-auto max-w-3xl px-4 py-16 text-center">
          <div style={{
            display: "inline-block",
            background: "rgba(255,107,87,0.2)",
            border: "1px solid rgba(255,107,87,0.4)",
            borderRadius: "999px",
            padding: "4px 16px",
            fontSize: "13px",
            fontWeight: 700,
            color: "#ff9e8f",
            marginBottom: "20px",
            letterSpacing: "0.04em",
          }}>
            직장인 건강 가이드
          </div>
          <h1 style={{
            fontSize: "clamp(1.75rem, 5vw, 2.5rem)",
            fontWeight: 800,
            lineHeight: 1.25,
            letterSpacing: "-0.02em",
            marginBottom: "16px",
            wordBreak: "keep-all",
          }}>
            앉아서 일하는 모든 분께,<br />
            <span style={{ color: "#ff6b57" }}>과학적 근거의 건강 가이드</span>
          </h1>
          <p style={{ fontSize: "1rem", color: "#a8b8d0", lineHeight: 1.75, wordBreak: "keep-all", maxWidth: "560px", margin: "0 auto 28px" }}>
            sureline은 사무직 직장인이 겪는 목·어깨·허리 통증, 눈 피로, 만성 피로를
            직접 해결할 수 있도록 공신력 있는 자료 기반의 실용 가이드를 제공합니다.
          </p>
          <Link
            href="/guides"
            style={{
              display: "inline-block",
              background: "#ff6b57",
              color: "#fff",
              fontWeight: 700,
              fontSize: "14px",
              padding: "12px 28px",
              borderRadius: "999px",
              textDecoration: "none",
              letterSpacing: "0.01em",
            }}
          >
            가이드 보러 가기 →
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white py-12 border-b border-gray-100">
        <div className="mx-auto max-w-3xl px-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {[
              { value: "8가지", label: "통증·피로 카테고리" },
              { value: "100%", label: "근거 기반 정보" },
              { value: "무료", label: "회원가입 불필요" },
              { value: "매일", label: "새 가이드 발행" },
            ].map((s) => (
              <div key={s.label}>
                <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "#3268ff", marginBottom: "4px" }}>{s.value}</div>
                <div style={{ fontSize: "13px", color: "#5a6a85" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why sureline */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-3xl px-4">
          <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#1c2741", marginBottom: "8px", textAlign: "center" }}>
            왜 sureline인가요?
          </h2>
          <p style={{ fontSize: "14px", color: "#5a6a85", textAlign: "center", marginBottom: "40px" }}>
            정보 과잉 시대, 진짜 도움이 되는 것만 골라 드립니다
          </p>
          <div className="grid sm:grid-cols-3 gap-5">
            {[
              {
                icon: "🔬",
                title: "근거 기반",
                desc: "대한정형외과학회, 대한안과학회, 고용노동부 등 공신력 있는 자료만 참고합니다.",
                bg: "#f4f7ff",
                border: "#dde6ff",
              },
              {
                icon: "🎯",
                title: "실용적 해결책",
                desc: "병원 가기 전 직접 할 수 있는 것, 환경 개선으로 예방할 수 있는 것을 명확히 안내합니다.",
                bg: "#fff5f3",
                border: "#ffd6ce",
              },
              {
                icon: "📋",
                title: "명확한 기준",
                desc: "어느 시점에 전문의 진료가 필요한지 구체적인 기준을 제시합니다.",
                bg: "#f0fff4",
                border: "#c3e6cb",
              },
            ].map((f) => (
              <div key={f.title} style={{ background: f.bg, border: `1px solid ${f.border}`, borderRadius: "16px", padding: "24px" }}>
                <div style={{ fontSize: "28px", marginBottom: "12px" }}>{f.icon}</div>
                <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#1c2741", marginBottom: "8px" }}>{f.title}</h3>
                <p style={{ fontSize: "13px", color: "#5a6a85", lineHeight: 1.7, wordBreak: "keep-all" }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Coverage */}
      <section style={{ background: "#f8f9fb" }} className="py-16">
        <div className="mx-auto max-w-3xl px-4">
          <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#1c2741", marginBottom: "8px", textAlign: "center" }}>
            다루는 주제
          </h2>
          <p style={{ fontSize: "14px", color: "#5a6a85", textAlign: "center", marginBottom: "32px" }}>
            직장인이 가장 많이 겪는 8가지 통증·피로 문제
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: "💆", label: "목·어깨 통증" },
              { icon: "🪑", label: "허리 통증" },
              { icon: "👁️", label: "눈 피로" },
              { icon: "🧍", label: "자세 교정" },
              { icon: "🤸", label: "스트레칭" },
              { icon: "😴", label: "피로 회복" },
              { icon: "🌙", label: "수면 개선" },
              { icon: "🤲", label: "손목·팔꿈치 통증" },
            ].map((c) => (
              <div key={c.label} style={{
                background: "#fff",
                border: "1px solid #e1e5eb",
                borderRadius: "12px",
                padding: "16px 12px",
                textAlign: "center",
              }}>
                <div style={{ fontSize: "22px", marginBottom: "6px" }}>{c.icon}</div>
                <div style={{ fontSize: "12px", fontWeight: 600, color: "#3a4a62", wordBreak: "keep-all" }}>{c.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 운영 원칙 */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-3xl px-4">
          <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#1c2741", marginBottom: "32px", textAlign: "center" }}>
            운영 원칙
          </h2>
          <div className="space-y-4">
            {[
              {
                title: "정확성",
                desc: "공식 학회 자료와 검증된 연구 결과만을 근거로 콘텐츠를 작성합니다.",
                color: "#3268ff", bg: "#f4f7ff", border: "#dde6ff",
              },
              {
                title: "투명성",
                desc: "본 사이트의 건강 정보는 참고용이며, 전문 의료인의 진단을 대체하지 않음을 명확히 밝힙니다.",
                color: "#ff6b57", bg: "#fff5f3", border: "#ffd6ce",
              },
              {
                title: "쿠팡 파트너스 고지",
                desc: "일부 제품 링크는 쿠팡 파트너스 제휴 링크이며, 클릭 시 수수료가 발생할 수 있습니다. 추천 제품은 주제 연관성을 기준으로만 선정합니다.",
                color: "#16a34a", bg: "#f0fff4", border: "#c3e6cb",
              },
              {
                title: "지속적 업데이트",
                desc: "의학 가이드라인 변경 또는 새로운 연구 결과 발표 시 콘텐츠를 신속하게 검토·수정합니다.",
                color: "#9333ea", bg: "#faf5ff", border: "#e9d5ff",
              },
            ].map((v) => (
              <div key={v.title} style={{ background: v.bg, border: `1px solid ${v.border}`, borderRadius: "12px", padding: "20px 24px", display: "flex", gap: "16px", alignItems: "flex-start" }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: v.color, marginTop: "7px", flexShrink: 0 }} />
                <div>
                  <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#1c2741", marginBottom: "4px" }}>{v.title}</h3>
                  <p style={{ fontSize: "13px", color: "#5a6a85", lineHeight: 1.7, wordBreak: "keep-all", margin: 0 }}>{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section style={{ background: "#f4f7ff", borderTop: "1px solid #dde6ff" }} className="py-16">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <div style={{ fontSize: "36px", marginBottom: "12px" }}>✉️</div>
          <h2 style={{ fontSize: "1.375rem", fontWeight: 800, color: "#1c2741", marginBottom: "8px" }}>문의하기</h2>
          <p style={{ fontSize: "14px", color: "#5a6a85", marginBottom: "20px" }}>
            오류 제보, 콘텐츠 제안, 협업 문의 모두 환영합니다
          </p>
          <a
            href="mailto:goooods@naver.com"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "#3268ff",
              color: "#fff",
              fontWeight: 700,
              fontSize: "14px",
              padding: "12px 28px",
              borderRadius: "999px",
              textDecoration: "none",
            }}
          >
            goooods@naver.com
          </a>
        </div>
      </section>

      {/* 면책 고지 */}
      <section style={{ background: "#fffbef", borderTop: "1px solid #f0e08a" }} className="py-10">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <p style={{ fontSize: "13px", color: "#6b5b1a", lineHeight: 1.8, wordBreak: "keep-all" }}>
            ⚠️ 본 사이트의 모든 정보는 일반적인 건강 참고 목적으로 제공되며,
            전문 의료인의 진단·처방·치료를 대체하지 않습니다.
            개인의 상태에 따라 내용이 적합하지 않을 수 있으니 반드시 전문의와 상담하시기 바랍니다.
          </p>
        </div>
      </section>

    </main>
  );
}
