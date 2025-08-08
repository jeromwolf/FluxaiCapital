import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generatePDFReport } from '@/lib/reports/pdf-generator';
import { emailService } from '@/lib/email/service';
import { convertPortfolioForReport } from '@/lib/utils/decimal-converter';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { portfolioId, reportType, email } = body;

    if (!portfolioId || !reportType || !email) {
      return NextResponse.json(
        { error: 'Portfolio ID, report type, and email are required' },
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

    // Generate PDF report
    const convertedData = convertPortfolioForReport(portfolio);
    const pdfBuffer = await generatePDFReport(convertedData, reportType);

    // Send email with PDF attachment
    const emailResult = await emailService.sendReportEmail(
      email,
      portfolio.name,
      reportType,
      pdfBuffer
    );

    if (!emailResult.success) {
      return NextResponse.json(
        { error: 'Failed to send email: ' + emailResult.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Report sent successfully via email',
    });

  } catch (error) {
    console.error('Email report error:', error);
    return NextResponse.json(
      { error: 'Failed to send report via email' },
      { status: 500 }
    );
  }
}