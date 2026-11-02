import { useCallback, useEffect, useRef } from 'react';
import { useUI } from '../store/useUI';

interface UseHeaderVisibilityOptions {
  downThreshold?: number; // default 60px
  upHysteresis?: number; // default 8px
  topBoundary?: number; // default 56px
}

export function useHeaderVisibility(options: UseHeaderVisibilityOptions = {}) {
  const { downThreshold = 60, upHysteresis = 8, topBoundary = 56 } = options;

  const lastScrollYRef = useRef<number>(0);
  const accumulatedDownRef = useRef<number>(0);
  const accumulatedUpRef = useRef<number>(0);
  const rAFRef = useRef<number | null>(null);

  const isVisible = useUI((s) => s.chromeVisible);
  const setChromeVisible = useUI((s) => s.setChromeVisible);
  const toggleVisibility = useUI((s) => s.toggleChrome);

  const showHeader = useCallback(() => {
    setChromeVisible(true);
  }, [setChromeVisible]);

  const hideHeader = useCallback(() => {
    setChromeVisible(false);
  }, [setChromeVisible]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleScroll = () => {
      if (rAFRef.current !== null) return;

      rAFRef.current = window.requestAnimationFrame(() => {
        rAFRef.current = null;
        const currentY = Math.max(0, window.scrollY);
        const delta = currentY - lastScrollYRef.current;
        lastScrollYRef.current = currentY;

        // If at top of the canvas, always keep header visible
        if (currentY <= topBoundary) {
          accumulatedDownRef.current = 0;
          accumulatedUpRef.current = 0;
          showHeader();
          return;
        }

        if (delta > 0) {
          // Scrolling down
          accumulatedUpRef.current = 0;
          accumulatedDownRef.current += delta;

          if (accumulatedDownRef.current > downThreshold) {
            hideHeader();
          }
        } else if (delta < 0) {
          // Scrolling up
          accumulatedDownRef.current = 0;
          accumulatedUpRef.current += Math.abs(delta);

          // Requires at least 8px hysteresis to show
          if (accumulatedUpRef.current >= upHysteresis) {
            showHeader();
          }
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rAFRef.current !== null) {
        window.cancelAnimationFrame(rAFRef.current);
      }
    };
  }, [downThreshold, upHysteresis, topBoundary, showHeader, hideHeader]);

  return {
    isVisible,
    toggleVisibility,
    showHeader,
    hideHeader,
  };
}
