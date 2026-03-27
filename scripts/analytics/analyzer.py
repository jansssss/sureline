"""
Supabase article_performance + guides 데이터 분석

반환값 dict 구조:
  {
    "total_articles": int,
    "data_days": int,
    "unique_slugs": int,
    "avg_ctr": float,
    "avg_clicks": float,
    "avg_position": float,
    "title_patterns": {pattern_name: {"avg_ctr": float, "avg_clicks": float, "count": int}},
    "category_performance": [{"category": str, "avg_clicks": float, "avg_ctr": float, "avg_position": float, "count": int}],
    "top_articles": [{"slug": str, "title": str, "category": str, "avg_clicks": float, "avg_ctr": float}],
    "bottom_articles": [...],
    "cta_stats": {"total_cta_clicks": int, "overall_click_rate": float},
    "can_evolve": bool,  # unique_slugs >= 14 AND data_days >= 7
  }
"""
from __future__ import annotations

import json
import re
from urllib import request
from urllib.error import HTTPError


# 제목 패턴 분류 (정규식)
_TITLE_PATTERNS: list[tuple[str, re.Pattern]] = [
    ("왜~", re.compile(r"왜")),
    ("하는법", re.compile(r"하는\s*법")),
    ("원인", re.compile(r"원인")),
    ("방법", re.compile(r"방법")),
    ("예방", re.compile(r"예방")),
    ("숫자포함", re.compile(r"\d+")),
    ("증상", re.compile(r"증상")),
    ("해결", re.compile(r"해결")),
    ("추천", re.compile(r"추천")),
    ("가이드", re.compile(r"가이드")),
]


def _classify_title(title: str) -> str:
    for name, pat in _TITLE_PATTERNS:
        if pat.search(title):
            return name
    return "기타"


class PerformanceAnalyzer:
    def __init__(self, supabase_url: str, service_role_key: str) -> None:
        self.base_url = supabase_url.rstrip("/")
        self._headers = {
            "apikey": service_role_key,
            "Authorization": f"Bearer {service_role_key}",
            "Content-Type": "application/json",
        }

    # ──────────────────────────────────────────────────
    # Public API
    # ──────────────────────────────────────────────────

    def analyze(self) -> dict:
        """전체 분석 실행. 데이터 부족 시 빈 결과 반환 (시스템 중단 없음)."""
        try:
            perf_rows = self._fetch_performance()
            guide_rows = self._fetch_guides()
        except Exception as exc:
            print(f"[ANALYZER] 데이터 조회 실패: {exc}", flush=True)
            return _empty_result()

        if not perf_rows:
            print("[ANALYZER] article_performance 데이터 없음 — 빈 결과 반환", flush=True)
            return _empty_result()

        return self._compute(perf_rows, guide_rows)

    # ──────────────────────────────────────────────────
    # Data Fetching
    # ──────────────────────────────────────────────────

    def _fetch_performance(self) -> list[dict]:
        url = (
            f"{self.base_url}/rest/v1/article_performance"
            "?select=guide_slug,date,clicks,impressions,ctr,position,cta_clicks"
            "&order=date.desc&limit=10000"
        )
        req = request.Request(url, headers=self._headers)
        try:
            with request.urlopen(req, timeout=15) as resp:
                return json.loads(resp.read().decode("utf-8"))
        except HTTPError as e:
            body = e.read().decode("utf-8")
            raise RuntimeError(f"article_performance 조회 실패 ({e.code}): {body}") from e

    def _fetch_guides(self) -> list[dict]:
        url = (
            f"{self.base_url}/rest/v1/guides"
            "?select=slug,title,category"
            "&order=created_at.desc&limit=500"
        )
        req = request.Request(url, headers=self._headers)
        try:
            with request.urlopen(req, timeout=15) as resp:
                return json.loads(resp.read().decode("utf-8"))
        except HTTPError:
            return []

    # ──────────────────────────────────────────────────
    # Computation
    # ──────────────────────────────────────────────────

    def _compute(self, perf_rows: list[dict], guide_rows: list[dict]) -> dict:
        # guide 메타 매핑 {slug: {title, category}}
        guide_meta: dict[str, dict] = {g["slug"]: g for g in guide_rows}

        # slug 기준 집계
        slug_stats: dict[str, dict] = {}
        all_dates: set[str] = set()

        for row in perf_rows:
            slug = row["guide_slug"]
            all_dates.add(row["date"])
            if slug not in slug_stats:
                slug_stats[slug] = {
                    "clicks": 0, "impressions": 0,
                    "ctr_sum": 0.0, "position_sum": 0.0,
                    "cta_clicks": 0, "count": 0,
                }
            s = slug_stats[slug]
            s["clicks"] += int(row.get("clicks", 0))
            s["impressions"] += int(row.get("impressions", 0))
            s["ctr_sum"] += float(row.get("ctr", 0.0))
            s["position_sum"] += float(row.get("position", 0.0))
            s["cta_clicks"] += int(row.get("cta_clicks", 0))
            s["count"] += 1

        unique_slugs = len(slug_stats)
        data_days = len(all_dates)

        # 전체 평균
        total_clicks = sum(s["clicks"] for s in slug_stats.values())
        total_impressions = sum(s["impressions"] for s in slug_stats.values())
        total_cta_clicks = sum(s["cta_clicks"] for s in slug_stats.values())
        avg_ctr = (total_clicks / total_impressions) if total_impressions > 0 else 0.0
        avg_clicks = total_clicks / unique_slugs if unique_slugs else 0.0
        all_positions = [
            s["position_sum"] / s["count"] for s in slug_stats.values() if s["count"] > 0
        ]
        avg_position = sum(all_positions) / len(all_positions) if all_positions else 0.0

        # 슬러그별 성과 요약 리스트
        slug_summary: list[dict] = []
        for slug, s in slug_stats.items():
            meta = guide_meta.get(slug, {})
            avg_slug_ctr = s["ctr_sum"] / s["count"] if s["count"] > 0 else 0.0
            avg_slug_pos = s["position_sum"] / s["count"] if s["count"] > 0 else 0.0
            slug_summary.append({
                "slug": slug,
                "title": meta.get("title", slug),
                "category": meta.get("category", "미분류"),
                "avg_clicks": s["clicks"] / s["count"] if s["count"] > 0 else 0.0,
                "total_clicks": s["clicks"],
                "avg_ctr": avg_slug_ctr,
                "avg_position": avg_slug_pos,
                "cta_clicks": s["cta_clicks"],
                "impressions": s["impressions"],
            })

        slug_summary.sort(key=lambda x: x["total_clicks"], reverse=True)

        # 상위/하위 10%
        n10 = max(1, unique_slugs // 10)
        top_articles = slug_summary[:n10]
        bottom_articles = slug_summary[-n10:] if len(slug_summary) >= n10 * 2 else []

        # 제목 패턴별 분석
        pattern_buckets: dict[str, list[float]] = {}
        for item in slug_summary:
            pat = _classify_title(item["title"])
            if pat not in pattern_buckets:
                pattern_buckets[pat] = []
            pattern_buckets[pat].append(item["avg_ctr"])

        title_patterns = {}
        for pat, ctrs in pattern_buckets.items():
            title_patterns[pat] = {
                "avg_ctr": sum(ctrs) / len(ctrs) if ctrs else 0.0,
                "count": len(ctrs),
            }

        # 카테고리별 분석
        cat_buckets: dict[str, list[dict]] = {}
        for item in slug_summary:
            cat = item["category"]
            cat_buckets.setdefault(cat, []).append(item)

        category_performance = []
        for cat, items in cat_buckets.items():
            category_performance.append({
                "category": cat,
                "avg_clicks": sum(i["avg_clicks"] for i in items) / len(items),
                "avg_ctr": sum(i["avg_ctr"] for i in items) / len(items),
                "avg_position": sum(i["avg_position"] for i in items) / len(items),
                "count": len(items),
            })
        category_performance.sort(key=lambda x: x["avg_clicks"], reverse=True)

        # CTA 클릭률
        overall_cta_rate = total_cta_clicks / max(total_impressions, 1)

        can_evolve = unique_slugs >= 14 and data_days >= 7

        print(
            f"[ANALYZER] 완료: slug={unique_slugs}, days={data_days}, "
            f"avg_ctr={avg_ctr:.4f}, can_evolve={can_evolve}",
            flush=True,
        )

        return {
            "total_articles": len(perf_rows),
            "data_days": data_days,
            "unique_slugs": unique_slugs,
            "avg_ctr": avg_ctr,
            "avg_clicks": avg_clicks,
            "avg_position": avg_position,
            "title_patterns": title_patterns,
            "category_performance": category_performance,
            "top_articles": top_articles,
            "bottom_articles": bottom_articles,
            "cta_stats": {
                "total_cta_clicks": total_cta_clicks,
                "overall_click_rate": overall_cta_rate,
            },
            "can_evolve": can_evolve,
        }


def _empty_result() -> dict:
    return {
        "total_articles": 0,
        "data_days": 0,
        "unique_slugs": 0,
        "avg_ctr": 0.0,
        "avg_clicks": 0.0,
        "avg_position": 0.0,
        "title_patterns": {},
        "category_performance": [],
        "top_articles": [],
        "bottom_articles": [],
        "cta_stats": {"total_cta_clicks": 0, "overall_click_rate": 0.0},
        "can_evolve": False,
    }
