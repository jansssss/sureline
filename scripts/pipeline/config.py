from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True)
class AppConfig:
    project_root: Path
    prompt_path: Path
    guides_js_path: Path
    openai_api_key: str | None
    openai_model: str
    perplexity_api_key: str | None
    supabase_url: str | None
    supabase_service_role_key: str | None
    guides_per_run: int
    x_api_key: str | None
    x_api_secret: str | None
    x_access_token: str | None
    x_access_token_secret: str | None
    gsc_client_secret_path: str | None
    gsc_token_path: str | None
    gsc_site_url: str | None


def _load_dotenv(dotenv_path: Path) -> None:
    if not dotenv_path.exists():
        return
    for raw_line in dotenv_path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))


def load_config() -> AppConfig:
    project_root = Path(__file__).resolve().parent.parent.parent
    _load_dotenv(project_root / ".env.local")
    _load_dotenv(project_root / ".env")

    scripts_root = project_root / "scripts"
    return AppConfig(
        project_root=project_root,
        prompt_path=scripts_root / "prompts" / "pain_guide_writer.txt",
        guides_js_path=project_root / "lib" / "guides.js",
        openai_api_key=os.getenv("OPENAI_API_KEY") or None,
        openai_model=os.getenv("OPENAI_MODEL", "gpt-5.4-mini"),
        perplexity_api_key=os.getenv("PERPLEXITY_API_KEY") or None,
        supabase_url=os.getenv("SUPABASE_URL") or None,
        supabase_service_role_key=os.getenv("SUPABASE_SERVICE_ROLE_KEY") or None,
        guides_per_run=int(os.getenv("GUIDES_PER_RUN", "1")),
        x_api_key=os.getenv("X_API_KEY") or None,
        x_api_secret=os.getenv("X_API_SECRET") or None,
        x_access_token=os.getenv("X_ACCESS_TOKEN") or None,
        x_access_token_secret=os.getenv("X_ACCESS_TOKEN_SECRET") or None,
        gsc_client_secret_path=os.getenv("GSC_CLIENT_SECRET_PATH") or str(scripts_root / "credentials" / "client_secret.json"),
        gsc_token_path=os.getenv("GSC_TOKEN_PATH") or str(scripts_root / "credentials" / "token.json"),
        gsc_site_url=os.getenv("GSC_SITE_URL") or None,
    )
