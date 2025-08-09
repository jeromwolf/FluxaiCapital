import { NextResponse } from 'next/server';

const API_DOCUMENTATION = {
  title: 'FLUX AI Capital API Documentation',
  version: '1.0.0',
  baseUrl: 'https://api.flux.ai.kr/v1',
  authentication: {
    type: 'API Key',
    header: 'X-API-Key',
    description: 'Include your API key in the X-API-Key header for all requests',
  },
  endpoints: [
    {
      method: 'GET',
      path: '/portfolios',
      description: 'List all portfolios',
      permissions: ['portfolio:read'],
      response: {
        portfolios: [
          {
            id: 'string',
            name: 'string',
            description: 'string',
            totalValue: 'number',
            totalReturn: 'number',
            isActive: 'boolean',
          },
        ],
      },
    },
    {
      method: 'GET',
      path: '/portfolios/:id',
      description: 'Get a specific portfolio',
      permissions: ['portfolio:read'],
      parameters: {
        id: 'Portfolio ID',
      },
      response: {
        portfolio: {
          id: 'string',
          name: 'string',
          description: 'string',
          totalValue: 'number',
          totalReturn: 'number',
          holdings: 'array',
        },
      },
    },
    {
      method: 'GET',
      path: '/portfolios/:id/holdings',
      description: 'Get portfolio holdings',
      permissions: ['portfolio:read'],
      parameters: {
        id: 'Portfolio ID',
      },
      response: {
        holdings: [
          {
            id: 'string',
            symbol: 'string',
            quantity: 'number',
            averagePrice: 'number',
            currentPrice: 'number',
            marketValue: 'number',
            unrealizedPnL: 'number',
            weight: 'number',
          },
        ],
      },
    },
    {
      method: 'POST',
      path: '/trades',
      description: 'Execute a trade',
      permissions: ['trades:write'],
      body: {
        portfolioId: 'string',
        symbol: 'string',
        type: 'BUY | SELL',
        quantity: 'number',
        price: 'number',
      },
      response: {
        trade: {
          id: 'string',
          status: 'PENDING | COMPLETED | FAILED',
          executedAt: 'timestamp',
        },
      },
    },
    {
      method: 'GET',
      path: '/trades',
      description: 'List trade history',
      permissions: ['trades:read'],
      parameters: {
        portfolioId: 'Portfolio ID (optional)',
        limit: 'Number of results (default: 50)',
        offset: 'Pagination offset',
      },
      response: {
        trades: 'array',
        total: 'number',
      },
    },
    {
      method: 'GET',
      path: '/market/:symbol',
      description: 'Get real-time market data',
      permissions: ['market:read'],
      parameters: {
        symbol: 'Stock symbol',
      },
      response: {
        symbol: 'string',
        price: 'number',
        change: 'number',
        changePercent: 'number',
        volume: 'number',
        marketCap: 'number',
        timestamp: 'timestamp',
      },
    },
    {
      method: 'GET',
      path: '/analytics/performance',
      description: 'Get portfolio performance analytics',
      permissions: ['analytics:read'],
      parameters: {
        portfolioId: 'Portfolio ID',
        period: '1D | 1W | 1M | 3M | 6M | 1Y | ALL',
      },
      response: {
        returns: 'number',
        volatility: 'number',
        sharpeRatio: 'number',
        maxDrawdown: 'number',
        beta: 'number',
      },
    },
  ],
  errors: {
    401: 'Unauthorized - Invalid or missing API key',
    403: 'Forbidden - Insufficient permissions',
    404: 'Not Found - Resource does not exist',
    429: 'Too Many Requests - Rate limit exceeded',
    500: 'Internal Server Error',
  },
  rateLimits: {
    default: '100 requests per minute',
    trades: '10 trades per minute',
  },
  examples: {
    curl: `curl -X GET https://api.flux.ai.kr/v1/portfolios \\
  -H "X-API-Key: fluxai_your_api_key_here"`,
    javascript: `const response = await fetch('https://api.flux.ai.kr/v1/portfolios', {
  headers: {
    'X-API-Key': 'fluxai_your_api_key_here'
  }
});
const data = await response.json();`,
    python: `import requests

response = requests.get(
  'https://api.flux.ai.kr/v1/portfolios',
  headers={'X-API-Key': 'fluxai_your_api_key_here'}
)
data = response.json()`,
  },
};

export async function GET() {
  return NextResponse.json(API_DOCUMENTATION);
}
