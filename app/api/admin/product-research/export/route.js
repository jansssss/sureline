import { NextResponse } from 'next/server';
import { isConfigured, verifyAdmin, listCandidates } from '@/lib/product-research/service.js';
import { candidatesToCsv, csvTemplate } from '@/lib/product-research/csv.js';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/product-research/export         → 전체 후보 CSV
 * GET /api/admin/product-research/export?template=1 → 빈 템플릿 CSV
 */
export async function GET(request) {
  const actor = await verifyAdmin(request);
  if (!actor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const isTemplate = new URL(request.url).searchParams.get('template') === '1';
  const today = new Date().toISOString().slice(0, 10);

  if (isTemplate) {
    return csvResponse(csvTemplate(), `product-research-template.csv`);
  }
  if (!isConfigured()) return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });

  try {
    const candidates = await listCandidates();
    return csvResponse(candidatesToCsv(candidates), `product-research-${today}.csv`);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

function csvResponse(text, filename) {
  return new NextResponse(text, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  });
}
