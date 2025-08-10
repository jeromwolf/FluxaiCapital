'use client';

export const dynamic = 'force-dynamic';

import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Bell, Check, X, TrendingUp, TrendingDown, AlertCircle, Info } from 'lucide-react';
import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import { ResponsiveCard } from '@/components/ui/responsive-card';
import { cn } from '@/lib/utils';

type NotificationType = 'price' | 'portfolio' | 'news' | 'system';
type NotificationPriority = 'high' | 'medium' | 'low';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  time: Date;
  read: boolean;
  priority: NotificationPriority;
  actionUrl?: string;
}

// 샘플 알림 데이터
const sampleNotifications: Notification[] = [
  {
    id: '1',
    type: 'price',
    title: 'AAPL 목표가 도달',
    message: 'Apple Inc. (AAPL) 주가가 설정하신 $180 목표가에 도달했습니다.',
    time: new Date(Date.now() - 1000 * 60 * 30), // 30분 전
    read: false,
    priority: 'high',
    actionUrl: '/stocks/AAPL',
  },
  {
    id: '2',
    type: 'portfolio',
    title: '포트폴리오 성과 업데이트',
    message: 'AI 성장주 포트폴리오의 이번 달 수익률이 +5.2%를 기록했습니다.',
    time: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2시간 전
    read: false,
    priority: 'medium',
    actionUrl: '/portfolio',
  },
  {
    id: '3',
    type: 'news',
    title: '주요 뉴스',
    message: 'NVDA: 새로운 AI 칩 발표로 주가 상승 예상',
    time: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5시간 전
    read: true,
    priority: 'low',
  },
  {
    id: '4',
    type: 'system',
    title: '시스템 점검 안내',
    message: '내일 오전 2시~4시 시스템 점검이 예정되어 있습니다.',
    time: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1일 전
    read: true,
    priority: 'low',
  },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(sampleNotifications);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif)),
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
  };

  const handleDelete = (id: string) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  };

  const filteredNotifications =
    filter === 'unread' ? notifications.filter((n) => !n.read) : notifications;

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'price':
        return <TrendingUp className="h-5 w-5" />;
      case 'portfolio':
        return <TrendingDown className="h-5 w-5" />;
      case 'news':
        return <Info className="h-5 w-5" />;
      case 'system':
        return <AlertCircle className="h-5 w-5" />;
    }
  };

  const getNotificationColor = (priority: NotificationPriority) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-50 dark:bg-red-900/20';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20';
      case 'low':
        return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">알림</h1>
          {unreadCount > 0 && (
            <span className="px-3 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 rounded-full text-sm font-medium">
              {unreadCount}개 안읽음
            </span>
          )}
        </div>
        <p className="text-gray-600 dark:text-gray-400">중요한 알림과 업데이트를 확인하세요</p>
      </div>

      {/* 필터 및 액션 버튼 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            전체
          </Button>
          <Button
            variant={filter === 'unread' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('unread')}
          >
            안읽음
          </Button>
        </div>

        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead}>
            모두 읽음으로 표시
          </Button>
        )}
      </div>

      {/* 알림 목록 */}
      <div className="space-y-4">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">
              {filter === 'unread' ? '읽지 않은 알림이 없습니다.' : '알림이 없습니다.'}
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <ResponsiveCard
              key={notification.id}
              className={cn(
                'p-4 transition-all',
                !notification.read && 'border-l-4 border-blue-500',
              )}
            >
              <div className="flex items-start gap-4">
                <div className={cn('p-2 rounded-lg', getNotificationColor(notification.priority))}>
                  {getNotificationIcon(notification.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h3
                        className={cn(
                          'font-medium text-gray-900 dark:text-gray-100',
                          !notification.read && 'font-semibold',
                        )}
                      >
                        {notification.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        {format(notification.time, 'PPP p', { locale: ko })}
                      </p>
                    </div>

                    <div className="flex items-center gap-1">
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleMarkAsRead(notification.id)}
                          title="읽음으로 표시"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(notification.id)}
                        title="삭제"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {notification.actionUrl && (
                    <a
                      href={notification.actionUrl}
                      className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 mt-2"
                    >
                      자세히 보기 →
                    </a>
                  )}
                </div>
              </div>
            </ResponsiveCard>
          ))
        )}
      </div>
    </div>
  );
}
