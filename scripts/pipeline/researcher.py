"""
Perplexity sonar-pro로 직장인 통증/피로 분야 인기 이슈 조사
- 1회 호출로 주제 선정 + 핵심 데이터 수집
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


class PerplexityResearcher:
    API_URL = "https://api.perplexity.ai/chat/completions"

    def __init__(self, api_key: str) -> None:
        self.api_key = api_key

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

        payload = {
            "model": "sonar-pro",
            "messages": [
                {
                    "role": "system",
                    "content": (
                        "당신은 대한민국 직업 건강·근골격계 질환·피로 관리 분야 전문 리서처입니다. "
                        "사무직·직장인의 목, 어깨, 허리, 손목 통증, 눈 피로, 만성 피로, 수면 장애 등 "
                        "직업 관련 건강 문제를 전문적으로 다룹니다. "
                        "오늘 네이버·구글·의료 커뮤니티·직장인 커뮤니티에서 가장 화제가 되는 이슈를 파악하고, "
                        "해당 주제에 대한 심층 데이터를 수집합니다. "
                        "모든 수치는 실제 출처(기관명+연도+발표처)와 함께 제공합니다."
                    ),
                },
                {
                    "role": "user",
                    "content": (
                        f"오늘({today}) 아래 우선순위에 따라 이슈 1개를 선정하고, "
                        "아래 형식의 JSON으로만 응답하세요. JSON 외 다른 텍스트는 출력하지 마세요.\n\n"
                        "【주제 선정 우선순위】\n"
                        "1순위 — 목·어깨·허리 통증: 사무직에서 흔한 근골격계 문제, 예방·완화법\n"
                        "2순위 — 눈 피로·수면: 모니터 작업으로 인한 디지털 눈 피로, 수면의 질 저하\n"
                        "3순위 — 자세·스트레칭: 거북목, 굽은 어깨 등 자세 문제와 교정법\n"
                        "4순위 — 피로 회복·영양: 만성 피로, 번아웃, 영양 보충 전략\n"
                        "※ 직장인이 검색할 만큼 실용적이고 구체적인 주제를 선택한다.\n\n"
                        "{\n"
                        '  "topic": "이슈 제목 (한국어, 50자 이내)",\n'
                        f'  "category": "{CATEGORY_STR} 중 1개",\n'
                        '  "background": "이슈 배경 설명 (200자 이상, 왜 지금 화제인지, 관련 통계·연구 포함)",\n'
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
                        "- key_data는 최소 5개 이상 (통계 수치 또는 연구 결과 필수)\n"
                        "- 대한정형외과학회, 대한안과학회, 고용노동부, 근로복지공단, 국제 의학 저널 자료 우선\n"
                        "- 추측이나 불확실한 내용 금지\n"
                        "- sources는 실제 접근 가능한 URL 포함 (없으면 기관 메인 URL)"
                        f"{exclude_block}"
                    ),
                },
            ],
            "max_tokens": 2000,
            "temperature": 0.2,
        }

        raw_body = json.dumps(payload).encode("utf-8")
        req = request.Request(
            self.API_URL,
            data=raw_body,
            headers={
                "Authorization": f"Bearer {self.api_key}",
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
            raise RuntimeError(f"Perplexity HTTP {e.code}: {body}") from e
