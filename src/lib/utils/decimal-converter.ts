import { Decimal } from '@prisma/client/runtime/library';

/**
 * Convert Prisma Decimal to number
 */
export function decimalToNumber(decimal: Decimal): number {
  return decimal.toNumber();
}

/**
 * Convert portfolio holdings from Prisma format to report format
 */
export function convertHoldingsForReport(holdings: any[]): any[] {
  return holdings.map((holding) => ({
    symbol: holding.symbol,
    quantity: decimalToNumber(holding.quantity),
    averagePrice: decimalToNumber(holding.averagePrice),
    currentPrice: decimalToNumber(holding.currentPrice),
    marketValue: decimalToNumber(holding.marketValue),
    unrealizedPnL: decimalToNumber(holding.unrealizedPnL),
    weight:
      holding.marketValue && holding.portfolioId
        ? (decimalToNumber(holding.marketValue) / decimalToNumber(holding.marketValue)) * 100
        : 0,
  }));
}

/**
 * Convert portfolio transactions from Prisma format to report format
 */
export function convertTransactionsForReport(transactions: any[]): any[] {
  return transactions.map((tx) => ({
    id: tx.id,
    type: tx.type,
    symbol: tx.symbol,
    quantity: tx.quantity ? decimalToNumber(tx.quantity) : undefined,
    price: tx.price ? decimalToNumber(tx.price) : undefined,
    amount: decimalToNumber(tx.amount),
    fee: decimalToNumber(tx.fee),
    executedAt: tx.executedAt.toISOString(),
  }));
}

/**
 * Convert portfolio data for PDF report generation (legacy format)
 */
export function convertPortfolioForReport(portfolio: any) {
  const holdings = convertHoldingsForReport(portfolio.holdings);
  const transactions = convertTransactionsForReport(portfolio.transactions || []);
  const performances = portfolio.performances
    ? portfolio.performances.map((perf: any) => ({
        date: new Date(perf.date),
        totalValue: decimalToNumber(perf.totalValue),
        dailyReturn: decimalToNumber(perf.dailyReturn),
        cumReturn: decimalToNumber(perf.cumReturn),
      }))
    : [];

  return {
    id: portfolio.id,
    name: portfolio.name,
    currency: portfolio.currency,
    holdings,
    transactions: transactions.map((tx) => ({
      ...tx,
      executedAt: new Date(tx.executedAt),
    })),
    performances,
  };
}

/**
 * Convert portfolio data for React PDF report generation
 */
export function convertPortfolioForReactPDFReport(portfolio: any) {
  const holdings = convertHoldingsForReport(portfolio.holdings);
  const transactions = convertTransactionsForReport(portfolio.transactions || []);

  // Calculate summary
  const totalValue = holdings.reduce((sum, h) => sum + h.marketValue, 0);
  const totalCost = holdings.reduce((sum, h) => sum + h.quantity * h.averagePrice, 0);
  const totalUnrealizedPnL = holdings.reduce((sum, h) => sum + h.unrealizedPnL, 0);
  const totalReturn = totalCost > 0 ? ((totalValue - totalCost) / totalCost) * 100 : 0;

  return {
    portfolio: {
      id: portfolio.id,
      name: portfolio.name,
      description: portfolio.description,
      currency: portfolio.currency,
      createdAt: portfolio.createdAt.toISOString(),
      updatedAt: portfolio.updatedAt.toISOString(),
    },
    holdings: holdings.map((h) => ({
      ...h,
      weight: totalValue > 0 ? (h.marketValue / totalValue) * 100 : 0,
    })),
    summary: {
      totalValue,
      totalCost,
      totalUnrealizedPnL,
      totalReturn,
      holdingsCount: holdings.length,
    },
    transactions,
  };
}
