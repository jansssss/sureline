-- ================================================
-- 005_product_research_auto_only.sql
-- 평가기준을 '자동 수집 가능한 항목'으로 재편
-- ================================================
-- 운영 원칙: 자동으로 채울 수 없는 항목은 점수에서 뺀다.
--            다만 자동화 자체는 가능한데 외부 장벽 때문에 막힌 항목은 남긴다.
--
--  제거(비활성) — 자동 수집이 원리적으로 불가능
--   · age_fit        : 데이터랩 응답이 요청마다 따로 정규화되는 상대지수라
--                      '전체 대비 25~54세 비중'을 계산할 수 없다
--   · coupang_signal : 쿠팡파트너스 API 가 후기 수·평점을 제공하지 않는다
--                      (상품페이지 크롤링은 하지 않는다)
--   · profitability  : 판매자 안정성·반품 위험 등은 사람의 판단 영역
--
--  유지 — 자동 수집 가능
--   · search_volume     : 네이버 검색광고 (연결됨)
--   · trend             : 네이버 데이터랩 검색어트렌드 (연결됨)
--   · competition       : 네이버 검색광고 (연결됨)
--   · shopping_interest : 데이터랩 쇼핑인사이트. 신규 등록 차단이라는 '벽'만
--                         걷히면 바로 붙일 수 있어 남겨둔다
--
-- 비활성 항목은 지우지 않고 is_active=false 로만 둔다.
-- 관리자 화면 [평가기준 설정]에서 체크 한 번으로 언제든 되살릴 수 있다.
-- ================================================

-- ------------------------------------------------
-- 1. 유지 항목 — 배점 재분배 (합계 100점) + 구간 재작성
-- ------------------------------------------------
-- 구간 점수는 절대값이라 배점이 바뀌면 함께 조정해야 한다.
-- 기존 비율을 그대로 유지한 채 새 배점에 맞춰 환산했다.

INSERT INTO product_research_score_settings (criterion_key, criterion_name, weight, sort_order, scoring_rules)
VALUES
(
  'search_volume', '월간 검색수', 45, 1,
  '{
    "type": "bands",
    "field": "total_monthly_search",
    "unit": "회",
    "bands": [
      { "max": 999,   "points": 5,  "label": "1,000회 미만" },
      { "max": 2999,  "points": 14, "label": "1,000~2,999회" },
      { "max": 9999,  "points": 27, "label": "3,000~9,999회" },
      { "max": 29999, "points": 38, "label": "10,000~29,999회" },
      { "points": 45, "label": "30,000회 이상" }
    ]
  }'::jsonb
),
(
  'trend', '최근 관심도 상승률', 25, 2,
  '{
    "type": "bands",
    "field": "search_trend_3_month",
    "unit": "%",
    "bands": [
      { "max": -20,   "points": 0,  "label": "20% 이상 감소" },
      { "max": -1,    "points": 7,  "label": "1~19% 감소" },
      { "max": 0.99,  "points": 12, "label": "보합" },
      { "max": 9.99,  "points": 17, "label": "1~9% 상승" },
      { "max": 29.99, "points": 22, "label": "10~29% 상승" },
      { "points": 25, "label": "30% 이상 상승" }
    ]
  }'::jsonb
),
(
  'competition', '검색 경쟁도', 20, 3,
  '{
    "type": "map",
    "field": "search_competition",
    "lowerIsBetter": true,
    "map": {
      "매우 낮음": 20,
      "낮음": 16,
      "중간": 12,
      "높음": 6,
      "매우 높음": 0
    }
  }'::jsonb
),
(
  'shopping_interest', '쇼핑 클릭 관심도', 10, 4,
  '{
    "type": "composite",
    "parts": [
      {
        "key": "click_index", "name": "네이버 쇼핑 클릭지수", "type": "bands",
        "field": "shopping_click_index", "max": 7,
        "bands": [
          { "max": 19.99, "points": 1, "label": "20 미만" },
          { "max": 39.99, "points": 2, "label": "20~39" },
          { "max": 59.99, "points": 4, "label": "40~59" },
          { "max": 79.99, "points": 6, "label": "60~79" },
          { "points": 7, "label": "80 이상" }
        ]
      },
      {
        "key": "shopping_trend", "name": "쇼핑 클릭 증감률", "type": "bands",
        "field": "shopping_trend_3_month", "unit": "%", "max": 3,
        "bands": [
          { "max": -10,   "points": 0, "label": "10% 이상 감소" },
          { "max": -0.01, "points": 1, "label": "소폭 감소" },
          { "max": 9.99,  "points": 2, "label": "보합~9% 상승" },
          { "points": 3, "label": "10% 이상 상승" }
        ]
      }
    ]
  }'::jsonb
)
ON CONFLICT (criterion_key) DO UPDATE
  SET criterion_name = EXCLUDED.criterion_name,
      weight         = EXCLUDED.weight,
      sort_order     = EXCLUDED.sort_order,
      scoring_rules  = EXCLUDED.scoring_rules,
      is_active      = true;

-- ------------------------------------------------
-- 2. 자동 수집이 불가능한 항목 비활성화
-- ------------------------------------------------
UPDATE product_research_score_settings
   SET is_active = false
 WHERE criterion_key IN ('age_fit', 'coupang_signal', 'profitability');

-- ------------------------------------------------
-- 3. 확인
-- ------------------------------------------------
-- 활성 배점 합계가 100 이어야 한다.
--   SELECT sum(weight) FROM product_research_score_settings WHERE is_active;
--
-- 이 마이그레이션 실행 후에는 관리자 화면에서 [점수 다시 계산]을 눌러야
-- 저장된 total_score 와 순위에 반영된다.
