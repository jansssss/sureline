-- ================================================
-- 003_product_research.sql
-- 직장인 관심제품 분석 (관리자 전용 리서치 도구)
-- ================================================
-- 공개 사용자는 어떤 행도 조회할 수 없다.
-- 서버(service_role)만 읽기/쓰기가 가능하며,
-- 향후 공개 추천페이지는 get_final_product_candidate() 함수로
-- 최종 후보의 최소 필드만 조회한다.
-- ================================================

-- ================================================
-- 1. product_research_candidates
-- ================================================
CREATE TABLE IF NOT EXISTS product_research_candidates (
  id                     BIGSERIAL   PRIMARY KEY,

  -- 기본정보
  product_name           TEXT        NOT NULL,
  primary_keyword        TEXT        NOT NULL,
  secondary_keywords     TEXT[]      NOT NULL DEFAULT '{}',
  category               TEXT,
  description            TEXT,
  research_purpose       TEXT,
  coupang_product_name   TEXT,
  coupang_url            TEXT,
  affiliate_url          TEXT,
  image_url              TEXT,
  price                  NUMERIC(12,2),
  rating                 NUMERIC(3,2),
  review_count           INTEGER,
  rocket_delivery        BOOLEAN,
  seller_name            TEXT,
  brand_name             TEXT,
  status                 TEXT        NOT NULL DEFAULT '조사 전',
  admin_memo             TEXT,

  -- 검색 데이터
  pc_monthly_search      INTEGER,
  mobile_monthly_search  INTEGER,
  total_monthly_search   INTEGER,
  average_click_count    NUMERIC(12,2),
  average_click_rate     NUMERIC(6,3),
  age_25_54_ratio        NUMERIC(5,2),
  search_trend_3_month   NUMERIC(7,2),
  search_trend_12_month  NUMERIC(7,2),
  search_competition     TEXT,
  ad_competition         TEXT,
  related_product_count  INTEGER,
  search_source_kind     TEXT,

  -- 쇼핑 관심도 데이터
  shopping_click_index      NUMERIC(12,2),
  shopping_index_note       TEXT,
  shopping_trend_3_month    NUMERIC(7,2),
  shopping_trend_12_month   NUMERIC(7,2),
  shopping_main_age_group   TEXT,
  shopping_mobile_ratio     NUMERIC(5,2),
  shopping_source_kind      TEXT,

  -- 쿠팡 판매 신호
  current_review_count              INTEGER,
  previous_review_count             INTEGER,
  measurement_start_date            DATE,
  measurement_end_date              DATE,
  measurement_days                  INTEGER,
  review_increase                   INTEGER,
  normalized_30_day_review_increase NUMERIC(12,2),
  stock_status                      TEXT,
  stock_memo                        TEXT,
  recommendation_badge              BOOLEAN,
  category_best                     BOOLEAN,
  coupang_source_kind               TEXT,

  -- 수익성과 운영 적합성
  estimated_price              NUMERIC(12,2),
  estimated_commission_rate    NUMERIC(6,3),
  estimated_commission_amount  NUMERIC(12,2),
  return_risk                  TEXT,
  seller_stability             TEXT,
  product_page_stability       TEXT,
  seasonality                  TEXT,
  direct_purchase_possible     BOOLEAN,
  direct_review_possible       BOOLEAN,
  sureline_relevance           TEXT,
  medical_claim_risk           TEXT,
  profitability_memo           TEXT,

  -- 점수 / 상태
  total_score            NUMERIC(6,2),
  score_breakdown        JSONB,
  is_final_candidate     BOOLEAN     NOT NULL DEFAULT false,
  last_checked_at        DATE,

  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by             TEXT,
  updated_by             TEXT
);

CREATE INDEX IF NOT EXISTS idx_prc_score    ON product_research_candidates(total_score DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_prc_status   ON product_research_candidates(status);
CREATE INDEX IF NOT EXISTS idx_prc_category ON product_research_candidates(category);
CREATE INDEX IF NOT EXISTS idx_prc_keyword  ON product_research_candidates(primary_keyword);

-- 제품명 + 대표 키워드 조합은 중복 후보로 본다.
CREATE UNIQUE INDEX IF NOT EXISTS uq_prc_name_keyword
  ON product_research_candidates(product_name, primary_keyword);

-- 최종 후보는 전체에서 최대 1개만 존재한다 (DB 레벨 보장).
CREATE UNIQUE INDEX IF NOT EXISTS uq_prc_single_final
  ON product_research_candidates((is_final_candidate))
  WHERE is_final_candidate;

COMMENT ON TABLE  product_research_candidates IS '직장인 관심제품 분석 — 제품 후보와 최신 조사 데이터';
COMMENT ON COLUMN product_research_candidates.total_monthly_search IS 'PC+모바일 합계. 관리자가 직접 덮어쓸 수 있음';
COMMENT ON COLUMN product_research_candidates.score_breakdown IS '마지막 점수 계산의 항목별 점수/사유 스냅샷';
COMMENT ON COLUMN product_research_candidates.shopping_index_note IS '클릭지수가 절대값인지 상대지수인지 등 데이터 성격 메모';

-- ================================================
-- 2. product_research_history — 날짜별 수치 변화 이력
-- ================================================
CREATE TABLE IF NOT EXISTS product_research_history (
  id                     BIGSERIAL   PRIMARY KEY,
  candidate_id           BIGINT      NOT NULL REFERENCES product_research_candidates(id) ON DELETE CASCADE,
  recorded_at            DATE        NOT NULL DEFAULT CURRENT_DATE,
  pc_monthly_search      INTEGER,
  mobile_monthly_search  INTEGER,
  total_monthly_search   INTEGER,
  age_25_54_ratio        NUMERIC(5,2),
  search_trend_3_month   NUMERIC(7,2),
  shopping_click_index   NUMERIC(12,2),
  shopping_trend_3_month NUMERIC(7,2),
  review_count           INTEGER,
  price                  NUMERIC(12,2),
  rating                 NUMERIC(3,2),
  stock_status           TEXT,
  total_score            NUMERIC(6,2),
  memo                   TEXT,
  created_by             TEXT,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_prh_candidate ON product_research_history(candidate_id, recorded_at DESC);

COMMENT ON TABLE product_research_history IS '제품 후보별 날짜 스냅샷 (추세 그래프 원본)';

-- ================================================
-- 3. product_research_sources — 데이터 출처
-- ================================================
CREATE TABLE IF NOT EXISTS product_research_sources (
  id                 BIGSERIAL   PRIMARY KEY,
  candidate_id       BIGINT      NOT NULL REFERENCES product_research_candidates(id) ON DELETE CASCADE,
  data_type          TEXT        NOT NULL,   -- search / shopping / coupang / profitability / etc
  source_name        TEXT,                   -- 네이버 검색광고 키워드 도구 등
  source_kind        TEXT,                   -- 공식 수치 / 플랫폼 제공 지수 / 외부 서비스 추정치 / 관리자 수동 추정 / 확인 불가
  source_url         TEXT,
  checked_at         DATE,
  evidence_image_url TEXT,
  memo               TEXT,
  created_by         TEXT,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_prs_candidate ON product_research_sources(candidate_id, data_type);

COMMENT ON TABLE  product_research_sources IS '수치별 데이터 출처 · 확인일 · 증빙';
COMMENT ON COLUMN product_research_sources.source_kind IS '공식 수치 / 플랫폼 제공 지수 / 외부 서비스 추정치 / 관리자 수동 추정 / 확인 불가';

-- ================================================
-- 4. product_research_score_settings — 배점 · 구간 설정
-- ================================================
CREATE TABLE IF NOT EXISTS product_research_score_settings (
  id            BIGSERIAL   PRIMARY KEY,
  criterion_key TEXT        NOT NULL UNIQUE,
  criterion_name TEXT       NOT NULL,
  weight        NUMERIC(6,2) NOT NULL,
  scoring_rules JSONB       NOT NULL,
  sort_order    INTEGER     NOT NULL DEFAULT 0,
  is_active     BOOLEAN     NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by    TEXT
);

COMMENT ON TABLE  product_research_score_settings IS '100점 평가 기준 (배점 + 구간). 코드가 아닌 DB가 기준값의 원본';
COMMENT ON COLUMN product_research_score_settings.scoring_rules IS 'bands / map / composite 규칙 JSON';

-- ================================================
-- 5. product_research_audit_logs — 관리자 작업 이력
-- ================================================
CREATE TABLE IF NOT EXISTS product_research_audit_logs (
  id           BIGSERIAL   PRIMARY KEY,
  candidate_id BIGINT      REFERENCES product_research_candidates(id) ON DELETE SET NULL,
  action       TEXT        NOT NULL,   -- create / update / delete / status_change / score_recalculate / final_candidate / csv_import / history_add
  actor        TEXT,
  detail       JSONB,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pral_created ON product_research_audit_logs(created_at DESC);

COMMENT ON TABLE product_research_audit_logs IS '제품 분석 도구 관리자 작업 감사 로그';

-- ================================================
-- 6. Row Level Security — 공개 조회 전면 차단
-- ================================================
ALTER TABLE product_research_candidates     ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_research_history        ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_research_sources        ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_research_score_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_research_audit_logs     ENABLE ROW LEVEL SECURITY;

-- anon / authenticated 대상 정책을 만들지 않는다 → 기본 거부.
-- service_role 은 RLS를 우회하지만, 의도를 명시적으로 남긴다.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'product_research_candidates' AND policyname = 'service manage product_research_candidates') THEN
    CREATE POLICY "service manage product_research_candidates"
      ON product_research_candidates FOR ALL
      USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'product_research_history' AND policyname = 'service manage product_research_history') THEN
    CREATE POLICY "service manage product_research_history"
      ON product_research_history FOR ALL
      USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'product_research_sources' AND policyname = 'service manage product_research_sources') THEN
    CREATE POLICY "service manage product_research_sources"
      ON product_research_sources FOR ALL
      USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'product_research_score_settings' AND policyname = 'service manage product_research_score_settings') THEN
    CREATE POLICY "service manage product_research_score_settings"
      ON product_research_score_settings FOR ALL
      USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'product_research_audit_logs' AND policyname = 'service manage product_research_audit_logs') THEN
    CREATE POLICY "service manage product_research_audit_logs"
      ON product_research_audit_logs FOR ALL
      USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
  END IF;
END $$;

-- ================================================
-- 7. 공개페이지용 최소 조회 함수
--    (이번 작업에서는 호출하는 공개페이지를 만들지 않는다)
-- ================================================
CREATE OR REPLACE FUNCTION get_final_product_candidate()
RETURNS TABLE (
  product_name         TEXT,
  primary_keyword      TEXT,
  category             TEXT,
  description          TEXT,
  coupang_product_name TEXT,
  affiliate_url        TEXT,
  image_url            TEXT,
  price                NUMERIC,
  rating               NUMERIC,
  rocket_delivery      BOOLEAN,
  last_checked_at      DATE
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT c.product_name, c.primary_keyword, c.category, c.description,
         c.coupang_product_name, c.affiliate_url, c.image_url,
         c.price, c.rating, c.rocket_delivery, c.last_checked_at
  FROM product_research_candidates c
  WHERE c.is_final_candidate
  LIMIT 1;
$$;

COMMENT ON FUNCTION get_final_product_candidate IS '공개 추천페이지에 노출 가능한 최종 후보 최소 필드만 반환';

-- ================================================
-- 8. updated_at 자동 갱신
-- ================================================
CREATE OR REPLACE FUNCTION set_product_research_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_prc_updated_at ON product_research_candidates;
CREATE TRIGGER trg_prc_updated_at
  BEFORE UPDATE ON product_research_candidates
  FOR EACH ROW EXECUTE FUNCTION set_product_research_updated_at();

DROP TRIGGER IF EXISTS trg_prs_updated_at ON product_research_sources;
CREATE TRIGGER trg_prs_updated_at
  BEFORE UPDATE ON product_research_sources
  FOR EACH ROW EXECUTE FUNCTION set_product_research_updated_at();

DROP TRIGGER IF EXISTS trg_prss_updated_at ON product_research_score_settings;
CREATE TRIGGER trg_prss_updated_at
  BEFORE UPDATE ON product_research_score_settings
  FOR EACH ROW EXECUTE FUNCTION set_product_research_updated_at();
