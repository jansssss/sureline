import { NextResponse } from 'next/server';
import {
  isConfigured, verifyAdmin, getScoreSettings, updateScoreSetting, writeAudit,
} from '@/lib/product-research/service.js';

export const dynamic = 'force-dynamic';

// GET /api/admin/product-research/settings — 평가기준 조회
export async function GET(request) {
  const actor = await verifyAdmin(request);
  if (!actor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!isConfigured()) return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });

  try {
    return NextResponse.json({ settings: await getScoreSettings() });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// PUT /api/admin/product-research/settings — 배점·구간 저장
// body: { settings: [{ criterion_key, weight, scoring_rules, is_active }] }
export async function PUT(request) {
  const actor = await verifyAdmin(request);
  if (!actor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!isConfigured()) return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });

  const body = await request.json().catch(() => null);
  const incoming = body?.settings;
  if (!Array.isArray(incoming) || incoming.length === 0) {
    return NextResponse.json({ error: 'settings 배열이 필요합니다.' }, { status: 400 });
  }

  for (const s of incoming) {
    if (!s.criterion_key) return NextResponse.json({ error: 'criterion_key 누락' }, { status: 400 });
    const w = Number(s.weight);
    if (Number.isNaN(w) || w < 0) {
      return NextResponse.json({ error: `${s.criterion_key}: 배점은 0 이상의 숫자여야 합니다.` }, { status: 422 });
    }
    if (s.scoring_rules && typeof s.scoring_rules !== 'object') {
      return NextResponse.json({ error: `${s.criterion_key}: scoring_rules 형식 오류` }, { status: 422 });
    }
  }

  const totalWeight = incoming
    .filter((s) => s.is_active !== false)
    .reduce((acc, s) => acc + Number(s.weight), 0);

  try {
    for (const s of incoming) {
      const patch = { weight: Number(s.weight) };
      if (s.scoring_rules !== undefined) patch.scoring_rules = s.scoring_rules;
      if (s.is_active !== undefined) patch.is_active = Boolean(s.is_active);
      await updateScoreSetting(s.criterion_key, patch, actor);
    }
    await writeAudit(null, 'update', actor, { score_settings_updated: incoming.map((s) => s.criterion_key) });

    return NextResponse.json({
      settings: await getScoreSettings(),
      totalWeight,
      warning: totalWeight !== 100 ? `활성 배점 합계가 ${totalWeight}점입니다. (권장 100점)` : null,
    });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
