/**
 * DART (Data Analysis, Retrieval and Transfer System) API Provider
 * 한국 금융감독원 전자공시시스템 API
 *
 * Documentation: https://opendart.fss.or.kr/
 */

import {
  DartDisclosure,
  DartFinancialStatement,
  DartMajorShareholder,
  DartCompanyInfo,
} from '../types';

interface DartApiResponse<T> {
  status: string;
  message: string;
  list?: T[];
}

// Unused interface - removed to fix TS6133
// interface DartCorpCode {
//   corp_code: string;
//   corp_name: string;
//   stock_code: string | null;
//   modify_date: string;
// }

export class DartProvider {
  private apiKey: string;
  private baseUrl = 'https://opendart.fss.or.kr/api';
  private cache = new Map<string, { data: any; timestamp: number }>();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes
  private corpCodeMap = new Map<string, string>(); // stock_code -> corp_code mapping

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.initializeCorpCodeMap();
  }

  /**
   * Initialize the corp code mapping
   * In production, this should fetch from DART's corp code API
   */
  private initializeCorpCodeMap() {
    // Popular Korean stocks mapping (stock_code -> corp_code)
    // In production, download from: https://opendart.fss.or.kr/api/corpCode.xml
    const mappings = {
      '005930': '00126380', // 삼성전자
      '000660': '00164742', // SK하이닉스
      '035420': '00226320', // NAVER
      '035720': '00258801', // 카카오
      '207940': '00977474', // 삼성바이오로직스
      '005380': '00164779', // 현대차
      '006400': '00126186', // 삼성SDI
      '051910': '00226447', // LG화학
      '005490': '00190321', // POSCO홀딩스
      '096770': '00293886', // SK이노베이션
      '068270': '00246328', // 셀트리온
      '028260': '00107150', // 삼성물산
      '012330': '00159380', // 현대모비스
      '003550': '00100188', // LG
      '105560': '00401604', // KB금융
      '055550': '00232009', // 신한지주
      '086790': '00266961', // 하나금융지주
      '032830': '00184622', // 삼성생명
      '000810': '00113025', // 삼성화재
      '316140': '00121015', // 우리금융지주
    };

    Object.entries(mappings).forEach(([stockCode, corpCode]) => {
      this.corpCodeMap.set(stockCode, corpCode);
    });
  }

  /**
   * Get corp code from stock code
   */
  private getCorpCode(stockCode: string): string | undefined {
    return this.corpCodeMap.get(stockCode);
  }

  /**
   * Make API request with caching
   */
  private async makeRequest<T>(endpoint: string, params: Record<string, string>): Promise<T> {
    const queryParams = new URLSearchParams({
      ...params,
      crtfc_key: this.apiKey,
    });

    const url = `${this.baseUrl}/${endpoint}.json?${queryParams}`;
    const cacheKey = url;

    // Check cache
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`DART API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (data.status !== '000') {
        throw new Error(`DART API error: ${data.message}`);
      }

      // Cache the result
      this.cache.set(cacheKey, { data, timestamp: Date.now() });

      return data;
    } catch (error) {
      console.error('DART API request failed:', error);
      throw error;
    }
  }

  /**
   * Get recent corporate disclosures
   */
  async getDisclosures(params: {
    corpCode?: string;
    stockCode?: string;
    startDate?: string; // YYYYMMDD
    endDate?: string; // YYYYMMDD
    reportType?: string; // A: 정기공시, B: 주요사항보고, C: 발행공시, D: 지분공시, etc.
    pageNo?: number;
    pageCount?: number;
  }): Promise<DartDisclosure[]> {
    let { corpCode } = params;

    // Convert stock code to corp code if needed
    if (!corpCode && params.stockCode) {
      corpCode = this.getCorpCode(params.stockCode);
      if (!corpCode) {
        throw new Error(`Unknown stock code: ${params.stockCode}`);
      }
    }

    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const apiParams: Record<string, string> = {
      bgn_de: params.startDate || this.formatDate(thirtyDaysAgo),
      end_de: params.endDate || this.formatDate(today),
      page_no: String(params.pageNo || 1),
      page_count: String(params.pageCount || 10),
    };

    if (corpCode) {
      apiParams.corp_code = corpCode;
    }

    if (params.reportType) {
      apiParams.pblntf_ty = params.reportType;
    }

    const response = await this.makeRequest<DartApiResponse<DartDisclosure>>('list', apiParams);
    return (response as any).list || [];
  }

  /**
   * Get financial statements
   */
  async getFinancialStatements(params: {
    corpCode?: string;
    stockCode?: string;
    year: string; // YYYY
    reportCode: string; // 11011: 사업보고서, 11012: 반기보고서, 11013: 1분기보고서, 11014: 3분기보고서
    fsDiv?: 'CFS' | 'OFS'; // CFS: 연결재무제표, OFS: 개별재무제표
  }): Promise<DartFinancialStatement[]> {
    let { corpCode } = params;

    // Convert stock code to corp code if needed
    if (!corpCode && params.stockCode) {
      corpCode = this.getCorpCode(params.stockCode);
      if (!corpCode) {
        throw new Error(`Unknown stock code: ${params.stockCode}`);
      }
    }

    if (!corpCode) {
      throw new Error('Either corpCode or stockCode is required');
    }

    const apiParams: Record<string, string> = {
      corp_code: corpCode,
      bsns_year: params.year,
      reprt_code: params.reportCode,
    };

    if (params.fsDiv) {
      apiParams.fs_div = params.fsDiv;
    }

    const response = await this.makeRequest<DartApiResponse<DartFinancialStatement>>(
      'fnlttSinglAcnt',
      apiParams,
    );
    return (response as any).list || [];
  }

  /**
   * Get major shareholders information
   */
  async getMajorShareholders(params: {
    corpCode?: string;
    stockCode?: string;
  }): Promise<DartMajorShareholder[]> {
    let { corpCode } = params;

    // Convert stock code to corp code if needed
    if (!corpCode && params.stockCode) {
      corpCode = this.getCorpCode(params.stockCode);
      if (!corpCode) {
        throw new Error(`Unknown stock code: ${params.stockCode}`);
      }
    }

    if (!corpCode) {
      throw new Error('Either corpCode or stockCode is required');
    }

    // Get the latest disclosure with major shareholder info
    const disclosures = await this.getDisclosures({
      corpCode,
      reportType: 'A', // 정기공시
      pageCount: 5,
    });

    if (disclosures.length === 0) {
      return [];
    }

    // Try to get major shareholder info from the latest disclosure
    const latestDisclosure = disclosures[0];
    const apiParams: Record<string, string> = {
      corp_code: corpCode,
      rcept_no: latestDisclosure.rcept_no,
    };

    try {
      const response = await this.makeRequest<DartApiResponse<DartMajorShareholder>>(
        'hyslrSttus',
        apiParams,
      );
      return (response as any).list || [];
    } catch (error) {
      console.error('Failed to get major shareholders:', error);
      return [];
    }
  }

  /**
   * Get company information
   */
  async getCompanyInfo(params: {
    corpCode?: string;
    stockCode?: string;
  }): Promise<DartCompanyInfo | null> {
    let { corpCode } = params;

    // Convert stock code to corp code if needed
    if (!corpCode && params.stockCode) {
      corpCode = this.getCorpCode(params.stockCode);
      if (!corpCode) {
        throw new Error(`Unknown stock code: ${params.stockCode}`);
      }
    }

    if (!corpCode) {
      throw new Error('Either corpCode or stockCode is required');
    }

    const apiParams: Record<string, string> = {
      corp_code: corpCode,
    };

    try {
      const response = await this.makeRequest<DartCompanyInfo>('company', apiParams);
      return response as DartCompanyInfo;
    } catch (error) {
      console.error('Failed to get company info:', error);
      return null;
    }
  }

  /**
   * Get document viewer URL
   */
  static getDocumentViewerUrl(rceptNo: string): string {
    return `https://dart.fss.or.kr/dsaf001/main.do?rcpNo=${rceptNo}`;
  }

  /**
   * Format date to YYYYMMDD
   */
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
  }

  /**
   * Get key financial metrics from statements
   */
  async getKeyFinancialMetrics(params: {
    corpCode?: string;
    stockCode?: string;
    year?: string;
  }): Promise<{
    revenue?: number;
    operatingProfit?: number;
    netIncome?: number;
    totalAssets?: number;
    totalEquity?: number;
    totalLiabilities?: number;
    eps?: number;
    roe?: number;
    roa?: number;
    debtRatio?: number;
  }> {
    const currentYear = new Date().getFullYear();
    const year = params.year || String(currentYear - 1); // Default to last year

    try {
      const statements = await this.getFinancialStatements({
        corpCode: params.corpCode,
        stockCode: params.stockCode,
        year,
        reportCode: '11011', // 사업보고서
        fsDiv: 'CFS', // 연결재무제표
      });

      const metrics: Record<string, number> = {};

      // Parse financial statements to extract key metrics
      statements.forEach((statement) => {
        const amount = parseFloat((statement as any).thstrm_amount?.replace(/,/g, '') || '0');
        const accountName = (statement as any).account_nm || '';

        // Income statement items
        if (accountName.includes('매출액') || accountName.includes('수익')) {
          metrics.revenue = amount;
        } else if (accountName.includes('영업이익')) {
          metrics.operatingProfit = amount;
        } else if (accountName.includes('당기순이익')) {
          metrics.netIncome = amount;
        }
        // Balance sheet items
        else if (accountName === '자산총계') {
          metrics.totalAssets = amount;
        } else if (accountName === '자본총계') {
          metrics.totalEquity = amount;
        } else if (accountName === '부채총계') {
          metrics.totalLiabilities = amount;
        }
        // Per share items
        else if (accountName.includes('주당순이익')) {
          metrics.eps = amount;
        }
      });

      // Calculate ratios
      if (metrics.netIncome && metrics.totalEquity) {
        metrics.roe = (metrics.netIncome / metrics.totalEquity) * 100;
      }
      if (metrics.netIncome && metrics.totalAssets) {
        metrics.roa = (metrics.netIncome / metrics.totalAssets) * 100;
      }
      if (metrics.totalLiabilities && metrics.totalEquity) {
        metrics.debtRatio = (metrics.totalLiabilities / metrics.totalEquity) * 100;
      }

      return metrics;
    } catch (error) {
      console.error('Failed to get financial metrics:', error);
      return {};
    }
  }

  /**
   * Search companies by name
   */
  searchCompanies(query: string): Promise<
    Array<{
      corpCode: string;
      corpName: string;
      stockCode?: string;
    }>
  > {
    // In production, this should search through the corp code list
    // For now, return matching companies from our mapping
    const results: Array<{ corpCode: string; corpName: string; stockCode?: string }> = [];

    const corpNames: Record<string, string> = {
      '00126380': '삼성전자',
      '00164742': 'SK하이닉스',
      '00226320': 'NAVER',
      '00258801': '카카오',
      '00977474': '삼성바이오로직스',
      '00164779': '현대차',
      '00126186': '삼성SDI',
      '00226447': 'LG화학',
      '00190321': 'POSCO홀딩스',
      '00293886': 'SK이노베이션',
    };

    const queryLower = query.toLowerCase();

    for (const [stockCode, corpCode] of this.corpCodeMap.entries()) {
      const corpName = corpNames[corpCode];
      if (corpName && corpName.toLowerCase().includes(queryLower)) {
        results.push({
          corpCode,
          corpName,
          stockCode,
        });
      }
    }

    return Promise.resolve(results);
  }
}

// Export singleton instance
let dartInstance: DartProvider | null = null;

export function getDartProvider(): DartProvider {
  if (!dartInstance) {
    const apiKey = process.env.DART_API_KEY;
    if (!apiKey || apiKey.trim() === '' || apiKey.startsWith('your-')) {
      throw new Error('DART_API_KEY is not configured or invalid');
    }
    dartInstance = new DartProvider(apiKey);
  }
  return dartInstance;
}
