'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { useIsMobile, useIsTablet } from '@/hooks/useMediaQuery';

interface MobileBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function MobileBottomSheet({
  isOpen,
  onClose,
  title,
  children,
  className,
}: MobileBottomSheetProps) {
  const isMobile = useIsMobile();

  React.useEffect(() => {
    if (isOpen && isMobile) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, isMobile]);

  if (!isMobile || !isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Bottom Sheet */}
      <div
        className={cn(
          'fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 z-50',
          'rounded-t-2xl shadow-xl',
          'animate-in slide-in-from-bottom duration-300',
          className,
        )}
      >
        {/* Handle */}
        <div className="flex justify-center pt-2">
          <div className="w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
        </div>

        {/* Header */}
        {title && (
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
          </div>
        )}

        {/* Content */}
        <div className="px-4 py-4 max-h-[70vh] overflow-y-auto">{children}</div>
      </div>
    </>
  );
}

interface SwipeableTabsProps {
  tabs: Array<{
    id: string;
    label: string;
    content: React.ReactNode;
  }>;
  defaultTab?: string;
  className?: string;
}

export function SwipeableTabs({ tabs, defaultTab, className }: SwipeableTabsProps) {
  const [activeTab, setActiveTab] = React.useState(defaultTab || tabs[0]?.id);
  const [touchStart, setTouchStart] = React.useState(0);
  const [touchEnd, setTouchEnd] = React.useState(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe || isRightSwipe) {
      const currentIndex = tabs.findIndex((tab) => tab.id === activeTab);

      if (isLeftSwipe && currentIndex < tabs.length - 1) {
        setActiveTab(tabs[currentIndex + 1].id);
      } else if (isRightSwipe && currentIndex > 0) {
        setActiveTab(tabs[currentIndex - 1].id);
      }
    }
  };

  const activeTabContent = tabs.find((tab) => tab.id === activeTab)?.content;

  return (
    <div className={className}>
      {/* Tab Headers */}
      <div className="flex overflow-x-auto scrollbar-hide border-b border-gray-200 dark:border-gray-700">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex-shrink-0 px-4 py-3 text-sm font-medium transition-colors',
              'border-b-2',
              activeTab === tab.id
                ? 'text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400'
                : 'text-gray-600 dark:text-gray-400 border-transparent hover:text-gray-900 dark:hover:text-gray-100',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div
        className="relative overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="transition-transform duration-300 ease-out">{activeTabContent}</div>
      </div>
    </div>
  );
}

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  className?: string;
}

export function PullToRefresh({ onRefresh, children, className }: PullToRefreshProps) {
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [pullDistance, setPullDistance] = React.useState(0);
  const [touchStart, setTouchStart] = React.useState(0);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (containerRef.current?.scrollTop === 0) {
      setTouchStart(e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStart && containerRef.current?.scrollTop === 0) {
      const distance = e.touches[0].clientY - touchStart;
      if (distance > 0) {
        setPullDistance(Math.min(distance, 100));
      }
    }
  };

  const handleTouchEnd = async () => {
    if (pullDistance > 70) {
      setIsRefreshing(true);
      await onRefresh();
      setIsRefreshing(false);
    }
    setPullDistance(0);
    setTouchStart(0);
  };

  return (
    <div
      ref={containerRef}
      className={cn('relative overflow-auto', className)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull indicator */}
      <div
        className={cn(
          'absolute top-0 left-0 right-0 flex justify-center items-center transition-all duration-200',
          pullDistance > 0 ? 'opacity-100' : 'opacity-0',
        )}
        style={{ height: pullDistance, marginTop: -pullDistance }}
      >
        <div
          className={cn(
            'w-8 h-8 rounded-full border-2 border-gray-300 dark:border-gray-600',
            isRefreshing && 'animate-spin border-t-blue-600 dark:border-t-blue-400',
          )}
        />
      </div>

      {/* Content */}
      <div
        style={{
          transform: `translateY(${pullDistance}px)`,
          transition: pullDistance === 0 ? 'transform 0.2s' : 'none',
        }}
      >
        {children}
      </div>
    </div>
  );
}

interface FloatingActionButtonProps {
  onClick: () => void;
  icon: React.ReactNode;
  label?: string;
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
  className?: string;
}

export function FloatingActionButton({
  onClick,
  icon,
  label,
  position = 'bottom-right',
  className,
}: FloatingActionButtonProps) {
  const positionClasses = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        'fixed z-30',
        'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600',
        'text-white rounded-full shadow-lg',
        'transition-all duration-200 hover:shadow-xl active:scale-95',
        'flex items-center gap-2',
        label ? 'px-4 py-3' : 'p-4',
        positionClasses[position],
        className,
      )}
    >
      {icon}
      {label && <span className="font-medium">{label}</span>}
    </button>
  );
}

interface TouchOptimizedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  children: React.ReactNode;
}

export function TouchOptimizedButton({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className,
  children,
  ...props
}: TouchOptimizedButtonProps) {
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm min-h-[36px]',
    md: 'px-4 py-3 text-base min-h-[44px]',
    lg: 'px-6 py-4 text-lg min-h-[52px]',
  };

  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white',
    secondary:
      'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100',
    ghost: 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300',
  };

  return (
    <button
      className={cn(
        'rounded-lg font-medium transition-all duration-200',
        'active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
        sizeClasses[size],
        variantClasses[variant],
        fullWidth && 'w-full',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
