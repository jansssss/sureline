/**
 * 데이터 수집 프로바이더 인터페이스
 *
 * 이번 버전에서 실제로 동작하는 것은 ManualDataProvider 와 CsvImportProvider 뿐이다.
 * 네이버 / 구글 / 쿠팡 프로바이더는 '미연결' 상태로만 존재하며,
 * 절대로 가짜 데이터를 반환하지 않는다 — 호출하면 NotConnectedError 를 던진다.
 *
 * 나중에 실제 API 를 붙일 때는 이 파일의 해당 프로바이더 안에서
 * fetchKeywordMetrics / fetchShoppingMetrics / fetchProductMetrics 만 구현하면 된다.
 * 화면·저장·점수 계산 경로는 그대로 재사용된다.
 */

import { applyDerivedFields } from './calc.js';
import { previewCsv } from './csv.js';

export class NotConnectedError extends Error {
  constructor(providerName) {
    super(`${providerName}는 아직 연결되지 않았습니다. 관리자 수동 입력 또는 CSV 가져오기를 사용하세요.`);
    this.name = 'NotConnectedError';
    this.providerName = providerName;
  }
}

/**
 * 모든 프로바이더가 따르는 형태.
 *   id, name, connected
 *   fetchKeywordMetrics(keyword)   → 검색 데이터
 *   fetchShoppingMetrics(keyword)  → 쇼핑 관심도
 *   fetchProductMetrics(url)       → 쿠팡 상품 지표
 *   normalizeMetrics(raw)          → 후보 컬럼 형태로 변환
 */
class BaseProvider {
  constructor({ id, name, kind, connected = false, note = '' }) {
    this.id = id;
    this.name = name;
    this.kind = kind;       // 데이터 출처 종류 (SOURCE_KINDS 값)
    this.connected = connected;
    this.note = note;
  }

  async fetchKeywordMetrics() { throw new NotConnectedError(this.name); }
  async fetchShoppingMetrics() { throw new NotConnectedError(this.name); }
  async fetchProductMetrics() { throw new NotConnectedError(this.name); }

  /** 원시 응답 → 후보 컬럼. 파생값까지 채워 반환한다. */
  normalizeMetrics(raw) {
    return applyDerivedFields({ ...(raw || {}) }, { respectManualTotal: false });
  }
}

// ─── 미연결 프로바이더 (자리만 잡아둔다) ─────────────────────────────────────

export const NaverKeywordProvider = new BaseProvider({
  id: 'naver_keyword',
  name: '네이버 검색광고 키워드 도구',
  kind: '공식 수치',
  connected: false,
  note: '검색광고 API 키 발급 후 fetchKeywordMetrics 구현 예정',
});

export const NaverShoppingInsightProvider = new BaseProvider({
  id: 'naver_shopping_insight',
  name: '네이버 데이터랩 쇼핑인사이트',
  kind: '플랫폼 제공 지수',
  connected: false,
  note: '데이터랩 오픈 API 연동 후 fetchShoppingMetrics 구현 예정',
});

export const GoogleTrendsProvider = new BaseProvider({
  id: 'google_trends',
  name: 'Google Trends',
  kind: '플랫폼 제공 지수',
  connected: false,
  note: '상대지수만 제공. 절대 검색량으로 쓰지 말 것',
});

export const CoupangProductProvider = new BaseProvider({
  id: 'coupang_product',
  name: '쿠팡파트너스 상품 API',
  kind: '공식 수치',
  connected: false,
  note: '쿠팡파트너스 공식 API 승인 후 연동. 상품페이지 무단 크롤링은 하지 않는다',
});

// ─── 실제 동작하는 프로바이더 ────────────────────────────────────────────────

class ManualProvider extends BaseProvider {
  constructor() {
    super({
      id: 'manual',
      name: '관리자 직접 조사',
      kind: '관리자 수동 추정',
      connected: true,
      note: '관리자가 화면에서 직접 입력한 값',
    });
  }

  /** 폼 입력값을 후보 컬럼 형태로 정규화 */
  async fetchKeywordMetrics(_keyword, input = {}) { return input; }
  async fetchShoppingMetrics(_keyword, input = {}) { return input; }
  async fetchProductMetrics(_url, input = {}) { return input; }
}

class CsvProvider extends BaseProvider {
  constructor() {
    super({
      id: 'csv',
      name: 'CSV 가져오기',
      kind: '관리자 수동 추정',
      connected: true,
      note: '관리자가 업로드한 CSV 파일',
    });
  }

  /** CSV 텍스트를 파싱해 정상 행만 후보 형태로 반환 */
  parse(text, existing = []) {
    return previewCsv(text, existing);
  }

  async fetchKeywordMetrics(_keyword, { csvText = '', existing = [] } = {}) {
    const preview = this.parse(csvText, existing);
    return preview.rows.filter((r) => r.valid).map((r) => r.data);
  }
}

export const ManualDataProvider = new ManualProvider();
export const CsvImportProvider = new CsvProvider();

export const PROVIDERS = [
  ManualDataProvider,
  CsvImportProvider,
  NaverKeywordProvider,
  NaverShoppingInsightProvider,
  GoogleTrendsProvider,
  CoupangProductProvider,
];

export function getProvider(id) {
  return PROVIDERS.find((p) => p.id === id) ?? null;
}

/** 화면 표시용 연결 상태 목록 */
export function listProviderStatus() {
  return PROVIDERS.map(({ id, name, kind, connected, note }) => ({ id, name, kind, connected, note }));
}
