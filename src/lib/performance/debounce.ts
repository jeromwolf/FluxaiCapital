// Debounce function for performance optimization
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout !== null) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(later, wait);
  };
}

// Throttle function for rate limiting
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number,
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Request animation frame throttle
export function rafThrottle<T extends (...args: any[]) => any>(
  func: T,
): (...args: Parameters<T>) => void {
  let rafId: number | null = null;

  return function executedFunction(...args: Parameters<T>) {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
    }

    rafId = requestAnimationFrame(() => {
      func(...args);
      rafId = null;
    });
  };
}

// Memoize function results
export function memoize<T extends (...args: any[]) => any>(
  func: T,
  resolver?: (...args: Parameters<T>) => string,
): T {
  const cache = new Map<string, ReturnType<T>>();

  return ((...args: Parameters<T>) => {
    const key = resolver ? resolver(...args) : JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key);
    }

    const result = func(...args);
    cache.set(key, result);

    return result;
  }) as T;
}

// Batch multiple calls into a single execution
export function batch<T>(func: (items: T[]) => void, wait: number = 0): (item: T) => void {
  let items: T[] = [];
  let timeout: NodeJS.Timeout | null = null;

  const flush = () => {
    const batch = items;
    items = [];
    timeout = null;

    if (batch.length > 0) {
      func(batch);
    }
  };

  return (item: T) => {
    items.push(item);

    if (timeout !== null) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(flush, wait);
  };
}
