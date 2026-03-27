"""
Google Search Console 검색 성과 데이터 수집 → article_performance 테이블 upsert

의존성: google-api-python-client, google-auth, google-auth-httplib2
  pip install -r scripts/requirements.txt
"""
from __future__ import annotations

import json
import re
from datetime import date, timedelta
from urllib import request
from urllib.error import HTTPError

try:
    from google.oauth2.credentials import Credentials
    from google.auth.transport.requests import Request
    from google_auth_oauthlib.flow import InstalledAppFlow
    import googleapiclient.discovery as discovery
except ImportError:
    raise ImportError(
        "[GSC] google-api-python-client, google-auth-oauthlib 가 설치되어 있지 않습니다.\n"
        "  pip install -r scripts/requirements.txt  을 먼저 실행하세요."
    )

# GSC API 스코프
_SCOPES = ["https://www.googleapis.com/auth/webmasters.readonly"]

# /guides/{slug} 패턴
_SLUG_RE = re.compile(r"/guides/([^/?#]+)")


class GSCCollector:
    """GSC Search Analytics → article_performance upsert"""

    def __init__(
        self,
        client_secret_path: str,
        token_path: str,
        site_url: str,
        supabase_url: str,
        service_role_key: str,
        days: int = 28,
    ) -> None:
        self.site_url = site_url
        self.supabase_url = supabase_url.rstrip("/")
        self.days = days
        self._headers = {
            "apikey": service_role_key,
            "Authorization": f"Bearer {service_role_key}",
            "Content-Type": "application/json",
            "Prefer": "resolution=merge-duplicates",
        }

        credentials = self._get_credentials(client_secret_path, token_path)
        print(f"[GSC] 인증 계정: {getattr(credentials, 'client_id', 'unknown')}", flush=True)
        print(f"[GSC] site_url: {site_url!r}", flush=True)
        self._service = discovery.build(
            "searchconsole", "v1", credentials=credentials, cache_discovery=False
        )

    def _get_credentials(self, client_secret_path: str, token_path: str) -> Credentials:
        """토큰 파일에서 credentials 로드, 없으면 OAuth2 브라우저 인증 실행."""
        from pathlib import Path
        creds = None
        token_file = Path(token_path)

        if token_file.exists():
            creds = Credentials.from_authorized_user_file(token_path, _SCOPES)

        if not creds or not creds.valid:
            if creds and creds.expired and creds.refresh_token:
                creds.refresh(Request())
            else:
                flow = InstalledAppFlow.from_client_secrets_file(client_secret_path, _SCOPES)
                creds = flow.run_local_server(port=0)
            token_file.parent.mkdir(parents=True, exist_ok=True)
            token_file.write_text(creds.to_json(), encoding="utf-8")

        return creds

    # ──────────────────────────────────────────────────
    # Public API
    # ──────────────────────────────────────────────────

    def collect_and_save(self) -> int:
        """GSC 데이터를 수집하고 Supabase에 저장. 저장된 행 수 반환."""
        rows = self._fetch_gsc_rows()
        if not rows:
            print("[GSC] 수집된 데이터 없음", flush=True)
            return 0

        records = self._build_records(rows)
        if not records:
            print("[GSC] /guides/ URL 없음 — 저장 건너뜀", flush=True)
            return 0

        saved = self._upsert(records)
        print(f"[GSC] {saved}건 upsert 완료", flush=True)
        return saved

    # ──────────────────────────────────────────────────
    # Internal
    # ──────────────────────────────────────────────────

    def _fetch_gsc_rows(self) -> list[dict]:
        end_date = date.today() - timedelta(days=3)  # GSC 반영 지연 고려
        start_date = end_date - timedelta(days=self.days - 1)

        body = {
            "startDate": start_date.isoformat(),
            "endDate": end_date.isoformat(),
            "dimensions": ["page", "date"],
            "rowLimit": 25000,
        }

        print(
            f"[GSC] {start_date} ~ {end_date} 데이터 조회 중... (site={self.site_url})",
            flush=True,
        )

        try:
            response = (
                self._service.searchanalytics()
                .query(siteUrl=self.site_url, body=body)
                .execute()
            )
        except Exception as exc:
            print(f"[GSC] API 호출 실패: {exc}", flush=True)
            return []

        rows = response.get("rows", [])
        print(f"[GSC] {len(rows)}행 수신", flush=True)
        return rows

    def _build_records(self, rows: list[dict]) -> list[dict]:
        """GSC row → article_performance record 변환 (slug 추출)"""
        records: list[dict] = []
        for row in rows:
            keys = row.get("keys", [])
            if len(keys) < 2:
                continue
            page_url, row_date = keys[0], keys[1]

            m = _SLUG_RE.search(page_url)
            if not m:
                continue
            slug = m.group(1)

            records.append({
                "guide_slug": slug,
                "date": row_date,
                "clicks": int(row.get("clicks", 0)),
                "impressions": int(row.get("impressions", 0)),
                "ctr": float(row.get("ctr", 0.0)),
                "position": float(row.get("position", 0.0)),
                # cta_clicks 는 건드리지 않음 (increment_cta_clicks RPC 전용)
            })
        return records

    def _upsert(self, records: list[dict]) -> int:
        """Supabase REST API onConflict=guide_slug,date upsert"""
        url = (
            f"{self.supabase_url}/rest/v1/article_performance"
            "?on_conflict=guide_slug%2Cdate"
        )
        raw_body = json.dumps(records).encode("utf-8")
        req = request.Request(
            url,
            data=raw_body,
            headers={
                **self._headers,
                "Prefer": "resolution=merge-duplicates,return=minimal",
            },
            method="POST",
        )
        try:
            with request.urlopen(req, timeout=30) as resp:
                resp.read()
            return len(records)
        except HTTPError as e:
            body = e.read().decode("utf-8")
            raise RuntimeError(f"article_performance upsert 실패 ({e.code}): {body}") from e
