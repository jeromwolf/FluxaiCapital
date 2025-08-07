'use client';

import { useState, useEffect, useMemo } from 'react';
import { Period } from '@/components/dashboard/PeriodTabs';
import { 
  filterDataByPeriod, 
  calculatePeriodReturns,
  getDataGranularityForPeriod,
  aggregateDataByGranularity,
  isDataStaleForPeriod,
  DataPoint,
  PortfolioData
} from '@/lib/utils/period-filters';

interface UsePeriodDataOptions<T> {
  data: T[];
  period: Period;
  dateField?: keyof T;
  valueField?: keyof T;
  autoRefresh?: boolean;
  refreshInterval?: number;
  onDataStale?: () => void;
}

interface UsePeriodDataReturn<T> {
  filteredData: T[];
  aggregatedData: T[];
  returns: ReturnType<typeof calculatePeriodReturns> | null;
  isLoading: boolean;
  isStale: boolean;
  refresh: () => void;
}

export function usePeriodData<T extends DataPoint>({
  data,
  period,
  dateField = 'date' as keyof T,
  valueField = 'value' as keyof T,
  autoRefresh = false,
  refreshInterval = 60000, // 1 minute default
  onDataStale
}: UsePeriodDataOptions<T>): UsePeriodDataReturn<T> {
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Filter data by period
  const filteredData = useMemo(() => {
    return filterDataByPeriod(data, period, dateField);
  }, [data, period, dateField]);

  // Aggregate data based on period granularity
  const aggregatedData = useMemo(() => {
    const granularity = getDataGranularityForPeriod(period);
    return aggregateDataByGranularity(filteredData, granularity, valueField);
  }, [filteredData, period, valueField]);

  // Calculate returns if data is portfolio data
  const returns = useMemo(() => {
    if (!data || data.length === 0) return null;
    
    // Check if data has the required fields for portfolio data
    const firstItem = data[0];
    if ('totalValue' in firstItem && 'date' in firstItem) {
      return calculatePeriodReturns(data as unknown as PortfolioData[], period);
    }
    
    return null;
  }, [data, period]);

  // Check if data is stale
  const isStale = useMemo(() => {
    return isDataStaleForPeriod(lastUpdate, period);
  }, [lastUpdate, period]);

  // Auto refresh logic
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      if (isDataStaleForPeriod(lastUpdate, period)) {
        onDataStale?.();
      }
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, lastUpdate, period, onDataStale]);

  const refresh = () => {
    setIsLoading(true);
    setLastUpdate(new Date());
    // In a real app, this would trigger data fetching
    setTimeout(() => setIsLoading(false), 500);
  };

  return {
    filteredData,
    aggregatedData,
    returns,
    isLoading,
    isStale,
    refresh
  };
}

// Hook for managing multiple data series with period filtering
interface UsePeriodSeriesOptions {
  period: Period;
  autoRefresh?: boolean;
}

export function usePeriodSeries<T extends DataPoint>({
  period,
  autoRefresh = false
}: UsePeriodSeriesOptions) {
  const [series, setSeries] = useState<Record<string, T[]>>({});
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});

  const addSeries = (key: string, data: T[]) => {
    setSeries(prev => ({ ...prev, [key]: data }));
  };

  const removeSeries = (key: string) => {
    setSeries(prev => {
      const newSeries = { ...prev };
      delete newSeries[key];
      return newSeries;
    });
  };

  const getFilteredSeries = (key: string): T[] => {
    const data = series[key] || [];
    return filterDataByPeriod(data, period);
  };

  const getAllFilteredSeries = (): Record<string, T[]> => {
    return Object.entries(series).reduce((acc, [key, data]) => {
      acc[key] = filterDataByPeriod(data, period);
      return acc;
    }, {} as Record<string, T[]>);
  };

  return {
    series,
    isLoading,
    addSeries,
    removeSeries,
    getFilteredSeries,
    getAllFilteredSeries
  };
}