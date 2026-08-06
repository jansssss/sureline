import { NextResponse } from 'next/server';
import {
  isConfigured, verifyAdmin, listHistory, saveSnapshot,
} from '@/lib/product-research/service.js';

export const dynamic = 'force-dynamic';

// GET /api/admin/product-research/[id]/history — 날짜별 이력
export async function GET(request, { params }) {
  const actor = await verifyAdmin(request);
  if (!actor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!isConfigured()) return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });

  try {
    return NextResponse.json({ history: await listHistory(params.id) });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// POST /api/admin/product-research/[id]/history — 데이터 기록 추가
export async function POST(request, { params }) {
  const actor = await verifyAdmin(request);
  if (!actor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!isConfigured()) return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });

  const body = await request.json().catch(() => ({}));
  try {
    const record = await saveSnapshot(params.id, body ?? {}, actor);
    if (!record) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ record });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
