import React, { useEffect, useRef } from 'react';
import { ChevronUp } from 'lucide-react';

interface CollapsedChapterPlaceholderProps {
  chapterId: string;
  chapterNumber?: number;
  chapterTitle?: string;
  height: number;
  onExpand?: () => void;
}

export const CollapsedChapterPlaceholder: React.FC<CollapsedChapterPlaceholderProps> = ({
  chapterId,
  chapterNumber,
  chapterTitle,
  height,
  onExpand,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || !onExpand || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          onExpand();
        }
      },
      {
        root: null,
        rootMargin: '200px',
        threshold: 0,
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [onExpand]);

  return (
    <div
      ref={containerRef}
      data-collapsed-chapter={chapterId}
      style={{ height: `${height}px` }}
      className="relative w-full flex flex-col justify-between py-6 px-4 my-4 rounded-xl border border-dashed border-line/60 bg-raised/30 select-none overflow-hidden"
      aria-label={`Collapsed Chapter ${chapterNumber || chapterId}`}
    >
      <div className="flex items-center justify-between text-xs text-muted border-b border-line/40 pb-2">
        <span className="font-semibold text-ink">
          {chapterTitle || `Chapter ${chapterNumber || chapterId}`}
        </span>
        <span className="text-[11px] bg-raised px-2 py-0.5 rounded border border-line">
          Collapsed ({Math.round(height)}px preserved)
        </span>
      </div>

      <div className="flex flex-col items-center justify-center my-auto py-8 text-center space-y-2">
        <p className="text-xs text-muted max-w-xs">
          This chapter was collapsed to preserve device memory.
        </p>
        {onExpand && (
          <button
            type="button"
            onClick={onExpand}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-page text-ink border border-line hover:border-accent hover:text-accent shadow-xs cursor-pointer transition-colors focus-visible:ring-2 focus-visible:ring-system focus-visible:outline-none"
          >
            <ChevronUp className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Click to restore</span>
          </button>
        )}
      </div>

      <div className="text-[11px] text-muted text-center border-t border-line/40 pt-2">
        Scroll up to seamlessly restore content
      </div>
    </div>
  );
};
