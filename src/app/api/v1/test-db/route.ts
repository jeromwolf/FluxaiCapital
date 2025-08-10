import { NextResponse } from 'next/server';

import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // Test database connection
    const userCount = await prisma.user.count();
    const portfolioCount = await prisma.portfolio.count();

    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      data: {
        users: userCount,
        portfolios: portfolioCount,
        database: 'SQLite',
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Database connection error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Database connection failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
