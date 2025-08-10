'use client';

import { ExternalLink, TrendingUp, Calendar, RefreshCw } from 'lucide-react';
import React, { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { ResponsiveCard } from '@/components/ui/responsive-card';
import { Skeleton } from '@/components/ui/skeleton';
import { marketData, MarketNews } from '@/lib/market-data';
import { cn } from '@/lib/utils';
import { formatRelativeTime } from '@/lib/utils/format';

interface MarketNewsWidgetProps {
  category?: 'general' | 'forex' | 'crypto' | 'merger';
  limit?: number;
  className?: string;
}

export function MarketNewsWidget({
  category = 'general',
  limit = 5,
  className,
}: MarketNewsWidgetProps) {
  const [news, setNews] = useState<MarketNews[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNews = async () => {
    try {
      setRefreshing(true);
      const data = await marketData.getNews(undefined, 50); // Get general news
      setNews(data.slice(0, limit));
    } catch (error) {
      console.error('Failed to fetch market news:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNews();

    // Refresh news every 5 minutes
    const interval = setInterval(fetchNews, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [category, limit]);

  const getSentimentColor = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive':
        return 'text-green-600 dark:text-green-400';
      case 'negative':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getCategoryLabel = (category?: string) => {
    switch (category) {
      case 'technology':
        return '기술';
      case 'economy':
        return '경제';
      case 'forex':
        return '외환';
      case 'crypto':
        return '암호화폐';
      case 'merger':
        return 'M&A';
      default:
        return '일반';
    }
  };

  if (loading) {
    return (
      <ResponsiveCard className={className}>
        <div className="space-y-4">
          <Skeleton className="h-6 w-32" />
          {[...Array(limit)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          ))}
        </div>
      </ResponsiveCard>
    );
  }

  return (
    <ResponsiveCard className={className}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">시장 뉴스</h3>
        <Button
          size="icon"
          variant="ghost"
          onClick={fetchNews}
          disabled={refreshing}
          className="h-8 w-8"
        >
          <RefreshCw className={cn('h-4 w-4', refreshing && 'animate-spin')} />
        </Button>
      </div>

      <div className="space-y-4">
        {news.map((item) => (
          <article
            key={item.id}
            className="pb-4 border-b border-gray-200 dark:border-gray-700 last:border-0 last:pb-0"
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-2">
                  {item.headline}
                </h4>
                {item.url && (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                {item.summary}
              </p>

              <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-500">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatRelativeTime(item.datetime)}
                </span>
                <span>{item.source}</span>
                {item.category && (
                  <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">
                    {getCategoryLabel(item.category)}
                  </span>
                )}
                {item.sentiment && (
                  <span className={cn('font-medium', getSentimentColor(item.sentiment))}>
                    <TrendingUp className="h-3 w-3 inline-block mr-1" />
                    {item.sentiment === 'positive'
                      ? '긍정'
                      : item.sentiment === 'negative'
                        ? '부정'
                        : '중립'}
                  </span>
                )}
              </div>
            </div>

            {item.image && (
              <img
                src={item.image}
                alt={item.headline}
                className="mt-3 w-full h-32 object-cover rounded-lg"
                loading="lazy"
              />
            )}
          </article>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <Button variant="outline" className="w-full" size="sm">
          더 많은 뉴스 보기
        </Button>
      </div>
    </ResponsiveCard>
  );
}
