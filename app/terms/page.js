export const metadata = {
  title: "이용약관 — sureline",
  description: "sureline 이용약관입니다.",
};

const SECTION_STYLE = { marginBottom: "36px" };

const H2_STYLE = {
  fontSize: "1rem",
  fontWeight: 700,
  color: "#1c2741",
  marginBottom: "12px",
  paddingBottom: "8px",
  borderBottom: "2px solid #eef2f7",
};

const P_STYLE = {
  fontSize: "14px",
  color: "#3a4a62",
  lineHeight: 1.85,
  wordBreak: "keep-all",
  marginBottom: "8px",
};

const LI_STYLE = {
  fontSize: "14px",
  color: "#3a4a62",
  lineHeight: 1.85,
  marginBottom: "4px",
  wordBreak: "keep-all",
};

export default function TermsPage() {
  return (
    <main className="flex-1">
      {/* 헤더 */}
      <div style={{ borderTop: "4px solid #ff6b57", background: "#fff5f3", padding: "32px 0 24px" }}>
        <div className="mx-auto max-w-3xl px-4">
          <p style={{ fontSize: "12px", fontWeight: 700, color: "#ff6b57", letterSpacing: "0.08em", marginBottom: "8px" }}>
            LEGAL
          </p>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#1c2741", marginBottom: "8px" }}>
            이용약관
          </h1>
          <p style={{ fontSize: "13px", color: "#9aa5b8" }}>
            시행일: 2025년 12월 1일
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-10">

        <section style={SECTION_STYLE}>
          <h2 style={H2_STYLE}>제1조 (목적)</h2>
          <p style={P_STYLE}>
            본 약관은 sureline(이하 "사이트")이 제공하는 직장인 건강 가이드 서비스의
            이용과 관련하여 사이트와 이용자 간의 권리·의무·책임 사항을 규정함을 목적으로 합니다.
          </p>
        </section>

        <section style={SECTION_STYLE}>
          <h2 style={H2_STYLE}>제2조 (정의)</h2>
          <ul style={{ paddingLeft: "18px", margin: "8px 0" }}>
            <li style={LI_STYLE}><strong>"사이트"</strong>란 sureline.kr을 통해 제공되는 웹서비스를 의미합니다.</li>
            <li style={LI_STYLE}><strong>"이용자"</strong>란 사이트에 접속하여 서비스를 이용하는 모든 방문자를 의미합니다.</li>
            <li style={LI_STYLE}><strong>"콘텐츠"</strong>란 사이트에 게시된 글·이미지·표 등 모든 정보를 의미합니다.</li>
          </ul>
        </section>

        <section style={SECTION_STYLE}>
          <h2 style={H2_STYLE}>제3조 (약관의 효력 및 변경)</h2>
          <p style={P_STYLE}>본 약관은 사이트에 게시함으로써 효력이 발생합니다.</p>
          <p style={P_STYLE}>사이트는 필요 시 약관을 변경할 수 있으며, 변경된 약관은 사이트 내 공지를 통해 안내합니다.</p>
        </section>

        <section style={SECTION_STYLE}>
          <h2 style={H2_STYLE}>제4조 (서비스의 내용)</h2>
          <p style={P_STYLE}>사이트는 다음과 같은 서비스를 제공합니다.</p>
          <ul style={{ paddingLeft: "18px", margin: "8px 0" }}>
            <li style={LI_STYLE}>직장인 목·어깨·허리 통증, 눈 피로, 피로 회복 등 건강 가이드 콘텐츠 제공</li>
            <li style={LI_STYLE}>자세 교정, 스트레칭, 수면 개선, 손목·팔꿈치 통증 관련 실용 정보 제공</li>
            <li style={LI_STYLE}>관련 건강 용품 쿠팡 파트너스 추천</li>
            <li style={LI_STYLE}>기타 사이트가 정하는 서비스</li>
          </ul>
        </section>

        <section style={SECTION_STYLE}>
          <h2 style={H2_STYLE}>제5조 (의료 정보 면책 고지) ⚠️</h2>
          <div style={{ background: "#fffbef", border: "1px solid #f0e08a", borderRadius: "12px", padding: "20px", marginBottom: "12px" }}>
            <p style={{ fontSize: "14px", color: "#6b5b1a", lineHeight: 1.85, wordBreak: "keep-all", margin: 0 }}>
              본 사이트의 모든 건강 정보는 <strong>일반적인 참고 목적</strong>으로 제공되며,
              전문 의료인의 진단·처방·치료를 <strong>대체하지 않습니다.</strong>
              개인의 건강 상태·병력·체질에 따라 내용이 적합하지 않을 수 있으므로,
              증상이 지속되거나 악화될 경우 반드시 전문의와 상담하시기 바랍니다.
            </p>
          </div>
          <p style={P_STYLE}>
            사이트는 콘텐츠의 정확성을 위해 노력하나, 의학 지식 및 가이드라인의 변화로 인해
            일부 정보가 최신 내용과 다를 수 있습니다. 정확한 의학 정보는 해당 전문 기관에서 확인하시기 바랍니다.
          </p>
        </section>

        <section style={SECTION_STYLE}>
          <h2 style={H2_STYLE}>제6조 (쿠팡 파트너스 제휴 고지)</h2>
          <div style={{ background: "#f4f7ff", border: "1px solid #dde6ff", borderRadius: "12px", padding: "20px", marginBottom: "12px" }}>
            <p style={{ fontSize: "14px", color: "#2a3a5c", lineHeight: 1.85, wordBreak: "keep-all", margin: 0 }}>
              이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.
            </p>
          </div>
          <p style={P_STYLE}>
            제휴 링크를 통한 구매 여부는 이용자의 자유로운 선택이며, 추천 제품은 글의 주제와의
            연관성을 기준으로 선정됩니다. 특정 브랜드나 판매사와 독점 계약 관계에 있지 않습니다.
          </p>
        </section>

        <section style={SECTION_STYLE}>
          <h2 style={H2_STYLE}>제7조 (저작권 및 콘텐츠 이용)</h2>
          <p style={P_STYLE}>사이트에 게시된 모든 콘텐츠의 저작권은 sureline에 귀속됩니다.</p>
          <p style={P_STYLE}>이용자는 사이트의 콘텐츠를 무단으로 복제·배포·전송·출판할 수 없습니다.</p>
          <p style={P_STYLE}>개인적 학습 목적의 이용은 허용하나, 상업적 이용 시 사전 서면 동의가 필요합니다.</p>
        </section>

        <section style={SECTION_STYLE}>
          <h2 style={H2_STYLE}>제8조 (이용자의 의무)</h2>
          <p style={P_STYLE}>이용자는 다음 행위를 해서는 안 됩니다.</p>
          <ul style={{ paddingLeft: "18px", margin: "8px 0" }}>
            <li style={LI_STYLE}>타인의 정보를 도용하거나 허위 정보를 유포하는 행위</li>
            <li style={LI_STYLE}>사이트의 운영을 방해하거나 서비스를 부정하게 이용하는 행위</li>
            <li style={LI_STYLE}>저작권 등 타인의 권리를 침해하는 행위</li>
            <li style={LI_STYLE}>법령 또는 공서양속에 반하는 행위</li>
          </ul>
        </section>

        <section style={SECTION_STYLE}>
          <h2 style={H2_STYLE}>제9조 (서비스 중단)</h2>
          <p style={P_STYLE}>사이트는 다음의 경우 서비스를 일시적으로 중단할 수 있습니다.</p>
          <ul style={{ paddingLeft: "18px", margin: "8px 0" }}>
            <li style={LI_STYLE}>시스템 점검·유지보수가 필요한 경우</li>
            <li style={LI_STYLE}>천재지변 등 불가항력적 사유가 발생한 경우</li>
            <li style={LI_STYLE}>기타 기술적 문제로 서비스 제공이 불가능한 경우</li>
          </ul>
        </section>

        <section style={SECTION_STYLE}>
          <h2 style={H2_STYLE}>제10조 (분쟁 해결)</h2>
          <p style={P_STYLE}>
            본 약관과 관련하여 분쟁이 발생한 경우, 대한민국 법률에 따라 해결합니다.
          </p>
        </section>

        <section style={SECTION_STYLE}>
          <h2 style={H2_STYLE}>제11조 (문의)</h2>
          <p style={P_STYLE}>약관에 관한 문의는 아래 이메일로 연락 주시기 바랍니다.</p>
          <div style={{ background: "#f4f7ff", border: "1px solid #dde6ff", borderRadius: "10px", padding: "16px 20px", marginTop: "12px" }}>
            <p style={{ fontSize: "14px", color: "#3a4a62", margin: 0 }}>
              <strong>이메일:</strong>{" "}
              <a href="mailto:goooods@naver.com" style={{ color: "#3268ff" }}>goooods@naver.com</a>
            </p>
          </div>
        </section>

        <div style={{ marginTop: "48px", paddingTop: "24px", borderTop: "1px solid #eef2f7" }}>
          <p style={{ fontSize: "13px", color: "#9aa5b8" }}>
            <strong>시행일자:</strong> 2025년 12월 1일
          </p>
        </div>

      </div>
    </main>
  );
}
