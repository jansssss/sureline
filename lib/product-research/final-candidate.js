/**
 * 최종 후보 단일 유지 규칙 (순수 함수)
 *
 * 새 제품을 최종 후보로 지정하면
 *  - 기존 최종 후보는 해제되고 상태가 '분석 완료'로 바뀐다
 *  - 대상 제품만 is_final_candidate=true, 상태 '최종 후보'가 된다
 *
 * 서비스 레이어는 이 함수가 만든 패치 목록을 그대로 DB에 적용한다.
 */

export function resolveFinalCandidateChange(candidates, targetId) {
  const id = Number(targetId);
  const target = (candidates || []).find((c) => Number(c.id) === id);
  if (!target) return { target: null, releases: [], promote: null };

  const releases = (candidates || [])
    .filter((c) => c.is_final_candidate && Number(c.id) !== id)
    .map((c) => ({ id: c.id, patch: { is_final_candidate: false, status: '분석 완료' } }));

  return {
    target,
    releases,
    promote: { id: target.id, patch: { is_final_candidate: true, status: '최종 후보' } },
  };
}

/** 패치를 적용한 결과 목록 (테스트·미리보기용) */
export function applyFinalCandidateChange(candidates, targetId) {
  const { releases, promote } = resolveFinalCandidateChange(candidates, targetId);
  if (!promote) return candidates;
  const byId = new Map([...releases, promote].map((p) => [Number(p.id), p.patch]));
  return candidates.map((c) => (byId.has(Number(c.id)) ? { ...c, ...byId.get(Number(c.id)) } : c));
}

/** 최종 후보가 정확히 하나(또는 0개)인지 확인 */
export function countFinalCandidates(candidates) {
  return (candidates || []).filter((c) => c.is_final_candidate).length;
}
