"""
sureline.kr 자기진화 에이전트 파이프라인

순서:
  1. config 로드 + 환경변수 검증
  2. GSC 데이터 수집
  3. 데이터 분석
  4. 프롬프트 진화 (조건 충족시)
  5. 리포트 생성

Usage:
  python -m scripts.evolve             # 전체 실행
  python -m scripts.evolve --dry-run   # 저장 없이 미리보기
"""
from __future__ import annotations

import argparse
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from scripts.pipeline.config import load_config
from scripts.analytics.gsc_collector import GSCCollector
from scripts.analytics.analyzer import PerformanceAnalyzer
from scripts.analytics.prompt_evolver import PromptEvolver
from scripts.analytics.reporter import EvolutionReporter


def build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(description="sureline.kr 자기진화 에이전트")
    p.add_argument(
        "--dry-run",
        action="store_true",
        help="저장 없이 미리보기만 출력",
    )
    return p


def main() -> None:
    args = build_parser().parse_args()
    config = load_config()

    # ── 환경변수 검증 ──────────────────────────────
    missing = []
    if not config.gsc_client_secret_path:
        missing.append("GSC_CLIENT_SECRET_PATH")
    if not config.gsc_site_url:
        missing.append("GSC_SITE_URL")
    if not config.supabase_url:
        missing.append("SUPABASE_URL")
    if not config.supabase_service_role_key:
        missing.append("SUPABASE_SERVICE_ROLE_KEY")
    if not config.openai_api_key:
        missing.append("OPENAI_API_KEY")
    if missing:
        print(f"[ERROR] 필수 환경변수 누락: {', '.join(missing)}", flush=True)
        sys.exit(1)

    dry_run = args.dry_run
    label = "[DRY-RUN] " if dry_run else ""
    print(f"[EVOLVE] {label}자기진화 파이프라인 시작", flush=True)

    # ── STEP 1: GSC 데이터 수집 ─────────────────────
    print(f"\n{'='*50}", flush=True)
    print("[STEP 1] GSC 데이터 수집 중...", flush=True)
    if dry_run:
        print("[STEP 1][DRY-RUN] GSC 수집 건너뜀 (Supabase 저장 없음)", flush=True)
        collected = 0
    else:
        try:
            collector = GSCCollector(
                client_secret_path=config.gsc_client_secret_path,
                token_path=config.gsc_token_path,
                site_url=config.gsc_site_url,
                supabase_url=config.supabase_url,
                service_role_key=config.supabase_service_role_key,
            )
            collected = collector.collect_and_save()
            print(f"[STEP 1] 완료 — {collected}건 저장", flush=True)
        except Exception as exc:
            print(f"[STEP 1] 실패: {exc}", flush=True)
            sys.exit(1)

    # ── STEP 2: 데이터 분석 ────────────────────────
    print(f"\n{'='*50}", flush=True)
    print("[STEP 2] 성과 데이터 분석 중...", flush=True)
    try:
        analyzer = PerformanceAnalyzer(
            supabase_url=config.supabase_url,
            service_role_key=config.supabase_service_role_key,
        )
        analysis = analyzer.analyze()
        print(
            f"[STEP 2] 완료 — slug={analysis['unique_slugs']}, "
            f"days={analysis['data_days']}, can_evolve={analysis['can_evolve']}",
            flush=True,
        )
    except Exception as exc:
        print(f"[STEP 2] 실패: {exc}", flush=True)
        sys.exit(1)

    # ── STEP 3: 프롬프트 진화 ──────────────────────
    print(f"\n{'='*50}", flush=True)
    print("[STEP 3] 프롬프트 진화 단계...", flush=True)
    try:
        evolver = PromptEvolver(
            supabase_url=config.supabase_url,
            service_role_key=config.supabase_service_role_key,
            openai_api_key=config.openai_api_key,
            prompt_path=config.prompt_path,
        )
        new_version_id = evolver.evolve(analysis, dry_run=dry_run)
        evolved = analysis.get("can_evolve", False) and not dry_run
        print(f"[STEP 3] 완료 — prompt_version_id={new_version_id}", flush=True)
    except Exception as exc:
        print(f"[STEP 3] 실패: {exc}", flush=True)
        sys.exit(1)

    # ── STEP 4: 리포트 생성 ────────────────────────
    print(f"\n{'='*50}", flush=True)
    print("[STEP 4] 진화 리포트 저장 중...", flush=True)
    try:
        reporter = EvolutionReporter(
            supabase_url=config.supabase_url,
            service_role_key=config.supabase_service_role_key,
        )
        report_id = reporter.save_report(
            analysis=analysis,
            prompt_version_id=new_version_id,
            evolved=evolved,
            dry_run=dry_run,
        )
        print(f"[STEP 4] 완료 — report_id={report_id}", flush=True)
    except Exception as exc:
        print(f"[STEP 4] 실패: {exc}", flush=True)
        sys.exit(1)

    print(f"\n[EVOLVE] {label}전체 완료!", flush=True)


if __name__ == "__main__":
    main()
