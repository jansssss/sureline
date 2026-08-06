-- ================================================
-- 004_product_research_seed.sql
-- 기본 평가기준(100점) + 초기 제품 후보 20개
-- ================================================
-- 초기 후보는 제품명/대표 키워드/카테고리만 넣는다.
-- 검색량·판매량·평점 등 실측이 필요한 값은 전부 NULL 로 둔다.
-- (임의 수치를 만들어 넣지 않는다)
-- ON CONFLICT DO NOTHING → 재실행해도 관리자가 수정한 값을 덮어쓰지 않는다.
-- ================================================

-- ------------------------------------------------
-- 1. 기본 평가기준 (총 100점)
-- ------------------------------------------------
INSERT INTO product_research_score_settings (criterion_key, criterion_name, weight, sort_order, scoring_rules)
VALUES
(
  'search_volume', '월간 검색수', 25, 1,
  '{
    "type": "bands",
    "field": "total_monthly_search",
    "unit": "회",
    "bands": [
      { "max": 999,   "points": 3,  "label": "1,000회 미만" },
      { "max": 2999,  "points": 8,  "label": "1,000~2,999회" },
      { "max": 9999,  "points": 15, "label": "3,000~9,999회" },
      { "max": 29999, "points": 21, "label": "10,000~29,999회" },
      { "points": 25, "label": "30,000회 이상" }
    ]
  }'::jsonb
),
(
  'trend', '최근 관심도 상승률', 15, 2,
  '{
    "type": "bands",
    "field": "search_trend_3_month",
    "unit": "%",
    "bands": [
      { "max": -20,   "points": 0,  "label": "20% 이상 감소" },
      { "max": -1,    "points": 4,  "label": "1~19% 감소" },
      { "max": 0.99,  "points": 7,  "label": "보합" },
      { "max": 9.99,  "points": 10, "label": "1~9% 상승" },
      { "max": 29.99, "points": 13, "label": "10~29% 상승" },
      { "points": 15, "label": "30% 이상 상승" }
    ]
  }'::jsonb
),
(
  'age_fit', '25~54세 적합도', 15, 3,
  '{
    "type": "bands",
    "field": "age_25_54_ratio",
    "unit": "%",
    "bands": [
      { "max": 39.99, "points": 3,  "label": "40% 미만" },
      { "max": 54.99, "points": 7,  "label": "40~54%" },
      { "max": 64.99, "points": 10, "label": "55~64%" },
      { "max": 74.99, "points": 13, "label": "65~74%" },
      { "points": 15, "label": "75% 이상" }
    ]
  }'::jsonb
),
(
  'shopping_interest', '쇼핑 클릭 관심도', 15, 4,
  '{
    "type": "composite",
    "parts": [
      {
        "key": "click_index", "name": "네이버 쇼핑 클릭지수", "type": "bands",
        "field": "shopping_click_index", "max": 10,
        "bands": [
          { "max": 19.99, "points": 2,  "label": "20 미만" },
          { "max": 39.99, "points": 4,  "label": "20~39" },
          { "max": 59.99, "points": 6,  "label": "40~59" },
          { "max": 79.99, "points": 8,  "label": "60~79" },
          { "points": 10, "label": "80 이상" }
        ]
      },
      {
        "key": "shopping_trend", "name": "쇼핑 클릭 증감률", "type": "bands",
        "field": "shopping_trend_3_month", "unit": "%", "max": 5,
        "bands": [
          { "max": -10,   "points": 0, "label": "10% 이상 감소" },
          { "max": -0.01, "points": 1, "label": "소폭 감소" },
          { "max": 9.99,  "points": 3, "label": "보합~9% 상승" },
          { "points": 5, "label": "10% 이상 상승" }
        ]
      }
    ]
  }'::jsonb
),
(
  'coupang_signal', '쿠팡 판매 신호', 15, 5,
  '{
    "type": "composite",
    "parts": [
      {
        "key": "review_increase", "name": "30일 환산 후기 증가량", "type": "bands",
        "field": "normalized_30_day_review_increase", "unit": "개", "max": 9,
        "bands": [
          { "max": 9.99,  "points": 1, "label": "10개 미만" },
          { "max": 29.99, "points": 3, "label": "10~29개" },
          { "max": 59.99, "points": 5, "label": "30~59개" },
          { "max": 99.99, "points": 7, "label": "60~99개" },
          { "points": 9, "label": "100개 이상" }
        ]
      },
      {
        "key": "rating", "name": "상품 평점", "type": "bands",
        "field": "rating", "unit": "점", "max": 2,
        "bands": [
          { "max": 3.99, "points": 0, "label": "4.0 미만" },
          { "max": 4.39, "points": 1, "label": "4.0~4.3" },
          { "points": 2, "label": "4.4 이상" }
        ]
      },
      {
        "key": "rocket", "name": "로켓배송", "type": "boolean",
        "field": "rocket_delivery", "points": 2, "max": 2
      },
      {
        "key": "badge", "name": "추천상품/카테고리 베스트", "type": "any_boolean",
        "fields": ["recommendation_badge", "category_best"], "points": 2, "max": 2
      }
    ]
  }'::jsonb
),
(
  'competition', '검색 경쟁도', 10, 6,
  '{
    "type": "map",
    "field": "search_competition",
    "lowerIsBetter": true,
    "map": {
      "매우 낮음": 10,
      "낮음": 8,
      "중간": 6,
      "높음": 3,
      "매우 높음": 0
    }
  }'::jsonb
),
(
  'profitability', '수익성과 상품 안정성', 5, 7,
  '{
    "type": "composite",
    "parts": [
      {
        "key": "price", "name": "판매가격 적정성", "type": "bands",
        "field": "price", "fallbackField": "estimated_price", "unit": "원", "max": 1,
        "bands": [
          { "max": 9999,  "points": 0.3, "label": "1만원 미만" },
          { "max": 29999, "points": 0.7, "label": "1~3만원" },
          { "max": 99999, "points": 1,   "label": "3~10만원" },
          { "points": 0.5, "label": "10만원 이상" }
        ]
      },
      {
        "key": "commission", "name": "건당 예상 수익", "type": "bands",
        "field": "estimated_commission_amount", "unit": "원", "max": 1,
        "bands": [
          { "max": 999,  "points": 0.2, "label": "1,000원 미만" },
          { "max": 2999, "points": 0.6, "label": "1,000~2,999원" },
          { "points": 1, "label": "3,000원 이상" }
        ]
      },
      {
        "key": "seller_stability", "name": "판매자 안정성", "type": "map",
        "field": "seller_stability", "max": 1,
        "map": { "높음": 1, "보통": 0.5, "낮음": 0 }
      },
      {
        "key": "return_risk", "name": "반품 위험도", "type": "map",
        "field": "return_risk", "max": 0.7, "lowerIsBetter": true,
        "map": { "낮음": 0.7, "보통": 0.35, "높음": 0 }
      },
      {
        "key": "page_stability", "name": "상품 페이지 안정성", "type": "map",
        "field": "product_page_stability", "max": 0.5,
        "map": { "높음": 0.5, "보통": 0.25, "낮음": 0 }
      },
      {
        "key": "direct_review", "name": "직접 사용 후기 작성 가능", "type": "boolean",
        "field": "direct_review_possible", "points": 0.4, "max": 0.4
      },
      {
        "key": "relevance", "name": "sureline 주제 적합성", "type": "map",
        "field": "sureline_relevance", "max": 0.4,
        "map": { "높음": 0.4, "보통": 0.2, "낮음": 0 }
      }
    ]
  }'::jsonb
)
ON CONFLICT (criterion_key) DO NOTHING;

-- ------------------------------------------------
-- 2. 초기 제품 후보 20개 (수치 없음)
-- ------------------------------------------------
INSERT INTO product_research_candidates
  (product_name, primary_keyword, category, status, created_by, updated_by)
VALUES
  ('버티컬 마우스',      '버티컬 마우스',      '데스크 주변기기', '조사 전', 'seed', 'seed'),
  ('저소음 마우스',      '저소음 마우스',      '데스크 주변기기', '조사 전', 'seed', 'seed'),
  ('무선 키보드',        '무선 키보드',        '데스크 주변기기', '조사 전', 'seed', 'seed'),
  ('키보드 손목받침대',  '키보드 손목받침대',  '데스크 주변기기', '조사 전', 'seed', 'seed'),
  ('마우스 손목받침대',  '마우스 손목받침대',  '데스크 주변기기', '조사 전', 'seed', 'seed'),
  ('모니터암',           '모니터암',           '데스크 셋업',     '조사 전', 'seed', 'seed'),
  ('모니터 받침대',      '모니터 받침대',      '데스크 셋업',     '조사 전', 'seed', 'seed'),
  ('노트북 거치대',      '노트북 거치대',      '데스크 셋업',     '조사 전', 'seed', 'seed'),
  ('사무실 발받침대',    '사무실 발받침대',    '데스크 셋업',     '조사 전', 'seed', 'seed'),
  ('사무용 허리쿠션',    '사무용 허리쿠션',    '자세·좌석',       '조사 전', 'seed', 'seed'),
  ('등받이 쿠션',        '등받이 쿠션',        '자세·좌석',       '조사 전', 'seed', 'seed'),
  ('목 마사지기',        '목 마사지기',        '이완·회복',       '조사 전', 'seed', 'seed'),
  ('눈 마사지기',        '눈 마사지기',        '이완·회복',       '조사 전', 'seed', 'seed'),
  ('온열 안대',          '온열 안대',          '이완·회복',       '조사 전', 'seed', 'seed'),
  ('손목 보호대',        '손목 보호대',        '근골격 보호',     '조사 전', 'seed', 'seed'),
  ('자세 교정 방석',     '자세 교정 방석',     '자세·좌석',       '조사 전', 'seed', 'seed'),
  ('마사지볼',           '마사지볼',           '이완·회복',       '조사 전', 'seed', 'seed'),
  ('폼롤러',             '폼롤러',             '이완·회복',       '조사 전', 'seed', 'seed'),
  ('경추 베개',          '경추 베개',          '이완·회복',       '조사 전', 'seed', 'seed'),
  ('사무실 텀블러',      '사무실 텀블러',      '사무실 생활',     '조사 전', 'seed', 'seed')
ON CONFLICT (product_name, primary_keyword) DO NOTHING;
