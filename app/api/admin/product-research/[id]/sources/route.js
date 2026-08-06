import { NextResponse } from 'next/server';
import {
  isConfigured, verifyAdmin, listSources, addSource, deleteSource,
} from '@/lib/product-research/service.js';
import { isValidUrl } from '@/lib/product-research/validation.js';

export const dynamic = 'force-dynamic';

// GET /api/admin/product-research/[id]/sources
export async function GET(request, { params }) {
  const actor = await verifyAdmin(request);
  if (!actor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!isConfigured()) return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });

  try {
    return NextResponse.json({ sources: await listSources(params.id) });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// POST /api/admin/product-research/[id]/sources — 출처 추가
export async function POST(request, { params }) {
  const actor = await verifyAdmin(request);
  if (!actor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!isConfigured()) return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });

  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  if (!body.source_kind) {
    return NextResponse.json({ error: '데이터 성격(공식 수치/추정치 등)은 필수입니다.' }, { status: 422 });
  }
  if (!isValidUrl(body.source_url) || !isValidUrl(body.evidence_image_url)) {
    return NextResponse.json({ error: 'URL 형식이 올바르지 않습니다.' }, { status: 422 });
  }

  try {
    return NextResponse.json({ source: await addSource(params.id, body, actor) });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// DELETE /api/admin/product-research/[id]/sources?sourceId=123
export async function DELETE(request) {
  const actor = await verifyAdmin(request);
  if (!actor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!isConfigured()) return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });

  const sourceId = new URL(request.url).searchParams.get('sourceId');
  if (!sourceId) return NextResponse.json({ error: 'sourceId 필요' }, { status: 400 });

  try {
    await deleteSource(sourceId);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
