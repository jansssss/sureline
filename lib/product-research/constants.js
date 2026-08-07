/**
 * 직장인 관심제품 분석 — 공용 상수
 * 서버 라우트와 관리자 화면이 함께 사용한다.
 */

export const STATUSES = ['조사 전', '조사 중', '분석 완료', '최종 후보', '보류', '제외'];

export const STATUS_STYLES = {
  '조사 전':   { bg: '#f1f4f9', fg: '#5a6a85', icon: '○' },
  '조사 중':   { bg: '#e0edff', fg: '#1d4ed8', icon: '◐' },
  '분석 완료': { bg: '#d1fae5', fg: '#065f46', icon: '✓' },
  '최종 후보': { bg: '#fef3c7', fg: '#92400e', icon: '★' },
  '보류':      { bg: '#fff7ed', fg: '#9a3412', icon: '‖' },
  '제외':      { bg: '#f4f4f5', fg: '#a1a1aa', icon: '✕' },
};

export const CATEGORIES = [
  '데스크 주변기기',
  '데스크 셋업',
  '자세·좌석',
  '근골격 보호',
  '이완·회복',
  '사무실 생활',
  '기타',
];

/** 경쟁도 — 낮을수록 유리 */
export const COMPETITION_LEVELS = ['매우 낮음', '낮음', '중간', '높음', '매우 높음'];

/** 높음/보통/낮음 3단계 (판매자 안정성, 페이지 안정성, 적합성 등) */
export const LEVEL_3 = ['높음', '보통', '낮음'];

export const STOCK_STATUSES = ['정상 판매', '일시 품절', '판매 종료', '확인 필요'];

/** 추정치 여부 구분 — 화면에서 공식 수치와 추정치를 구별해 보여준다 */
export const SOURCE_KINDS = [
  '공식 수치',
  '플랫폼 제공 지수',
  '외부 서비스 추정치',
  '관리자 수동 추정',
  '확인 불가',
];

export const ESTIMATED_SOURCE_KINDS = new Set([
  '외부 서비스 추정치',
  '관리자 수동 추정',
]);

export const SOURCE_NAMES = [
  '네이버 검색광고 키워드 도구',
  '네이버 데이터랩 검색어트렌드',
  '네이버 데이터랩 쇼핑인사이트',
  'Google Trends',
  '쿠팡 상품페이지',
  '쿠팡파트너스 추천상품',
  '아이템스카우트',
  '판다랭크',
  '관리자 직접 조사',
];

/** 출처를 붙일 수 있는 데이터 묶음 */
export const DATA_TYPES = [
  { key: 'search',        label: '검색 데이터' },
  { key: 'shopping',      label: '쇼핑 관심도' },
  { key: 'coupang',       label: '쿠팡 판매 신호' },
  { key: 'profitability', label: '수익성·안정성' },
  { key: 'etc',           label: '기타' },
];

/** 데이터가 오래됐다고 경고할 기준 (일) */
export const STALE_DAYS = 30;

/** CSV 가져오기/내보내기 기본 컬럼 순서 */
export const CSV_COLUMNS = [
  'product_name',
  'primary_keyword',
  'secondary_keywords',
  'category',
  'pc_monthly_search',
  'mobile_monthly_search',
  'age_25_54_ratio',
  'trend_3_month',
  'shopping_click_index',
  'shopping_trend_3_month',
  'coupang_product_name',
  'coupang_url',
  'affiliate_url',
  'current_review_count',
  'previous_review_count',
  'measurement_start_date',
  'measurement_end_date',
  'price',
  'rating',
  'rocket_delivery',
  'competition_level',
  'estimated_commission_rate',
  'seller_stability',
  'return_risk',
  'sureline_relevance',
  'direct_review_possible',
  'source_name',
  'source_url',
  'checked_at',
  'memo',
];

/** CSV 컬럼 → DB 컬럼 매핑 (이름이 다른 것만 별도 표기) */
export const CSV_TO_DB = {
  trend_3_month: 'search_trend_3_month',
  competition_level: 'search_competition',
  memo: 'admin_memo',
};

/** CSV 컬럼별 타입 (검증·변환용) */
export const CSV_COLUMN_TYPES = {
  product_name: 'text',
  primary_keyword: 'text',
  secondary_keywords: 'text[]',
  category: 'text',
  pc_monthly_search: 'int',
  mobile_monthly_search: 'int',
  age_25_54_ratio: 'ratio',
  trend_3_month: 'number',
  shopping_click_index: 'number',
  shopping_trend_3_month: 'number',
  coupang_product_name: 'text',
  coupang_url: 'url',
  affiliate_url: 'url',
  current_review_count: 'int',
  previous_review_count: 'int',
  measurement_start_date: 'date',
  measurement_end_date: 'date',
  price: 'money',
  rating: 'rating',
  rocket_delivery: 'bool',
  competition_level: 'enum:competition',
  estimated_commission_rate: 'ratio',
  seller_stability: 'enum:level3',
  return_risk: 'enum:level3',
  sureline_relevance: 'enum:level3',
  direct_review_possible: 'bool',
  source_name: 'text',
  source_url: 'url',
  checked_at: 'date',
  memo: 'text',
};

/** 필수 CSV 컬럼 */
export const CSV_REQUIRED = ['product_name', 'primary_keyword'];

/** 후보 상세에서 다루는 숫자 필드 (이력 스냅샷 대상) */
export const HISTORY_FIELDS = [
  { key: 'total_monthly_search',   label: '월간 검색량',    unit: '회' },
  { key: 'search_trend_3_month',   label: '검색 관심도',    unit: '%' },
  { key: 'shopping_click_index',   label: '쇼핑 클릭지수',  unit: '' },
  { key: 'review_count',           label: '쿠팡 후기 수',   unit: '개' },
  { key: 'price',                  label: '가격',           unit: '원' },
  { key: 'rating',                 label: '평점',           unit: '점' },
  { key: 'total_score',            label: '종합점수',       unit: '점' },
];
