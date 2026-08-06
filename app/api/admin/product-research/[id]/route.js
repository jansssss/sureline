import { NextResponse } from 'next/server';
import {
  isConfigured, verifyAdmin, getCandidate, updateCandidate, deleteCandidate,
  listHistory, listSources, getScoreSettings, listAudit,
} from '@/lib/product-research/service.js';
import { validateCandidate } from '@/lib/product-research/validation.js';
import { applyDerivedFields } from '@/lib/product-research/calc.js';

export const dynamic = 'force-dynamic';

// GET /api/admin/product-research/[id] — 상세 (후보 + 이력 + 출처 + 평가기준)
export async function GET(request, { params }) {
  const actor = await verifyAdmin(request);
  if (!actor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!isConfigured()) return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });

  try {
    const candidate = await getCandidate(params.id);
    if (!candidate) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const [history, sources, settings, audit] = await Promise.all([
      listHistory(params.id),
      listSources(params.id),
      getScoreSettings(),
      listAudit(params.id, 30),
    ]);
    return NextResponse.json({ candidate, history, sources, settings, audit });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// PATCH /api/admin/product-research/[id] — 후보 수정
export async function PATCH(request, { params }) {
  const actor = await verifyAdmin(request);
  if (!actor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!isConfigured()) return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });

  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Bad request' }, { status: 400 });

  try {
    const existing = await getCandidate(params.id);
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const merged = applyDerivedFields({ ...existing, ...body }, { respectManualTotal: false });
    const { errors, warnings } = validateCandidate(merged);
    if (errors.length) return NextResponse.json({ error: '입력값 오류', errors }, { status: 422 });

    const candidate = await updateCandidate(params.id, body, actor);
    return NextResponse.json({ candidate, warnings });
  } catch (e) {
    const duplicate = /uq_prc_name_keyword|duplicate key/i.test(e.message || '');
    return NextResponse.json(
      { error: duplicate ? '같은 제품명 + 대표 키워드 후보가 이미 있습니다.' : e.message },
      { status: duplicate ? 409 : 500 }
    );
  }
}

// DELETE /api/admin/product-research/[id] — 후보 삭제
export async function DELETE(request, { params }) {
  const actor = await verifyAdmin(request);
  if (!actor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!isConfigured()) return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });

  try {
    const ok = await deleteCandidate(params.id, actor);
    if (!ok) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
