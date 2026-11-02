import { useCallback, useEffect, useRef, useState } from 'react';
import { usePrefs } from '../../store/usePrefs';
import { useProgress } from '../../store/useProgress';
import { useUI } from '../../store/useUI';
import type { Chapter } from '../../types/novel';

interface UsePaginationOptions {
  novelId: string;
  chapter: Chapter;
  initialBlockId?: string | null;
  onToggleChrome?: () => void;
  onPrevChapter?: () => void;
  onNextChapter?: () => void;
}

export function usePagination({
  novelId,
  chapter,
  initialBlockId,
  onToggleChrome,
  onPrevChapter,
  onNextChapter,
}: UsePaginationOptions) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  const { fontSize, lineHeight, paragraphGap, fontFamily, maxWidth } = usePrefs();

  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth >= 768 : dimensions.width >= 768
  );

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const gap = isDesktop ? 48 : 32;
  const columnWidth = isDesktop
    ? Math.max(200, Math.floor((dimensions.width - gap) / 2))
    : dimensions.width;
  const pageStep = isDesktop ? dimensions.width + gap : columnWidth + gap;

  const measureLayout = useCallback(() => {
    const contentEl = contentRef.current;
    if (!contentEl) return;

    const scrollWidth = contentEl.scrollWidth;
    const computedPages = Math.max(1, Math.ceil((scrollWidth + gap) / pageStep));
    setTotalPages(computedPages);
    setCurrentPage((prev) => Math.min(prev, computedPages - 1));
  }, [gap, pageStep]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setDimensions({ width: Math.round(width), height: Math.round(height) });
        }
      }
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let cancelled = false;
    const update = async () => {
      if (typeof document !== 'undefined' && document.fonts?.ready) {
        try {
          await document.fonts.ready;
        } catch {
          // Ignore font errors
        }
      }
      if (cancelled) return;
      window.requestAnimationFrame(() => {
        if (!cancelled) measureLayout();
      });
    };

    update();
    return () => {
      cancelled = true;
    };
  }, [chapter, dimensions, fontSize, lineHeight, paragraphGap, fontFamily, maxWidth, measureLayout]);

  const initialHandledRef = useRef(!initialBlockId);

  useEffect(() => {
    if (!initialBlockId || !contentRef.current) return;
    const contentEl = contentRef.current;
    const blockEl = contentEl.querySelector<HTMLElement>(`[data-block-id="${initialBlockId}"]`);
    if (blockEl) {
      const contentRect = contentEl.getBoundingClientRect();
      const blockRect = blockEl.getBoundingClientRect();
      const relativeLeft = blockRect.left - contentRect.left;
      const targetPage = Math.max(0, Math.floor(relativeLeft / pageStep));
      setCurrentPage(Math.min(targetPage, Math.max(0, totalPages - 1)));
      initialHandledRef.current = true;
    }
  }, [initialBlockId, pageStep, totalPages]);

  useEffect(() => {
    if (!initialHandledRef.current) return;
    const contentEl = contentRef.current;
    if (!contentEl) return;

    const pageStart = currentPage * pageStep;
    const pageEnd = pageStart + dimensions.width;
    const contentRect = contentEl.getBoundingClientRect();
    const blockEls = contentEl.querySelectorAll<HTMLElement>('[data-block-id]');

    let visibleBlockId: string | null = null;
    for (let i = 0; i < blockEls.length; i++) {
      const el = blockEls[i];
      const rect = el.getBoundingClientRect();
      const relLeft = rect.left - contentRect.left;
      const relRight = rect.right - contentRect.left;

      if (relRight > pageStart + 5 && relLeft < pageEnd - 5) {
        visibleBlockId = el.getAttribute('data-block-id');
        break;
      }
    }

    if (visibleBlockId) {
      useUI.getState().setActiveBlockId(visibleBlockId);
    }

    const percent = Math.round((currentPage / Math.max(1, totalPages - 1)) * 100);
    useProgress.getState().saveProgress(novelId, {
      chapterId: chapter.id,
      blockId: visibleBlockId ?? undefined,
      offsetRatio: 0,
      percent,
    });
  }, [currentPage, pageStep, dimensions.width, totalPages, novelId, chapter.id]);

  const goToPrevPage = useCallback(() => {
    if (currentPage > 0) {
      setCurrentPage((p) => p - 1);
    } else if (onPrevChapter) {
      onPrevChapter();
    }
  }, [currentPage, onPrevChapter]);

  const goToNextPage = useCallback(() => {
    if (currentPage < totalPages - 1) {
      setCurrentPage((p) => p + 1);
    } else if (onNextChapter) {
      onNextChapter();
    }
  }, [currentPage, totalPages, onNextChapter]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }
      if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        goToPrevPage();
      } else if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        goToNextPage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToPrevPage, goToNextPage]);

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (typeof window !== 'undefined') {
      const sel = window.getSelection();
      if (sel && sel.toString().trim().length > 0) return;
    }
    const target = e.target as HTMLElement | null;
    if (target && target.closest('[data-interactive]')) return;

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const xRatio = (e.clientX - rect.left) / rect.width;

    if (xRatio < 0.3) {
      goToPrevPage();
    } else if (xRatio > 0.7) {
      goToNextPage();
    } else if (onToggleChrome) {
      onToggleChrome();
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStartRef.current = { x: t.clientX, y: t.clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const t = e.changedTouches[0];
    const deltaX = t.clientX - touchStartRef.current.x;
    const deltaY = t.clientY - touchStartRef.current.y;
    touchStartRef.current = null;

    if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX < 0) goToNextPage();
      else goToPrevPage();
    }
  };

  return {
    containerRef,
    contentRef,
    currentPage,
    totalPages,
    isDesktop,
    gap,
    columnWidth,
    pageStep,
    handleCanvasClick,
    handleTouchStart,
    handleTouchEnd,
  };
}
