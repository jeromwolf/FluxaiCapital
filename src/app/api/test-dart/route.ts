import { NextResponse } from 'next/server';

import { createMarketDataService } from '@/lib/market-data/service';

export async function GET() {
  try {
    const marketDataService = createMarketDataService();

    if (!marketDataService.isDartAvailable()) {
      return NextResponse.json({
        status: 'error',
        message: 'DART API is not configured. Please set DART_API_KEY in environment variables.',
      });
    }

    // Test with Samsung Electronics (005930)
    const stockCode = '005930';

    // Get latest disclosures
    const disclosures = await marketDataService.getDartDisclosures({
      stockCode,
      pageCount: 5,
    });

    // Get company info
    const companyInfo = await marketDataService.getDartCompanyInfo({
      stockCode,
    });

    // Get financial metrics
    const financialMetrics = await marketDataService.getDartKeyFinancialMetrics({
      stockCode,
    });

    return NextResponse.json({
      status: 'success',
      data: {
        companyInfo,
        latestDisclosures: disclosures,
        financialMetrics,
        message: 'DART API integration is working successfully!',
      },
    });
  } catch (error) {
    console.error('DART test error:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 },
    );
  }
}
