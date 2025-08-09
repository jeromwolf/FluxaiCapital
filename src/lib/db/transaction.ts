import { prisma } from '@/lib/prisma';
import { TransactionType, Prisma } from '@prisma/client';

export type CreateTransactionInput = {
  portfolioId: string;
  type: TransactionType;
  symbol: string;
  quantity: number;
  price: number;
  fee?: number;
  notes?: string;
  executedAt?: Date;
};

export const transactionService = {
  // Create a new transaction
  async create(data: CreateTransactionInput) {
    const amount = data.quantity * data.price + (data.fee || 0);

    return await prisma.$transaction(async (tx) => {
      // Create transaction
      const transaction = await tx.transaction.create({
        data: {
          ...data,
          quantity: new Prisma.Decimal(data.quantity),
          price: new Prisma.Decimal(data.price),
          amount: new Prisma.Decimal(amount),
          fee: new Prisma.Decimal(data.fee || 0),
        },
      });

      // Update holdings
      const existingHolding = await tx.holding.findUnique({
        where: {
          portfolioId_symbol: {
            portfolioId: data.portfolioId,
            symbol: data.symbol,
          },
        },
      });

      if (data.type === TransactionType.BUY) {
        if (existingHolding) {
          // Update existing holding
          const newQuantity = Number(existingHolding.quantity) + data.quantity;
          const newTotalCost =
            Number(existingHolding.quantity) * Number(existingHolding.averagePrice) +
            data.quantity * data.price;
          const newAveragePrice = newTotalCost / newQuantity;

          await tx.holding.update({
            where: {
              id: existingHolding.id,
            },
            data: {
              quantity: new Prisma.Decimal(newQuantity),
              averagePrice: new Prisma.Decimal(newAveragePrice),
              currentPrice: new Prisma.Decimal(data.price),
              marketValue: new Prisma.Decimal(newQuantity * data.price),
            },
          });
        } else {
          // Create new holding
          await tx.holding.create({
            data: {
              portfolioId: data.portfolioId,
              symbol: data.symbol,
              quantity: new Prisma.Decimal(data.quantity),
              averagePrice: new Prisma.Decimal(data.price),
              currentPrice: new Prisma.Decimal(data.price),
              marketValue: new Prisma.Decimal(data.quantity * data.price),
            },
          });
        }
      } else if (data.type === TransactionType.SELL && existingHolding) {
        const newQuantity = Number(existingHolding.quantity) - data.quantity;

        if (newQuantity > 0) {
          // Update holding
          await tx.holding.update({
            where: {
              id: existingHolding.id,
            },
            data: {
              quantity: new Prisma.Decimal(newQuantity),
              currentPrice: new Prisma.Decimal(data.price),
              marketValue: new Prisma.Decimal(newQuantity * data.price),
              realizedPnL: {
                increment: new Prisma.Decimal(
                  data.quantity * (data.price - Number(existingHolding.averagePrice)),
                ),
              },
            },
          });
        } else {
          // Delete holding if quantity is 0
          await tx.holding.delete({
            where: {
              id: existingHolding.id,
            },
          });
        }
      }

      return transaction;
    });
  },

  // Get transactions for a portfolio
  async getByPortfolio(
    portfolioId: string,
    options?: {
      limit?: number;
      offset?: number;
      startDate?: Date;
      endDate?: Date;
      type?: TransactionType;
      symbol?: string;
    },
  ) {
    const where: Prisma.TransactionWhereInput = {
      portfolioId,
    };

    if (options?.type) where.type = options.type;
    if (options?.symbol) where.symbol = options.symbol;
    if (options?.startDate || options?.endDate) {
      where.executedAt = {};
      if (options.startDate) where.executedAt.gte = options.startDate;
      if (options.endDate) where.executedAt.lte = options.endDate;
    }

    return await prisma.transaction.findMany({
      where,
      orderBy: {
        executedAt: 'desc',
      },
      take: options?.limit,
      skip: options?.offset,
    });
  },

  // Get transaction by ID
  async getById(id: string) {
    return await prisma.transaction.findUnique({
      where: { id },
      include: {
        portfolio: true,
      },
    });
  },

  // Delete transaction
  async delete(id: string) {
    return await prisma.transaction.delete({
      where: { id },
    });
  },

  // Get transaction summary
  async getSummary(portfolioId: string, period?: { start: Date; end: Date }) {
    const where: Prisma.TransactionWhereInput = {
      portfolioId,
    };

    if (period) {
      where.executedAt = {
        gte: period.start,
        lte: period.end,
      };
    }

    const transactions = await prisma.transaction.groupBy({
      by: ['type'],
      where,
      _sum: {
        amount: true,
        fee: true,
      },
      _count: true,
    });

    return transactions.reduce(
      (acc, tx) => {
        acc[tx.type] = {
          count: tx._count,
          amount: Number(tx._sum.amount || 0),
          fees: Number(tx._sum.fee || 0),
        };
        return acc;
      },
      {} as Record<TransactionType, { count: number; amount: number; fees: number }>,
    );
  },
};
