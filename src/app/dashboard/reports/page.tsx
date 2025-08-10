'use client';

import {
  FileText,
  Download,
  Calendar,
  TrendingUp,
  Clock,
  AlertCircle,
  Settings,
  Mail,
  Send,
} from 'lucide-react';
import { useState, useEffect } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/use-toast';

interface Portfolio {
  id: string;
  name: string;
  currency: string;
  totalValue: number;
  lastUpdate: string;
}

interface ReportType {
  id: string;
  name: string;
  description: string;
  frequency: string;
}

interface ReportData {
  portfolio: Portfolio;
  reportTypes: ReportType[];
}

export default function ReportsPage() {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [selectedPortfolio, setSelectedPortfolio] = useState<string>('');
  const [selectedReportType, setSelectedReportType] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('dev@flux.ai.kr');

  useEffect(() => {
    loadReportData();
  }, []);

  const loadReportData = async () => {
    try {
      // For demo, use test portfolio
      const portfolioId = 'test-portfolio-1';
      const response = await fetch(`/api/reports?portfolioId=${portfolioId}`);

      if (!response.ok) {
        throw new Error('Failed to load report data');
      }

      const data = await response.json();
      setReportData(data);
      setSelectedPortfolio(portfolioId);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load report data:', error);
      toast({
        title: '오류',
        description: '리포트 데이터를 불러오는데 실패했습니다.',
        variant: 'destructive',
      });
      setLoading(false);
    }
  };

  const generateReport = async () => {
    if (!selectedPortfolio || !selectedReportType) {
      toast({
        title: '선택 오류',
        description: '포트폴리오와 리포트 유형을 선택해주세요.',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          portfolioId: selectedPortfolio,
          type: selectedReportType,
          format: 'pdf',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate report');
      }

      // Download the PDF
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-${selectedReportType}-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: '성공',
        description: '리포트가 성공적으로 생성되었습니다.',
      });
    } catch (error) {
      console.error('Failed to generate report:', error);
      toast({
        title: '오류',
        description: '리포트 생성에 실패했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const sendReportEmail = async () => {
    if (!selectedPortfolio || !selectedReportType || !email) {
      toast({
        title: '입력 오류',
        description: '포트폴리오, 리포트 유형, 이메일을 모두 입력해주세요.',
        variant: 'destructive',
      });
      return;
    }

    setIsSendingEmail(true);

    try {
      const response = await fetch('/api/reports/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          portfolioId: selectedPortfolio,
          reportType: selectedReportType,
          email,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send email');
      }

      toast({
        title: '이메일 발송 완료',
        description: `${email}으로 리포트가 발송되었습니다.`,
      });
    } catch (error) {
      console.error('Failed to send email:', error);
      toast({
        title: '오류',
        description: '이메일 발송에 실패했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsSendingEmail(false);
    }
  };

  const getFrequencyBadge = (frequency: string) => {
    const colors = {
      daily: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      weekly: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      monthly: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'on-demand': 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
    };

    return (
      <Badge className={colors[frequency as keyof typeof colors] || colors['on-demand']}>
        {frequency === 'on-demand' ? '요청시' : frequency}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">리포트 관리</h1>
          <p className="text-muted-foreground">포트폴리오 성과 리포트를 생성하고 관리합니다</p>
        </div>
        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4 mr-2" />
          설정
        </Button>
      </div>

      {/* Report Generation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            리포트 생성
          </CardTitle>
          <CardDescription>
            포트폴리오별로 다양한 유형의 리포트를 생성할 수 있습니다
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">포트폴리오</label>
              <Select value={selectedPortfolio} onValueChange={setSelectedPortfolio}>
                <SelectTrigger>
                  <SelectValue placeholder="포트폴리오를 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {reportData && (
                    <SelectItem value={reportData.portfolio.id}>
                      {reportData.portfolio.name}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">리포트 유형</label>
              <Select value={selectedReportType} onValueChange={setSelectedReportType}>
                <SelectTrigger>
                  <SelectValue placeholder="리포트 유형을 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {reportData?.reportTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <Button
                onClick={generateReport}
                disabled={isGenerating || !selectedPortfolio || !selectedReportType}
                className="flex-1"
              >
                <Download className="h-4 w-4 mr-2" />
                {isGenerating ? '생성 중...' : 'PDF 리포트 생성'}
              </Button>

              <div className="flex-1 space-y-2">
                <label className="text-sm font-medium">이메일 주소</label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="이메일 주소를 입력하세요"
                    className="flex-1 px-3 py-2 border border-input bg-background text-sm rounded-md"
                  />
                  <Button
                    onClick={sendReportEmail}
                    disabled={isSendingEmail || !selectedPortfolio || !selectedReportType || !email}
                    variant="outline"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {isSendingEmail ? '발송 중...' : '이메일 발송'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Report Types */}
      <Card>
        <CardHeader>
          <CardTitle>사용 가능한 리포트 유형</CardTitle>
          <CardDescription>
            각 리포트 유형별 상세 정보와 생성 주기를 확인할 수 있습니다
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reportData?.reportTypes.map((type, index) => (
              <div key={type.id}>
                <div className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{type.name}</h3>
                    {getFrequencyBadge(type.frequency)}
                  </div>
                  <p className="text-sm text-muted-foreground">{type.description}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {type.frequency}
                    </div>
                    <div className="flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      PDF 형식
                    </div>
                  </div>
                </div>
                {index < reportData.reportTypes.length - 1 && <Separator className="my-4" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Portfolio Summary */}
      {reportData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              포트폴리오 요약
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 border rounded-lg">
                <div className="text-2xl font-bold">
                  {new Intl.NumberFormat('ko-KR', {
                    style: 'currency',
                    currency: reportData.portfolio.currency,
                  }).format(Number(reportData.portfolio.totalValue))}
                </div>
                <div className="text-sm text-muted-foreground">총 자산</div>
              </div>

              <div className="text-center p-3 border rounded-lg">
                <div className="text-2xl font-bold">{reportData.portfolio.currency}</div>
                <div className="text-sm text-muted-foreground">기준통화</div>
              </div>

              <div className="text-center p-3 border rounded-lg">
                <div className="text-2xl font-bold flex items-center justify-center gap-1">
                  <Clock className="h-5 w-5" />
                </div>
                <div className="text-sm text-muted-foreground">자동 업데이트</div>
              </div>

              <div className="text-center p-3 border rounded-lg">
                <div className="text-2xl font-bold flex items-center justify-center gap-1">
                  <Mail className="h-5 w-5" />
                </div>
                <div className="text-sm text-muted-foreground">이메일 발송</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Usage Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            사용 팁
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-sm text-muted-foreground space-y-1">
            <p>• 일일 리포트: 매일 자동으로 생성되며, 당일 성과와 주요 변동사항을 포함합니다</p>
            <p>• 주간 리포트: 매주 생성되며, 주간 성과 요약과 시장 분석을 제공합니다</p>
            <p>• 월간 리포트: 월말에 생성되며, 상세한 성과 분석과 투자 권장사항을 포함합니다</p>
            <p>• 성과 분석: 필요시 생성하며, 심화된 포트폴리오 분석과 벤치마크 비교를 제공합니다</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
