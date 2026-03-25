"""
X(Twitter) API v2 + OAuth 1.0a 자동 스레드 게시
- 표준 라이브러리만 사용 (외부 패키지 불필요)
- 스레드 구조: 훅 트윗 → 핵심 요약 → 링크
"""
from __future__ import annotations

import base64
import hashlib
import hmac
import json
import time
import uuid
from urllib import parse, request
from urllib.error import HTTPError

from .writer import Guide

SITE_URL = "https://sureline.kr"
API_URL = "https://api.twitter.com/2/tweets"


class XPublisher:
    def __init__(
        self,
        api_key: str,
        api_secret: str,
        access_token: str,
        access_token_secret: str,
    ) -> None:
        self.api_key = api_key
        self.api_secret = api_secret
        self.access_token = access_token
        self.access_token_secret = access_token_secret

    def _oauth_header(self, method: str, url: str) -> str:
        oauth_params = {
            "oauth_consumer_key": self.api_key,
            "oauth_nonce": uuid.uuid4().hex,
            "oauth_signature_method": "HMAC-SHA1",
            "oauth_timestamp": str(int(time.time())),
            "oauth_token": self.access_token,
            "oauth_version": "1.0",
        }

        sorted_params = sorted(oauth_params.items())
        param_str = "&".join(
            f"{parse.quote(k, safe='')}={parse.quote(v, safe='')}"
            for k, v in sorted_params
        )
        base_str = "&".join([
            method.upper(),
            parse.quote(url, safe=""),
            parse.quote(param_str, safe=""),
        ])
        signing_key = (
            f"{parse.quote(self.api_secret, safe='')}"
            f"&{parse.quote(self.access_token_secret, safe='')}"
        )
        sig = base64.b64encode(
            hmac.new(signing_key.encode(), base_str.encode(), hashlib.sha1).digest()
        ).decode()

        oauth_params["oauth_signature"] = sig
        return "OAuth " + ", ".join(
            f'{parse.quote(k, safe="")}="{parse.quote(v, safe="")}"'
            for k, v in sorted(oauth_params.items())
        )

    def _post_tweet(self, text: str, reply_to_id: str | None = None) -> str:
        body: dict = {"text": text}
        if reply_to_id:
            body["reply"] = {"in_reply_to_tweet_id": reply_to_id}

        raw = json.dumps(body).encode("utf-8")
        req = request.Request(
            API_URL,
            data=raw,
            headers={
                "Authorization": self._oauth_header("POST", API_URL),
                "Content-Type": "application/json",
            },
            method="POST",
        )
        try:
            with request.urlopen(req, timeout=15) as resp:
                result = json.loads(resp.read().decode("utf-8"))
                return result["data"]["id"]
        except HTTPError as e:
            raise RuntimeError(f"X API {e.code}: {e.read().decode()}") from e

    def post_thread(self, guide: Guide, slug: str) -> str:
        """글 기반 X 스레드 게시. 첫 트윗 ID 반환"""
        url = f"{SITE_URL}/guides/{slug}"

        tweet1_id = self._post_tweet(_build_hook(guide))
        tweet2_id = self._post_tweet(_build_summary(guide), reply_to_id=tweet1_id)
        self._post_tweet(_build_link(url), reply_to_id=tweet2_id)

        return tweet1_id


# ─────────────────────────────────────────────
# 트윗 내용 생성
# ─────────────────────────────────────────────

def _truncate(text: str, limit: int = 270) -> str:
    return text if len(text) <= limit else text[:limit - 1] + "…"


def _build_hook(guide: Guide) -> str:
    kp = guide.key_points[0] if guide.key_points else guide.description
    text = "\n".join([
        f"【{guide.category}】",
        "",
        guide.title,
        "",
        kp,
        "",
        "↓ 스레드에서 이어집니다",
    ])
    return _truncate(text)


def _build_summary(guide: Guide) -> str:
    lines = ["핵심 요약"]
    for i, p in enumerate(guide.key_points[:3], 1):
        lines.append(f"{i}. {p}")
    return _truncate("\n".join(lines))


def _build_link(url: str) -> str:
    return f"전체 내용 + 실천 루틴은 아래에 정리했습니다\n\n{url}"
