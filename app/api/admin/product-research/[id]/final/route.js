import { NextResponse } from 'next/server';
import {
  isConfigured, verifyAdmin, getCandidate, setFinalCandidate, clearFinalCandidate,
  getScoreSettings, listCandidates,
} from '@/lib/product-research/service.js';
import { calculateScore } from '@/lib/product-research/scoring.js';
import { checkFinalCandidateReadiness } from '@/lib/product-research/validation.js';

export const dynamic = 'force-dynamic';

// GET /api/admin/product-research/[id]/final — 지정 전 확인 정보
export async function GET(request, { params }) {
  const actor = await verifyAdmin(request);
  if (!actor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!isConfigured()) return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });

  try {
    const [candidate, settings, all] = await Promise.all([
      getCandidate(params.id), getScoreSettings(), listCandidates(),
    ]);
    if (!candidate) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const scoreResult = calculateScore(candidate, settings);
    const ranked = [...all].sort((a, b) => (Number(b.total_score) || 0) - (Number(a.total_score) || 0));
    const rank = ranked.findIndex((c) => Number(c.id) === Number(params.id)) + 1;
    const currentFinal = all.find((c) => c.is_final_candidate) ?? null;

    return NextResponse.json({
      candidate,
      scoreResult,
      rank,
      totalCandidates: all.length,
      currentFinal: currentFinal ? { id: currentFinal.id, product_name: currentFinal.product_name } : null,
      warnings: checkFinalCandidateReadiness(candidate, scoreResult),
    });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// POST /api/admin/product-research/[id]/final — 최종 후보 지정 (기존 지정은 자동 해제)
export async function POST(request, { params }) {
  const actor = await verifyAdmin(request);
  if (!actor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!isConfigured()) return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });

  try {
    const candidate = await setFinalCandidate(params.id, actor);
    if (!candidate) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ candidate });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// DELETE /api/admin/product-research/[id]/final — 최종 후보 해제
export async function DELETE(request, { params }) {
  const actor = await verifyAdmin(request);
  if (!actor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!isConfigured()) return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });

  try {
    return NextResponse.json({ candidate: await clearFinalCandidate(params.id, actor) });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
