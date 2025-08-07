// Mock WebSocket server for development
import { WebSocketMessage, PriceUpdate, PortfolioUpdate, Alert } from './types';

export class MockWebSocketServer {
  private clients: Set<WebSocket> = new Set();
  private priceInterval?: NodeJS.Timeout;
  private portfolioInterval?: NodeJS.Timeout;
  private alertInterval?: NodeJS.Timeout;

  // Mock data
  private symbols = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'NVDA', 'META'];
  private basePrices: Record<string, number> = {
    AAPL: 175000,
    GOOGL: 125000,
    MSFT: 300000,
    AMZN: 3200000,
    TSLA: 750000,
    NVDA: 500000,
    META: 320000
  };

  private currentPrices: Record<string, number> = { ...this.basePrices };
  private portfolioValue = 100000000; // 100M KRW

  start() {
    // Simulate price updates
    this.priceInterval = setInterval(() => {
      this.symbols.forEach(symbol => {
        // Random price movement (-1% to +1%)
        const change = (Math.random() - 0.5) * 0.02;
        const oldPrice = this.currentPrices[symbol];
        const newPrice = Math.round(oldPrice * (1 + change));
        
        this.currentPrices[symbol] = newPrice;

        const priceUpdate: PriceUpdate = {
          symbol,
          price: newPrice,
          previousPrice: oldPrice,
          change: newPrice - oldPrice,
          changePercent: ((newPrice - oldPrice) / oldPrice) * 100,
          volume: Math.floor(Math.random() * 1000000),
          timestamp: Date.now()
        };

        this.broadcast({
          type: 'price',
          data: priceUpdate,
          timestamp: Date.now()
        });
      });
    }, 1000); // Update every second

    // Simulate portfolio updates
    this.portfolioInterval = setInterval(() => {
      // Calculate portfolio change based on price movements
      const dailyChange = (Math.random() - 0.5) * 0.03 * this.portfolioValue;
      this.portfolioValue += dailyChange;

      const holdings = this.symbols.slice(0, 5).map(symbol => ({
        symbol,
        quantity: Math.floor(Math.random() * 100),
        currentPrice: this.currentPrices[symbol],
        value: Math.floor(Math.random() * 20000000),
        change: (Math.random() - 0.5) * 1000000,
        changePercent: (Math.random() - 0.5) * 5
      }));

      const portfolioUpdate: PortfolioUpdate = {
        totalValue: Math.round(this.portfolioValue),
        dailyChange: Math.round(dailyChange),
        dailyChangePercent: (dailyChange / this.portfolioValue) * 100,
        holdings,
        timestamp: Date.now()
      };

      this.broadcast({
        type: 'portfolio',
        data: portfolioUpdate,
        timestamp: Date.now()
      });
    }, 2000); // Update every 2 seconds

    // Simulate alerts
    this.alertInterval = setInterval(() => {
      const alertTypes: Alert['type'][] = ['price', 'portfolio', 'news', 'system'];
      const severities: Alert['severity'][] = ['info', 'warning', 'error', 'success'];
      
      const randomSymbol = this.symbols[Math.floor(Math.random() * this.symbols.length)];
      const randomType = alertTypes[Math.floor(Math.random() * alertTypes.length)];
      const randomSeverity = severities[Math.floor(Math.random() * severities.length)];

      const alerts: Record<Alert['type'], () => Alert> = {
        price: () => ({
          id: `alert-${Date.now()}`,
          type: 'price',
          severity: randomSeverity,
          title: `${randomSymbol} 가격 알림`,
          message: `${randomSymbol}이(가) ${Math.random() > 0.5 ? '상승' : '하락'} 중입니다`,
          timestamp: Date.now(),
          read: false
        }),
        portfolio: () => ({
          id: `alert-${Date.now()}`,
          type: 'portfolio',
          severity: 'info',
          title: '포트폴리오 업데이트',
          message: '포트폴리오 가치가 업데이트되었습니다',
          timestamp: Date.now(),
          read: false
        }),
        news: () => ({
          id: `alert-${Date.now()}`,
          type: 'news',
          severity: 'info',
          title: '시장 뉴스',
          message: '새로운 시장 동향이 감지되었습니다',
          timestamp: Date.now(),
          read: false
        }),
        system: () => ({
          id: `alert-${Date.now()}`,
          type: 'system',
          severity: randomSeverity,
          title: '시스템 알림',
          message: '시스템 상태 업데이트',
          timestamp: Date.now(),
          read: false
        })
      };

      const alert = alerts[randomType]();

      this.broadcast({
        type: 'alert',
        data: alert,
        timestamp: Date.now()
      });
    }, 10000); // Alert every 10 seconds
  }

  stop() {
    if (this.priceInterval) clearInterval(this.priceInterval);
    if (this.portfolioInterval) clearInterval(this.portfolioInterval);
    if (this.alertInterval) clearInterval(this.alertInterval);
  }

  addClient(ws: WebSocket) {
    this.clients.add(ws);
    
    // Send initial connection message
    this.send(ws, {
      type: 'connection',
      data: { status: 'connected' },
      timestamp: Date.now()
    });
  }

  removeClient(ws: WebSocket) {
    this.clients.delete(ws);
  }

  private broadcast(message: WebSocketMessage) {
    const data = JSON.stringify(message);
    this.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  }

  private send(ws: WebSocket, message: WebSocketMessage) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }
}

// Browser-side mock WebSocket
export class MockWebSocket extends EventTarget {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;

  readyState: number = MockWebSocket.CONNECTING;
  url: string;
  
  private mockServer = new MockWebSocketServer();

  constructor(url: string) {
    super();
    this.url = url;
    
    // Simulate connection delay
    setTimeout(() => {
      this.readyState = MockWebSocket.OPEN;
      this.dispatchEvent(new Event('open'));
      this.mockServer.addClient(this as any);
      this.mockServer.start();
    }, 100);
  }

  send(data: string) {
    if (this.readyState !== MockWebSocket.OPEN) {
      throw new Error('WebSocket is not open');
    }
    
    // Handle ping/pong
    const message = JSON.parse(data);
    if (message.type === 'ping') {
      setTimeout(() => {
        this.dispatchEvent(new MessageEvent('message', {
          data: JSON.stringify({
            type: 'pong',
            data: {},
            timestamp: Date.now()
          })
        }));
      }, 10);
    }
  }

  close() {
    this.readyState = MockWebSocket.CLOSING;
    this.mockServer.removeClient(this as any);
    this.mockServer.stop();
    
    setTimeout(() => {
      this.readyState = MockWebSocket.CLOSED;
      this.dispatchEvent(new Event('close'));
    }, 10);
  }

  // Mock event handlers
  onopen: ((event: Event) => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;
  onclose: ((event: Event) => void) | null = null;
}

// Override WebSocket in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).MockWebSocket = MockWebSocket;
}