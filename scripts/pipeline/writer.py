"""
OpenAI API로 sureline.kr 스타일 직장인 통증/피로 가이드 글 생성
- 모델: gpt-4o-mini (기본) — env OPENAI_MODEL 로 교체 가능
- 출력: lib/guides.js 포맷에 맞는 구조화 JSON
"""
from __future__ import annotations

import hashlib
import json
import re
from dataclasses import dataclass, field
from datetime import date
from pathlib import Path
from urllib import request
from urllib.error import HTTPError


@dataclass
class GuideSection:
    title: str
    paragraphs: list[str]
    bullets: list[str] | None = None
    callout: str | None = None
    table: dict | None = None  # { headers: [...], rows: [[...], ...] }


@dataclass
class Guide:
    topic: str
    category: str
    slug_en: str
    title: str
    description: str
    read_time: str
    key_points: list[str]
    sources: list[dict]        # [{ name, url, accessedAt }]
    sections: list[GuideSection]

    @property
    def slug(self) -> str:
        today = date.today().strftime("%Y%m%d")
        safe = re.sub(r"[^a-z0-9]+", "-", self.slug_en.lower()).strip("-")
        slug_part = safe[:50] if safe else ""
        if slug_part:
            return f"{today}-{slug_part}"
        cat = re.sub(r"[^a-z]", "", self.category.lower()) or "health"
        h = hashlib.md5(self.title.encode()).hexdigest()[:8]
        return f"{today}-{cat}-{h}"

    @property
    def published_at(self) -> str:
        return date.today().strftime("%Y-%m-%d")


class GuideWriter:
    OPENAI_API_URL = "https://api.openai.com/v1/chat/completions"

    def __init__(self, api_key: str, model: str, prompt_path: Path) -> None:
        self.api_key = api_key
        self.model = model
        self.prompt_text = prompt_path.read_text(encoding="utf-8")

    def write(self, research: dict) -> Guide:
        """Perplexity 리서치 결과를 받아 Guide 반환"""
        topic = research["topic"]
        category = research.get("category", "피로 회복")

        key_data_lines = "\n".join(
            f"  - {d['fact']} ({d['source']})"
            for d in research.get("key_data", [])
        )
        research_block = (
            f"━━━ 리서치 자료 (반드시 수치/출처 인용) ━━━\n"
            f"주제: {topic}\n"
            f"카테고리: {category}\n"
            f"배경: {research.get('background', '')}\n"
            f"핵심 데이터:\n{key_data_lines}\n"
            f"직장인 영향: {research.get('impact_on_workers', '')}\n"
            f"관련 키워드: {', '.join(research.get('related_keywords', []))}\n"
        )

        json_format = (
            '{\n'
            '  "slug_en": "english-slug-kebab-case (예: office-neck-pain-stretching-guide)",\n'
            '  "category": "카테고리 (리서치 결과 그대로)",\n'
            '  "title": "가이드 제목 (40~60자, 핵심 내용 포함)",\n'
            '  "description": "한 줄 설명 (80~120자, 독자가 얻을 핵심 정보)",\n'
            '  "readTime": "X분",\n'
            '  "keyPoints": [\n'
            '    "핵심 요약 포인트 1 (독자가 얻는 가장 중요한 인사이트)",\n'
            '    "핵심 요약 포인트 2",\n'
            '    "핵심 요약 포인트 3"\n'
            '  ],\n'
            '  "sources": [\n'
            '    {"name": "출처명", "url": "https://...", "accessedAt": "YYYY-MM-DD"},\n'
            '    ...\n'
            '  ],\n'
            '  "sections": [\n'
            '    {\n'
            '      "title": "섹션 제목",\n'
            '      "paragraphs": ["문단1", "문단2"],\n'
            '      "bullets": ["항목1", "항목2"],\n'
            '      "callout": "강조 문구 (선택, 없으면 생략)",\n'
            '      "table": {\n'
            '        "headers": ["컬럼1", "컬럼2"],\n'
            '        "rows": [["값1", "값2"]]\n'
            '      }\n'
            '    },\n'
            '    ...\n'
            '  ]\n'
            '}'
        )

        user_message = (
            f"{self.prompt_text}\n\n"
            f"{research_block}\n\n"
            f"위 리서치 자료를 바탕으로 sureline.kr 직장인 건강 가이드를 작성하세요. "
            f"리서치의 수치와 출처를 글에 직접 인용하세요.\n\n"
            f"아래 JSON 형식으로만 응답하세요. JSON 외 다른 텍스트는 출력하지 마세요:\n"
            f"{json_format}"
        )

        print(f"[WRITER] OpenAI API 호출 중... 모델: {self.model}", flush=True)
        result = _post_json(
            self.OPENAI_API_URL,
            headers={
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
            },
            payload={
                "model": self.model,
                "max_completion_tokens": 6000,
                "temperature": 0.3,
                "messages": [{"role": "user", "content": user_message}],
            },
            timeout=180,
        )

        content_text = result["choices"][0]["message"]["content"]
        usage = result.get("usage", {})
        print(
            f"[WRITER] 완료! 토큰={usage.get('prompt_tokens', 0)}→{usage.get('completion_tokens', 0)}",
            flush=True,
        )

        try:
            data = json.loads(_extract_json(content_text))
        except json.JSONDecodeError as e:
            snippet = content_text[:500].replace("\n", "\\n")
            print(f"[WRITER] JSON 파싱 실패: {e}", flush=True)
            print(f"[WRITER] 응답 앞 500자: {snippet}", flush=True)
            raise RuntimeError(f"OpenAI JSON 파싱 실패: {e}") from e

        today_str = date.today().strftime("%Y-%m-%d")
        sources = []
        for s in data.get("sources", []):
            sources.append({
                "name": s.get("name", ""),
                "url": s.get("url", ""),
                "accessedAt": s.get("accessedAt", today_str),
            })
        # research에서 받은 sources도 병합
        for s in research.get("sources", []):
            if not any(x["url"] == s.get("url", "") for x in sources):
                sources.append({
                    "name": s.get("name", ""),
                    "url": s.get("url", ""),
                    "accessedAt": today_str,
                })

        sections = []
        for s in data.get("sections", []):
            sec = GuideSection(
                title=s.get("title", ""),
                paragraphs=s.get("paragraphs", []),
                bullets=s.get("bullets") or None,
                callout=s.get("callout") or None,
                table=s.get("table") or None,
            )
            sections.append(sec)

        print(f"[WRITER] 섹션 {len(sections)}개 생성됨, 제목: {data['title']}", flush=True)

        return Guide(
            topic=topic,
            category=data.get("category", category),
            slug_en=data.get("slug_en", ""),
            title=data["title"],
            description=data.get("description", ""),
            read_time=data.get("readTime", "5분"),
            key_points=data.get("keyPoints", []),
            sources=sources,
            sections=sections,
        )


# ─────────────────────────────────────────────
# 유틸리티
# ─────────────────────────────────────────────

def _extract_json(text: str) -> str:
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
                return _fix_json_strings(text[start: i + 1])
    return _fix_json_strings(text[start:])


def _fix_json_strings(text: str) -> str:
    result: list[str] = []
    in_string = False
    i = 0
    while i < len(text):
        ch = text[i]
        if ch == "\\" and in_string:
            result.append(ch)
            i += 1
            if i < len(text):
                result.append(text[i])
        elif ch == '"':
            in_string = not in_string
            result.append(ch)
        elif in_string and ch == "\n":
            result.append("\\n")
        elif in_string and ch == "\r":
            result.append("\\r")
        elif in_string and ch == "\t":
            result.append("\\t")
        else:
            result.append(ch)
        i += 1
    return "".join(result)


def _post_json(url: str, headers: dict, payload: dict, timeout: int = 60) -> dict:
    raw_body = json.dumps(payload).encode("utf-8")
    req = request.Request(url, data=raw_body, headers=headers, method="POST")
    try:
        with request.urlopen(req, timeout=timeout) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except HTTPError as e:
        body = e.read().decode("utf-8")
        raise RuntimeError(f"HTTP {e.code} {e.reason}: {body}") from e
