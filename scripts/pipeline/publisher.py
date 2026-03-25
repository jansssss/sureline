"""
Supabase REST API로 guides + guide_sections 테이블에 발행
- service role key 사용 (RLS 우회)
- fallback: lib/guides.js 파일에 직접 prepend (SUPABASE 설정 없을 때)
"""
from __future__ import annotations

import json
import re
from pathlib import Path
from urllib import request
from urllib.error import HTTPError

from .writer import Guide


# ─────────────────────────────────────────────
# Supabase 발행
# ─────────────────────────────────────────────

class SupabasePublisher:
    def __init__(self, supabase_url: str, service_role_key: str) -> None:
        self.base_url = supabase_url.rstrip("/")
        self._headers = {
            "apikey": service_role_key,
            "Authorization": f"Bearer {service_role_key}",
            "Content-Type": "application/json",
            "Prefer": "return=representation",
        }

    def fetch_published_titles(self, limit: int = 60) -> list[str]:
        url = f"{self.base_url}/rest/v1/guides?select=title&order=created_at.desc&limit={limit}"
        req = request.Request(url, headers=self._headers)
        try:
            with request.urlopen(req, timeout=10) as resp:
                rows = json.loads(resp.read().decode("utf-8"))
                return [row["title"] for row in rows]
        except Exception:
            return []

    def _slug_is_unique(self, slug: str) -> bool:
        url = f"{self.base_url}/rest/v1/guides?slug=eq.{slug}&select=id&limit=1"
        req = request.Request(url, headers=self._headers)
        with request.urlopen(req, timeout=10) as resp:
            rows = json.loads(resp.read().decode("utf-8"))
            return len(rows) == 0

    def _unique_slug(self, base_slug: str) -> str:
        slug = base_slug
        suffix = 1
        while not self._slug_is_unique(slug):
            slug = f"{base_slug}-{suffix}"
            suffix += 1
        return slug

    def publish(self, guide: Guide) -> str:
        slug = self._unique_slug(guide.slug)

        guide_row = {
            "slug": slug,
            "category": guide.category,
            "title": guide.title,
            "description": guide.description,
            "read_time": guide.read_time,
            "key_points": guide.key_points,
            "sources": guide.sources,
            "published_at": guide.published_at,
        }
        raw_body = json.dumps(guide_row).encode("utf-8")
        req = request.Request(
            f"{self.base_url}/rest/v1/guides",
            data=raw_body,
            headers=self._headers,
            method="POST",
        )
        try:
            with request.urlopen(req, timeout=15) as resp:
                result = json.loads(resp.read().decode("utf-8"))
                guide_record = result[0] if isinstance(result, list) else result
                guide_id = guide_record["id"]
        except HTTPError as e:
            body = e.read().decode("utf-8")
            raise RuntimeError(f"guides insert 실패 ({e.code}): {body}") from e

        sections_rows = []
        for idx, sec in enumerate(guide.sections):
            row = {
                "guide_id": guide_id,
                "order_index": idx + 1,
                "title": sec.title,
                "paragraphs": sec.paragraphs,
                "bullets": sec.bullets,
                "callout": sec.callout,
                "section_table": sec.table,
            }
            sections_rows.append(row)

        raw_body = json.dumps(sections_rows).encode("utf-8")
        req = request.Request(
            f"{self.base_url}/rest/v1/guide_sections",
            data=raw_body,
            headers={**self._headers, "Prefer": "return=minimal"},
            method="POST",
        )
        try:
            with request.urlopen(req, timeout=15) as resp:
                resp.read()
        except HTTPError as e:
            body = e.read().decode("utf-8")
            raise RuntimeError(f"guide_sections insert 실패 ({e.code}): {body}") from e

        return slug


# ─────────────────────────────────────────────
# 파일 발행 (Supabase 없을 때 fallback)
# ─────────────────────────────────────────────

class FilePublisher:
    def __init__(self, guides_js_path: Path) -> None:
        self.path = guides_js_path

    def fetch_published_titles(self, limit: int = 60) -> list[str]:
        text = self.path.read_text(encoding="utf-8")
        titles = re.findall(
            r'slug:\s*"[^"]+",\s*\n(?:\s+\w+:[^\n]+\n)*?\s+title:\s*"([^"]+)"',
            text,
        )
        return titles[:limit]

    def _slug_exists(self, slug: str) -> bool:
        text = self.path.read_text(encoding="utf-8")
        return f'slug: "{slug}"' in text

    def _unique_slug(self, base_slug: str) -> str:
        slug = base_slug
        suffix = 1
        while self._slug_exists(slug):
            slug = f"{base_slug}-{suffix}"
            suffix += 1
        return slug

    def publish(self, guide: Guide) -> str:
        slug = self._unique_slug(guide.slug)
        js_block = _guide_to_js(guide, slug)

        text = self.path.read_text(encoding="utf-8")
        marker = "const guides = ["
        idx = text.find(marker)
        if idx == -1:
            raise RuntimeError("guides.js에서 'const guides = [' 를 찾을 수 없습니다.")

        insert_pos = idx + len(marker)
        new_text = text[:insert_pos] + "\n" + js_block + "," + text[insert_pos:]
        self.path.write_text(new_text, encoding="utf-8")
        return slug


# ─────────────────────────────────────────────
# JS 직렬화 유틸 (FilePublisher용)
# ─────────────────────────────────────────────

def _js_str(value: str) -> str:
    escaped = value.replace("\\", "\\\\").replace('"', '\\"')
    return f'"{escaped}"'


def _guide_to_js(guide: Guide, slug: str) -> str:
    pad = "  "
    today = guide.published_at

    lines: list[str] = []
    lines.append(f"{pad}{{")
    lines.append(f'{pad}  slug: {_js_str(slug)},')
    lines.append(f'{pad}  category: {_js_str(guide.category)},')
    lines.append(f'{pad}  title: {_js_str(guide.title)},')
    lines.append(f'{pad}  description: {_js_str(guide.description)},')
    lines.append(f'{pad}  publishedAt: {_js_str(today)},')
    lines.append(f'{pad}  updatedAt: {_js_str(today)},')
    lines.append(f'{pad}  readTime: {_js_str(guide.read_time)},')

    source_items = []
    for s in guide.sources:
        source_items.append(
            f'{pad}    {{ name: {_js_str(s["name"])}, url: {_js_str(s["url"])}, accessedAt: {_js_str(s.get("accessedAt", today))} }}'
        )
    sources_str = "[\n" + ",\n".join(source_items) + f"\n{pad}  ]"
    lines.append(f'{pad}  sources: {sources_str},')

    kp_items = ",\n".join(f'{pad}    {_js_str(kp)}' for kp in guide.key_points)
    lines.append(f'{pad}  keyPoints: [\n{kp_items}\n{pad}  ],')

    section_strs = []
    for sec in guide.sections:
        sl: list[str] = []
        sl.append(f'{pad}    {{')
        sl.append(f'{pad}      title: {_js_str(sec.title)},')
        para_items = ",\n".join(f'{pad}        {_js_str(p)}' for p in sec.paragraphs)
        sl.append(f'{pad}      paragraphs: [\n{para_items}\n{pad}      ],')
        if sec.bullets:
            bullet_items = ",\n".join(f'{pad}        {_js_str(b)}' for b in sec.bullets)
            sl.append(f'{pad}      bullets: [\n{bullet_items}\n{pad}      ],')
        if sec.callout:
            sl.append(f'{pad}      callout: {_js_str(sec.callout)},')
        if sec.table:
            headers_str = ", ".join(_js_str(h) for h in sec.table["headers"])
            row_strs = []
            for row in sec.table["rows"]:
                cells_str = ", ".join(_js_str(c) for c in row)
                row_strs.append(f'{pad}          [{cells_str}]')
            rows_block = ",\n".join(row_strs)
            sl.append(
                f'{pad}      table: {{\n'
                f'{pad}        headers: [{headers_str}],\n'
                f'{pad}        rows: [\n{rows_block}\n{pad}        ]\n'
                f'{pad}      }},'
            )
        sl.append(f'{pad}    }}')
        section_strs.append("\n".join(sl))

    sections_block = ",\n".join(section_strs)
    lines.append(f'{pad}  sections: [\n{sections_block}\n{pad}  ]')
    lines.append(f'{pad}}}')
    return "\n".join(lines)
