'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { getWebSocketClient, WebSocketClient } from '@/lib/websocket/client';
import { ConnectionStatus, PriceUpdate, PortfolioUpdate, Alert } from '@/lib/websocket/types';

interface UseWebSocketOptions {
  autoConnect?: boolean;
  onPrice?: (data: PriceUpdate) => void;
  onPortfolio?: (data: PortfolioUpdate) => void;
  onAlert?: (data: Alert) => void;
  onError?: (error: any) => void;
  onStatusChange?: (status: ConnectionStatus) => void;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const {
    autoConnect = true,
    onPrice,
    onPortfolio,
    onAlert,
    onError,
    onStatusChange
  } = options;

  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    connected: false,
    reconnecting: false
  });
  
  const [lastPriceUpdate, setLastPriceUpdate] = useState<PriceUpdate | null>(null);
  const [lastPortfolioUpdate, setLastPortfolioUpdate] = useState<PortfolioUpdate | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  
  const wsClientRef = useRef<WebSocketClient | null>(null);
  const unsubscribersRef = useRef<(() => void)[]>([]);

  useEffect(() => {
    const wsClient = getWebSocketClient();
    wsClientRef.current = wsClient;

    // Subscribe to events
    const unsubscribers: (() => void)[] = [];

    unsubscribers.push(
      wsClient.subscribe('status', (status: ConnectionStatus) => {
        setConnectionStatus(status);
        onStatusChange?.(status);
      })
    );

    unsubscribers.push(
      wsClient.subscribe('price', (data: PriceUpdate) => {
        setLastPriceUpdate(data);
        onPrice?.(data);
      })
    );

    unsubscribers.push(
      wsClient.subscribe('portfolio', (data: PortfolioUpdate) => {
        setLastPortfolioUpdate(data);
        onPortfolio?.(data);
      })
    );

    unsubscribers.push(
      wsClient.subscribe('alert', (data: Alert) => {
        setAlerts(prev => [data, ...prev].slice(0, 50)); // Keep last 50 alerts
        onAlert?.(data);
      })
    );

    unsubscribers.push(
      wsClient.subscribe('error', (error: any) => {
        console.error('WebSocket error:', error);
        onError?.(error);
      })
    );

    unsubscribersRef.current = unsubscribers;

    // Auto connect
    if (autoConnect && !wsClient.isConnected()) {
      wsClient.connect();
    }

    // Cleanup
    return () => {
      unsubscribersRef.current.forEach(unsubscribe => unsubscribe());
      unsubscribersRef.current = [];
      // Don't disconnect here as other components might be using it
    };
  }, [autoConnect, onPrice, onPortfolio, onAlert, onError, onStatusChange]);

  const connect = useCallback(() => {
    wsClientRef.current?.connect();
  }, []);

  const disconnect = useCallback(() => {
    wsClientRef.current?.disconnect();
  }, []);

  const sendMessage = useCallback((type: string, data: any) => {
    wsClientRef.current?.send(type, data);
  }, []);

  const clearAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  const markAlertAsRead = useCallback((alertId: string) => {
    setAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId ? { ...alert, read: true } : alert
      )
    );
  }, []);

  return {
    // Connection
    connectionStatus,
    isConnected: connectionStatus.connected,
    connect,
    disconnect,
    
    // Data
    lastPriceUpdate,
    lastPortfolioUpdate,
    alerts,
    unreadAlertCount: alerts.filter(a => !a.read).length,
    
    // Actions
    sendMessage,
    clearAlerts,
    markAlertAsRead
  };
}

// Hook for subscribing to specific symbols
export function usePriceSubscription(symbols: string[]) {
  const [prices, setPrices] = useState<Record<string, PriceUpdate>>({});
  
  const { isConnected, sendMessage } = useWebSocket({
    onPrice: (update) => {
      if (symbols.includes(update.symbol)) {
        setPrices(prev => ({
          ...prev,
          [update.symbol]: update
        }));
      }
    }
  });

  useEffect(() => {
    if (isConnected && symbols.length > 0) {
      // Subscribe to price updates for specific symbols
      sendMessage('subscribe', { 
        type: 'price', 
        symbols 
      });

      // Unsubscribe on cleanup
      return () => {
        sendMessage('unsubscribe', { 
          type: 'price', 
          symbols 
        });
      };
    }
  }, [isConnected, symbols, sendMessage]);

  return prices;
}

// Hook for portfolio updates
export function usePortfolioSubscription() {
  const [portfolio, setPortfolio] = useState<PortfolioUpdate | null>(null);
  const [history, setHistory] = useState<PortfolioUpdate[]>([]);

  const { isConnected } = useWebSocket({
    onPortfolio: (update) => {
      setPortfolio(update);
      setHistory(prev => [...prev, update].slice(-100)); // Keep last 100 updates
    }
  });

  return {
    portfolio,
    history,
    isConnected
  };
}