import { useState, useEffect } from 'react';
import { 
  DartDisclosure, 
  DartFinancialStatement, 
  DartMajorShareholder,
  DartCompanyInfo 
} from '@/lib/market-data/types';

interface UseDartDataOptions {
  stockCode?: string;
  corpCode?: string;
}

interface DartData {
  disclosures: DartDisclosure[];
  financials: Record<string, number>;
  shareholders: DartMajorShareholder[];
  companyInfo: DartCompanyInfo | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useDartData({ stockCode, corpCode }: UseDartDataOptions): DartData {
  const [disclosures, setDisclosures] = useState<DartDisclosure[]>([]);
  const [financials, setFinancials] = useState<Record<string, number>>({});
  const [shareholders, setShareholders] = useState<DartMajorShareholder[]>([]);
  const [companyInfo, setCompanyInfo] = useState<DartCompanyInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!stockCode && !corpCode) {
      setError('stockCode 또는 corpCode가 필요합니다.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (stockCode) params.append('stockCode', stockCode);
      if (corpCode) params.append('corpCode', corpCode);

      // Fetch all data in parallel
      const [
        disclosuresRes,
        companyRes,
        shareholdersRes,
        metricsRes
      ] = await Promise.all([
        fetch(`/api/v1/market/dart?action=disclosures&${params}&pageCount=10`),
        fetch(`/api/v1/market/dart?action=company&${params}`),
        fetch(`/api/v1/market/dart?action=shareholders&${params}`),
        fetch(`/api/v1/market/dart?action=metrics&${params}`)
      ]);

      // Check responses
      if (!disclosuresRes.ok || !companyRes.ok || !shareholdersRes.ok || !metricsRes.ok) {
        throw new Error('Failed to fetch DART data');
      }

      // Parse responses
      const [
        disclosuresData,
        companyData,
        shareholdersData,
        metricsData
      ] = await Promise.all([
        disclosuresRes.json(),
        companyRes.json(),
        shareholdersRes.json(),
        metricsRes.json()
      ]);

      setDisclosures(disclosuresData.data || []);
      setCompanyInfo(companyData.data);
      setShareholders(shareholdersData.data || []);
      setFinancials(metricsData.data || {});
    } catch (err) {
      console.error('Failed to fetch DART data:', err);
      setError('데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (stockCode || corpCode) {
      fetchData();
    }
  }, [stockCode, corpCode]);

  return {
    disclosures,
    financials,
    shareholders,
    companyInfo,
    loading,
    error,
    refetch: fetchData
  };
}

// Hook for searching companies
export function useDartSearch(query: string) {
  const [results, setResults] = useState<Array<{
    corpCode: string;
    corpName: string;
    stockCode?: string;
  }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setResults([]);
      return;
    }

    const searchCompanies = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/v1/market/dart?action=search&query=${encodeURIComponent(query)}`
        );

        if (!response.ok) {
          throw new Error('Search failed');
        }

        const data = await response.json();
        setResults(data.data || []);
      } catch (err) {
        console.error('Search error:', err);
        setError('검색에 실패했습니다.');
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    // Debounce search
    const timer = setTimeout(searchCompanies, 300);
    return () => clearTimeout(timer);
  }, [query]);

  return { results, loading, error };
}