export interface FetchOptions extends RequestInit {
  requireAuth?: boolean;
}

class APIClient {
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || '';
  }

  private getCSRFToken(): string | null {
    if (typeof document === 'undefined') return null;

    const value = `; ${document.cookie}`;
    const parts = value.split(`; csrf-token=`);
    if (parts.length === 2) {
      return parts.pop()?.split(';').shift() || null;
    }
    return null;
  }

  async fetch<T = any>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    const { requireAuth = true, ...fetchOptions } = options;

    const headers = new Headers(fetchOptions.headers);

    // Add CSRF token for non-GET requests
    if (fetchOptions.method && fetchOptions.method !== 'GET') {
      const csrfToken = this.getCSRFToken();
      if (csrfToken) {
        headers.set('x-csrf-token', csrfToken);
      }
    }

    // Add content type if not set
    if (!headers.has('Content-Type') && fetchOptions.body) {
      headers.set('Content-Type', 'application/json');
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...fetchOptions,
      headers,
      credentials: 'include', // Include cookies
    });

    if (!response.ok) {
      if (response.status === 401 && requireAuth) {
        // Redirect to login
        window.location.href = '/login';
        throw new Error('Unauthorized');
      }

      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  get<T = any>(endpoint: string, options?: FetchOptions): Promise<T> {
    return this.fetch<T>(endpoint, { ...options, method: 'GET' });
  }

  post<T = any>(endpoint: string, body?: any, options?: FetchOptions): Promise<T> {
    return this.fetch<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  put<T = any>(endpoint: string, body?: any, options?: FetchOptions): Promise<T> {
    return this.fetch<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  delete<T = any>(endpoint: string, options?: FetchOptions): Promise<T> {
    return this.fetch<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

export const apiClient = new APIClient();
