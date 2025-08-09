import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export type CreatePortfolioInput = {
  userId: string;
  name: string;
  description?: string;
  currency?: string;
};

export type UpdatePortfolioInput = {
  name?: string;
  description?: string;
  isActive?: boolean;
};

export const portfolioService = {
  // Create a new portfolio
  async create(data: CreatePortfolioInput) {
    return await prisma.portfolio.create({
      data,
      include: {
        holdings: true,
        _count: {
          select: { transactions: true },
        },
      },
    });
  },

  // Get portfolio by ID
  async getById(id: string, userId: string) {
    return await prisma.portfolio.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        holdings: true,
        _count: {
          select: { transactions: true },
        },
      },
    });
  },

  // Get all portfolios for a user
  async getAllByUser(userId: string) {
    return await prisma.portfolio.findMany({
      where: {
        userId,
      },
      include: {
        holdings: true,
        _count: {
          select: { transactions: true },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  },

  // Update portfolio
  async update(id: string, userId: string, data: UpdatePortfolioInput) {
    return await prisma.portfolio.update({
      where: {
        id,
        userId,
      },
      data,
      include: {
        holdings: true,
        _count: {
          select: { transactions: true },
        },
      },
    });
  },

  // Delete portfolio
  async delete(id: string, userId: string) {
    return await prisma.portfolio.delete({
      where: {
        id,
        userId,
      },
    });
  },

  // Get portfolio performance
  async getPerformance(portfolioId: string, startDate?: Date, endDate?: Date) {
    const where: Prisma.PerformanceWhereInput = {
      portfolioId,
    };

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = startDate;
      if (endDate) where.date.lte = endDate;
    }

    return await prisma.performance.findMany({
      where,
      orderBy: {
        date: 'asc',
      },
    });
  },

  // Calculate portfolio value
  async calculateTotalValue(portfolioId: string) {
    const holdings = await prisma.holding.findMany({
      where: { portfolioId },
    });

    return holdings.reduce((total, holding) => total + Number(holding.marketValue), 0);
  },
};
