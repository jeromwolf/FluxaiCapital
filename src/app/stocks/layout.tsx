import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function StocksLayout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
