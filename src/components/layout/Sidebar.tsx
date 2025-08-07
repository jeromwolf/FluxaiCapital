'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  Home, 
  PieChart, 
  BarChart3, 
  FileText, 
  Settings,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Bell,
  HelpCircle
} from 'lucide-react';

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
}

const mainNavItems: NavItem[] = [
  { title: '대시보드', href: '/dashboard', icon: Home },
  { title: '포트폴리오', href: '/dashboard/portfolio', icon: PieChart },
  { title: '분석', href: '/dashboard/analysis', icon: BarChart3 },
  { title: '리포트', href: '/dashboard/reports', icon: FileText },
];

const secondaryNavItems: NavItem[] = [
  { title: '시장 동향', href: '/dashboard/market', icon: TrendingUp },
  { title: '알림', href: '/dashboard/notifications', icon: Bell, badge: '3' },
  { title: '설정', href: '/dashboard/settings', icon: Settings },
  { title: '도움말', href: '/dashboard/help', icon: HelpCircle },
];

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

export function Sidebar({ collapsed = false, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = React.useState(collapsed);

  React.useEffect(() => {
    setIsCollapsed(collapsed);
  }, [collapsed]);

  const handleToggle = () => {
    setIsCollapsed(!isCollapsed);
    onToggle?.();
  };

  return (
    <aside className={cn(
      'fixed left-0 top-0 z-20 h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300',
      isCollapsed ? 'w-20' : 'w-64'
    )}>
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
        <Link href="/dashboard" className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">F</span>
          </div>
          {!isCollapsed && (
            <div>
              <h1 className="font-bold text-gray-900 dark:text-gray-100">
                FLUX AI
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Capital Management
              </p>
            </div>
          )}
        </Link>
        
        <button
          onClick={handleToggle}
          className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-1">
        {/* Main Navigation */}
        <div className="space-y-1">
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors group',
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                )}
              >
                <Icon className={cn(
                  'flex-shrink-0',
                  isCollapsed ? 'w-6 h-6' : 'w-5 h-5'
                )} />
                {!isCollapsed && (
                  <>
                    <span className="font-medium">{item.title}</span>
                    {item.badge && (
                      <span className="ml-auto bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 text-xs px-2 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </Link>
            );
          })}
        </div>

        {/* Divider */}
        {!isCollapsed && (
          <div className="my-4 border-t border-gray-200 dark:border-gray-700" />
        )}

        {/* Secondary Navigation */}
        <div className="space-y-1">
          {secondaryNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors group',
                  isActive
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
                )}
              >
                <Icon className={cn(
                  'flex-shrink-0',
                  isCollapsed ? 'w-6 h-6' : 'w-5 h-5'
                )} />
                {!isCollapsed && (
                  <>
                    <span className="font-medium">{item.title}</span>
                    {item.badge && (
                      <span className="ml-auto bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 text-xs px-2 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User Profile (Bottom) */}
      {!isCollapsed && (
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer">
            <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                사용자
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                user@example.com
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tooltips for collapsed state */}
      {isCollapsed && (
        <div className="hidden group-hover:block">
          {/* Implement tooltips here */}
        </div>
      )}
    </aside>
  );
}