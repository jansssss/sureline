export const metadata = {
  title: "이용약관 — sureline",
};

export default function TermsPage() {
  return (
    <main className="flex-1">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-xl font-bold text-gray-900 mb-6">이용약관</h1>
        <div className="space-y-6 text-sm text-gray-600 leading-8">
          <section>
            <h2 className="font-semibold text-gray-800 mb-2">면책 조항</h2>
            <p>
              본 사이트의 건강 정보는 일반적인 참고 목적으로 제공되며, 전문 의료인의 진단 및
              치료를 대체하지 않습니다. 개인의 건강 상태에 따라 적합하지 않을 수 있으므로
              반드시 전문의와 상담하시기 바랍니다.
            </p>
          </section>
          <section>
            <h2 className="font-semibold text-gray-800 mb-2">저작권</h2>
            <p>본 사이트의 모든 콘텐츠에 대한 저작권은 sureline에 있습니다. 무단 복제 및 배포를 금합니다.</p>
          </section>
        </div>
      </div>
    </main>
  );
}
