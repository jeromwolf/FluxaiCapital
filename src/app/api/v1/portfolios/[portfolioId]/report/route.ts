import { NextRequest, NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import prisma from '@/lib/prisma';
import { PortfolioReport } from '@/components/reports/PortfolioReport';
import React from 'react';

interface RouteParams {
  params: Promise<{ portfolioId: string }>
}

// GET /api/v1/portfolios/[portfolioId]/report
export async function GET(request: NextRequest, props: RouteParams) {
  const params = await props.params;
  
  try {
    // Get portfolio data
    const portfolio = await prisma.portfolio.findUnique({
      where: { id: params.portfolioId },
      include: {
        holdings: {
          orderBy: { marketValue: 'desc' },
        },
        transactions: {
          orderBy: { executedAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!portfolio) {
      return NextResponse.json(
        { success: false, message: 'Portfolio not found' },
        { status: 404 }
      );
    }

    // Calculate summary
    const holdings = portfolio.holdings.map(h => ({
      symbol: h.symbol,
      quantity: Number(h.quantity),
      averagePrice: Number(h.averagePrice),
      currentPrice: Number(h.currentPrice),
      marketValue: Number(h.marketValue),
      unrealizedPnL: Number(h.unrealizedPnL),
      weight: 0,
    }));

    const totalValue = holdings.reduce((sum, h) => sum + h.marketValue, 0);
    const totalCost = holdings.reduce((sum, h) => sum + (h.quantity * h.averagePrice), 0);
    const totalUnrealizedPnL = holdings.reduce((sum, h) => sum + h.unrealizedPnL, 0);
    const totalReturn = totalCost > 0 ? (totalUnrealizedPnL / totalCost) * 100 : 0;

    // Calculate weights
    holdings.forEach(h => {
      h.weight = totalValue > 0 ? (h.marketValue / totalValue) * 100 : 0;
    });

    const summary = {
      totalValue,
      totalCost,
      totalUnrealizedPnL,
      totalReturn,
      holdingsCount: holdings.length,
    };

    // Format transactions
    const transactions = portfolio.transactions.map(t => ({
      id: t.id,
      type: t.type,
      symbol: t.symbol || undefined,
      quantity: t.quantity ? Number(t.quantity) : undefined,
      price: t.price ? Number(t.price) : undefined,
      amount: Number(t.amount),
      fee: Number(t.fee),
      executedAt: t.executedAt.toISOString(),
    }));

    // Generate PDF
    const pdfBuffer = await renderToBuffer(
      React.createElement(PortfolioReport, {
        portfolio: {
          ...portfolio,
          createdAt: portfolio.createdAt.toISOString(),
          updatedAt: portfolio.updatedAt.toISOString(),
        },
        holdings,
        summary,
        transactions,
      })
    );

    // Return PDF
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="portfolio-report-${params.portfolioId}-${new Date().toISOString().split('T')[0]}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to generate report',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}