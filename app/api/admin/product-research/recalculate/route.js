import { NextResponse } from 'next/server';
import { isConfigured, verifyAdmin, recalculateAll } from '@/lib/product-research/service.js';

export const dynamic = 'force-dynamic';

// POST /api/admin/product-research/recalculate — 전체 후보 점수 다시 계산
export async function POST(request) {
  const actor = await verifyAdmin(request);
  if (!actor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!isConfigured()) return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });

  try {
    return NextResponse.json(await recalculateAll(actor));
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
