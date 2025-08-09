export interface PriceUpdate {
  symbol: string;
  price: number;
  previousPrice: number;
  change: number;
  changePercent: number;
  volume: number;
  timestamp: number;
}

export interface PortfolioUpdate {
  totalValue: number;
  dailyChange: number;
  dailyChangePercent: number;
  holdings: HoldingUpdate[];
  timestamp: number;
}

export interface HoldingUpdate {
  symbol: string;
  quantity: number;
  currentPrice: number;
  value: number;
  change: number;
  changePercent: number;
}

export interface WebSocketMessage {
  type: 'price' | 'portfolio' | 'alert' | 'connection' | 'error';
  data: any;
  timestamp: number;
}

export interface Alert {
  id: string;
  type: 'price' | 'portfolio' | 'news' | 'system';
  severity: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
}

export interface ConnectionStatus {
  connected: boolean;
  reconnecting: boolean;
  error?: string;
}
