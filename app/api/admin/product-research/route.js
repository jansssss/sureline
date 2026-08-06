import { NextResponse } from 'next/server';
import {
  isConfigured, verifyAdmin, listCandidates, createCandidate, getScoreSettings,
} from '@/lib/product-research/service.js';
import { listProviderStatus } from '@/lib/product-research/providers.js';
import { validateCandidate } from '@/lib/product-research/validation.js';
import { applyDerivedFields } from '@/lib/product-research/calc.js';

export const dynamic = 'force-dynamic';

// GET /api/admin/product-research — 후보 전체 + 평가기준 + 프로바이더 연결 상태
export async function GET(request) {
  const actor = await verifyAdmin(request);
  if (!actor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!isConfigured()) return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });

  try {
    const [candidates, settings] = await Promise.all([listCandidates(), getScoreSettings()]);
    return NextResponse.json({
      candidates,
      settings,
      providers: listProviderStatus(),
    });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// POST /api/admin/product-research — 후보 추가
export async function POST(request) {
  const actor = await verifyAdmin(request);
  if (!actor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!isConfigured()) return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });

  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Bad request' }, { status: 400 });

  const { errors, warnings } = validateCandidate(applyDerivedFields(body, { respectManualTotal: false }));
  if (errors.length) return NextResponse.json({ error: '입력값 오류', errors }, { status: 422 });

  try {
    const candidate = await createCandidate(body, actor);
    return NextResponse.json({ candidate, warnings });
  } catch (e) {
    const duplicate = /uq_prc_name_keyword|duplicate key/i.test(e.message || '');
    return NextResponse.json(
      { error: duplicate ? '같은 제품명 + 대표 키워드 후보가 이미 있습니다.' : e.message },
      { status: duplicate ? 409 : 500 }
    );
  }
}
