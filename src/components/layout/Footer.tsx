import { TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container py-8 md:py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <TrendingUp className="h-6 w-6 text-primary" />
              <span>FLUX AI Capital</span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">AI 기반 전략적 자산관리</p>
          </div>

          <div>
            <h3 className="font-semibold">서비스</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link href="/portfolio" className="text-muted-foreground hover:text-foreground">
                  포트폴리오
                </Link>
              </li>
              <li>
                <Link href="/market" className="text-muted-foreground hover:text-foreground">
                  시장 분석
                </Link>
              </li>
              <li>
                <Link href="/analytics" className="text-muted-foreground hover:text-foreground">
                  성과 분석
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold">회사</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-foreground">
                  소개
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-foreground">
                  이용약관
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-foreground">
                  개인정보처리방침
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold">지원</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link href="/help" className="text-muted-foreground hover:text-foreground">
                  도움말
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-foreground">
                  문의하기
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t pt-8">
          <p className="text-center text-sm text-muted-foreground">
            © 2024 FLUX AI Capital. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
