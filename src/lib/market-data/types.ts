export interface MarketQuote {
  symbol: string;
  name: string;
  nameKr?: string;
  price: number;
  currency: 'USD' | 'KRW' | 'EUR' | 'JPY';
  previousClose: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  dayHigh?: number;
  dayLow?: number;
  week52High?: number;
  week52Low?: number;
  per?: number;
  pbr?: number;
  dividend?: number;
  timestamp: Date;
}

export interface MarketCandle {
  timestamp: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface MarketNews {
  id: string;
  headline: string;
  summary: string;
  source: string;
  url: string;
  image?: string;
  datetime: Date;
  category?: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
}

export interface TechnicalIndicator {
  timestamp: Date;
  value: number;
  signal?: number;
  histogram?: number;
  upperBand?: number;
  lowerBand?: number;
  middleBand?: number;
}

export interface MarketIndex {
  symbol: string;
  name: string;
  value: number;
  change: number;
  changePercent: number;
  timestamp: Date;
}

export interface SectorPerformance {
  sector: string;
  performance: number;
  timestamp: Date;
}

export type MarketProvider = 'finnhub' | 'alphaVantage' | 'twelveData' | 'yahoo' | 'korean' | 'dart';

export interface MarketDataConfig {
  provider: MarketProvider;
  apiKey?: string;
  enableWebSocket?: boolean;
  cacheTimeout?: number;
}

// DART API Types
export interface DartDisclosure {
  rcept_no: string;          // 접수번호
  corp_cls: string;          // 법인구분
  corp_code: string;         // 고유번호
  corp_name: string;         // 회사명
  report_nm: string;         // 보고서명
  rcept_dt: string;          // 접수일자
  rm: string;                // 비고
  stock_code?: string;       // 종목코드
  flr_nm?: string;           // 공시제출인명
}

export interface DartFinancialStatement {
  rcept_no: string;          // 접수번호
  bsns_year: string;         // 사업연도
  stock_code: string;        // 종목코드
  fs_div: string;            // 개별/연결구분
  fs_nm: string;             // 재무제표구분
  account_nm: string;        // 계정명
  thstrm_nm: string;         // 당기명
  thstrm_amount: string;     // 당기금액
  frmtrm_nm?: string;        // 전기명
  frmtrm_amount?: string;    // 전기금액
  bfefrmtrm_nm?: string;     // 전전기명
  bfefrmtrm_amount?: string; // 전전기금액
  ord: string;               // 계정과목 정렬순서
}

export interface DartMajorShareholder {
  rcept_no: string;          // 접수번호
  nm: string;                // 성명
  relate: string;            // 관계
  stock_knd: string;         // 주식종류
  bsis_posesn_stock_co: string; // 기초소유주식수
  trmend_posesn_stock_co: string; // 기말소유주식수
  stock_change_co: string;   // 주식증감수
  stock_change_rate: string; // 증감비율
  stock_posesn_rate: string; // 소유비율
}

export interface DartCompanyInfo {
  corp_code: string;         // 고유번호
  corp_name: string;         // 정식명칭
  corp_name_eng?: string;    // 영문명칭
  stock_name?: string;       // 종목명
  stock_code?: string;       // 종목코드
  ceo_nm: string;            // 대표자명
  corp_cls: string;          // 법인구분
  jurir_no: string;          // 법인등록번호
  bizr_no: string;           // 사업자등록번호
  adres: string;             // 주소
  hm_url?: string;           // 홈페이지
  ir_url?: string;           // IR홈페이지
  phn_no?: string;           // 전화번호
  fax_no?: string;           // 팩스번호
  induty_code: string;       // 업종코드
  est_dt: string;            // 설립일
  acc_mt: string;            // 결산월
}