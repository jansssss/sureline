import { NextResponse } from 'next/server';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function getAdminHeaders() {
  return {
    apikey: SERVICE_KEY,
    Authorization: `Bearer ${SERVICE_KEY}`,
    'Content-Type': 'application/json',
    Prefer: 'return=representation',
  };
}

async function verifyToken(request) {
  const auth = request.headers.get('Authorization') ?? '';
  if (!auth.startsWith('Bearer ')) return false;
  const token = auth.slice(7);
  const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${token}` },
  });
  return res.ok;
}

// PATCH /api/admin/guides/[slug] — 글 수정
// published_at 은 절대 수정하지 않음 (정렬 순서 유지)
export async function PATCH(request, { params }) {
  if (!(await verifyToken(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!SUPABASE_URL || !SERVICE_KEY) {
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
  }

  const { slug } = params;
  const body = await request.json();
  const { title, description, category, keyPoints, sources, sections, contentType, seriesId, seriesOrder, published } = body;

  // 1) guides 행의 id 조회
  const idRes = await fetch(
    `${SUPABASE_URL}/rest/v1/guides?slug=eq.${encodeURIComponent(slug)}&select=id`,
    { headers: getAdminHeaders() }
  );
  if (!idRes.ok) return NextResponse.json({ error: 'Guide not found' }, { status: 404 });
  const idRows = await idRes.json();
  if (!idRows.length) return NextResponse.json({ error: 'Guide not found' }, { status: 404 });
  const guideId = idRows[0].id;

  // 2) guides 테이블 업데이트 (published_at 제외, 전달된 필드만 반영)
  const today = new Date().toISOString().slice(0, 10);
  const patchData = { updated_at: today };
  if (title !== undefined) patchData.title = title;
  if (description !== undefined) patchData.description = description;
  if (category !== undefined) patchData.category = category;
  if (keyPoints !== undefined) patchData.key_points = keyPoints;
  if (sources !== undefined) patchData.sources = sources;
  if (contentType !== undefined) patchData.content_type = contentType;
  if (seriesId !== undefined) patchData.series_id = seriesId ?? null;
  if (seriesOrder !== undefined) patchData.series_order = seriesOrder ? Number(seriesOrder) : null;
  if (typeof published === 'boolean') patchData.published = published;

  const patchRes = await fetch(
    `${SUPABASE_URL}/rest/v1/guides?slug=eq.${encodeURIComponent(slug)}`,
    {
      method: 'PATCH',
      headers: getAdminHeaders(),
      body: JSON.stringify(patchData),
    }
  );
  if (!patchRes.ok) {
    const errText = await patchRes.text();
    return NextResponse.json({ error: errText }, { status: 500 });
  }

  // 3) 섹션이 전달된 경우에만 교체 (published 토글 시에는 섹션 건드리지 않음)
  if (sections !== undefined) {
    await fetch(
      `${SUPABASE_URL}/rest/v1/guide_sections?guide_id=eq.${guideId}`,
      { method: 'DELETE', headers: getAdminHeaders() }
    );

    // 4) 새 섹션 삽입
    if (sections.length > 0) {
      const rows = sections.map((s, i) => ({
        guide_id: guideId,
        order_index: i,
        title: s.title,
        paragraphs: s.paragraphs ?? [],
        bullets: s.bullets ?? null,
        callout: s.callout ?? null,
        section_table: s.table ?? null,
      }));
      const insertRes = await fetch(
        `${SUPABASE_URL}/rest/v1/guide_sections`,
        { method: 'POST', headers: getAdminHeaders(), body: JSON.stringify(rows) }
      );
      if (!insertRes.ok) {
        const errText = await insertRes.text();
        return NextResponse.json({ error: errText }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ ok: true });
}

// DELETE /api/admin/guides/[slug] — 글 삭제
export async function DELETE(request, { params }) {
  if (!(await verifyToken(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!SUPABASE_URL || !SERVICE_KEY) {
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
  }

  const { slug } = params;

  // 1) guide id 조회
  const idRes = await fetch(
    `${SUPABASE_URL}/rest/v1/guides?slug=eq.${encodeURIComponent(slug)}&select=id`,
    { headers: getAdminHeaders() }
  );
  const idRows = idRes.ok ? await idRes.json() : [];
  if (!idRows.length) return NextResponse.json({ error: 'Guide not found' }, { status: 404 });
  const guideId = idRows[0].id;

  // 2) 섹션 먼저 삭제
  await fetch(
    `${SUPABASE_URL}/rest/v1/guide_sections?guide_id=eq.${guideId}`,
    { method: 'DELETE', headers: getAdminHeaders() }
  );

  // 3) 가이드 삭제
  const delRes = await fetch(
    `${SUPABASE_URL}/rest/v1/guides?slug=eq.${encodeURIComponent(slug)}`,
    { method: 'DELETE', headers: getAdminHeaders() }
  );
  if (!delRes.ok) {
    const errText = await delRes.text();
    return NextResponse.json({ error: errText }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
