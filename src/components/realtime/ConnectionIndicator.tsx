'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { useWebSocket } from '@/hooks/useWebSocket';

interface ConnectionIndicatorProps {
  className?: string;
  variant?: 'default' | 'compact' | 'detailed';
  showReconnectButton?: boolean;
}

export function ConnectionIndicator({
  className,
  variant = 'default',
  showReconnectButton = true,
}: ConnectionIndicatorProps) {
  const { connectionStatus, connect } = useWebSocket();
  const { connected, reconnecting, error } = connectionStatus;

  if (variant === 'compact') {
    return (
      <div className={cn('flex items-center space-x-2', className)}>
        <div
          className={cn(
            'w-2 h-2 rounded-full',
            connected && 'bg-green-500',
            reconnecting && 'bg-yellow-500 animate-pulse',
            !connected && !reconnecting && 'bg-red-500',
          )}
        />
        {!connected && showReconnectButton && (
          <button
            onClick={connect}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="재연결"
          >
            <RefreshCw className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
        )}
      </div>
    );
  }

  if (variant === 'detailed') {
    return (
      <div
        className={cn(
          'p-4 rounded-lg border',
          connected && 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
          reconnecting &&
            'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
          !connected &&
            !reconnecting &&
            'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
          className,
        )}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            {connected ? (
              <Wifi className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
            ) : (
              <WifiOff className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
            )}
            <div>
              <h4
                className={cn(
                  'font-medium',
                  connected && 'text-green-800 dark:text-green-200',
                  reconnecting && 'text-yellow-800 dark:text-yellow-200',
                  !connected && !reconnecting && 'text-red-800 dark:text-red-200',
                )}
              >
                {connected ? '실시간 연결됨' : reconnecting ? '재연결 중...' : '연결 끊김'}
              </h4>
              <p
                className={cn(
                  'text-sm mt-1',
                  connected && 'text-green-700 dark:text-green-300',
                  reconnecting && 'text-yellow-700 dark:text-yellow-300',
                  !connected && !reconnecting && 'text-red-700 dark:text-red-300',
                )}
              >
                {connected
                  ? '실시간 데이터를 수신하고 있습니다'
                  : reconnecting
                    ? '서버에 다시 연결을 시도하고 있습니다'
                    : error || '서버와의 연결이 끊어졌습니다'}
              </p>
            </div>
          </div>
          {!connected && showReconnectButton && !reconnecting && (
            <button
              onClick={connect}
              className={cn(
                'px-3 py-1 text-sm rounded-lg transition-colors',
                'bg-red-600 hover:bg-red-700 text-white',
              )}
            >
              재연결
            </button>
          )}
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <div
        className={cn(
          'flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm',
          connected && 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400',
          reconnecting &&
            'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400',
          !connected &&
            !reconnecting &&
            'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400',
        )}
      >
        {connected ? (
          <>
            <Wifi className="w-4 h-4" />
            <span>연결됨</span>
          </>
        ) : reconnecting ? (
          <>
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>재연결 중</span>
          </>
        ) : (
          <>
            <WifiOff className="w-4 h-4" />
            <span>연결 끊김</span>
          </>
        )}
      </div>

      {!connected && showReconnectButton && !reconnecting && (
        <button
          onClick={connect}
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          title="재연결"
        >
          <RefreshCw className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        </button>
      )}
    </div>
  );
}

// Minimal connection dot for headers
export function ConnectionDot({ className }: { className?: string }) {
  const { connectionStatus } = useWebSocket();
  const { connected, reconnecting } = connectionStatus;

  return (
    <div
      className={cn(
        'w-2 h-2 rounded-full',
        connected && 'bg-green-500',
        reconnecting && 'bg-yellow-500 animate-pulse',
        !connected && !reconnecting && 'bg-red-500',
        className,
      )}
      title={connected ? '실시간 연결됨' : reconnecting ? '재연결 중...' : '연결 끊김'}
    />
  );
}
