'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DartDisclosureWidget } from '@/components/market/DartDisclosureWidget';
import { Search } from 'lucide-react';

const popularStocks = [
  { code: '005930', name: '삼성전자' },
  { code: '000660', name: 'SK하이닉스' },
  { code: '035420', name: 'NAVER' },
  { code: '035720', name: '카카오' },
  { code: '207940', name: '삼성바이오로직스' },
  { code: '005380', name: '현대차' },
  { code: '006400', name: '삼성SDI' },
  { code: '051910', name: 'LG화학' },
  { code: '005490', name: 'POSCO홀딩스' },
  { code: '096770', name: 'SK이노베이션' },
];

export default function DisclosuresPage() {
  const [selectedStock, setSelectedStock] = useState(popularStocks[0]);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = () => {
    // In a real implementation, this would search for the stock
    const stock = popularStocks.find(
      (s) =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.code.includes(searchQuery),
    );
    if (stock) {
      setSelectedStock(stock);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">기업 공시 정보</h1>
        <p className="text-muted-foreground">
          한국 금융감독원 DART 시스템의 최신 기업 공시 정보를 확인하세요
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>종목 선택</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Select
              value={selectedStock.code}
              onValueChange={(value) => {
                const stock = popularStocks.find((s) => s.code === value);
                if (stock) setSelectedStock(stock);
              }}
            >
              <SelectTrigger className="w-[300px]">
                <SelectValue placeholder="종목을 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {popularStocks.map((stock) => (
                  <SelectItem key={stock.code} value={stock.code}>
                    {stock.name} ({stock.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex gap-2 flex-1">
              <Input
                placeholder="종목명 또는 종목코드로 검색"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  }
                }}
              />
              <Button onClick={handleSearch}>
                <Search className="h-4 w-4 mr-2" />
                검색
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <DartDisclosureWidget stockCode={selectedStock.code} corpName={selectedStock.name} />

      <Card>
        <CardContent className="pt-6">
          <div className="text-sm text-muted-foreground space-y-2">
            <p>* 본 데이터는 금융감독원 전자공시시스템(DART)에서 제공하는 정보입니다.</p>
            <p>* 실시간 업데이트되는 정보이며, 투자 판단의 참고자료로만 활용하시기 바랍니다.</p>
            <p>* DART API 키가 설정되어 있어야 정상적으로 동작합니다.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
