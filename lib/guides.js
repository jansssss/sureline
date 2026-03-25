/**
 * 정적 가이드 데이터 (로컬 개발용 fallback)
 * 실제 운영은 Supabase를 사용합니다. (lib/supabase-server.js)
 *
 * 파이프라인 --file 옵션 사용 시에만 이 파일에 글이 추가됩니다.
 */
const guides = [];

export function getAllGuides() {
  return guides;
}

export function getGuideBySlug(slug) {
  return guides.find((g) => g.slug === slug) ?? null;
}
