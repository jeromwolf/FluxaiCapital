import { useEffect, useRef, useState } from 'react';

interface UseIntersectionObserverProps {
  threshold?: number | number[];
  root?: Element | null;
  rootMargin?: string;
  freezeOnceVisible?: boolean;
}

export function useIntersectionObserver({
  threshold = 0,
  root = null,
  rootMargin = '0%',
  freezeOnceVisible = false,
}: UseIntersectionObserverProps = {}): [
  (node: Element | null) => void,
  IntersectionObserverEntry | undefined,
] {
  const [entry, setEntry] = useState<IntersectionObserverEntry>();
  const [node, setNode] = useState<Element | null>(null);

  const frozen = entry?.isIntersecting && freezeOnceVisible;

  const updateEntry = ([entry]: IntersectionObserverEntry[]): void => {
    setEntry(entry);
  };

  useEffect(() => {
    if (!node || frozen || typeof IntersectionObserver === 'undefined') {
      return;
    }

    const observerOptions = { threshold, root, rootMargin };
    const observer = new IntersectionObserver(updateEntry, observerOptions);

    observer.observe(node);

    return () => observer.disconnect();
  }, [node, JSON.stringify(threshold), root, rootMargin, frozen]);

  return [setNode, entry];
}

// Hook for lazy loading images
export function useLazyLoadImage(src: string) {
  const [imageSrc, setImageSrc] = useState<string | undefined>();
  const [imageRef, entry] = useIntersectionObserver({
    threshold: 0,
    rootMargin: '50px',
  });

  const isIntersecting = entry?.isIntersecting;

  useEffect(() => {
    if (isIntersecting && src) {
      setImageSrc(src);
    }
  }, [isIntersecting, src]);

  return { imageRef, imageSrc };
}

// Hook for infinite scroll
export function useInfiniteScroll(callback: () => void, options?: UseIntersectionObserverProps) {
  const [targetRef, entry] = useIntersectionObserver(options);

  useEffect(() => {
    if (entry?.isIntersecting) {
      callback();
    }
  }, [entry?.isIntersecting, callback]);

  return targetRef;
}
