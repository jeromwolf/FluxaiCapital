interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  strategy?: 'sliding' | 'fixed';
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
  queue: Array<() => void>;
}

export class RateLimiter {
  private limits: Map<string, RateLimitEntry> = new Map();
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = {
      strategy: 'sliding',
      ...config,
    };
  }

  /**
   * Check if request can proceed or needs to wait
   */
  async checkLimit(key: string = 'default'): Promise<void> {
    const now = Date.now();
    let entry = this.limits.get(key);

    if (!entry || now >= entry.resetTime) {
      // Create new entry or reset existing
      entry = {
        count: 0,
        resetTime: now + this.config.windowMs,
        queue: [],
      };
      this.limits.set(key, entry);
    }

    if (entry.count >= this.config.maxRequests) {
      // Rate limit exceeded, queue the request
      const waitTime = entry.resetTime - now;

      return new Promise((resolve) => {
        entry!.queue.push(resolve);

        setTimeout(() => {
          this.processQueue(key);
        }, waitTime);
      });
    }

    // Request can proceed
    entry.count++;
  }

  /**
   * Process queued requests after rate limit reset
   */
  private processQueue(key: string): void {
    const entry = this.limits.get(key);
    if (!entry) return;

    const now = Date.now();
    if (now >= entry.resetTime) {
      // Reset the entry
      entry.count = 0;
      entry.resetTime = now + this.config.windowMs;

      // Process queued requests up to the limit
      const toProcess = entry.queue.splice(0, this.config.maxRequests);
      toProcess.forEach((resolve) => {
        entry.count++;
        resolve();
      });
    }
  }

  /**
   * Get current rate limit status
   */
  getStatus(key: string = 'default'): {
    remaining: number;
    resetTime: Date;
    isLimited: boolean;
  } {
    const entry = this.limits.get(key);
    const now = Date.now();

    if (!entry || now >= entry.resetTime) {
      return {
        remaining: this.config.maxRequests,
        resetTime: new Date(now + this.config.windowMs),
        isLimited: false,
      };
    }

    return {
      remaining: Math.max(0, this.config.maxRequests - entry.count),
      resetTime: new Date(entry.resetTime),
      isLimited: entry.count >= this.config.maxRequests,
    };
  }

  /**
   * Reset rate limit for a specific key
   */
  reset(key: string = 'default'): void {
    this.limits.delete(key);
  }

  /**
   * Clear all rate limits
   */
  clearAll(): void {
    this.limits.clear();
  }
}

// Pre-configured rate limiters for different APIs
export const twitterRateLimiter = new RateLimiter({
  maxRequests: 180,
  windowMs: 15 * 60 * 1000, // 15 minutes
});

export const sentimentAnalysisRateLimiter = new RateLimiter({
  maxRequests: 100,
  windowMs: 60 * 1000, // 1 minute
});

/**
 * Decorator for rate-limited methods
 */
export function RateLimit(limiter: RateLimiter, key?: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const limitKey = key || `${target.constructor.name}.${propertyKey}`;
      await limiter.checkLimit(limitKey);
      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}

/**
 * Utility function to batch requests within rate limits
 */
export async function batchWithRateLimit<T, R>(
  items: T[],
  processor: (item: T) => Promise<R>,
  rateLimiter: RateLimiter,
  batchSize: number = 10,
): Promise<R[]> {
  const results: R[] = [];

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);

    const batchResults = await Promise.all(
      batch.map(async (item) => {
        await rateLimiter.checkLimit();
        return processor(item);
      }),
    );

    results.push(...batchResults);

    // Add a small delay between batches to avoid hitting rate limits
    if (i + batchSize < items.length) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  return results;
}
