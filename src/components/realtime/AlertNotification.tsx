'use client';

import { X, Bell, TrendingUp, TrendingDown, AlertCircle, CheckCircle } from 'lucide-react';
import React from 'react';

import { useWebSocket } from '@/hooks/useWebSocket';
import { cn } from '@/lib/utils';
import { Alert } from '@/lib/websocket/types';

interface AlertNotificationProps {
  className?: string;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  maxAlerts?: number;
}

export function AlertNotification({
  className,
  position = 'top-right',
  maxAlerts = 5,
}: AlertNotificationProps) {
  const { alerts, markAlertAsRead } = useWebSocket();
  const [dismissedAlerts, setDismissedAlerts] = React.useState<Set<string>>(new Set());

  const visibleAlerts = alerts
    .filter((alert) => !dismissedAlerts.has(alert.id))
    .slice(0, maxAlerts);

  const handleDismiss = (alertId: string) => {
    setDismissedAlerts((prev) => new Set(prev).add(alertId));
    markAlertAsRead(alertId);
  };

  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
  };

  return (
    <div className={cn('fixed z-50 space-y-2', positionClasses[position], className)}>
      {visibleAlerts.map((alert, index) => (
        <AlertItem
          key={alert.id}
          alert={alert}
          onDismiss={() => handleDismiss(alert.id)}
          style={{
            animation: `slideIn 0.3s ease-out ${index * 0.1}s both`,
          }}
        />
      ))}
    </div>
  );
}

interface AlertItemProps {
  alert: Alert;
  onDismiss: () => void;
  style?: React.CSSProperties;
}

function AlertItem({ alert, onDismiss, style }: AlertItemProps) {
  const [isExiting, setIsExiting] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(onDismiss, 300);
    }, 5000);

    return () => clearTimeout(timer);
  }, [onDismiss]);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(onDismiss, 300);
  };

  const icons = {
    price: alert.message.includes('상승') ? TrendingUp : TrendingDown,
    portfolio: Bell,
    news: AlertCircle,
    system: AlertCircle,
  };

  const Icon = icons[alert.type] || Bell;

  const severityClasses = {
    info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200',
    warning:
      'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200',
    error:
      'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200',
    success:
      'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200',
  };

  const iconClasses = {
    info: 'text-blue-600 dark:text-blue-400',
    warning: 'text-yellow-600 dark:text-yellow-400',
    error: 'text-red-600 dark:text-red-400',
    success: 'text-green-600 dark:text-green-400',
  };

  return (
    <div
      className={cn(
        'w-80 p-4 rounded-lg border shadow-lg transition-all duration-300',
        severityClasses[alert.severity],
        isExiting && 'opacity-0 translate-x-full',
      )}
      style={style}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <Icon className={cn('w-5 h-5 mt-0.5', iconClasses[alert.severity])} />
          <div className="flex-1">
            <h4 className="font-medium">{alert.title}</h4>
            <p className="text-sm mt-1 opacity-90">{alert.message}</p>
            <p className="text-xs mt-2 opacity-70">
              {new Date(alert.timestamp).toLocaleTimeString('ko-KR')}
            </p>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// Alert Center - Shows all alerts
interface AlertCenterProps {
  className?: string;
  onClose?: () => void;
}

export function AlertCenter({ className, onClose }: AlertCenterProps) {
  const { alerts, clearAlerts, markAlertAsRead, unreadAlertCount } = useWebSocket();
  const [filter, setFilter] = React.useState<Alert['type'] | 'all'>('all');

  const filteredAlerts =
    filter === 'all' ? alerts : alerts.filter((alert) => alert.type === filter);

  return (
    <div className={cn('bg-white dark:bg-gray-800 rounded-lg shadow-xl', className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">알림 센터</h2>
          {unreadAlertCount > 0 && (
            <span className="px-2 py-0.5 text-xs font-medium bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 rounded-full">
              {unreadAlertCount}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={clearAlerts}
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
          >
            모두 지우기
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-2 p-4 border-b border-gray-200 dark:border-gray-700">
        {(['all', 'price', 'portfolio', 'news', 'system'] as const).map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={cn(
              'px-3 py-1 text-sm rounded-lg transition-colors',
              filter === type
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700',
            )}
          >
            {type === 'all'
              ? '전체'
              : type === 'price'
                ? '가격'
                : type === 'portfolio'
                  ? '포트폴리오'
                  : type === 'news'
                    ? '뉴스'
                    : '시스템'}
          </button>
        ))}
      </div>

      {/* Alert List */}
      <div className="max-h-96 overflow-y-auto">
        {filteredAlerts.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">알림이 없습니다</div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredAlerts.map((alert) => (
              <AlertListItem
                key={alert.id}
                alert={alert}
                onMarkAsRead={() => markAlertAsRead(alert.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function AlertListItem({ alert, onMarkAsRead }: { alert: Alert; onMarkAsRead: () => void }) {
  const icons = {
    price: alert.message.includes('상승') ? TrendingUp : TrendingDown,
    portfolio: Bell,
    news: AlertCircle,
    system: AlertCircle,
  };

  const Icon = icons[alert.type] || Bell;

  return (
    <div
      className={cn(
        'p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer',
        !alert.read && 'bg-blue-50/50 dark:bg-blue-900/10',
      )}
      onClick={onMarkAsRead}
    >
      <div className="flex items-start space-x-3">
        <Icon
          className={cn(
            'w-5 h-5 mt-0.5',
            alert.severity === 'error' && 'text-red-600 dark:text-red-400',
            alert.severity === 'warning' && 'text-yellow-600 dark:text-yellow-400',
            alert.severity === 'success' && 'text-green-600 dark:text-green-400',
            alert.severity === 'info' && 'text-blue-600 dark:text-blue-400',
          )}
        />
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h4
                className={cn(
                  'font-medium text-gray-900 dark:text-gray-100',
                  !alert.read && 'font-semibold',
                )}
              >
                {alert.title}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{alert.message}</p>
            </div>
            {!alert.read && (
              <span className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full flex-shrink-0 mt-2" />
            )}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
            {new Date(alert.timestamp).toLocaleString('ko-KR')}
          </p>
        </div>
      </div>
    </div>
  );
}
