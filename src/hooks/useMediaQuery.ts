'use client';

import { useState, useEffect } from 'react';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    
    // Set the initial value
    setMatches(media.matches);

    // Create event listener
    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Add the listener
    if (media.addEventListener) {
      media.addEventListener('change', listener);
    } else {
      // Fallback for older browsers
      media.addListener(listener);
    }

    // Clean up
    return () => {
      if (media.removeEventListener) {
        media.removeEventListener('change', listener);
      } else {
        // Fallback for older browsers
        media.removeListener(listener);
      }
    };
  }, [query]);

  return matches;
}

// Preset media queries
export function useIsMobile() {
  return useMediaQuery('(max-width: 640px)');
}

export function useIsTablet() {
  return useMediaQuery('(min-width: 641px) and (max-width: 1024px)');
}

export function useIsDesktop() {
  return useMediaQuery('(min-width: 1025px)');
}

export function useIsLargeDesktop() {
  return useMediaQuery('(min-width: 1280px)');
}

// Device type detection
export function useDeviceType() {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const isDesktop = useIsDesktop();
  const isLargeDesktop = useIsLargeDesktop();

  if (isMobile) return 'mobile';
  if (isTablet) return 'tablet';
  if (isLargeDesktop) return 'large-desktop';
  if (isDesktop) return 'desktop';
  
  return 'unknown';
}

// Orientation detection
export function useIsPortrait() {
  return useMediaQuery('(orientation: portrait)');
}

export function useIsLandscape() {
  return useMediaQuery('(orientation: landscape)');
}

// High DPI screen detection
export function useIsRetina() {
  return useMediaQuery(
    '(-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi)'
  );
}

// Reduced motion preference
export function usePrefersReducedMotion() {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}

// Dark mode preference
export function usePrefersDarkMode() {
  return useMediaQuery('(prefers-color-scheme: dark)');
}