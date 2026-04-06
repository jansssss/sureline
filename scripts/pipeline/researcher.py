"""
Tavily Search + OpenAI로 직장인 통증/피로 분야 인기 이슈 조사
- Tavily로 실시간 검색 → OpenAI로 JSON 포맷
"""
from __future__ import annotations

import json
from urllib import request
from urllib.error import HTTPError
from datetime import date


CATEGORIES = [
    "목·어깨 통증",
    "허리 통증",
    "눈 피로",
    "자세 교정",
    "스트레칭",
    "피로 회복",
    "수면 개선",
    "손목·팔꿈치 통증",
]

CATEGORY_STR = " | ".join(CATEGORIES)


class TavilyResearcher:
    TAVILY_URL = "https://api.tavily.com/search"
    OPENAI_URL = "https://api.openai.com/v1/chat/completions"

    def __init__(self, tavily_api_key: str, openai_api_key: str, openai_model: str = "gpt-4o-mini") -> None:
        self.tavily_api_key = tavily_api_key
        self.openai_api_key = openai_api_key
        self.openai_model = openai_model

    def _tavily_search(self, query: str) -> dict:
        payload = {
            "api_key": self.tavily_api_key,
            "query": query,
            "search_depth": "advanced",
            "include_answer": True,
            "max_results": 5,
        }
        raw_body = json.dumps(payload).encode("utf-8")
        req = request.Request(
            self.TAVILY_URL,
            data=raw_body,
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        try:
            with request.urlopen(req, timeout=60) as resp:
                return json.loads(resp.read().decode("utf-8"))
        except HTTPError as e:
            body = e.read().decode("utf-8")
            raise RuntimeError(f"Tavily HTTP {e.code}: {body}") from e

    def research_today(self, published_topics: list[str] | None = None) -> dict:
        """
        오늘의 직장인 통증/피로 관련 인기 이슈 1개 선정 + 심층 리서치
        published_topics: 이미 발행된 제목 목록 (중복 회피용)
        Returns: { topic, category, background, key_data, impact_on_workers, related_keywords }
        """
        today = date.today().strftime("%Y년 %m월 %d일")

        exclude_block = ""
        if published_topics:
            titles = "\n".join(f"- {t}" for t in published_topics)
            exclude_block = (
                "\n\n【이미 발행된 주제 — 반드시 제외】\n"
                f"{titles}\n"
                "위 주제와 동일하거나 매우 유사한 주제는 선택하지 마세요. "
                "카테고리가 같더라도 다른 각도나 세부 주제를 선택해야 합니다."
            )

        # Step 1: Tavily 실시간 검색
        query = f"직장인 사무직 통증 피로 건강 최신 연구 이슈 {today}"
        search_results = self._tavily_search(query)
        answer = search_results.get("answer", "")
        snippets = "\n".join(
            f"- [{r['title']}]({r['url']}): {r['content'][:300]}"
            for r in search_results.get("results", [])
        )
        context = f"[검색 요약]\n{answer}\n\n[주요 기사]\n{snippets}"

        # Step 2: OpenAI로 JSON 포맷
        payload = {
            "model": self.openai_model,
            "messages": [
                {
                    "role": "system",
                    "content": (
                        "당신은 대한민국 직업 건강·근골격계 질환·피로 관리 분야 전문 리서처입니다. "
                        "주어진 검색 결과를 분석하여 정확한 JSON 형식으로 응답합니다. "
                        "【절대 금지】 산재, 노무, 노동법, 근로기준법, 직장 내 괴롭힘 법적 처리 주제는 선택하지 않습니다."
                    ),
                },
                {
                    "role": "user",
                    "content": (
                        f"오늘({today}) 아래 검색 결과를 바탕으로 직장인 통증·피로 이슈를 1개 선정하고, "
                        "아래 형식의 JSON으로만 응답하세요. JSON 외 다른 텍스트는 출력하지 마세요.\n\n"
                        "【주제 선정 우선순위】\n"
                        "1순위 — 목·어깨·허리 통증: 사무직에서 흔한 근골격계 문제\n"
                        "2순위 — 눈 피로·수면: 디지털 눈 피로, 수면의 질 저하\n"
                        "3순위 — 자세·스트레칭: 거북목, 굽은 어깨 등 자세 문제\n"
                        "4순위 — 피로 회복·영양: 만성 피로, 번아웃\n\n"
                        f"[검색 결과]\n{context}\n\n"
                        "{\n"
                        '  "topic": "이슈 제목 (한국어, 50자 이내)",\n'
                        f'  "category": "{CATEGORY_STR} 중 1개",\n'
                        '  "background": "이슈 배경 설명 (200자 이상)",\n'
                        '  "key_data": [\n'
                        '    {"fact": "구체적 수치나 연구 결과", "source": "출처 기관명 또는 저널, 연도"},\n'
                        '    ...\n'
                        '  ],\n'
                        '  "impact_on_workers": "직장인에게 미치는 실질적 영향 (200자 이상)",\n'
                        '  "related_keywords": ["키워드1", "키워드2", "키워드3"],\n'
                        '  "sources": [\n'
                        '    {"name": "출처명", "url": "https://..."},\n'
                        '    ...\n'
                        '  ]\n'
                        "}\n\n"
                        "요구사항:\n"
                        "- key_data는 최소 3개 이상 (통계 수치 또는 연구 결과 필수)\n"
                        "- 추측이나 불확실한 내용 금지"
                        f"{exclude_block}"
                    ),
                },
            ],
            "max_tokens": 2000,
            "temperature": 0.2,
        }

        raw_body = json.dumps(payload).encode("utf-8")
        req = request.Request(
            self.OPENAI_URL,
            data=raw_body,
            headers={
                "Authorization": f"Bearer {self.openai_api_key}",
                "Content-Type": "application/json",
            },
            method="POST",
        )
        try:
            with request.urlopen(req, timeout=60) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                content = data["choices"][0]["message"]["content"].strip()
                if content.startswith("```"):
                    content = content.split("```")[1]
                    if content.startswith("json"):
                        content = content[4:]
                return json.loads(content.strip())
        except HTTPError as e:
            body = e.read().decode("utf-8")
            raise RuntimeError(f"OpenAI HTTP {e.code}: {body}") from e
