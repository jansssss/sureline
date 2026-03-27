"""
프롬프트 자동 진화

흐름:
  1. Supabase prompt_versions 최신 버전 조회
  2. 없으면 scripts/prompts/pain_guide_writer.txt 읽어 version=1 초기화
  3. 분석 결과 + 현재 프롬프트 → OpenAI gpt-4o-mini
  4. 개선된 프롬프트를 prompt_versions 테이블에 insert
  5. 새 버전 id 반환
  6. 진화 조건 미충족 → 현재 버전 id만 반환 (프롬프트 수정 없음)
"""
from __future__ import annotations

import json
from pathlib import Path
from urllib import request
from urllib.error import HTTPError

_OPENAI_API_URL = "https://api.openai.com/v1/chat/completions"
_EVOLUTION_MODEL = "gpt-4o-mini"


class PromptEvolver:
    def __init__(
        self,
        supabase_url: str,
        service_role_key: str,
        openai_api_key: str,
        prompt_path: Path,
    ) -> None:
        self.base_url = supabase_url.rstrip("/")
        self.openai_api_key = openai_api_key
        self.prompt_path = prompt_path
        self._headers = {
            "apikey": service_role_key,
            "Authorization": f"Bearer {service_role_key}",
            "Content-Type": "application/json",
            "Prefer": "return=representation",
        }

    # ──────────────────────────────────────────────────
    # Public API
    # ──────────────────────────────────────────────────

    def evolve(self, analysis: dict, dry_run: bool = False) -> int | None:
        """
        진화 조건 충족 시 새 프롬프트 버전 생성.
        반환: 현재(또는 새) prompt_version.id
        """
        current_version = self._fetch_latest_version()

        # 버전 0이면 최초 초기화
        if current_version is None:
            current_version = self._seed_initial_version(dry_run)
            if current_version is None:
                return None

        current_id = current_version["id"]
        current_content = current_version["content"]
        current_ver_num = current_version["version"]

        if not analysis.get("can_evolve", False):
            print(
                f"[EVOLVER] 진화 조건 미충족 (unique_slugs={analysis.get('unique_slugs', 0)}, "
                f"data_days={analysis.get('data_days', 0)}) — 현재 버전 {current_ver_num} 유지",
                flush=True,
            )
            return current_id

        print(f"[EVOLVER] 진화 조건 충족 — 프롬프트 v{current_ver_num} → v{current_ver_num+1} 생성 중...", flush=True)

        improved_prompt, reason = self._call_openai(current_content, analysis)

        if dry_run:
            print("[EVOLVER][DRY-RUN] 새 프롬프트 미저장 (--dry-run)", flush=True)
            print(f"[EVOLVER][DRY-RUN] 변경 이유: {reason[:200]}", flush=True)
            return current_id

        new_id = self._insert_new_version(
            version=current_ver_num + 1,
            content=improved_prompt,
            reason=reason,
        )
        print(f"[EVOLVER] 새 버전 id={new_id} (v{current_ver_num+1}) 저장 완료", flush=True)
        return new_id

    # ──────────────────────────────────────────────────
    # Supabase 조회 / 저장
    # ──────────────────────────────────────────────────

    def _fetch_latest_version(self) -> dict | None:
        url = (
            f"{self.base_url}/rest/v1/prompt_versions"
            "?select=id,version,content"
            "&order=version.desc&limit=1"
        )
        req = request.Request(url, headers=self._headers)
        try:
            with request.urlopen(req, timeout=10) as resp:
                rows = json.loads(resp.read().decode("utf-8"))
                return rows[0] if rows else None
        except Exception as exc:
            print(f"[EVOLVER] prompt_versions 조회 실패: {exc}", flush=True)
            return None

    def _seed_initial_version(self, dry_run: bool) -> dict | None:
        """prompt_versions 테이블이 비어있을 때 파일에서 읽어 v1 삽입."""
        print("[EVOLVER] 최초 실행 — pain_guide_writer.txt 를 version=1 로 초기화", flush=True)
        try:
            content = self.prompt_path.read_text(encoding="utf-8")
        except Exception as exc:
            print(f"[EVOLVER] 프롬프트 파일 읽기 실패: {exc}", flush=True)
            return None

        if dry_run:
            print("[EVOLVER][DRY-RUN] 초기 버전 미저장 (--dry-run)", flush=True)
            return {"id": None, "version": 1, "content": content}

        new_id = self._insert_new_version(version=1, content=content, reason="최초 초기화")
        return {"id": new_id, "version": 1, "content": content}

    def _insert_new_version(self, version: int, content: str, reason: str) -> int:
        row = {"version": version, "content": content, "reason": reason}
        raw_body = json.dumps(row).encode("utf-8")
        req = request.Request(
            f"{self.base_url}/rest/v1/prompt_versions",
            data=raw_body,
            headers=self._headers,
            method="POST",
        )
        try:
            with request.urlopen(req, timeout=15) as resp:
                result = json.loads(resp.read().decode("utf-8"))
                record = result[0] if isinstance(result, list) else result
                return record["id"]
        except HTTPError as e:
            body = e.read().decode("utf-8")
            raise RuntimeError(f"prompt_versions insert 실패 ({e.code}): {body}") from e

    # ──────────────────────────────────────────────────
    # OpenAI 호출 (writer.py의 _post_json 패턴 동일)
    # ──────────────────────────────────────────────────

    def _call_openai(self, current_prompt: str, analysis: dict) -> tuple[str, str]:
        """(improved_prompt, reason) 반환"""
        analysis_summary = _format_analysis_for_prompt(analysis)

        user_message = (
            "당신은 SEO 최적화 콘텐츠 전략가입니다.\n\n"
            "아래는 sureline.kr 직장인 건강 가이드 사이트의 최근 Google Search Console 성과 분석입니다.\n\n"
            f"{analysis_summary}\n\n"
            "현재 가이드 작성 프롬프트:\n"
            "---\n"
            f"{current_prompt}\n"
            "---\n\n"
            "위 성과 데이터를 바탕으로 클릭률(CTR)과 사용자 참여도를 높일 수 있도록 "
            "프롬프트를 개선하세요.\n\n"
            "다음 JSON 형식으로만 응답하세요 (JSON 외 텍스트 금지):\n"
            "{\n"
            '  "improved_prompt": "개선된 프롬프트 전문 (기존 구조 유지, 성과 기반 지침 추가)",\n'
            '  "reason": "변경 이유 요약 (2~4문장, 데이터 근거 포함)"\n'
            "}"
        )

        payload = {
            "model": _EVOLUTION_MODEL,
            "max_completion_tokens": 4000,
            "temperature": 0.4,
            "messages": [{"role": "user", "content": user_message}],
        }

        print(f"[EVOLVER] OpenAI {_EVOLUTION_MODEL} 호출 중...", flush=True)
        result = _post_json(
            _OPENAI_API_URL,
            headers={
                "Authorization": f"Bearer {self.openai_api_key}",
                "Content-Type": "application/json",
            },
            payload=payload,
            timeout=120,
        )

        content_text = result["choices"][0]["message"]["content"]

        try:
            data = json.loads(_extract_json(content_text))
            improved = data.get("improved_prompt", current_prompt)
            reason = data.get("reason", "분석 기반 자동 개선")
        except Exception:
            print("[EVOLVER] JSON 파싱 실패 — 현재 프롬프트 유지", flush=True)
            improved = current_prompt
            reason = "JSON 파싱 실패 — 변경 없음"

        return improved, reason


# ──────────────────────────────────────────────────
# 유틸리티
# ──────────────────────────────────────────────────

def _format_analysis_for_prompt(analysis: dict) -> str:
    lines = [
        f"- 총 기사 수: {analysis.get('unique_slugs', 0)}개",
        f"- 데이터 기간: {analysis.get('data_days', 0)}일",
        f"- 평균 CTR: {analysis.get('avg_ctr', 0.0):.4f}",
        f"- 평균 클릭수: {analysis.get('avg_clicks', 0.0):.1f}",
        f"- 평균 게재 순위: {analysis.get('avg_position', 0.0):.1f}",
    ]

    cat_perf = analysis.get("category_performance", [])
    if cat_perf:
        lines.append("\n카테고리별 성과 (클릭수 기준):")
        for item in cat_perf[:5]:
            lines.append(
                f"  - {item['category']}: avg_clicks={item['avg_clicks']:.1f}, "
                f"avg_ctr={item['avg_ctr']:.4f}, count={item['count']}"
            )

    title_pats = analysis.get("title_patterns", {})
    if title_pats:
        sorted_pats = sorted(title_pats.items(), key=lambda x: x[1]["avg_ctr"], reverse=True)
        lines.append("\n제목 패턴별 평균 CTR (높은 순):")
        for pat, stats in sorted_pats[:6]:
            lines.append(
                f"  - {pat}: avg_ctr={stats['avg_ctr']:.4f}, count={stats['count']}"
            )

    top = analysis.get("top_articles", [])
    if top:
        lines.append("\n상위 글 (클릭수 기준):")
        for item in top[:3]:
            lines.append(
                f"  - [{item['category']}] {item['title'][:40]}: "
                f"avg_ctr={item['avg_ctr']:.4f}"
            )

    bottom = analysis.get("bottom_articles", [])
    if bottom:
        lines.append("\n하위 글 (클릭수 기준):")
        for item in bottom[:3]:
            lines.append(
                f"  - [{item['category']}] {item['title'][:40]}: "
                f"avg_ctr={item['avg_ctr']:.4f}"
            )

    cta = analysis.get("cta_stats", {})
    lines.append(f"\nCTA 클릭률: {cta.get('overall_click_rate', 0.0):.6f}")

    return "\n".join(lines)


def _extract_json(text: str) -> str:
    import re
    text = re.sub(r"^```(?:json)?\s*", "", text.strip())
    text = re.sub(r"\s*```$", "", text.strip())
    start = text.find("{")
    if start == -1:
        return text
    depth = 0
    for i, ch in enumerate(text[start:], start):
        if ch == "{":
            depth += 1
        elif ch == "}":
            depth -= 1
            if depth == 0:
                return text[start: i + 1]
    return text[start:]


def _post_json(url: str, headers: dict, payload: dict, timeout: int = 60) -> dict:
    raw_body = json.dumps(payload).encode("utf-8")
    req = request.Request(url, data=raw_body, headers=headers, method="POST")
    try:
        with request.urlopen(req, timeout=timeout) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except HTTPError as e:
        body = e.read().decode("utf-8")
        raise RuntimeError(f"HTTP {e.code} {e.reason}: {body}") from e
