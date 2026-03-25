/**
 * 서버 전용 Supabase REST 유틸
 * anon key로 공개 데이터 조회 (RLS: SELECT 전체 허용)
 */

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

function getHeaders() {
  return {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  };
}

/**
 * 전체 가이드 목록 조회 (메타데이터만, 최신순)
 * @param {number} limit
 */
export async function fetchAllGuides(limit = 100) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return [];
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/guides?select=slug,category,title,description,read_time,published_at,updated_at&order=created_at.desc&limit=${limit}`,
      { headers: getHeaders(), next: { revalidate: 3600 } }
    );
    if (!res.ok) return [];
    const rows = await res.json();
    return rows.map(normalizeGuide);
  } catch {
    return [];
  }
}

/**
 * slug로 가이드 + 섹션 조회
 * @param {string} slug
 * @returns {Promise<object|null>}
 */
export async function fetchGuideBySlug(slug) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;
  try {
    const headers = getHeaders();

    const [guideRes, secRes] = await Promise.all([
      fetch(
        `${SUPABASE_URL}/rest/v1/guides?slug=eq.${encodeURIComponent(slug)}&limit=1`,
        { headers, next: { revalidate: 3600 } }
      ),
      // 섹션은 guide_id를 먼저 알아야 하므로 가이드 조회 후 처리
    ]);

    if (!guideRes.ok) return null;
    const guideRows = await guideRes.json();
    if (!guideRows.length) return null;
    const g = guideRows[0];

    const sectionsRes = await fetch(
      `${SUPABASE_URL}/rest/v1/guide_sections?guide_id=eq.${g.id}&order=order_index.asc`,
      { headers, next: { revalidate: 3600 } }
    );
    const secRows = sectionsRes.ok ? await sectionsRes.json() : [];

    return {
      ...normalizeGuide(g),
      sections: secRows.map((s) => ({
        title: s.title,
        paragraphs: s.paragraphs ?? [],
        bullets: s.bullets ?? null,
        callout: s.callout ?? null,
        table: s.section_table ?? null,
      })),
    };
  } catch {
    return null;
  }
}

/**
 * 인접 글 조회 (이전/다음)
 * @param {string} currentSlug
 * @param {string} publishedAt  // YYYY-MM-DD
 */
export async function fetchAdjacentGuides(currentSlug, publishedAt) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return { prev: null, next: null };
  try {
    const headers = getHeaders();
    const [prevRes, nextRes] = await Promise.all([
      fetch(
        `${SUPABASE_URL}/rest/v1/guides?select=slug,title&published_at=lt.${publishedAt}&order=published_at.desc&limit=1`,
        { headers, next: { revalidate: 3600 } }
      ),
      fetch(
        `${SUPABASE_URL}/rest/v1/guides?select=slug,title&published_at=gt.${publishedAt}&order=published_at.asc&limit=1`,
        { headers, next: { revalidate: 3600 } }
      ),
    ]);
    const prevRows = prevRes.ok ? await prevRes.json() : [];
    const nextRows = nextRes.ok ? await nextRes.json() : [];
    return {
      prev: prevRows[0] ?? null,
      next: nextRows[0] ?? null,
    };
  } catch {
    return { prev: null, next: null };
  }
}

function normalizeGuide(g) {
  return {
    slug: g.slug,
    category: g.category,
    title: g.title,
    description: g.description,
    publishedAt: g.published_at,
    updatedAt: (g.updated_at || g.published_at || "").slice(0, 10),
    readTime: g.read_time,
    keyPoints: g.key_points ?? [],
    sources: g.sources ?? [],
  };
}
