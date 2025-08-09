'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import {
  Home,
  PieChart,
  BarChart3,
  FileText,
  Settings,
  Menu,
  X,
  ChevronRight,
  User,
  LogOut,
} from 'lucide-react';

interface NavItem {
  titleKey: string;
  href: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { titleKey: 'nav.dashboard', href: '/dashboard', icon: Home },
  { titleKey: 'nav.portfolio', href: '/portfolio', icon: PieChart },
  { titleKey: 'nav.stocks', href: '/stocks', icon: BarChart3 },
  { titleKey: 'nav.reports', href: '/reports', icon: FileText },
  { titleKey: 'nav.settings', href: '/settings', icon: Settings },
];

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const t = useTranslations();

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Mobile Header Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between px-4 h-16">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">F</span>
            </div>
            <span className="font-semibold text-gray-900 dark:text-gray-100">FLUX AI</span>
          </Link>

          <button
            onClick={toggleMenu}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Toggle menu"
          >
            {isOpen ? (
              <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            ) : (
              <Menu className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isOpen && <div className="lg:hidden fixed inset-0 z-30 bg-black/50" onClick={toggleMenu} />}

      {/* Mobile Menu Drawer */}
      <div
        className={cn(
          'lg:hidden fixed top-0 right-0 z-40 h-full w-80 bg-white dark:bg-gray-900 shadow-xl transform transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        {/* Menu Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {t('common.menu')}
          </h2>
          <button
            onClick={toggleMenu}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {t('common.user')}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">user@example.com</p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={toggleMenu}
                className={cn(
                  'flex items-center justify-between px-4 py-3 rounded-lg transition-colors',
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300',
                )}
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{t(item.titleKey)}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-800">
          <button
            className="flex items-center space-x-3 w-full px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300"
            onClick={() => {
              // Handle logout
              console.log('Logout');
            }}
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">{t('auth.logout')}</span>
          </button>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
        <div className="grid grid-cols-5 h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center justify-center space-y-1 transition-colors',
                  isActive
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-400',
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs">{t(item.titleKey)}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
