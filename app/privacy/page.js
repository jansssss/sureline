export const metadata = {
  title: "개인정보처리방침 — sureline",
  description: "sureline의 개인정보처리방침입니다.",
};

const SECTION_STYLE = {
  marginBottom: "36px",
};

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

export default function PrivacyPage() {
  return (
    <main className="flex-1">
      {/* 헤더 */}
      <div style={{ borderTop: "4px solid #3268ff", background: "#f4f7ff", padding: "32px 0 24px" }}>
        <div className="mx-auto max-w-3xl px-4">
          <p style={{ fontSize: "12px", fontWeight: 700, color: "#3268ff", letterSpacing: "0.08em", marginBottom: "8px" }}>
            LEGAL
          </p>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#1c2741", marginBottom: "8px" }}>
            개인정보처리방침
          </h1>
          <p style={{ fontSize: "13px", color: "#9aa5b8" }}>
            시행일: 2025년 12월 1일
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-10">

        <section style={SECTION_STYLE}>
          <h2 style={H2_STYLE}>1. 총칙</h2>
          <p style={P_STYLE}>
            sureline(이하 "사이트")은 이용자의 개인정보를 중요하게 생각합니다.
            본 방침은 사이트 이용 과정에서 수집·이용·보관하는 정보에 관해 안내합니다.
          </p>
          <p style={P_STYLE}>
            본 사이트는 <strong>별도의 회원가입 없이</strong> 이용 가능하며,
            이름·주민등록번호·전화번호·이메일 등 민감한 개인정보를 직접 수집하지 않습니다.
          </p>
        </section>

        <section style={SECTION_STYLE}>
          <h2 style={H2_STYLE}>2. 자동 수집 정보</h2>
          <p style={P_STYLE}>사이트 방문 시 아래 정보가 자동으로 수집될 수 있습니다.</p>
          <ul style={{ paddingLeft: "18px", margin: "8px 0" }}>
            <li style={LI_STYLE}>IP 주소</li>
            <li style={LI_STYLE}>브라우저 종류 및 운영체제</li>
            <li style={LI_STYLE}>방문 일시 및 체류 시간</li>
            <li style={LI_STYLE}>유입 경로 (검색어, 이전 페이지 등)</li>
            <li style={LI_STYLE}>쿠키(Cookie)</li>
          </ul>
        </section>

        <section style={SECTION_STYLE}>
          <h2 style={H2_STYLE}>3. 수집 목적</h2>
          <ul style={{ paddingLeft: "18px", margin: "8px 0" }}>
            <li style={LI_STYLE}>웹사이트 방문 통계 분석 및 서비스 품질 개선</li>
            <li style={LI_STYLE}>사용자 경험 최적화</li>
          </ul>
        </section>

        <section style={SECTION_STYLE}>
          <h2 style={H2_STYLE}>4. 제3자 서비스 이용</h2>
          <p style={P_STYLE}>본 사이트는 아래 외부 서비스를 사용하며, 각 서비스의 개인정보처리방침이 적용됩니다.</p>

          <div style={{ background: "#f8f9fb", border: "1px solid #e1e5eb", borderRadius: "12px", padding: "20px", marginTop: "12px" }}>
            <div style={{ marginBottom: "16px" }}>
              <p style={{ fontSize: "13px", fontWeight: 700, color: "#1c2741", marginBottom: "4px" }}>Google Analytics</p>
              <p style={{ fontSize: "13px", color: "#5a6a85", lineHeight: 1.7 }}>
                방문자 통계 및 행동 분석에 사용됩니다. 수집된 데이터는 익명으로 처리되며
                Google의 개인정보처리방침이 적용됩니다.
              </p>
            </div>
            <div>
              <p style={{ fontSize: "13px", fontWeight: 700, color: "#1c2741", marginBottom: "4px" }}>쿠팡 파트너스</p>
              <p style={{ fontSize: "13px", color: "#5a6a85", lineHeight: 1.7 }}>
                본 사이트는 쿠팡 파트너스 활동의 일환으로 일부 제품 링크를 게재하며,
                이에 따른 일정액의 수수료를 제공받습니다.
                쿠팡 링크 클릭 시 쿠팡의 개인정보처리방침이 적용됩니다.
              </p>
            </div>
          </div>
        </section>

        <section style={SECTION_STYLE}>
          <h2 style={H2_STYLE}>5. 쿠키(Cookie) 운용 및 거부</h2>
          <p style={P_STYLE}>
            쿠키는 웹사이트 이용 편의 및 통계 수집을 위해 사용됩니다.
            브라우저 설정에서 언제든지 쿠키 저장을 거부할 수 있으며,
            거부 시 일부 기능에 제한이 생길 수 있습니다.
          </p>
          <ul style={{ paddingLeft: "18px", margin: "8px 0" }}>
            <li style={LI_STYLE}><strong>Chrome:</strong> 설정 → 개인정보 및 보안 → 쿠키 및 기타 사이트 데이터</li>
            <li style={LI_STYLE}><strong>Edge:</strong> 설정 → 쿠키 및 사이트 권한</li>
            <li style={LI_STYLE}><strong>Safari:</strong> 환경설정 → 개인정보 → 쿠키 및 웹사이트 데이터</li>
          </ul>
        </section>

        <section style={SECTION_STYLE}>
          <h2 style={H2_STYLE}>6. 개인정보의 보유 및 파기</h2>
          <p style={P_STYLE}>
            수집된 정보는 수집 목적이 달성된 후 지체 없이 파기합니다.
            단, 관계 법령에 따라 보존이 필요한 경우 해당 기간 동안 안전하게 보관합니다.
          </p>
        </section>

        <section style={SECTION_STYLE}>
          <h2 style={H2_STYLE}>7. 개인정보 보호책임자 및 문의</h2>
          <p style={P_STYLE}>개인정보 처리에 관한 문의 및 열람·정정·삭제 요청은 아래로 연락 주시기 바랍니다.</p>
          <div style={{ background: "#f4f7ff", border: "1px solid #dde6ff", borderRadius: "10px", padding: "16px 20px", marginTop: "12px" }}>
            <p style={{ fontSize: "14px", color: "#3a4a62", margin: 0 }}>
              <strong>이메일:</strong>{" "}
              <a href="mailto:goooods@naver.com" style={{ color: "#3268ff" }}>goooods@naver.com</a>
            </p>
          </div>
        </section>

        <section style={SECTION_STYLE}>
          <h2 style={H2_STYLE}>8. 방침 변경 안내</h2>
          <p style={P_STYLE}>
            본 개인정보처리방침은 법령 또는 서비스 정책 변경에 따라 수정될 수 있으며,
            변경 시 사이트 내 공지를 통해 안내합니다.
          </p>
        </section>

        <div style={{ marginTop: "48px", padding: "16px 20px", background: "#fffbef", border: "1px solid #f0e08a", borderRadius: "10px" }}>
          <p style={{ fontSize: "13px", color: "#6b5b1a", lineHeight: 1.7, margin: 0 }}>
            ※ 이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.
          </p>
        </div>

      </div>
    </main>
  );
}
