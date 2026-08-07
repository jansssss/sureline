/**
 * 데이터 수집 프로바이더 인터페이스
 *
 * 현재 실제로 동작하는 것은 ManualDataProvider 와 CsvImportProvider 뿐이다.
 * 네이버 / 구글 프로바이더는 '미연결' 상태로만 존재하며,
 * 절대로 가짜 데이터를 반환하지 않는다 — 호출하면 NotConnectedError 를 던진다.
 *
 * 자동수집 대상은 검색 데이터와 쇼핑 관심도뿐이다.
 * 쿠팡 판매 신호(후기 수·평점·품절)는 관리자 수동 입력으로만 채운다.
 *
 * 나중에 실제 API 를 붙일 때는 이 파일의 해당 프로바이더 안에서
 * fetchKeywordMetrics / fetchShoppingMetrics 만 구현하면 된다.
 * 화면·저장·점수 계산 경로는 그대로 재사용된다.
 */

import { applyDerivedFields } from './calc.js';
import { previewCsv } from './csv.js';
import {
  hasSearchAdEnv, fetchKeywordTool, findExactRow, mapKeywordToolRow,
  hasCensoredCount, normalizeKeyword,
} from './naver.js';

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

  /** 원시 응답 → 후보 컬럼. 파생값까지 채워 반환한다. */
  normalizeMetrics(raw) {
    return applyDerivedFields({ ...(raw || {}) }, { respectManualTotal: false });
  }
}

// ─── 네이버 검색광고 (연결됨) ────────────────────────────────────────────────

class NaverSearchAdProvider extends BaseProvider {
  constructor() {
    const ready = hasSearchAdEnv();
    super({
      id: 'naver_keyword',
      name: '네이버 검색광고 키워드 도구',
      kind: '공식 수치',
      connected: ready,
      note: ready
        ? '검색량·클릭수·경쟁도를 자동 수집합니다'
        : 'NAVER_AD_API_KEY / SECRET_KEY / CUSTOMER_ID 를 등록하면 켜집니다',
    });
  }

  /**
   * 대표 키워드로 검색 지표를 가져온다.
   * 연관 키워드 목록에서 정확히 일치하는 행만 쓴다 — 비슷한 키워드 값을 대신 넣지 않는다.
   */
  async fetchKeywordMetrics(keyword) {
    if (!hasSearchAdEnv()) throw new NotConnectedError(this.name);
    if (!keyword) throw new Error('대표 키워드가 없습니다.');

    const list = await fetchKeywordTool(keyword);
    const row = findExactRow(list, keyword);
    if (!row) {
      throw new Error(
        `"${normalizeKeyword(keyword)}"와 정확히 일치하는 키워드를 네이버가 돌려주지 않았습니다. ` +
        `(연관 키워드 ${list.length}개 수신) 대표 키워드 표기를 확인해 주세요.`
      );
    }
    return { row, relatedCount: list.length, censored: hasCensoredCount(row) };
  }

  normalizeMetrics({ row } = {}) {
    return applyDerivedFields(mapKeywordToolRow(row), { respectManualTotal: false });
  }
}

export const NaverKeywordProvider = new NaverSearchAdProvider();

// ─── 미연결 프로바이더 (자리만 잡아둔다) ─────────────────────────────────────

/**
 * 네이버 데이터랩
 *
 * 2026-08-06 확인: 개발자센터에서 데이터랩을 사용 API 로 "새로" 추가하면
 * "신규로 등록할 수 없는 API가 선택되었습니다"로 거부된다.
 * 다만 이미 데이터랩이 등록돼 있는 기존 애플리케이션의 Client ID/Secret 은 그대로 쓸 수 있다.
 *
 *  - 검색어트렌드 : 기존 앱 키가 있으면 사용 가능 (추세·연령 비중)
 *  - 쇼핑인사이트 : 신규 등록 차단. datalab.naver.com 에서 수동 확인
 */
export const NaverShoppingInsightProvider = new BaseProvider({
  id: 'naver_shopping_insight',
  name: '네이버 데이터랩 쇼핑인사이트',
  kind: '플랫폼 제공 지수',
  connected: false,
  note: '신규 등록 차단됨(2026-08 확인) — datalab.naver.com 에서 수동 확인',
});

export const NaverSearchTrendProvider = new BaseProvider({
  id: 'naver_search_trend',
  name: '네이버 데이터랩 검색어트렌드',
  kind: '플랫폼 제공 지수',
  connected: false,
  note: '데이터랩이 등록된 기존 앱의 Client ID/Secret 이 있으면 사용 가능 — 연결 진단으로 확인',
});

export const GoogleTrendsProvider = new BaseProvider({
  id: 'google_trends',
  name: 'Google Trends',
  kind: '플랫폼 제공 지수',
  connected: false,
  note: '공식 공개 API 없음. 상대지수라 절대 검색량으로 쓸 수 없음 — 당분간 수동 확인',
});

// 쿠팡 지표는 자동수집 대상이 아니다.
// 파트너스 API 가 후기 수·평점을 제공하지 않아 실익이 없고,
// 상품페이지 크롤링은 하지 않는다. 쿠팡 판매 신호는 관리자 수동 입력으로만 채운다.

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
  NaverSearchTrendProvider,
  NaverShoppingInsightProvider,
  GoogleTrendsProvider,
];

export function getProvider(id) {
  return PROVIDERS.find((p) => p.id === id) ?? null;
}

/** 화면 표시용 연결 상태 목록 */
export function listProviderStatus() {
  return PROVIDERS.map(({ id, name, kind, connected, note }) => ({ id, name, kind, connected, note }));
}
