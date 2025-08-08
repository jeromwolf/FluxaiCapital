'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface DownloadReportButtonProps {
  portfolioId: string;
  portfolioName: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
}

export function DownloadReportButton({ 
  portfolioId, 
  portfolioName,
  variant = 'outline',
  size = 'default'
}: DownloadReportButtonProps) {
  const [isDownloading, setIsDownloading] = React.useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    
    try {
      const response = await fetch(`/api/v1/portfolios/${portfolioId}/report`);
      
      if (!response.ok) {
        throw new Error('리포트 생성에 실패했습니다');
      }

      // Get the blob from response
      const blob = await response.blob();
      
      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${portfolioName.replace(/\s+/g, '-')}-리포트-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('리포트가 다운로드되었습니다');
    } catch (error) {
      console.error('Error downloading report:', error);
      toast.error('리포트 다운로드에 실패했습니다');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Button 
      variant={variant}
      size={size}
      onClick={handleDownload}
      disabled={isDownloading}
    >
      {isDownloading ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          다운로드 중...
        </>
      ) : (
        <>
          <Download className="h-4 w-4 mr-2" />
          리포트
        </>
      )}
    </Button>
  );
}