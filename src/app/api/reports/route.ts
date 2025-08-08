import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generatePDFReport } from '@/lib/reports/pdf-generator';
import { convertPortfolioForReport } from '@/lib/utils/decimal-converter';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { portfolioId, type, format = 'pdf' } = body;

    if (!portfolioId || !type) {
      return NextResponse.json(
        { error: 'Portfolio ID and type are required' },
        { status: 400 }
      );
    }

    // Get portfolio data
    const portfolio = await prisma.portfolio.findUnique({
      where: { id: portfolioId },
      include: {
        user: true,
        holdings: true,
        transactions: {
          orderBy: { executedAt: 'desc' },
          take: 100,
        },
        performances: {
          orderBy: { date: 'desc' },
          take: 30,
        },
      },
    });

    if (!portfolio) {
      return NextResponse.json(
        { error: 'Portfolio not found' },
        { status: 404 }
      );
    }

    if (format === 'pdf') {
      const convertedData = convertPortfolioForReport(portfolio);
      const pdfBuffer = await generatePDFReport(convertedData, type);
      
      return new NextResponse(pdfBuffer as BodyInit, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${portfolio.name}-${type}-${new Date().toISOString().split('T')[0]}.pdf"`,
        },
      });
    }

    return NextResponse.json(
      { error: 'Unsupported format' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Report generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const portfolioId = searchParams.get('portfolioId');

    if (!portfolioId) {
      return NextResponse.json(
        { error: 'Portfolio ID is required' },
        { status: 400 }
      );
    }

    const portfolio = await prisma.portfolio.findUnique({
      where: { id: portfolioId },
      include: {
        holdings: true,
        performances: {
          orderBy: { date: 'desc' },
          take: 1,
        },
      },
    });

    if (!portfolio) {
      return NextResponse.json(
        { error: 'Portfolio not found' },
        { status: 404 }
      );
    }

    const reportTypes = [
      {
        id: 'daily',
        name: '일일 리포트',
        description: '당일 포트폴리오 성과와 변동사항',
        frequency: 'daily',
      },
      {
        id: 'weekly',
        name: '주간 리포트',
        description: '주간 성과 요약과 분석',
        frequency: 'weekly',
      },
      {
        id: 'monthly',
        name: '월간 리포트',
        description: '월간 성과 리포트와 상세 분석',
        frequency: 'monthly',
      },
      {
        id: 'performance',
        name: '성과 분석 리포트',
        description: '포트폴리오 성과 심화 분석',
        frequency: 'on-demand',
      },
    ];

    return NextResponse.json({
      portfolio: {
        id: portfolio.id,
        name: portfolio.name,
        currency: portfolio.currency,
        totalValue: portfolio.performances[0]?.totalValue || 0,
        lastUpdate: portfolio.performances[0]?.date || new Date(),
      },
      reportTypes,
    });

  } catch (error) {
    console.error('Report API error:', error);
    return NextResponse.json(
      { error: 'Failed to get report data' },
      { status: 500 }
    );
  }
}