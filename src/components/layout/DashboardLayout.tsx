'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { MobileNav } from './MobileNav';
import { Sidebar } from './Sidebar';
import { useIsMobile, useIsTablet } from '@/hooks/useMediaQuery';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const pathname = usePathname();

  // Get page title based on pathname
  const getPageTitle = () => {
    const segments = pathname.split('/').filter(Boolean);
    const lastSegment = segments[segments.length - 1] || 'dashboard';
    
    const titles: Record<string, string> = {
      dashboard: '대시보드',
      portfolio: '포트폴리오',
      analysis: '분석',
      reports: '리포트',
      settings: '설정',
    };
    
    return titles[lastSegment] || lastSegment;
  };

  if (isMobile) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <MobileNav />
        
        {/* Mobile Content Area */}
        <div className="pt-16 pb-16">
          {/* Page Header */}
          <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
            <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {getPageTitle()}
            </h1>
          </div>
          
          {/* Main Content */}
          <main className="p-4">
            {children}
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Desktop/Tablet Layout */}
      <div className="flex">
        {/* Sidebar */}
        <Sidebar collapsed={isTablet} />
        
        {/* Main Content Area */}
        <div className={cn(
          'flex-1 transition-all duration-300',
          isTablet ? 'ml-20' : 'ml-64'
        )}>
          {/* Top Header */}
          <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {getPageTitle()}
              </h1>
              
              {/* Header Actions */}
              <div className="flex items-center space-x-4">
                {/* Notifications */}
                <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </button>
                
                {/* User Menu */}
                <button className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    사용자
                  </span>
                </button>
              </div>
            </div>
          </header>
          
          {/* Page Content */}
          <main className={cn(
            'p-6',
            isTablet && 'p-4'
          )}>
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

// Breadcrumb component for navigation
interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  const isMobile = useIsMobile();
  
  if (isMobile && items.length > 2) {
    // Show only first and last item on mobile
    const displayItems = [items[0], items[items.length - 1]];
    
    return (
      <nav className={cn('flex items-center text-sm', className)}>
        {displayItems.map((item, index) => (
          <React.Fragment key={index}>
            {index > 0 && (
              <span className="mx-2 text-gray-400">...</span>
            )}
            <span className={cn(
              index === displayItems.length - 1
                ? 'text-gray-900 dark:text-gray-100 font-medium'
                : 'text-gray-600 dark:text-gray-400'
            )}>
              {item.label}
            </span>
          </React.Fragment>
        ))}
      </nav>
    );
  }
  
  return (
    <nav className={cn('flex items-center text-sm', className)}>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <span className="mx-2 text-gray-400">/</span>
          )}
          <span className={cn(
            index === items.length - 1
              ? 'text-gray-900 dark:text-gray-100 font-medium'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
          )}>
            {item.label}
          </span>
        </React.Fragment>
      ))}
    </nav>
  );
}