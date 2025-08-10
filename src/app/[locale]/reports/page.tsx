'use client';

import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { FileText, Download, Send, Calendar, Filter } from 'lucide-react';
import { useSession } from 'next-auth/react';
import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import { ResponsiveCard } from '@/components/ui/responsive-card';
import { usePortfolios } from '@/hooks/useApi';

type ReportType = 'monthly' | 'quarterly' | 'annual' | 'custom';

export default function ReportsPage() {
  const { data: session } = useSession();
  const { data: portfolios } = usePortfolios(session?.user?.id);
  const [selectedPortfolio, setSelectedPortfolio] = useState<string>('');
  const [reportType, setReportType] = useState<ReportType>('monthly');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateReport = async (format: 'pdf' | 'email') => {
    if (!selectedPortfolio) {
      alert('포트폴리오를 선택해주세요.');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch(`/api/v1/portfolios/${selectedPortfolio}/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: reportType,
          format,
          email: format === 'email' ? session?.user?.email : undefined,
        }),
      });

      if (response.ok) {
        if (format === 'pdf') {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `portfolio-report-${reportType}-${new Date().toISOString().split('T')[0]}.pdf`;
          a.click();
        } else {
          alert('리포트가 이메일로 전송되었습니다.');
        }
      } else {
        alert('리포트 생성에 실패했습니다.');
      }
    } catch (error) {
      console.error('Failed to generate report:', error);
      alert('리포트 생성 중 오류가 발생했습니다.');
    } finally {
      setIsGenerating(false);
    }
  };

  // 과거 리포트 목록 (실제로는 API에서 가져와야 함)
  const pastReports = [
    {
      id: '1',
      type: 'monthly',
      date: new Date(2024, 0, 31),
      portfolioName: 'AI 성장주 포트폴리오',
    },
    {
      id: '2',
      type: 'quarterly',
      date: new Date(2023, 11, 31),
      portfolioName: '안정형 배당주 포트폴리오',
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">리포트</h1>
        <p className="text-gray-600 dark:text-gray-400">
          포트폴리오 성과 리포트를 생성하고 관리하세요
        </p>
      </div>

      {/* 리포트 생성 섹션 */}
      <ResponsiveCard className="p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">새 리포트 생성</h2>

        <div className="grid gap-4 md:grid-cols-2 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              포트폴리오 선택
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
              value={selectedPortfolio}
              onChange={(e) => setSelectedPortfolio(e.target.value)}
            >
              <option value="">포트폴리오를 선택하세요</option>
              {portfolios?.map((portfolio: any) => (
                <option key={portfolio.id} value={portfolio.id}>
                  {portfolio.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              리포트 기간
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
              value={reportType}
              onChange={(e) => setReportType(e.target.value as ReportType)}
            >
              <option value="monthly">월간 리포트</option>
              <option value="quarterly">분기 리포트</option>
              <option value="annual">연간 리포트</option>
              <option value="custom">사용자 정의</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={() => handleGenerateReport('pdf')}
            disabled={!selectedPortfolio || isGenerating}
          >
            <Download className="h-4 w-4 mr-2" />
            PDF 다운로드
          </Button>
          <Button
            variant="outline"
            onClick={() => handleGenerateReport('email')}
            disabled={!selectedPortfolio || isGenerating}
          >
            <Send className="h-4 w-4 mr-2" />
            이메일로 전송
          </Button>
        </div>
      </ResponsiveCard>

      {/* 과거 리포트 목록 */}
      <div>
        <h2 className="text-xl font-semibold mb-4">과거 리포트</h2>

        <div className="grid gap-4">
          {pastReports.map((report) => (
            <ResponsiveCard key={report.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <FileText className="h-8 w-8 text-gray-400" />
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">
                      {report.portfolioName}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {report.type === 'monthly' && '월간 리포트'}
                      {report.type === 'quarterly' && '분기 리포트'}
                      {report.type === 'annual' && '연간 리포트'}
                      {' • '}
                      {format(report.date, 'yyyy년 MM월', { locale: ko })}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </ResponsiveCard>
          ))}
        </div>

        {pastReports.length === 0 && (
          <div className="text-center py-12 text-gray-500">아직 생성된 리포트가 없습니다.</div>
        )}
      </div>
    </div>
  );
}
