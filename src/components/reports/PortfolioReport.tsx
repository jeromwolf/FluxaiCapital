import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Image,
} from '@react-pdf/renderer';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

// Register Korean font
Font.register({
  family: 'NotoSansKR',
  fonts: [
    {
      src: 'https://fonts.gstatic.com/ea/notosanskr/v2/NotoSansKR-Regular.otf',
      fontWeight: 400,
    },
    {
      src: 'https://fonts.gstatic.com/ea/notosanskr/v2/NotoSansKR-Bold.otf',
      fontWeight: 700,
    },
  ],
});

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
    fontFamily: 'NotoSansKR',
  },
  header: {
    marginBottom: 30,
    borderBottom: '2 solid #000000',
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 700,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#666666',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 700,
    marginBottom: 10,
    color: '#000000',
  },
  table: {
    display: 'flex',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  tableRow: {
    margin: 'auto',
    flexDirection: 'row',
  },
  tableColHeader: {
    width: '20%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderLeftWidth: 0,
    borderTopWidth: 0,
    backgroundColor: '#f3f4f6',
  },
  tableCol: {
    width: '20%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  tableCellHeader: {
    margin: 5,
    fontSize: 10,
    fontWeight: 700,
  },
  tableCell: {
    margin: 5,
    fontSize: 10,
  },
  summaryBox: {
    backgroundColor: '#f3f4f6',
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666666',
  },
  summaryValue: {
    fontSize: 12,
    fontWeight: 700,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 10,
    color: '#666666',
  },
  performance: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  performanceBox: {
    width: '30%',
    padding: 10,
    backgroundColor: '#f9fafb',
    borderRadius: 5,
  },
  performanceLabel: {
    fontSize: 10,
    color: '#666666',
    marginBottom: 5,
  },
  performanceValue: {
    fontSize: 14,
    fontWeight: 700,
  },
  positive: {
    color: '#10b981',
  },
  negative: {
    color: '#ef4444',
  },
});

interface PortfolioReportProps {
  portfolio: {
    id: string;
    name: string;
    description?: string;
    currency: string;
    createdAt: string;
    updatedAt: string;
  };
  holdings: Array<{
    symbol: string;
    quantity: number;
    averagePrice: number;
    currentPrice: number;
    marketValue: number;
    unrealizedPnL: number;
    weight: number;
  }>;
  summary: {
    totalValue: number;
    totalCost: number;
    totalUnrealizedPnL: number;
    totalReturn: number;
    holdingsCount: number;
  };
  transactions?: Array<{
    id: string;
    type: string;
    symbol?: string;
    quantity?: number;
    price?: number;
    amount: number;
    fee: number;
    executedAt: string;
  }>;
}

export const PortfolioReport: React.FC<PortfolioReportProps> = ({
  portfolio,
  holdings,
  summary,
  transactions = [],
}) => {
  const reportDate = new Date();
  
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{portfolio.name}</Text>
          <Text style={styles.subtitle}>
            FLUX AI Capital 포트폴리오 리포트 | {format(reportDate, 'yyyy년 MM월 dd일', { locale: ko })}
          </Text>
        </View>

        {/* Portfolio Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>포트폴리오 요약</Text>
          <View style={styles.summaryBox}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>총 자산가치</Text>
              <Text style={styles.summaryValue}>
                {summary.totalValue.toLocaleString()} {portfolio.currency}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>총 투자금액</Text>
              <Text style={styles.summaryValue}>
                {summary.totalCost.toLocaleString()} {portfolio.currency}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>미실현 손익</Text>
              <Text style={[
                styles.summaryValue,
                summary.totalUnrealizedPnL >= 0 ? styles.positive : styles.negative
              ]}>
                {summary.totalUnrealizedPnL >= 0 ? '+' : ''}
                {summary.totalUnrealizedPnL.toLocaleString()} {portfolio.currency}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>총 수익률</Text>
              <Text style={[
                styles.summaryValue,
                summary.totalReturn >= 0 ? styles.positive : styles.negative
              ]}>
                {summary.totalReturn >= 0 ? '+' : ''}{summary.totalReturn.toFixed(2)}%
              </Text>
            </View>
          </View>
        </View>

        {/* Performance Metrics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>성과 지표</Text>
          <View style={styles.performance}>
            <View style={styles.performanceBox}>
              <Text style={styles.performanceLabel}>1개월 수익률</Text>
              <Text style={[styles.performanceValue, styles.positive]}>+5.2%</Text>
            </View>
            <View style={styles.performanceBox}>
              <Text style={styles.performanceLabel}>3개월 수익률</Text>
              <Text style={[styles.performanceValue, styles.positive]}>+12.8%</Text>
            </View>
            <View style={styles.performanceBox}>
              <Text style={styles.performanceLabel}>연간 수익률</Text>
              <Text style={[styles.performanceValue, styles.positive]}>+18.5%</Text>
            </View>
          </View>
        </View>

        {/* Holdings Table */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>보유 자산 ({holdings.length}개)</Text>
          <View style={styles.table}>
            {/* Table Header */}
            <View style={styles.tableRow}>
              <View style={styles.tableColHeader}>
                <Text style={styles.tableCellHeader}>종목</Text>
              </View>
              <View style={styles.tableColHeader}>
                <Text style={styles.tableCellHeader}>수량</Text>
              </View>
              <View style={styles.tableColHeader}>
                <Text style={styles.tableCellHeader}>평균단가</Text>
              </View>
              <View style={styles.tableColHeader}>
                <Text style={styles.tableCellHeader}>현재가</Text>
              </View>
              <View style={styles.tableColHeader}>
                <Text style={styles.tableCellHeader}>평가금액</Text>
              </View>
            </View>
            
            {/* Table Rows */}
            {holdings.map((holding, index) => (
              <View style={styles.tableRow} key={index}>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>{holding.symbol}</Text>
                </View>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>{holding.quantity.toLocaleString()}</Text>
                </View>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>{holding.averagePrice.toLocaleString()}</Text>
                </View>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>{holding.currentPrice.toLocaleString()}</Text>
                </View>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>{holding.marketValue.toLocaleString()}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Recent Transactions */}
        {transactions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>최근 거래 내역 (최대 5건)</Text>
            <View style={styles.table}>
              <View style={styles.tableRow}>
                <View style={styles.tableColHeader}>
                  <Text style={styles.tableCellHeader}>날짜</Text>
                </View>
                <View style={styles.tableColHeader}>
                  <Text style={styles.tableCellHeader}>유형</Text>
                </View>
                <View style={styles.tableColHeader}>
                  <Text style={styles.tableCellHeader}>종목</Text>
                </View>
                <View style={styles.tableColHeader}>
                  <Text style={styles.tableCellHeader}>수량</Text>
                </View>
                <View style={styles.tableColHeader}>
                  <Text style={styles.tableCellHeader}>금액</Text>
                </View>
              </View>
              
              {transactions.slice(0, 5).map((tx, index) => (
                <View style={styles.tableRow} key={index}>
                  <View style={styles.tableCol}>
                    <Text style={styles.tableCell}>
                      {format(new Date(tx.executedAt), 'MM/dd')}
                    </Text>
                  </View>
                  <View style={styles.tableCol}>
                    <Text style={styles.tableCell}>{tx.type}</Text>
                  </View>
                  <View style={styles.tableCol}>
                    <Text style={styles.tableCell}>{tx.symbol || '-'}</Text>
                  </View>
                  <View style={styles.tableCol}>
                    <Text style={styles.tableCell}>
                      {tx.quantity ? tx.quantity.toLocaleString() : '-'}
                    </Text>
                  </View>
                  <View style={styles.tableCol}>
                    <Text style={styles.tableCell}>
                      {tx.amount.toLocaleString()}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Footer */}
        <Text style={styles.footer}>
          이 리포트는 FLUX AI Capital에서 자동으로 생성되었습니다. | https://flux.ai.kr
        </Text>
      </Page>
    </Document>
  );
};