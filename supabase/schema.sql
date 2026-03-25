-- ================================================
-- sureline.kr Database Schema
-- Supabase SQL Editor에 그대로 붙여넣기 후 실행
-- ================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================
-- 1. guides 테이블 (가이드 메타데이터)
-- ================================================
CREATE TABLE guides (
  id           UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug         TEXT        UNIQUE NOT NULL,          -- YYYYMMDD-english-slug
  category     TEXT        NOT NULL,                 -- 목·어깨 통증|허리 통증|눈 피로|자세 교정|스트레칭|피로 회복|수면 개선|손목·팔꿈치 통증
  title        TEXT        NOT NULL,
  description  TEXT        NOT NULL,                 -- 한 줄 설명 (메타 description)
  read_time    TEXT        NOT NULL DEFAULT '5분',
  key_points   JSONB       NOT NULL DEFAULT '[]',    -- string[]
  sources      JSONB       NOT NULL DEFAULT '[]',    -- {name, url, accessedAt}[]
  published_at DATE        NOT NULL DEFAULT CURRENT_DATE,
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_guides_slug        ON guides(slug);
CREATE INDEX idx_guides_category    ON guides(category);
CREATE INDEX idx_guides_published   ON guides(published_at DESC);
CREATE INDEX idx_guides_created     ON guides(created_at DESC);

-- ================================================
-- 2. guide_sections 테이블 (가이드 본문 섹션)
-- ================================================
CREATE TABLE guide_sections (
  id            UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  guide_id      UUID        NOT NULL REFERENCES guides(id) ON DELETE CASCADE,
  order_index   INTEGER     NOT NULL,                -- 1부터 시작
  title         TEXT        NOT NULL,                -- 섹션 제목
  paragraphs    JSONB       NOT NULL DEFAULT '[]',   -- string[]
  bullets       JSONB,                               -- string[] | null
  callout       TEXT,                                -- 강조 문구 | null
  section_table JSONB,                               -- {headers: string[], rows: string[][]} | null
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sections_guide_id ON guide_sections(guide_id);
CREATE INDEX idx_sections_order    ON guide_sections(guide_id, order_index);

-- ================================================
-- 3. updated_at 자동 갱신 트리거
-- ================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_guides_updated_at
  BEFORE UPDATE ON guides
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ================================================
-- 4. Row Level Security
-- ================================================
ALTER TABLE guides         ENABLE ROW LEVEL SECURITY;
ALTER TABLE guide_sections ENABLE ROW LEVEL SECURITY;

-- 누구나 읽기 가능
CREATE POLICY "public read guides"
  ON guides FOR SELECT USING (true);

CREATE POLICY "public read guide_sections"
  ON guide_sections FOR SELECT USING (true);

-- service_role(파이프라인)만 쓰기 가능
-- service role key는 RLS를 자동 우회하므로 별도 INSERT 정책 불필요.
CREATE POLICY "service write guides"
  ON guides FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "service write guide_sections"
  ON guide_sections FOR ALL
  USING (auth.role() = 'service_role');

-- ================================================
-- 5. 테이블 설명
-- ================================================
COMMENT ON TABLE guides          IS 'sureline.kr 직장인 건강 가이드 메타데이터';
COMMENT ON TABLE guide_sections  IS '가이드 본문 섹션 (순서 있는 배열)';

COMMENT ON COLUMN guides.slug        IS 'YYYYMMDD-english-slug, URL 경로로 사용';
COMMENT ON COLUMN guides.category    IS '목·어깨 통증 | 허리 통증 | 눈 피로 | 자세 교정 | 스트레칭 | 피로 회복 | 수면 개선 | 손목·팔꿈치 통증';
COMMENT ON COLUMN guides.key_points  IS '핵심 요약 포인트 string 배열 (JSON)';
COMMENT ON COLUMN guides.sources     IS '[{name, url, accessedAt}] 출처 목록 (JSON)';
COMMENT ON COLUMN guide_sections.paragraphs    IS '본문 문단 string 배열 (JSON)';
COMMENT ON COLUMN guide_sections.bullets       IS '불릿 항목 string 배열 (JSON), 없으면 null';
COMMENT ON COLUMN guide_sections.callout       IS '강조 문구, 없으면 null';
COMMENT ON COLUMN guide_sections.section_table IS '{headers, rows} 비교표, 없으면 null';
