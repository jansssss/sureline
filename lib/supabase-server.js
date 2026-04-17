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
      { headers: getHeaders(), cache: "no-store" }
    );
    if (!res.ok) return [];
    const rows = await res.json();
    return rows.map(normalizeGuide);
  } catch {
    return [];
  }
}

/**
 * 전체 가이드 목록 조회 (섹션 포함, 최신순) — 홈 피드용
 * @param {number} limit
 */
export async function fetchAllGuidesWithSections(limit = 10) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return [];
  try {
    const headers = getHeaders();
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/guides?order=created_at.desc&limit=${limit}`,
      { headers: getHeaders(), cache: "no-store" }
    );
    if (!res.ok) return [];
    const rows = await res.json();

    const guides = await Promise.all(
      rows.map(async (g) => {
        const secRes = await fetch(
          `${SUPABASE_URL}/rest/v1/guide_sections?guide_id=eq.${g.id}&order=order_index.asc`,
          { headers, cache: "no-store" }
        );
        const secRows = secRes.ok ? await secRes.json() : [];
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
      })
    );
    return guides;
  } catch {
    return [];
  }
}

/**
 * 카테고리별 가이드 목록 조회
 * @param {string} category
 * @param {number} limit
 */
export async function fetchGuidesByCategory(category, limit = 100) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return [];
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/guides?select=slug,category,title,description,read_time,published_at,updated_at&category=eq.${encodeURIComponent(category)}&order=published_at.desc&limit=${limit}`,
      { headers: getHeaders(), cache: "no-store" }
    );
    if (!res.ok) return [];
    const rows = await res.json();
    return rows.map(normalizeGuide);
  } catch {
    return [];
  }
}

/**
 * 전체 카테고리 목록 조회 (중복 제거)
 */
export async function fetchAllCategories() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return [];
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/guides?select=category&order=category.asc`,
      { headers: getHeaders(), cache: "no-store" }
    );
    if (!res.ok) return [];
    const rows = await res.json();
    const unique = [...new Set(rows.map((r) => r.category).filter(Boolean))];
    return unique;
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
        { headers, cache: "no-store" }
      ),
      // 섹션은 guide_id를 먼저 알아야 하므로 가이드 조회 후 처리
    ]);

    if (!guideRes.ok) return null;
    const guideRows = await guideRes.json();
    if (!guideRows.length) return null;
    const g = guideRows[0];

    const relatedSlugs = g.related_slugs ?? [];
    const [sectionsRes, relatedRes] = await Promise.all([
      fetch(
        `${SUPABASE_URL}/rest/v1/guide_sections?guide_id=eq.${g.id}&order=order_index.asc`,
        { headers, cache: "no-store" }
      ),
      relatedSlugs.length > 0
        ? fetch(
            `${SUPABASE_URL}/rest/v1/guides?select=slug,title,category&slug=in.(${relatedSlugs.join(",")})`,
            { headers, cache: "no-store" }
          )
        : Promise.resolve(null),
    ]);

    const secRows = sectionsRes.ok ? await sectionsRes.json() : [];
    const relatedRows = relatedRes && relatedRes.ok ? await relatedRes.json() : [];

    return {
      ...normalizeGuide(g),
      sections: secRows.map((s) => ({
        title: s.title,
        paragraphs: s.paragraphs ?? [],
        bullets: s.bullets ?? null,
        callout: s.callout ?? null,
        table: s.section_table ?? null,
      })),
      relatedGuides: relatedRows.map((r) => ({ slug: r.slug, title: r.title, category: r.category })),
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
        { headers, cache: "no-store" }
      ),
      fetch(
        `${SUPABASE_URL}/rest/v1/guides?select=slug,title&published_at=gt.${publishedAt}&order=published_at.asc&limit=1`,
        { headers, cache: "no-store" }
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
