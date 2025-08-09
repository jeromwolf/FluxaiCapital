// Chart theme configuration for FluxAI Capital
export const chartTheme = {
  // Color palette
  colors: {
    primary: '#3b82f6', // Blue
    secondary: '#8b5cf6', // Purple
    success: '#10b981', // Green
    danger: '#ef4444', // Red
    warning: '#f59e0b', // Orange
    info: '#06b6d4', // Cyan
    neutral: '#6b7280', // Gray

    // Chart specific colors
    chart: [
      '#3b82f6', // Blue
      '#8b5cf6', // Purple
      '#10b981', // Green
      '#f59e0b', // Orange
      '#ef4444', // Red
      '#06b6d4', // Cyan
      '#ec4899', // Pink
      '#84cc16', // Lime
    ],

    // Gradient colors
    gradients: {
      profit: {
        start: '#10b981',
        end: '#059669',
      },
      loss: {
        start: '#ef4444',
        end: '#dc2626',
      },
      neutral: {
        start: '#6b7280',
        end: '#4b5563',
      },
    },

    // Background colors
    background: {
      light: '#ffffff',
      dark: '#1f2937',
      card: '#f8fafc',
      cardDark: '#374151',
    },

    // Grid and axis colors
    grid: {
      light: '#e5e7eb',
      dark: '#4b5563',
    },

    // Text colors
    text: {
      primary: '#111827',
      primaryDark: '#f9fafb',
      secondary: '#6b7280',
      secondaryDark: '#9ca3af',
    },
  },

  // Font configuration
  fonts: {
    family: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
    sizes: {
      xs: '0.75rem', // 12px
      sm: '0.875rem', // 14px
      base: '1rem', // 16px
      lg: '1.125rem', // 18px
      xl: '1.25rem', // 20px
      '2xl': '1.5rem', // 24px
    },
    weights: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },

  // Spacing and sizing
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    '2xl': 48,
  },

  // Chart dimensions
  dimensions: {
    miniChart: {
      width: 200,
      height: 80,
    },
    pieChart: {
      width: 300,
      height: 300,
    },
    lineChart: {
      width: '100%',
      height: 400,
    },
    barChart: {
      width: '100%',
      height: 350,
    },
  },

  // Animation settings
  animation: {
    duration: 800,
    easing: 'ease-in-out',
  },

  // Responsive breakpoints
  breakpoints: {
    mobile: 768,
    tablet: 1024,
    desktop: 1280,
  },
};

// Dark mode theme
export const darkChartTheme = {
  ...chartTheme,
  colors: {
    ...chartTheme.colors,
    background: {
      light: chartTheme.colors.background.dark,
      dark: chartTheme.colors.background.light,
      card: chartTheme.colors.background.cardDark,
      cardDark: chartTheme.colors.background.card,
    },
    text: {
      primary: chartTheme.colors.text.primaryDark,
      primaryDark: chartTheme.colors.text.primary,
      secondary: chartTheme.colors.text.secondaryDark,
      secondaryDark: chartTheme.colors.text.secondary,
    },
  },
};

// Utility function to get theme based on mode
export const getChartTheme = (isDark = false) => {
  return isDark ? darkChartTheme : chartTheme;
};

// Common chart configurations
export const chartDefaults = {
  margin: { top: 20, right: 30, left: 20, bottom: 20 },
  grid: {
    strokeDasharray: '3 3',
    stroke: chartTheme.colors.grid.light,
    strokeOpacity: 0.5,
  },
  tooltip: {
    contentStyle: {
      backgroundColor: chartTheme.colors.background.card,
      border: `1px solid ${chartTheme.colors.grid.light}`,
      borderRadius: '8px',
      fontSize: chartTheme.fonts.sizes.sm,
      fontFamily: chartTheme.fonts.family,
      color: chartTheme.colors.text.primary,
      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    },
    cursor: {
      stroke: chartTheme.colors.primary,
      strokeWidth: 1,
      strokeOpacity: 0.7,
    },
  },
  legend: {
    wrapperStyle: {
      fontSize: chartTheme.fonts.sizes.sm,
      fontFamily: chartTheme.fonts.family,
      color: chartTheme.colors.text.secondary,
    },
  },
};

// Chart type specific configurations
export const pieChartConfig = {
  ...chartDefaults,
  dataKey: 'value',
  cx: '50%',
  cy: '50%',
  innerRadius: 60,
  outerRadius: 120,
  paddingAngle: 2,
  labelLine: false,
  label: {
    fontSize: chartTheme.fonts.sizes.sm,
    fill: chartTheme.colors.text.primary,
    fontWeight: chartTheme.fonts.weights.medium,
  },
};

export const lineChartConfig = {
  ...chartDefaults,
  strokeWidth: 2,
  dot: {
    r: 4,
    strokeWidth: 2,
    fill: chartTheme.colors.background.light,
  },
  activeDot: {
    r: 6,
    strokeWidth: 0,
  },
};

export const barChartConfig = {
  ...chartDefaults,
  barCategoryGap: '20%',
  radius: [4, 4, 0, 0],
};

export const areaChartConfig = {
  ...chartDefaults,
  strokeWidth: 2,
  fillOpacity: 0.3,
};
