import useSWR, { SWRConfiguration } from 'swr';
import apiClient from '@/lib/api/client';

// Custom fetcher
const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    const error = new Error('An error occurred while fetching the data.');
    throw error;
  }
  const data = await response.json();
  return data.data;
};

// User hooks
export function useUsers(config?: SWRConfiguration) {
  return useSWR('/api/v1/users', fetcher, config);
}

export function useUser(userId: string | null, config?: SWRConfiguration) {
  return useSWR(userId ? `/api/v1/users/${userId}` : null, fetcher, config);
}

// Portfolio hooks
export function usePortfolios(userId?: string, config?: SWRConfiguration) {
  const url = userId ? `/api/v1/portfolios?userId=${userId}` : '/api/v1/portfolios';
  return useSWR(url, fetcher, config);
}

export function usePortfolio(portfolioId: string | null, config?: SWRConfiguration) {
  return useSWR(portfolioId ? `/api/v1/portfolios/${portfolioId}` : null, fetcher, config);
}

// Holdings hooks
export function useHoldings(portfolioId: string | null, config?: SWRConfiguration) {
  return useSWR(portfolioId ? `/api/v1/portfolios/${portfolioId}/holdings` : null, fetcher, config);
}

// Mutation helpers
export const userMutations = {
  create: async (data: { email: string; name?: string }) => {
    return apiClient.createUser(data);
  },
  update: async (userId: string, data: any) => {
    return apiClient.updateUser(userId, data);
  },
};

export const portfolioMutations = {
  create: async (data: {
    userId: string;
    name: string;
    description?: string;
    currency?: string;
  }) => {
    return apiClient.createPortfolio(data);
  },
  update: async (portfolioId: string, data: any) => {
    return apiClient.updatePortfolio(portfolioId, data);
  },
  delete: async (portfolioId: string) => {
    return apiClient.deletePortfolio(portfolioId);
  },
};

export const holdingMutations = {
  add: async (
    portfolioId: string,
    data: {
      symbol: string;
      quantity: number;
      averagePrice: number;
      currentPrice: number;
    },
  ) => {
    return apiClient.addHolding(portfolioId, data);
  },
};

// Transaction hooks
export function useTransactions(portfolioId: string | null, config?: SWRConfiguration) {
  return useSWR(
    portfolioId ? `/api/v1/portfolios/${portfolioId}/transactions` : null,
    fetcher,
    config,
  );
}

export const transactionMutations = {
  create: async (portfolioId: string, data: any) => {
    const response = await fetch(`/api/v1/portfolios/${portfolioId}/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create transaction');
    return response.json();
  },
};
