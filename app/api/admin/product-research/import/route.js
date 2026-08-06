import { NextResponse } from 'next/server';
import {
  isConfigured, verifyAdmin, listCandidates, createCandidate, addSource, writeAudit,
} from '@/lib/product-research/service.js';
import { previewCsv } from '@/lib/product-research/csv.js';

export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/product-research/import
 * body: { csv: string, commit?: boolean, rowNumbers?: number[] }
 *   commit=false (기본) → 미리보기만 반환
 *   commit=true         → rowNumbers 로 지정된 정상 행만 실제 등록
 */
export async function POST(request) {
  const actor = await verifyAdmin(request);
  if (!actor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!isConfigured()) return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });

  const body = await request.json().catch(() => null);
  if (!body?.csv) return NextResponse.json({ error: 'csv 내용이 필요합니다.' }, { status: 400 });

  try {
    const existing = await listCandidates();
    const preview = previewCsv(body.csv, existing);

    if (preview.fatal) return NextResponse.json({ error: preview.fatal, preview }, { status: 422 });
    if (!body.commit) return NextResponse.json({ preview });

    const wanted = Array.isArray(body.rowNumbers) ? new Set(body.rowNumbers) : null;
    const targets = preview.rows.filter((r) => r.valid && (!wanted || wanted.has(r.rowNumber)));

    const created = [];
    const failed = [];

    for (const row of targets) {
      try {
        const candidate = await createCandidate({ ...row.data, status: '조사 중' }, actor);
        created.push({ rowNumber: row.rowNumber, id: candidate?.id, product_name: candidate?.product_name });

        const { source_name, source_url, checked_at } = row.sourceMeta || {};
        if (candidate && (source_name || source_url || checked_at)) {
          await addSource(candidate.id, {
            data_type: 'search',
            source_name: source_name ?? null,
            source_kind: '관리자 수동 추정',
            source_url: source_url ?? null,
            checked_at: checked_at ?? null,
            memo: 'CSV 가져오기로 등록됨',
          }, actor);
        }
      } catch (e) {
        const duplicate = /uq_prc_name_keyword|duplicate key/i.test(e.message || '');
        failed.push({
          rowNumber: row.rowNumber,
          product_name: row.data.product_name,
          message: duplicate ? '이미 등록된 제품명 + 대표 키워드입니다.' : e.message,
        });
      }
    }

    await writeAudit(null, 'csv_import', actor, { created: created.length, failed: failed.length });
    return NextResponse.json({ created, failed, preview });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
