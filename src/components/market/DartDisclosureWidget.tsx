'use client';

import {
  FileText,
  TrendingUp,
  Users,
  Building2,
  Calendar,
  ExternalLink,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import React, { useState, useEffect } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDartData } from '@/hooks/useDartData';
import {
  DartDisclosure,
  DartFinancialStatement,
  DartMajorShareholder,
  DartCompanyInfo,
} from '@/lib/market-data/types';

interface DartDisclosureWidgetProps {
  stockCode: string;
  corpName?: string;
}

export function DartDisclosureWidget({ stockCode, corpName }: DartDisclosureWidgetProps) {
  const [activeTab, setActiveTab] = useState('disclosures');

  const { disclosures, financials, shareholders, companyInfo, loading, error, refetch } =
    useDartData({ stockCode });

  const formatNumber = (num: number | undefined) => {
    if (num === undefined) return '-';
    return new Intl.NumberFormat('ko-KR').format(num);
  };

  const formatPercent = (num: number | undefined) => {
    if (num === undefined) return '-';
    return `${num.toFixed(2)}%`;
  };

  const formatDate = (dateStr: string) => {
    const year = dateStr.substring(0, 4);
    const month = dateStr.substring(4, 6);
    const day = dateStr.substring(6, 8);
    return `${year}.${month}.${day}`;
  };

  const getReportTypeBadge = (reportName: string) => {
    if (reportName.includes('사업보고서')) return <Badge variant="default">사업보고서</Badge>;
    if (reportName.includes('반기보고서')) return <Badge variant="secondary">반기보고서</Badge>;
    if (reportName.includes('분기보고서')) return <Badge>분기보고서</Badge>;
    if (reportName.includes('주요사항')) return <Badge variant="destructive">주요사항</Badge>;
    if (reportName.includes('증권신고')) return <Badge variant="outline">증권신고</Badge>;
    return <Badge variant="outline">기타</Badge>;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {corpName || '기업'} 공시정보
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={refetch} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : '새로고침'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="disclosures">공시</TabsTrigger>
            <TabsTrigger value="financials">재무정보</TabsTrigger>
            <TabsTrigger value="shareholders">주주현황</TabsTrigger>
            <TabsTrigger value="company">기업정보</TabsTrigger>
          </TabsList>

          <TabsContent value="disclosures" className="mt-4">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : error ? (
              <div className="text-center py-8 text-muted-foreground">{error}</div>
            ) : disclosures.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">최근 공시가 없습니다.</div>
            ) : (
              <div className="space-y-3">
                {disclosures.map((disclosure) => (
                  <div key={disclosure.rcept_no} className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {getReportTypeBadge(disclosure.report_nm)}
                          <span className="text-xs text-muted-foreground">
                            {formatDate(disclosure.rcept_dt)}
                          </span>
                        </div>
                        <h4 className="text-sm font-medium">{disclosure.report_nm}</h4>
                        {disclosure.flr_nm && (
                          <p className="text-xs text-muted-foreground mt-1">
                            제출인: {disclosure.flr_nm}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const url = `https://dart.fss.or.kr/dsaf001/main.do?rcpNo=${disclosure.rcept_no}`;
                          window.open(url, '_blank');
                        }}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                    <Separator />
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="financials" className="mt-4">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    손익 지표
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">매출액</span>
                      <span className="text-sm font-medium">
                        {formatNumber(financials.revenue)} 원
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">영업이익</span>
                      <span className="text-sm font-medium">
                        {formatNumber(financials.operatingProfit)} 원
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">당기순이익</span>
                      <span className="text-sm font-medium">
                        {formatNumber(financials.netIncome)} 원
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-medium">재무 비율</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">ROE</span>
                      <span className="text-sm font-medium">{formatPercent(financials.roe)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">ROA</span>
                      <span className="text-sm font-medium">{formatPercent(financials.roa)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">부채비율</span>
                      <span className="text-sm font-medium">
                        {formatPercent(financials.debtRatio)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="shareholders" className="mt-4">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : shareholders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">주주 정보가 없습니다.</div>
            ) : (
              <div className="space-y-3">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  주요 주주 현황
                </h4>
                {shareholders.map((shareholder, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium">{shareholder.nm}</p>
                        <p className="text-xs text-muted-foreground">
                          {shareholder.relate} · {shareholder.stock_knd}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {formatPercent(parseFloat(shareholder.stock_posesn_rate))}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatNumber(parseInt(shareholder.trmend_posesn_stock_co))} 주
                        </p>
                      </div>
                    </div>
                    <Separator />
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="company" className="mt-4">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : !companyInfo ? (
              <div className="text-center py-8 text-muted-foreground">기업 정보가 없습니다.</div>
            ) : (
              <div className="space-y-4">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  기업 개요
                </h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground">대표자</p>
                    <p className="text-sm font-medium">{companyInfo.ceo_nm}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">설립일</p>
                    <p className="text-sm font-medium">
                      {companyInfo.est_dt && formatDate(companyInfo.est_dt)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">결산월</p>
                    <p className="text-sm font-medium">{companyInfo.acc_mt}월</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">사업자번호</p>
                    <p className="text-sm font-medium">{companyInfo.bizr_no}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-muted-foreground">주소</p>
                    <p className="text-sm">{companyInfo.adres}</p>
                  </div>
                  {companyInfo.hm_url && (
                    <div className="col-span-2">
                      <p className="text-xs text-muted-foreground">홈페이지</p>
                      <a
                        href={companyInfo.hm_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline"
                      >
                        {companyInfo.hm_url}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
