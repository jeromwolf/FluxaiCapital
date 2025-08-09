'use client';

import { WebSocketMessage, ConnectionStatus, PriceUpdate, PortfolioUpdate, Alert } from './types';

export type WebSocketEventHandler = (data: any) => void;

export class WebSocketClient {
  private ws: WebSocket | null = null;
  private url: string;
  private reconnectInterval: number = 5000;
  private maxReconnectAttempts: number = 5;
  private reconnectAttempts: number = 0;
  private handlers: Map<string, Set<WebSocketEventHandler>> = new Map();
  private connectionStatus: ConnectionStatus = {
    connected: false,
    reconnecting: false,
  };
  private reconnectTimeout?: NodeJS.Timeout;
  private pingInterval?: NodeJS.Timeout;

  constructor(url?: string) {
    // Use environment variable or default URL
    this.url = url || process.env['NEXT_PUBLIC_WS_URL'] || 'ws://localhost:3001';
  }

  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      this.ws = new WebSocket(this.url);
      this.setupEventHandlers();
    } catch (error) {
      console.error('WebSocket connection error:', error);
      this.handleError(error as Error);
    }
  }

  disconnect(): void {
    this.clearTimers();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.updateConnectionStatus({ connected: false, reconnecting: false });
  }

  private setupEventHandlers(): void {
    if (!this.ws) return;

    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
      this.updateConnectionStatus({ connected: true, reconnecting: false });
      this.emit('connection', { status: 'connected' });
      this.startPing();
    };

    this.ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        this.handleMessage(message);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.handleError(new Error('WebSocket error'));
    };

    this.ws.onclose = () => {
      console.log('WebSocket disconnected');
      this.updateConnectionStatus({ connected: false, reconnecting: false });
      this.emit('connection', { status: 'disconnected' });
      this.clearTimers();
      this.attemptReconnect();
    };
  }

  private handleMessage(message: WebSocketMessage): void {
    switch (message.type) {
      case 'price':
        this.emit('price', message.data as PriceUpdate);
        break;
      case 'portfolio':
        this.emit('portfolio', message.data as PortfolioUpdate);
        break;
      case 'alert':
        this.emit('alert', message.data as Alert);
        break;
      case 'error':
        this.emit('error', message.data);
        break;
      default:
        console.warn('Unknown message type:', message.type);
    }
  }

  private handleError(error: Error): void {
    this.updateConnectionStatus({
      connected: false,
      reconnecting: false,
      error: error.message,
    });
    this.emit('error', error);
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.updateConnectionStatus({ connected: false, reconnecting: true });
    this.reconnectAttempts++;

    this.reconnectTimeout = setTimeout(() => {
      console.log(
        `Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`,
      );
      this.connect();
    }, this.reconnectInterval);
  }

  private updateConnectionStatus(status: Partial<ConnectionStatus>): void {
    this.connectionStatus = { ...this.connectionStatus, ...status };
    this.emit('status', this.connectionStatus);
  }

  private startPing(): void {
    this.pingInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.send('ping', {});
      }
    }, 30000); // Ping every 30 seconds
  }

  private clearTimers(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
    }
  }

  // Public methods
  send(type: string, data: any): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      const message: WebSocketMessage = {
        type: type as any,
        data,
        timestamp: Date.now(),
      };
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket is not connected');
    }
  }

  subscribe(event: string, handler: WebSocketEventHandler): () => void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event)!.add(handler);

    // Return unsubscribe function
    return () => {
      const handlers = this.handlers.get(event);
      if (handlers) {
        handlers.delete(handler);
        if (handlers.size === 0) {
          this.handlers.delete(event);
        }
      }
    };
  }

  private emit(event: string, data: any): void {
    const handlers = this.handlers.get(event);
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(data);
        } catch (error) {
          console.error(`Error in ${event} handler:`, error);
        }
      });
    }
  }

  getConnectionStatus(): ConnectionStatus {
    return { ...this.connectionStatus };
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

// Singleton instance
let wsClient: WebSocketClient | null = null;

export function getWebSocketClient(): WebSocketClient {
  if (!wsClient) {
    wsClient = new WebSocketClient();
  }
  return wsClient;
}
