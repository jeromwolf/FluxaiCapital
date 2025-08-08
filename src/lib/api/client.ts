// API Client for FLUX AI Capital

const API_BASE_URL = process.env["NEXT_PUBLIC_API_URL"] || 'http://localhost:4321'

interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  errors?: any[]
}

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
  }

  private async request<T>(
    path: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${path}`
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'API request failed')
      }

      return data
    } catch (error) {
      console.error('API request error:', error)
      throw error
    }
  }

  // User endpoints
  async getUsers() {
    return this.request<any[]>('/api/v1/users')
  }

  async getUser(userId: string) {
    return this.request<any>(`/api/v1/users/${userId}`)
  }

  async createUser(data: { email: string; name?: string }) {
    return this.request<any>('/api/v1/users', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateUser(userId: string, data: any) {
    return this.request<any>(`/api/v1/users/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  // Portfolio endpoints
  async getPortfolios(userId?: string) {
    const params = userId ? `?userId=${userId}` : ''
    return this.request<any[]>(`/api/v1/portfolios${params}`)
  }

  async getPortfolio(portfolioId: string) {
    return this.request<any>(`/api/v1/portfolios/${portfolioId}`)
  }

  async createPortfolio(data: {
    userId: string
    name: string
    description?: string
    currency?: string
  }) {
    return this.request<any>('/api/v1/portfolios', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updatePortfolio(portfolioId: string, data: any) {
    return this.request<any>(`/api/v1/portfolios/${portfolioId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  async deletePortfolio(portfolioId: string) {
    return this.request<any>(`/api/v1/portfolios/${portfolioId}`, {
      method: 'DELETE',
    })
  }

  // Holdings endpoints
  async getHoldings(portfolioId: string) {
    return this.request<any>(`/api/v1/portfolios/${portfolioId}/holdings`)
  }

  async addHolding(
    portfolioId: string,
    data: {
      symbol: string
      quantity: number
      averagePrice: number
      currentPrice: number
    }
  ) {
    return this.request<any>(`/api/v1/portfolios/${portfolioId}/holdings`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }
}

export const apiClient = new ApiClient()
export default apiClient