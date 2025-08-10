'use client';

import { Search, X, TrendingUp, FileText, Briefcase } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState, useRef, useEffect } from 'react';

import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface SearchResult {
  type: 'stock' | 'portfolio' | 'page';
  title: string;
  subtitle?: string;
  url: string;
  icon?: React.ReactNode;
}

// 검색 가능한 페이지들
const searchablePages: SearchResult[] = [
  { type: 'page', title: '대시보드', url: '/dashboard', icon: <Briefcase className="h-4 w-4" /> },
  { type: 'page', title: '포트폴리오', url: '/portfolio', icon: <Briefcase className="h-4 w-4" /> },
  { type: 'page', title: '백테스트', url: '/backtest', icon: <FileText className="h-4 w-4" /> },
  { type: 'page', title: '시장', url: '/market', icon: <TrendingUp className="h-4 w-4" /> },
  { type: 'page', title: '리포트', url: '/reports', icon: <FileText className="h-4 w-4" /> },
  { type: 'page', title: '설정', url: '/settings', icon: <FileText className="h-4 w-4" /> },
];

// 주식 심볼 데이터 (실제로는 API에서 가져와야 함)
const stockSymbols = [
  { symbol: 'AAPL', name: 'Apple Inc.' },
  { symbol: 'MSFT', name: 'Microsoft Corporation' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation' },
  { symbol: '005930', name: '삼성전자' },
  { symbol: '035420', name: 'NAVER' },
];

export function SearchBar({ className }: { className?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // 검색 실행
  const performSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    const lowercaseQuery = searchQuery.toLowerCase();
    const searchResults: SearchResult[] = [];

    // 페이지 검색
    searchablePages.forEach((page) => {
      if (page.title.toLowerCase().includes(lowercaseQuery)) {
        searchResults.push(page);
      }
    });

    // 주식 검색
    stockSymbols.forEach((stock) => {
      if (
        stock.symbol.toLowerCase().includes(lowercaseQuery) ||
        stock.name.toLowerCase().includes(lowercaseQuery)
      ) {
        searchResults.push({
          type: 'stock',
          title: stock.symbol,
          subtitle: stock.name,
          url: `/stocks/${stock.symbol}`,
          icon: <TrendingUp className="h-4 w-4" />,
        });
      }
    });

    setResults(searchResults.slice(0, 8)); // 최대 8개 결과
  };

  // 검색어 변경 시
  useEffect(() => {
    performSearch(query);
    setSelectedIndex(0);
  }, [query]);

  // 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 키보드 네비게이션
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[selectedIndex]) {
        router.push(results[selectedIndex].url);
        setIsOpen(false);
        setQuery('');
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  // 단축키 (Cmd/Ctrl + K)
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
        inputRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, []);

  return (
    <div ref={searchRef} className={cn('relative', className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="검색... (⌘K)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className="pl-9 pr-9 w-full"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* 검색 결과 드롭다운 */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
          {results.map((result, index) => (
            <button
              key={`${result.type}-${result.title}`}
              onClick={() => {
                router.push(result.url);
                setIsOpen(false);
                setQuery('');
              }}
              className={cn(
                'w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left',
                selectedIndex === index && 'bg-gray-50 dark:bg-gray-700',
              )}
            >
              <div className="text-gray-400">{result.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 dark:text-gray-100 truncate">
                  {result.title}
                </div>
                {result.subtitle && (
                  <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {result.subtitle}
                  </div>
                )}
              </div>
              <div className="text-xs text-gray-400">
                {result.type === 'stock' ? '주식' : '페이지'}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* 검색 결과 없음 */}
      {isOpen && query && results.length === 0 && (
        <div className="absolute top-full mt-2 w-full bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 text-center text-gray-500 dark:text-gray-400 z-50">
          검색 결과가 없습니다
        </div>
      )}
    </div>
  );
}
