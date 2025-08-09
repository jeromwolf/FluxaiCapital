import { useMemo, useEffect, useState } from 'react';

export interface ChartColors {
  primary: string;
  secondary: string;
  success: string;
  warning: string;
  error: string;
  muted: string;
  background: string;
  foreground: string;
  border: string;
  grid: string;
  tooltip: {
    background: string;
    foreground: string;
    border: string;
  };
  candlestick: {
    up: string;
    down: string;
    wick: string;
  };
}

export interface ChartTheme {
  colors: ChartColors;
  fontSize: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
  };
}

const lightTheme: ChartTheme = {
  colors: {
    primary: '#3b82f6',
    secondary: '#8b5cf6',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    muted: '#64748b',
    background: '#ffffff',
    foreground: '#0f172a',
    border: '#e2e8f0',
    grid: '#f1f5f9',
    tooltip: {
      background: '#ffffff',
      foreground: '#0f172a',
      border: '#e2e8f0',
    },
    candlestick: {
      up: '#10b981',
      down: '#ef4444',
      wick: '#64748b',
    },
  },
  fontSize: {
    xs: 10,
    sm: 11,
    md: 12,
    lg: 14,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
  },
};

const darkTheme: ChartTheme = {
  colors: {
    primary: '#60a5fa',
    secondary: '#a78bfa',
    success: '#34d399',
    warning: '#fbbf24',
    error: '#f87171',
    muted: '#94a3b8',
    background: '#0f172a',
    foreground: '#f8fafc',
    border: '#334155',
    grid: '#1e293b',
    tooltip: {
      background: '#1e293b',
      foreground: '#f8fafc',
      border: '#475569',
    },
    candlestick: {
      up: '#34d399',
      down: '#f87171',
      wick: '#94a3b8',
    },
  },
  fontSize: {
    xs: 10,
    sm: 11,
    md: 12,
    lg: 14,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
  },
};

export function useChartTheme(): ChartTheme {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check for system preference or stored theme
    const checkTheme = () => {
      const stored = localStorage.getItem('theme');
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const isDarkMode = stored === 'dark' || (!stored && systemDark);
      setIsDark(isDarkMode);
    };

    checkTheme();

    // Listen for theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => checkTheme();

    mediaQuery.addEventListener('change', handleChange);
    window.addEventListener('storage', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
      window.removeEventListener('storage', handleChange);
    };
  }, []);

  return useMemo(() => {
    return isDark ? darkTheme : lightTheme;
  }, [isDark]);
}

export default useChartTheme;
