import { NextRequest, NextResponse } from 'next/server';
import { createMarketDataService } from '@/lib/market-data/service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const stockCode = searchParams.get('stockCode');
    const corpCode = searchParams.get('corpCode');

    const marketDataService = createMarketDataService();

    if (!marketDataService.isDartAvailable()) {
      return NextResponse.json({ error: 'DART API is not configured' }, { status: 503 });
    }

    switch (action) {
      case 'disclosures': {
        const startDate = searchParams.get('startDate') || undefined;
        const endDate = searchParams.get('endDate') || undefined;
        const reportType = searchParams.get('reportType') || undefined;
        const pageNo = searchParams.get('pageNo');
        const pageCount = searchParams.get('pageCount');

        const disclosures = await marketDataService.getDartDisclosures({
          corpCode: corpCode || undefined,
          stockCode: stockCode || undefined,
          startDate,
          endDate,
          reportType,
          pageNo: pageNo ? parseInt(pageNo) : undefined,
          pageCount: pageCount ? parseInt(pageCount) : undefined,
        });

        return NextResponse.json({ data: disclosures });
      }

      case 'financials': {
        const year = searchParams.get('year');
        const reportCode = searchParams.get('reportCode');
        const fsDiv = searchParams.get('fsDiv') as 'CFS' | 'OFS' | undefined;

        if (!year || !reportCode) {
          return NextResponse.json({ error: 'year and reportCode are required' }, { status: 400 });
        }

        const statements = await marketDataService.getDartFinancialStatements({
          corpCode: corpCode || undefined,
          stockCode: stockCode || undefined,
          year,
          reportCode,
          fsDiv,
        });

        return NextResponse.json({ data: statements });
      }

      case 'shareholders': {
        const shareholders = await marketDataService.getDartMajorShareholders({
          corpCode: corpCode || undefined,
          stockCode: stockCode || undefined,
        });

        return NextResponse.json({ data: shareholders });
      }

      case 'company': {
        const companyInfo = await marketDataService.getDartCompanyInfo({
          corpCode: corpCode || undefined,
          stockCode: stockCode || undefined,
        });

        return NextResponse.json({ data: companyInfo });
      }

      case 'metrics': {
        const year = searchParams.get('year') || undefined;
        const metrics = await marketDataService.getDartKeyFinancialMetrics({
          corpCode: corpCode || undefined,
          stockCode: stockCode || undefined,
          year,
        });

        return NextResponse.json({ data: metrics });
      }

      case 'search': {
        const query = searchParams.get('query');
        if (!query) {
          return NextResponse.json({ error: 'query parameter is required' }, { status: 400 });
        }

        const results = await marketDataService.searchDartCompanies(query);
        return NextResponse.json({ data: results });
      }

      default:
        return NextResponse.json({ error: 'Invalid action parameter' }, { status: 400 });
    }
  } catch (error) {
    console.error('DART API error:', error);
    return NextResponse.json({ error: 'Failed to fetch DART data' }, { status: 500 });
  }
}
