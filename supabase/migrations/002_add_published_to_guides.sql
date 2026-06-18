-- guides 테이블에 published 컬럼 추가
-- 기본값 false → 파이프라인 생성 글은 임시저장, 관리자가 직접 발행
ALTER TABLE guides
  ADD COLUMN IF NOT EXISTS published BOOLEAN NOT NULL DEFAULT false;

-- 기존 글은 모두 발행 상태로 전환 (소급 적용)
UPDATE guides SET published = true WHERE published = false;

-- 인덱스 추가 (published=true 필터 쿼리 최적화)
CREATE INDEX IF NOT EXISTS idx_guides_published ON guides(published);

COMMENT ON COLUMN guides.published IS '발행 여부. false=임시저장, true=공개';
