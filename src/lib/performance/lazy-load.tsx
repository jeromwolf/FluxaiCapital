import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

// Loading component
const LoadingComponent = () => (
  <div className="flex items-center justify-center min-h-[200px]">
    <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
  </div>
);

// Lazy load heavy components
export const LazyChart = dynamic(
  () => import('@/components/charts').then(mod => mod.Chart),
  { 
    loading: () => <LoadingComponent />,
    ssr: false 
  }
);

export const LazyPieChart = dynamic(
  () => import('@/components/charts').then(mod => mod.AssetAllocationPieChart),
  { 
    loading: () => <LoadingComponent />,
    ssr: false 
  }
);

export const LazyBacktestChart = dynamic(
  () => import('@/components/charts/BacktestChart'),
  { 
    loading: () => <LoadingComponent />,
    ssr: false 
  }
);

export const LazyHoldingsTable = dynamic(
  () => import('@/components/dashboard/HoldingsTable').then(mod => mod.HoldingsTable),
  { 
    loading: () => <LoadingComponent />,
  }
);

export const LazyPortfolioOverview = dynamic(
  () => import('@/components/dashboard/PortfolioOverview').then(mod => mod.PortfolioOverview),
  { 
    loading: () => <LoadingComponent />,
  }
);

// Lazy load heavy pages
export const LazyBacktestPage = dynamic(
  () => import('@/app/[locale]/backtest/page'),
  { 
    loading: () => <LoadingComponent />,
  }
);

export const LazyStocksPage = dynamic(
  () => import('@/app/[locale]/stocks/page'),
  { 
    loading: () => <LoadingComponent />,
  }
);