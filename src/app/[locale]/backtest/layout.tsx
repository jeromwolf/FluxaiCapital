import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function BacktestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}