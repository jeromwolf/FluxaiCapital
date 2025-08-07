interface ReportTemplate {
  title: string;
  sections: Array<{
    title: string;
    content: string;
  }>;
}

interface PortfolioData {
  id: string;
  name: string;
  currency: string;
  holdings: Array<{
    symbol: string;
    quantity: number;
    averagePrice: number;
    currentPrice: number;
    marketValue: number;
    unrealizedPnL: number;
  }>;
  transactions: Array<{
    type: string;
    symbol: string;
    quantity: number;
    price: number;
    amount: number;
    executedAt: Date;
  }>;
  performances: Array<{
    date: Date;
    totalValue: number;
    dailyReturn: number;
    cumReturn: number;
  }>;
}

export function getReportTemplate(reportType: string, portfolio: PortfolioData): ReportTemplate {
  const totalValue = portfolio.holdings.reduce((sum, holding) => sum + holding.marketValue, 0);
  const totalPnL = portfolio.holdings.reduce((sum, holding) => sum + holding.unrealizedPnL, 0);
  const latestPerformance = portfolio.performances[portfolio.performances.length - 1];
  
  const baseTemplate: ReportTemplate = {
    title: '',
    sections: []
  };

  switch (reportType) {
    case 'monthly':
      return {
        ...baseTemplate,
        title: 'Monthly Portfolio Report',
        sections: [
          {
            title: 'Portfolio Overview',
            content: `Portfolio ${portfolio.name} currently holds ${portfolio.holdings.length} different positions with a total market value of ${totalValue.toLocaleString()} ${portfolio.currency}. The unrealized P&L stands at ${totalPnL >= 0 ? '+' : ''}${totalPnL.toFixed(2)} ${portfolio.currency}.`
          },
          {
            title: 'Performance Summary',
            content: latestPerformance 
              ? `As of ${latestPerformance.date.toLocaleDateString('ko-KR')}, the portfolio shows a cumulative return of ${latestPerformance.cumReturn.toFixed(2)}% with the most recent daily return of ${latestPerformance.dailyReturn.toFixed(2)}%.`
              : 'No performance data available for this reporting period.'
          },
          {
            title: 'Risk Assessment',
            content: `The portfolio maintains diversification across ${portfolio.holdings.length} positions. Risk monitoring continues to track volatility and correlation metrics to ensure optimal risk-adjusted returns.`
          },
          {
            title: 'Transaction Activity',
            content: `During this period, ${portfolio.transactions.length} transactions were executed, including both buy and sell orders across various asset classes.`
          }
        ]
      };

    case 'quarterly':
      return {
        ...baseTemplate,
        title: 'Quarterly Portfolio Report',
        sections: [
          {
            title: 'Executive Summary',
            content: `This quarterly report provides a comprehensive analysis of portfolio ${portfolio.name} performance over the past three months. The portfolio has shown ${totalPnL >= 0 ? 'positive' : 'negative'} performance with current holdings valued at ${totalValue.toLocaleString()} ${portfolio.currency}.`
          },
          {
            title: 'Strategic Allocation',
            content: `The portfolio maintains strategic positions across ${portfolio.holdings.length} different securities, with active rebalancing to maintain target allocations while maximizing risk-adjusted returns.`
          },
          {
            title: 'Performance Analysis',
            content: latestPerformance 
              ? `Quarterly performance metrics show a cumulative return of ${latestPerformance.cumReturn.toFixed(2)}%, demonstrating the effectiveness of our AI-driven investment strategies.`
              : 'Performance analysis will be provided once sufficient data is available.'
          },
          {
            title: 'Market Outlook',
            content: 'Our AI models continue to monitor market conditions and adjust portfolio allocations accordingly. The upcoming quarter will focus on maintaining diversification while capturing emerging opportunities.'
          }
        ]
      };

    case 'annual':
      return {
        ...baseTemplate,
        title: 'Annual Portfolio Report',
        sections: [
          {
            title: 'Annual Performance Review',
            content: `Portfolio ${portfolio.name} has completed another year of systematic investment management. The portfolio currently manages ${totalValue.toLocaleString()} ${portfolio.currency} across ${portfolio.holdings.length} positions.`
          },
          {
            title: 'Strategy Effectiveness',
            content: `Our AI-powered investment strategies have executed ${portfolio.transactions.length} transactions throughout the year, maintaining disciplined risk management while pursuing optimal returns.`
          },
          {
            title: 'Risk Management',
            content: 'Annual risk metrics demonstrate effective portfolio management with controlled volatility and systematic risk controls. Diversification across asset classes continues to provide stability.'
          },
          {
            title: 'Looking Forward',
            content: 'The upcoming year will focus on expanding our AI capabilities and further optimizing portfolio performance through advanced machine learning techniques and market analysis.'
          }
        ]
      };

    default:
      return {
        ...baseTemplate,
        title: 'Portfolio Report',
        sections: [
          {
            title: 'Portfolio Summary',
            content: `Portfolio ${portfolio.name} summary with ${portfolio.holdings.length} positions and total value of ${totalValue.toLocaleString()} ${portfolio.currency}.`
          },
          {
            title: 'Current Status',
            content: `The portfolio shows ${totalPnL >= 0 ? 'gains' : 'losses'} of ${totalPnL.toFixed(2)} ${portfolio.currency} from current positions.`
          }
        ]
      };
  }
}

export function getReportStyles() {
  return {
    colors: {
      primary: '#1a365d',
      secondary: '#2d3748',
      success: '#38a169',
      danger: '#e53e3e',
      text: '#2d3748',
      border: '#e2e8f0'
    },
    fonts: {
      title: 'Helvetica-Bold',
      heading: 'Helvetica-Bold',
      body: 'Helvetica',
      small: 'Helvetica'
    },
    sizes: {
      title: 24,
      heading: 16,
      subheading: 14,
      body: 11,
      small: 10,
      tiny: 8
    }
  };
}