import { NextResponse } from 'next/server';
import {
  isConfigured, verifyAdmin, getCandidate, updateCandidate, saveSnapshot, addSource,
} from '@/lib/product-research/service.js';
import { NaverKeywordProvider, NotConnectedError } from '@/lib/product-research/providers.js';

export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/product-research/[id]/fetch
 * 대표 키워드로 네이버 검색광고 지표를 가져와 후보에 반영한다.
 * 저장 → 점수 재계산 → 이력 스냅샷 → 출처 기록까지 한 번에 처리한다.
 */
export async function POST(request, { params }) {
  const actor = await verifyAdmin(request);
  if (!actor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!isConfigured()) return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });

  try {
    const existing = await getCandidate(params.id);
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const raw = await NaverKeywordProvider.fetchKeywordMetrics(existing.primary_keyword);
    const metrics = NaverKeywordProvider.normalizeMetrics(raw);
    const today = new Date().toISOString().slice(0, 10);

    // 자동 수집 대상 컬럼만 덮어쓴다. 관리자가 손으로 넣은 다른 값은 건드리지 않는다.
    const patch = {
      pc_monthly_search: metrics.pc_monthly_search,
      mobile_monthly_search: metrics.mobile_monthly_search,
      total_monthly_search: null,           // PC+모바일 자동 합계로 되돌린다
      average_click_count: metrics.average_click_count,
      average_click_rate: metrics.average_click_rate,
      search_competition: metrics.search_competition,
      ad_competition: metrics.ad_competition,
      search_source_kind: '공식 수치',
      last_checked_at: today,
    };
    if (existing.status === '조사 전') patch.status = '조사 중';

    const candidate = await updateCandidate(params.id, patch, actor);

    await saveSnapshot(params.id, {
      recorded_at: today,
      total_score: candidate.total_score,
      memo: '네이버 검색광고 자동 수집',
    }, actor);

    await addSource(params.id, {
      data_type: 'search',
      source_name: '네이버 검색광고 키워드 도구',
      source_kind: '공식 수치',
      source_url: 'https://searchad.naver.com',
      checked_at: today,
      memo: raw.censored
        ? '자동 수집. 검색량이 10 미만("< 10")으로 표시된 항목은 9로 기록했습니다.'
        : `자동 수집 (연관 키워드 ${raw.relatedCount}개 중 정확 일치 행 사용)`,
    }, actor);

    return NextResponse.json({
      candidate,
      censored: raw.censored,
      applied: {
        pc_monthly_search: patch.pc_monthly_search,
        mobile_monthly_search: patch.mobile_monthly_search,
        total_monthly_search: candidate.total_monthly_search,
        search_competition: patch.search_competition,
      },
    });
  } catch (e) {
    if (e instanceof NotConnectedError) {
      return NextResponse.json({ error: e.message }, { status: 409 });
    }
    return NextResponse.json({ error: e.message }, { status: 502 });
  }
}
