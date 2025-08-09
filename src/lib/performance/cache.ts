// Simple in-memory cache for client-side data
class MemoryCache {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private defaultTTL: number = 5 * 60 * 1000; // 5 minutes

  set(key: string, data: any, ttl?: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now() + (ttl || this.defaultTTL),
    });
  }

  get(key: string): any | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    if (Date.now() > item.timestamp) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Clean up expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.timestamp) {
        this.cache.delete(key);
      }
    }
  }
}

export const cache = new MemoryCache();

// Run cleanup every minute
if (typeof window !== 'undefined') {
  setInterval(() => cache.cleanup(), 60 * 1000);
}

// Cache keys
export const CACHE_KEYS = {
  PORTFOLIO_LIST: 'portfolios',
  PORTFOLIO_DETAIL: (id: string) => `portfolio:${id}`,
  HOLDINGS: (portfolioId: string) => `holdings:${portfolioId}`,
  MARKET_DATA: (symbol: string) => `market:${symbol}`,
  USER_SETTINGS: 'user:settings',
  API_KEYS: 'api:keys',
} as const;

// Cache utilities
export function getCachedData<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl?: number
): Promise<T> {
  const cached = cache.get(key);
  
  if (cached) {
    return Promise.resolve(cached);
  }

  return fetcher().then(data => {
    cache.set(key, data, ttl);
    return data;
  });
}

// React Query-like cache invalidation
export function invalidateCache(pattern?: string): void {
  if (!pattern) {
    cache.clear();
    return;
  }

  // Invalidate all keys matching the pattern
  const keys = Array.from((cache as any).cache.keys());
  keys.forEach(key => {
    if (key.includes(pattern)) {
      cache.delete(key);
    }
  });
}