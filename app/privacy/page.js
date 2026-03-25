export const metadata = {
  title: "개인정보처리방침 — sureline",
};

export default function PrivacyPage() {
  return (
    <main className="flex-1">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-xl font-bold text-gray-900 mb-6">개인정보처리방침</h1>
        <div className="space-y-6 text-sm text-gray-600 leading-8">
          <section>
            <h2 className="font-semibold text-gray-800 mb-2">수집하는 개인정보</h2>
            <p>본 사이트는 별도의 회원가입 없이 이용 가능하며, 개인정보를 직접 수집하지 않습니다.</p>
          </section>
          <section>
            <h2 className="font-semibold text-gray-800 mb-2">쿠팡 파트너스</h2>
            <p>
              본 사이트는 쿠팡 파트너스 활동의 일환으로 일정 수수료를 제공받습니다.
              쿠팡 링크 클릭 시 쿠팡의 개인정보처리방침이 적용됩니다.
            </p>
          </section>
          <section>
            <h2 className="font-semibold text-gray-800 mb-2">쿠키 및 분석 도구</h2>
            <p>방문자 통계 수집을 위해 Google Analytics 등 분석 도구를 사용할 수 있습니다.</p>
          </section>
        </div>
      </div>
    </main>
  );
}
