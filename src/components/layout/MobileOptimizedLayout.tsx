'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
// import { MobileNavigation } from './MobileNavigation';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { FloatingActionButton } from '@/components/ui/mobile-optimized';
import { Plus } from 'lucide-react';

interface MobileOptimizedLayoutProps {
  children: React.ReactNode;
  showFab?: boolean;
  fabAction?: () => void;
  fabLabel?: string;
}

export function MobileOptimizedLayout({
  children,
  showFab = false,
  fabAction,
  fabLabel,
}: MobileOptimizedLayoutProps) {
  const pathname = usePathname();
  const isMobile = useIsMobile();

  // Hide bottom navigation on certain pages
  const hideBottomNav = pathname === '/login' || pathname === '/register';

  // Calculate safe area for iOS devices
  const [safeAreaInsets, setSafeAreaInsets] = React.useState({
    top: 0,
    bottom: 0,
  });

  React.useEffect(() => {
    const computeSafeArea = () => {
      const root = document.documentElement;
      const top = parseInt(getComputedStyle(root).getPropertyValue('--sat') || '0');
      const bottom = parseInt(getComputedStyle(root).getPropertyValue('--sab') || '0');
      setSafeAreaInsets({ top, bottom });
    };

    computeSafeArea();
    window.addEventListener('resize', computeSafeArea);
    return () => window.removeEventListener('resize', computeSafeArea);
  }, []);

  if (!isMobile) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Main Content */}
      <main
        className={cn(
          'flex-1 overflow-y-auto',
          !hideBottomNav && 'pb-16', // Add padding for bottom navigation
        )}
        style={{
          paddingTop: `env(safe-area-inset-top, ${safeAreaInsets.top}px)`,
          paddingBottom: !hideBottomNav
            ? `calc(4rem + env(safe-area-inset-bottom, ${safeAreaInsets.bottom}px))`
            : `env(safe-area-inset-bottom, ${safeAreaInsets.bottom}px)`,
        }}
      >
        {children}
      </main>

      {/* Floating Action Button */}
      {showFab && fabAction && (
        <FloatingActionButton
          onClick={fabAction}
          icon={<Plus className="w-5 h-5" />}
          label={fabLabel}
          position="bottom-right"
          className={!hideBottomNav ? 'mb-16' : ''}
        />
      )}

      {/* Bottom Navigation */}
      {/* {!hideBottomNav && <MobileNavigation />} */}
    </div>
  );
}
