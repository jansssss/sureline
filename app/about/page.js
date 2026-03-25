export const metadata = {
  title: "소개 — sureline",
  description: "sureline은 직장인의 통증과 피로를 실용적으로 해결하는 건강 가이드 사이트입니다.",
};

export default function AboutPage() {
  return (
    <main className="flex-1">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-xl font-bold text-gray-900 mb-4">sureline 소개</h1>
        <div className="prose prose-sm max-w-none text-gray-600 space-y-4 leading-8">
          <p>
            sureline은 사무직 직장인이 겪는 목·어깨·허리 통증, 눈 피로, 만성 피로 문제를
            실용적으로 해결하기 위한 건강 가이드 사이트입니다.
          </p>
          <p>
            병원 가기 전에 직접 할 수 있는 것, 환경 개선으로 예방할 수 있는 것,
            전문가 진료가 필요한 것을 명확히 구분해 안내합니다.
          </p>
          <p>
            모든 정보는 대한정형외과학회, 대한안과학회, 고용노동부 등 공신력 있는 기관 자료를
            근거로 작성하며, 의학적 조언을 대체하지 않습니다.
          </p>
        </div>
      </div>
    </main>
  );
}
