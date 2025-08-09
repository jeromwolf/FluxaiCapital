export enum TwitterErrorCode {
  RATE_LIMIT_EXCEEDED = 429,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  SERVER_ERROR = 500,
  SERVICE_UNAVAILABLE = 503,
}

export class TwitterApiError extends Error {
  constructor(
    message: string,
    public code: TwitterErrorCode,
    public details?: any,
  ) {
    super(message);
    this.name = 'TwitterApiError';
  }
}

export interface ErrorHandlerConfig {
  maxRetries?: number;
  retryDelay?: number;
  onError?: (error: TwitterApiError) => void;
  fallbackToMock?: boolean;
}

export class TwitterErrorHandler {
  private config: Required<ErrorHandlerConfig>;

  constructor(config?: ErrorHandlerConfig) {
    this.config = {
      maxRetries: 3,
      retryDelay: 1000,
      onError: () => {},
      fallbackToMock: process.env.NODE_ENV === 'development',
      ...config,
    };
  }

  /**
   * Wrap API calls with error handling and retry logic
   */
  async handleApiCall<T>(apiCall: () => Promise<T>, mockData?: () => T): Promise<T> {
    let lastError: TwitterApiError | null = null;

    for (let attempt = 0; attempt <= this.config.maxRetries; attempt++) {
      try {
        return await apiCall();
      } catch (error) {
        lastError = this.parseError(error);

        // Log the error
        console.error(`Twitter API error (attempt ${attempt + 1}):`, lastError);
        this.config.onError(lastError);

        // Check if we should retry
        if (!this.shouldRetry(lastError) || attempt === this.config.maxRetries) {
          break;
        }

        // Calculate backoff delay
        const delay = this.calculateBackoff(attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    // If all retries failed, check if we should use mock data
    if (this.config.fallbackToMock && mockData) {
      console.warn('Falling back to mock data due to Twitter API error');
      return mockData();
    }

    throw lastError;
  }

  /**
   * Parse error response from Twitter API
   */
  private parseError(error: any): TwitterApiError {
    if (error instanceof TwitterApiError) {
      return error;
    }

    // Parse Twitter API v2 errors
    if (error.data?.errors) {
      const firstError = error.data.errors[0];
      const code = this.mapTwitterErrorCode(firstError.type);
      return new TwitterApiError(
        firstError.message || 'Twitter API error',
        code,
        error.data.errors,
      );
    }

    // Parse HTTP errors
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.detail || error.response.statusText || 'Unknown error';
      return new TwitterApiError(message, status, error.response.data);
    }

    // Network or other errors
    return new TwitterApiError(
      error.message || 'Unknown Twitter API error',
      TwitterErrorCode.SERVER_ERROR,
      error,
    );
  }

  /**
   * Map Twitter error types to error codes
   */
  private mapTwitterErrorCode(type: string): TwitterErrorCode {
    const errorMap: Record<string, TwitterErrorCode> = {
      'https://api.twitter.com/2/problems/rate-limit-exceeded':
        TwitterErrorCode.RATE_LIMIT_EXCEEDED,
      'https://api.twitter.com/2/problems/not-authorized-for-resource': TwitterErrorCode.FORBIDDEN,
      'https://api.twitter.com/2/problems/resource-not-found': TwitterErrorCode.NOT_FOUND,
    };

    return errorMap[type] || TwitterErrorCode.SERVER_ERROR;
  }

  /**
   * Determine if error should trigger a retry
   */
  private shouldRetry(error: TwitterApiError): boolean {
    // Don't retry on client errors (except rate limit)
    if (
      error.code >= 400 &&
      error.code < 500 &&
      error.code !== TwitterErrorCode.RATE_LIMIT_EXCEEDED
    ) {
      return false;
    }

    // Retry on server errors and rate limits
    return true;
  }

  /**
   * Calculate exponential backoff delay
   */
  private calculateBackoff(attempt: number): number {
    const baseDelay = this.config.retryDelay;
    const maxDelay = 60000; // 1 minute max

    // Exponential backoff with jitter
    const exponentialDelay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
    const jitter = Math.random() * 0.3 * exponentialDelay; // 30% jitter

    return exponentialDelay + jitter;
  }

  /**
   * Create user-friendly error messages
   */
  static getUserMessage(error: TwitterApiError): string {
    switch (error.code) {
      case TwitterErrorCode.RATE_LIMIT_EXCEEDED:
        return 'Twitter API rate limit exceeded. Please try again later.';
      case TwitterErrorCode.UNAUTHORIZED:
        return 'Twitter API authentication failed. Please check your credentials.';
      case TwitterErrorCode.FORBIDDEN:
        return 'Access to Twitter API resource denied.';
      case TwitterErrorCode.NOT_FOUND:
        return 'Twitter resource not found.';
      case TwitterErrorCode.SERVER_ERROR:
      case TwitterErrorCode.SERVICE_UNAVAILABLE:
        return 'Twitter API is temporarily unavailable. Please try again later.';
      default:
        return 'An error occurred while accessing Twitter API.';
    }
  }
}

// Global error handler instance
export const twitterErrorHandler = new TwitterErrorHandler({
  onError: (error) => {
    // Log to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      console.error('Twitter API Error:', {
        code: error.code,
        message: error.message,
        details: error.details,
      });
    }
  },
});
