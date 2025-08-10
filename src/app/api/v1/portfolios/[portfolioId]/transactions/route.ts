import { Decimal } from '@prisma/client/runtime/library';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { getMarketDataClient } from '@/lib/market/client';
import prisma from '@/lib/prisma';

const createTransactionSchema = z.object({
  type: z.enum(['BUY', 'SELL', 'DEPOSIT', 'WITHDRAWAL', 'FEE', 'DIVIDEND']),
  symbol: z.string().optional(),
  quantity: z.number().positive().optional(),
  price: z.number().positive().optional(),
  amount: z.number().optional(),
  fee: z.number().default(0),
  notes: z.string().optional(),
  executedAt: z.string().optional(),
});

interface RouteParams {
  params: Promise<{ portfolioId: string }>;
}

// GET /api/v1/portfolios/[portfolioId]/transactions
export async function GET(request: NextRequest, props: RouteParams) {
  const params = await props.params;
  try {
    const { searchParams } = request.nextUrl;
    const type = searchParams.get('type');
    const symbol = searchParams.get('symbol');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const where: any = { portfolioId: params.portfolioId };
    if (type) where.type = type;
    if (symbol) where.symbol = symbol;

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        orderBy: { executedAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.transaction.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: transactions,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch transactions' },
      { status: 500 },
    );
  }
}

// POST /api/v1/portfolios/[portfolioId]/transactions
export async function POST(request: NextRequest, props: RouteParams) {
  const params = await props.params;
  try {
    const body = await request.json();
    const validatedData = createTransactionSchema.parse(body);

    // Check if portfolio exists
    const portfolio = await prisma.portfolio.findUnique({
      where: { id: params.portfolioId },
    });

    if (!portfolio) {
      return NextResponse.json({ success: false, message: 'Portfolio not found' }, { status: 404 });
    }

    // Calculate amount if not provided
    let { amount } = validatedData;
    if (!amount && validatedData.quantity && validatedData.price) {
      amount = validatedData.quantity * validatedData.price;
    }

    if (!amount) {
      return NextResponse.json(
        { success: false, message: 'Amount or quantity/price required' },
        { status: 400 },
      );
    }

    // Create transaction
    const transaction = await prisma.transaction.create({
      data: {
        portfolioId: params.portfolioId!,
        type: validatedData.type,
        symbol: validatedData.symbol!,
        quantity: validatedData.quantity ? new Decimal(validatedData.quantity) : new Decimal(0),
        price: validatedData.price ? new Decimal(validatedData.price) : new Decimal(0),
        amount: new Decimal(amount),
        fee: new Decimal(validatedData.fee),
        notes: validatedData.notes,
        executedAt: validatedData.executedAt ? new Date(validatedData.executedAt) : new Date(),
      },
    });

    // Update holdings for BUY/SELL transactions
    if (validatedData.symbol && (validatedData.type === 'BUY' || validatedData.type === 'SELL')) {
      await updateHolding(params.portfolioId, validatedData);
    }

    // Log activity
    await prisma.activity.create({
      data: {
        userId: portfolio.userId,
        type: 'TRANSACTION_CREATE',
        action: `${validatedData.type} ${validatedData.quantity} ${validatedData.symbol || ''}`,
        metadata: { transactionId: transaction.id, portfolioId: params.portfolioId },
      },
    });

    return NextResponse.json({ success: true, data: transaction }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: 'Invalid data', errors: error.issues },
        { status: 400 },
      );
    }

    console.error('Error creating transaction:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to create transaction',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

// Helper function to update holdings
async function updateHolding(portfolioId: string, transaction: any) {
  const existingHolding = await prisma.holding.findUnique({
    where: {
      portfolioId_symbol: {
        portfolioId,
        symbol: transaction.symbol,
      },
    },
  });

  if (transaction.type === 'BUY') {
    if (existingHolding) {
      // Update existing holding
      const currentQuantity = Number(existingHolding.quantity);
      const currentAvgPrice = Number(existingHolding.averagePrice);
      const newQuantity = currentQuantity + transaction.quantity;
      const newTotalCost =
        currentQuantity * currentAvgPrice + transaction.quantity * transaction.price;
      const newAvgPrice = newTotalCost / newQuantity;

      // Get current market price
      const marketClient = getMarketDataClient();
      const marketPrice = await marketClient.getPrice(transaction.symbol);
      const currentPrice = marketPrice?.price || transaction.price;

      const marketValue = newQuantity * currentPrice;
      const unrealizedPnL = marketValue - newTotalCost;

      await prisma.holding.update({
        where: { id: existingHolding.id },
        data: {
          quantity: new Decimal(newQuantity),
          averagePrice: new Decimal(newAvgPrice),
          currentPrice: new Decimal(currentPrice),
          marketValue: new Decimal(marketValue),
          unrealizedPnL: new Decimal(unrealizedPnL),
        },
      });
    } else {
      // Create new holding
      const marketClient = getMarketDataClient();
      const marketPrice = await marketClient.getPrice(transaction.symbol);
      const currentPrice = marketPrice?.price || transaction.price;

      const marketValue = transaction.quantity * currentPrice;
      const unrealizedPnL = marketValue - transaction.quantity * transaction.price;

      await prisma.holding.create({
        data: {
          portfolioId,
          symbol: transaction.symbol,
          quantity: new Decimal(transaction.quantity),
          averagePrice: new Decimal(transaction.price),
          currentPrice: new Decimal(currentPrice),
          marketValue: new Decimal(marketValue),
          unrealizedPnL: new Decimal(unrealizedPnL),
          realizedPnL: new Decimal(0),
        },
      });
    }
  } else if (transaction.type === 'SELL' && existingHolding) {
    const currentQuantity = Number(existingHolding.quantity);
    const newQuantity = currentQuantity - transaction.quantity;

    if (newQuantity <= 0) {
      // Remove holding if quantity is 0 or negative
      const realizedPnL =
        transaction.quantity * (transaction.price - Number(existingHolding.averagePrice));

      await prisma.holding.delete({
        where: { id: existingHolding.id },
      });

      // You might want to store realized P&L somewhere
    } else {
      // Update holding with reduced quantity
      const avgPrice = Number(existingHolding.averagePrice);
      const realizedPnL = transaction.quantity * (transaction.price - avgPrice);
      const currentRealizedPnL = Number(existingHolding.realizedPnL);

      // Get current market price
      const marketClient = getMarketDataClient();
      const marketPrice = await marketClient.getPrice(transaction.symbol);
      const currentPrice = marketPrice?.price || transaction.price;

      const marketValue = newQuantity * currentPrice;
      const unrealizedPnL = marketValue - newQuantity * avgPrice;

      await prisma.holding.update({
        where: { id: existingHolding.id },
        data: {
          quantity: new Decimal(newQuantity),
          currentPrice: new Decimal(currentPrice),
          marketValue: new Decimal(marketValue),
          unrealizedPnL: new Decimal(unrealizedPnL),
          realizedPnL: new Decimal(currentRealizedPnL + realizedPnL),
        },
      });
    }
  }
}
