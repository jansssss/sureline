---
name: paytesla.kr design system
description: 테슬라 구매 계산기 플랫폼(paytesla.kr)의 디자인 토큰, 색상 시스템, 타이포그래피, 스페이싱 컨벤션
type: project
---

## 프로젝트 개요
- 서비스명: 하우머치 테슬라 (paytesla.kr)
- 스택: Next.js App Router + Tailwind CSS
- 경로: F:\개인\tesla\tesla-quote-app

## 색상 시스템
- 브랜드 강조색: `brandRed` = #e31937 (tailwind.config.js에 정의)
- 주 배경: white (#ffffff)
- 어두운 배경 (히어로/사이드바): `bg-slate-950` / `bg-black` / `bg-gray-900`
- 텍스트 주색: `text-slate-950`
- 텍스트 보조: `text-slate-600`, `text-gray-600`
- 텍스트 약: `text-slate-400`, `text-gray-400`
- 강조 포인트: `text-green-400` (보조금 절약금액), `text-red-500` (보조금 수치 in RegionHero)
- 인터랙티브 호버: `hover:text-blue-700` (가이드 카드)

## 타이포그래피
- 기본 폰트: Noto Sans KR (globals.css에서 Google Fonts로 임포트)
- 로고 폰트: Orbitron (font-logo 클래스)
- h1 패턴: text-2xl md:text-4xl font-bold (compare/subsidy), text-3xl md:text-5xl font-black (guide)
- h2 패턴: text-xl md:text-2xl font-black tracking-tight (대부분)
- h3 패턴: text-lg font-black md:text-xl (wizard 섹션 헤더)
- 본문: text-sm leading-7 text-slate-700 md:text-base
- 레이블/뱃지: text-xs font-bold uppercase tracking-[0.2em~0.24em]

## max-width 컨테이너 불일치 (핵심 이슈)
- SiteHeader: max-w-7xl (1280px)
- Breadcrumb: max-w-7xl (1280px)
- SiteNav: max-w-[1400px] (1400px) — 다름
- QuoteWizard: max-w-[1400px] (1400px) — 다름
- RecentGuides: max-w-7xl (1280px)
- HomeContent: max-w-7xl (1280px)
- GuideDetailPage: max-w-4xl (896px)
- compare/page.js: max-w-4xl (896px)
- subsidy/page.js: max-w-4xl (896px)
- shop/page.js: max-w-5xl (1024px)

## border-radius 패턴
- 대형 카드: rounded-[28px], rounded-[32px] (HomeContent, ShopBanner inline)
- 중형 카드: rounded-2xl (24px), rounded-3xl (QuoteWizard 섹션)
- 소형 요소: rounded-xl, rounded-2xl
- 뱃지/태그: rounded-full
- 비교 페이지: rounded-2xl (더 작음 — 다른 페이지 대비 낮은 고급감)

## 스페이싱 컨벤션
- 페이지 수직 패딩: py-8 md:py-12 (subsidy), py-10 md:py-14 (guide), py-12 md:py-16 (shop)
- 섹션 간격: space-y-10 (subsidy, compare)
- 카드 내부 패딩: p-5 md:p-6 (wizard), p-6 md:p-10 (HomeContent 카드)
- 헤더 내부 패딩: px-4 py-3 md:px-8 (SiteHeader)

## 반응형 브레이크포인트
- sm: 640px (그리드 2열 전환)
- md: 768px (대부분의 레이아웃 전환)
- lg: 1024px (그리드 다열, QuoteWizard 2-col 레이아웃)
- 별도 xl 브레이크포인트 미사용

## 히어로 스타일 분기
- 고급 페이지 (guide, shop): bg-[linear-gradient(135deg,#0f172a_0%,#172554_50%,#1d4ed8_100%)] — 딥블루
- 기본 페이지 (compare, subsidy/RegionHero): bg-black — 단순 블랙
- 이 두 패턴이 혼재함 (일관성 문제)

## 플로팅 UI
- FloatingCalcButton: fixed bottom-6 right-5 (모바일), md:bottom-8 md:right-8
- ScrollTop button (QuoteWizard): fixed bottom-6 right-6 z-50 — FloatingCalcButton과 z-index 충돌 가능

## 이중 브레드크럼 구조 (이슈)
- 글로벌 Breadcrumb (layout.js에 삽입): max-w-7xl, px-4 md:px-8
- 각 페이지 내 로컬 nav 브레드크럼 (compare, subsidy/RegionHero): max-w-4xl, px-4 md:px-6
- 두 브레드크럼이 동시에 렌더링될 가능성 있음

## SiteNav 이모지 혼입
- SiteNav의 "🛒 액세서리 베스트" 항목에만 이모지 사용 — 다른 링크와 시각적 불일치

**Why:** 2026-03-25 기준 전체 레이아웃 품질 분석에서 도출
**How to apply:** 향후 컴포넌트 수정 시 위 불일치 항목을 기준으로 일관성 검토
