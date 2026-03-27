"""
진화 리포트를 evolution_reports 테이블에 저장

저장 JSON 구조:
  {
    "summary": {"total_articles": N, "avg_ctr": X, "top_category": "..."},
    "title_patterns": {"왜~": {"avg_ctr": X, "count": N}, ...},
    "category_performance": [...],
    "top_articles": [...],
    "bottom_articles": [...],
    "cta_stats": {"overall_click_rate": X},
    "prompt_changed": bool,
    "next_strategy": "..."
  }
"""
from __future__ import annotations

import json
from urllib import request
from urllib.error import HTTPError


class EvolutionReporter:
    def __init__(self, supabase_url: str, service_role_key: str) -> None:
        self.base_url = supabase_url.rstrip("/")
        self._headers = {
            "apikey": service_role_key,
            "Authorization": f"Bearer {service_role_key}",
            "Content-Type": "application/json",
            "Prefer": "return=representation",
        }

    def save_report(
        self,
        analysis: dict,
        prompt_version_id: int | None,
        evolved: bool,
        dry_run: bool = False,
    ) -> int | None:
        """
        리포트 빌드 후 Supabase 저장.
        dry_run=True 이면 저장 없이 출력만.
        반환: evolution_reports.id (dry_run 이면 None)
        """
        report_data = self._build_report(analysis, evolved)

        if dry_run:
            print("[REPORTER][DRY-RUN] 리포트 (미저장):", flush=True)
            print(json.dumps(report_data, ensure_ascii=False, indent=2), flush=True)
            return None

        row = {
            "report_data": report_data,
            "prompt_version_id": prompt_version_id,
            "evolved": evolved,
        }
        raw_body = json.dumps(row).encode("utf-8")
        req = request.Request(
            f"{self.base_url}/rest/v1/evolution_reports",
            data=raw_body,
            headers=self._headers,
            method="POST",
        )
        try:
            with request.urlopen(req, timeout=15) as resp:
                result = json.loads(resp.read().decode("utf-8"))
                record = result[0] if isinstance(result, list) else result
                report_id = record["id"]
            print(f"[REPORTER] 리포트 저장 완료 id={report_id}", flush=True)
            return report_id
        except HTTPError as e:
            body = e.read().decode("utf-8")
            raise RuntimeError(f"evolution_reports insert 실패 ({e.code}): {body}") from e

    # ──────────────────────────────────────────────────
    # Report Building
    # ──────────────────────────────────────────────────

    def _build_report(self, analysis: dict, evolved: bool) -> dict:
        cat_perf = analysis.get("category_performance", [])
        top_category = cat_perf[0]["category"] if cat_perf else "없음"

        summary = {
            "total_articles": analysis.get("unique_slugs", 0),
            "data_days": analysis.get("data_days", 0),
            "avg_ctr": round(analysis.get("avg_ctr", 0.0), 6),
            "avg_clicks": round(analysis.get("avg_clicks", 0.0), 2),
            "avg_position": round(analysis.get("avg_position", 0.0), 2),
            "top_category": top_category,
        }

        next_strategy = self._derive_next_strategy(analysis, evolved)

        return {
            "summary": summary,
            "title_patterns": analysis.get("title_patterns", {}),
            "category_performance": cat_perf,
            "top_articles": analysis.get("top_articles", []),
            "bottom_articles": analysis.get("bottom_articles", []),
            "cta_stats": analysis.get("cta_stats", {}),
            "prompt_changed": evolved,
            "next_strategy": next_strategy,
        }

    def _derive_next_strategy(self, analysis: dict, evolved: bool) -> str:
        lines: list[str] = []

        # 진화 조건 미충족
        if not analysis.get("can_evolve", False):
            lines.append(
                f"데이터 축적 중 (slug={analysis.get('unique_slugs', 0)}/14, "
                f"days={analysis.get('data_days', 0)}/7). "
                "진화 조건 충족까지 계속 데이터 수집."
            )
            return " ".join(lines)

        # 가장 높은 CTR 제목 패턴
        pats = analysis.get("title_patterns", {})
        if pats:
            best_pat = max(pats.items(), key=lambda x: x[1]["avg_ctr"])
            lines.append(f"'{best_pat[0]}' 패턴 제목이 CTR {best_pat[1]['avg_ctr']:.4f}으로 가장 높음 → 해당 패턴 활용 권장.")

        # 하위 카테고리
        cat_perf = analysis.get("category_performance", [])
        if len(cat_perf) >= 2:
            worst_cat = cat_perf[-1]
            lines.append(
                f"'{worst_cat['category']}' 카테고리 성과 저조(avg_ctr={worst_cat['avg_ctr']:.4f}) "
                "→ 해당 카테고리 글 제목·내용 전략 재검토."
            )

        if evolved:
            lines.append("이번 주 프롬프트 자동 업데이트 완료.")
        else:
            lines.append("프롬프트 변경 없음 (조건 미충족 또는 dry-run).")

        return " ".join(lines)
