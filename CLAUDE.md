# Self-Evolving Agent Pipeline — 설치 매뉴얼

GSC(Google Search Console) 데이터를 수집하고, 성과를 분석한 뒤, 콘텐츠 작성 프롬프트를 자동으로 개선하는 **자기진화 에이전트 파이프라인**이다.
다른 프로젝트에 그대로 복사·붙여넣기해서 적용할 수 있도록 전체 구축 과정을 기록한다.

---

## 아키텍처 개요

```
GitHub Actions (주 1회, 월요일 09:00 KST)
  └─ scripts/evolve.py
       ├─ STEP 1: GSCCollector   → GSC API → article_performance (Supabase)
       ├─ STEP 2: PerformanceAnalyzer → Supabase 데이터 분석
       ├─ STEP 3: PromptEvolver  → GPT-4o-mini → prompt_versions (Supabase)
       └─ STEP 4: EvolutionReporter → evolution_reports (Supabase)
```

**사용 서비스**
- Google Search Console API (OAuth2 Desktop App)
- Supabase (PostgreSQL REST API)
- OpenAI API (gpt-4o-mini)
- GitHub Actions

---

## 1단계: Google Cloud — OAuth2 클라이언트 생성

> 서비스 계정 키 생성이 조직 정책으로 막혀 있을 경우 OAuth2 방식 필수.

1. [console.cloud.google.com](https://console.cloud.google.com) 접속
2. **API 및 서비스 → 사용자 인증 정보 → OAuth 동의 화면** 구성
   - 앱 유형: 외부
   - 앱 이름, 이메일 입력 후 저장
   - **대상 → 테스트 사용자** 에 본인 Google 계정 이메일 추가 (필수)
3. **API 및 서비스 → 라이브러리 → "Search Console API"** 검색 → 사용 설정
4. **사용자 인증 정보 → + 사용자 인증 정보 만들기 → OAuth 클라이언트 ID**
   - 애플리케이션 유형: **데스크톱 앱**
   - 이름 입력 후 만들기
5. JSON 파일 다운로드 → `scripts/credentials/client_secret.json` 으로 저장

---

## 2단계: 최초 OAuth2 인증 (로컬에서 1회만)

```bash
# 의존성 설치
pip install -r scripts/requirements.txt

# 환경변수 설정 (.env.local 또는 export)
export GSC_SITE_URL="sc-domain:yourdomain.com"
# Search Console에 도메인 속성으로 등록된 경우 sc-domain: 접두사 사용
# URL 접두사 속성인 경우 https://yourdomain.com/ 형식 사용

# 최초 실행 → 브라우저 열림 → Google 계정 로그인 → 권한 허용
python -m scripts.evolve --dry-run
```

- 인증 완료 시 `scripts/credentials/token.json` 자동 생성됨
- 이후 실행은 토큰 자동 갱신 (브라우저 불필요)

> **주의**: `scripts/credentials/` 는 `.gitignore`에 추가해 커밋 금지

---

## 3단계: Supabase 테이블 생성

Supabase SQL Editor에서 아래 SQL 실행:

```sql
-- GSC 수집 데이터
CREATE TABLE IF NOT EXISTS article_performance (
  id              BIGSERIAL PRIMARY KEY,
  guide_slug      TEXT        NOT NULL,
  date            DATE        NOT NULL,
  clicks          INT         NOT NULL DEFAULT 0,
  impressions     INT         NOT NULL DEFAULT 0,
  ctr             FLOAT       NOT NULL DEFAULT 0,
  position        FLOAT       NOT NULL DEFAULT 0,
  cta_clicks      INT         NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (guide_slug, date)
);

-- 프롬프트 버전 이력
CREATE TABLE IF NOT EXISTS prompt_versions (
  id         BIGSERIAL PRIMARY KEY,
  version    INT         NOT NULL,
  content    TEXT        NOT NULL,
  reason     TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 진화 리포트
CREATE TABLE IF NOT EXISTS evolution_reports (
  id                BIGSERIAL PRIMARY KEY,
  unique_slugs      INT,
  data_days         INT,
  avg_ctr           FLOAT,
  avg_position      FLOAT,
  can_evolve        BOOLEAN,
  evolved           BOOLEAN,
  prompt_version_id BIGINT REFERENCES prompt_versions(id),
  dry_run           BOOLEAN NOT NULL DEFAULT false,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

## 4단계: GitHub Secrets 등록

리포지토리 **Settings → Secrets and variables → Actions → New repository secret**:

| Secret 이름                | 값                                         |
|---------------------------|--------------------------------------------|
| `OPENAI_API_KEY`          | OpenAI API 키                              |
| `OPENAI_MODEL`            | 예: `gpt-4o-mini`                          |
| `SUPABASE_URL`            | Supabase 프로젝트 URL                      |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service_role 키                 |
| `GSC_SITE_URL`            | `sc-domain:yourdomain.com`                 |
| `GSC_CLIENT_SECRET_JSON`  | `client_secret.json` 파일 내용 전체 (JSON) |
| `GSC_TOKEN_JSON`          | `token.json` 파일 내용 전체 (JSON)          |

> `token.json`은 로컬에서 최초 인증 후 생성된 파일의 내용을 그대로 붙여넣기.

---

## 5단계: 파일 구조

아래 파일들을 프로젝트에 복사한다:

```
scripts/
├── evolve.py                     # 진화 파이프라인 엔트리포인트
├── requirements.txt              # 의존성 목록
├── pipeline/
│   └── config.py                 # 환경변수 로드
└── analytics/
    ├── gsc_collector.py          # GSC API 수집
    ├── analyzer.py               # 성과 분석
    ├── prompt_evolver.py         # 프롬프트 자동 진화
    └── reporter.py               # 리포트 저장

.github/workflows/
└── evolve.yml                    # GitHub Actions 스케줄

scripts/credentials/              # .gitignore 처리 필수
├── client_secret.json            # OAuth2 클라이언트 키
└── token.json                    # OAuth2 액세스 토큰
```

**requirements.txt 필수 패키지:**
```
google-api-python-client>=2.100.0
google-auth>=2.23.0
google-auth-httplib2>=0.2.0
google-auth-oauthlib>=1.1.0
openai>=1.0.0
```

---

## 6단계: GitHub Actions 워크플로우

`.github/workflows/evolve.yml`:

```yaml
name: Weekly Agent Evolution

on:
  workflow_dispatch:
    inputs:
      dry_run:
        description: "Dry-run (저장 없이 미리보기)"
        required: false
        default: false
        type: boolean
  schedule:
    - cron: "0 0 * * 1"   # KST 월요일 09:00 (UTC 일요일 00:00)

jobs:
  evolve:
    runs-on: ubuntu-latest
    env:
      FORCE_JAVASCRIPT_ACTIONS_TO_NODE24: true

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: "3.12"

      - name: Install dependencies
        run: pip install -r scripts/requirements.txt

      - name: Write environment file
        env:
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
          OPENAI_MODEL: ${{ secrets.OPENAI_MODEL }}
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
        shell: bash
        run: |
          printf 'OPENAI_API_KEY=%s\n'            "$OPENAI_API_KEY"            >> .env
          printf 'OPENAI_MODEL=%s\n'              "$OPENAI_MODEL"              >> .env
          printf 'SUPABASE_URL=%s\n'              "$SUPABASE_URL"              >> .env
          printf 'SUPABASE_SERVICE_ROLE_KEY=%s\n' "$SUPABASE_SERVICE_ROLE_KEY" >> .env

      - name: Write GSC credentials
        env:
          GSC_CLIENT_SECRET_JSON: ${{ secrets.GSC_CLIENT_SECRET_JSON }}
          GSC_TOKEN_JSON: ${{ secrets.GSC_TOKEN_JSON }}
        shell: bash
        run: |
          mkdir -p scripts/credentials
          printf '%s' "$GSC_CLIENT_SECRET_JSON" > scripts/credentials/client_secret.json
          printf '%s' "$GSC_TOKEN_JSON"         > scripts/credentials/token.json

      - name: Run agent evolution
        env:
          GSC_SITE_URL: ${{ secrets.GSC_SITE_URL }}
        shell: bash
        run: |
          if [ "${{ inputs.dry_run }}" = "true" ]; then
            python -m scripts.evolve --dry-run
          else
            python -m scripts.evolve
          fi
```

---

## 7단계: config.py 수정 포인트

새 프로젝트에 맞게 `scripts/pipeline/config.py`에서 변경해야 할 부분:

```python
# 프로젝트별 경로 수정
prompt_path=scripts_root / "prompts" / "your_writer_prompt.txt",   # 프롬프트 파일명
guides_js_path=project_root / "lib" / "articles.js",              # 아티클 목록 파일
```

---

## 8단계: gsc_collector.py의 slug 추출 패턴 수정

기본값은 `/guides/` 경로 기준. 다른 경로 구조면 수정:

```python
# scripts/analytics/gsc_collector.py 상단
_SLUG_RE = re.compile(r"/your-path/([^/?#]+)")  # 경로에 맞게 수정
```

---

## 9단계: analyzer.py의 진화 조건 수정

기본 조건: `unique_slugs >= 14 AND data_days >= 7`

초기 단계의 소규모 사이트는 완화 가능:

```python
# scripts/analytics/analyzer.py
can_evolve = unique_slugs >= 5 and data_days >= 7  # 기준 완화 예시
```

---

## 트러블슈팅

### GSC API 403 "insufficient permission"
- Search Console에 등록된 속성 URL 형식 확인
  - 도메인 속성: `sc-domain:yourdomain.com`
  - URL 접두사 속성: `https://yourdomain.com/`
- `GSC_SITE_URL` Secret을 정확한 형식으로 재설정

### access_denied (OAuth 인증 실패)
- Google Cloud Console → OAuth 동의 화면 → 대상 → **테스트 사용자** 에 계정 추가

### 서비스 계정 키 생성 차단 (`iam.disableServiceAccountKeyCreation`)
- 조직 정책 제약. 이 매뉴얼의 OAuth2 방식 사용 (서비스 계정 불필요)

### Search Console API 미사용 설정 오류
- GCP → API 및 서비스 → 라이브러리 → "Google Search Console API" 검색 → 사용 설정

### 0건 저장 (데이터 없음)
- 구글이 사이트를 아직 크롤링/색인하지 않은 경우 정상. 색인 후 자동 수집.
- GSC에서 해당 페이지 URL 직접 검색 → 색인 상태 확인

### token.json 만료 (CI에서 재인증 불가)
- token.json에 `refresh_token` 포함 여부 확인
- 포함돼 있으면 자동 갱신됨. 없으면 로컬 재인증 후 Secret 업데이트 필요
