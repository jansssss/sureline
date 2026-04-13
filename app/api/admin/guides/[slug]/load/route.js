import { NextResponse } from 'next/server';

const SUPABASE_URL = process.env.SUPABASE_URL;
const ANON_KEY = process.env.SUPABASE_ANON_KEY;

// GET /api/admin/guides/[slug]/load — 에디터용 가이드 데이터 조회
export async function GET(request, { params }) {
  const { slug } = params;
  if (!SUPABASE_URL || !ANON_KEY) {
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
  }

  const headers = {
    apikey: ANON_KEY,
    Authorization: `Bearer ${ANON_KEY}`,
  };

  const [guideRes] = await Promise.all([
    fetch(`${SUPABASE_URL}/rest/v1/guides?slug=eq.${encodeURIComponent(slug)}&limit=1`, { headers, cache: 'no-store' }),
  ]);
  if (!guideRes.ok) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const guideRows = await guideRes.json();
  if (!guideRows.length) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const g = guideRows[0];

  const secRes = await fetch(
    `${SUPABASE_URL}/rest/v1/guide_sections?guide_id=eq.${g.id}&order=order_index.asc`,
    { headers, cache: 'no-store' }
  );
  const secRows = secRes.ok ? await secRes.json() : [];

  return NextResponse.json({
    slug: g.slug,
    title: g.title,
    description: g.description,
    category: g.category,
    publishedAt: g.published_at,
    updatedAt: (g.updated_at || g.published_at || '').slice(0, 10),
    readTime: g.read_time,
    keyPoints: g.key_points ?? [],
    sources: g.sources ?? [],
    sections: secRows.map((s) => ({
      title: s.title,
      paragraphs: s.paragraphs ?? [],
      bullets: s.bullets ?? null,
      callout: s.callout ?? null,
      table: s.section_table ?? null,
    })),
  });
}
