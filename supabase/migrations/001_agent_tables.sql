-- ================================================
-- 001_agent_tables.sql
-- 자기진화 에이전트 시스템 테이블
-- ================================================

-- ================================================
-- 1. prompt_versions 테이블
-- ================================================
CREATE TABLE prompt_versions (
  id          SERIAL      PRIMARY KEY,
  version     INTEGER     NOT NULL,
  content     TEXT        NOT NULL,             -- 프롬프트 전문
  reason      TEXT,                             -- 변경 이유 (분석 요약)
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_prompt_versions_version ON prompt_versions(version DESC);

COMMENT ON TABLE prompt_versions IS '가이드 작성 프롬프트 버전 이력';
COMMENT ON COLUMN prompt_versions.version IS '단조 증가 버전 번호 (1, 2, 3, ...)';
COMMENT ON COLUMN prompt_versions.reason  IS '이 버전으로 업데이트한 이유 (분석 결과 요약)';

-- ================================================
-- 2. article_performance 테이블
-- ================================================
CREATE TABLE article_performance (
  id          BIGSERIAL   PRIMARY KEY,
  guide_slug  TEXT        NOT NULL,
  date        DATE        NOT NULL,
  clicks      INTEGER     NOT NULL DEFAULT 0,
  impressions INTEGER     NOT NULL DEFAULT 0,
  ctr         NUMERIC(8,6) NOT NULL DEFAULT 0,  -- 0.000000 ~ 1.000000
  position    NUMERIC(8,4) NOT NULL DEFAULT 0,  -- 평균 순위
  cta_clicks  INTEGER     NOT NULL DEFAULT 0,   -- 쿠팡 CTA 클릭 수
  collected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT uq_article_performance_slug_date UNIQUE (guide_slug, date)
);

CREATE INDEX idx_article_perf_slug ON article_performance(guide_slug);
CREATE INDEX idx_article_perf_date ON article_performance(date DESC);

COMMENT ON TABLE article_performance IS 'Google Search Console + CTA 클릭 집계 (일별)';
COMMENT ON COLUMN article_performance.ctr       IS 'GSC CTR 값 (0~1 실수)';
COMMENT ON COLUMN article_performance.position  IS 'GSC 평균 게재 순위 (낮을수록 상위)';
COMMENT ON COLUMN article_performance.cta_clicks IS '쿠팡 CTA 버튼 클릭 누계 (increment_cta_clicks RPC 로 갱신)';

-- ================================================
-- 3. evolution_reports 테이블
-- ================================================
CREATE TABLE evolution_reports (
  id              SERIAL      PRIMARY KEY,
  report_data     JSONB       NOT NULL,         -- 분석 결과 전문
  prompt_version_id INTEGER   REFERENCES prompt_versions(id),
  evolved         BOOLEAN     NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_evolution_reports_created ON evolution_reports(created_at DESC);

COMMENT ON TABLE evolution_reports IS '주간 에이전트 진화 리포트';
COMMENT ON COLUMN evolution_reports.report_data IS 'analyzer 결과 + 전략 + 프롬프트 변경 여부';
COMMENT ON COLUMN evolution_reports.evolved     IS '이번 실행에서 프롬프트가 실제로 변경됐는지 여부';

-- ================================================
-- 4. guides 테이블에 prompt_version_id 컬럼 추가
-- ================================================
ALTER TABLE guides
  ADD COLUMN IF NOT EXISTS prompt_version_id INTEGER REFERENCES prompt_versions(id);

COMMENT ON COLUMN guides.prompt_version_id IS '이 가이드 생성에 사용된 프롬프트 버전 (null = 버전 추적 이전)';

-- ================================================
-- 5. increment_cta_clicks RPC 함수
--    race condition 방지: atomic UPDATE
-- ================================================
CREATE OR REPLACE FUNCTION increment_cta_clicks(
  p_slug TEXT,
  p_date DATE DEFAULT CURRENT_DATE
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- 해당 날짜 행이 없으면 먼저 삽입
  INSERT INTO article_performance (guide_slug, date, cta_clicks)
  VALUES (p_slug, p_date, 1)
  ON CONFLICT (guide_slug, date)
  DO UPDATE SET cta_clicks = article_performance.cta_clicks + 1;
END;
$$;

COMMENT ON FUNCTION increment_cta_clicks IS 'CTA 클릭 수 원자적 증가 (race condition 방지)';

-- ================================================
-- 6. Row Level Security
-- ================================================
ALTER TABLE prompt_versions     ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE evolution_reports   ENABLE ROW LEVEL SECURITY;

-- 공개 SELECT
CREATE POLICY "public read prompt_versions"
  ON prompt_versions FOR SELECT USING (true);

CREATE POLICY "public read article_performance"
  ON article_performance FOR SELECT USING (true);

CREATE POLICY "public read evolution_reports"
  ON evolution_reports FOR SELECT USING (true);

-- service_role만 INSERT/UPDATE/DELETE
CREATE POLICY "service write prompt_versions"
  ON prompt_versions FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "service write article_performance"
  ON article_performance FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "service write evolution_reports"
  ON evolution_reports FOR ALL
  USING (auth.role() = 'service_role');
