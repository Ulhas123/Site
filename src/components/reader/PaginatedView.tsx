import React from 'react';
import type { Chapter } from '../../types/novel';
import { BlockRenderer } from './BlockRenderer';
import { usePagination } from './usePagination';

export interface PaginatedViewProps {
  novelId: string;
  chapter: Chapter;
  initialBlockId?: string | null;
  onToggleChrome?: () => void;
  onPrevChapter?: () => void;
  onNextChapter?: () => void;
}

export const PaginatedView: React.FC<PaginatedViewProps> = ({
  novelId,
  chapter,
  initialBlockId,
  onToggleChrome,
  onPrevChapter,
  onNextChapter,
}) => {
  const {
    containerRef,
    contentRef,
    currentPage,
    totalPages,
    isDesktop,
    gap,
    pageStep,
    handleCanvasClick,
    handleTouchStart,
    handleTouchEnd,
  } = usePagination({
    novelId,
    chapter,
    initialBlockId,
    onToggleChrome,
    onPrevChapter,
    onNextChapter,
  });

  return (
    <div className="relative w-full h-[calc(100dvh-5.5rem)] max-w-[var(--reader-width)] md:max-w-4xl lg:max-w-5xl mx-auto px-4 sm:px-6 pt-16 pb-6 flex flex-col justify-between select-text">
      {/* Paginated columns viewport */}
      <div
        ref={containerRef}
        onClick={handleCanvasClick}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="relative flex-1 w-full overflow-hidden cursor-pointer"
        tabIndex={-1}
      >
        {/* Desktop Book Spine in Center Gutter */}
        {isDesktop && (
          <div
            className="hidden md:block absolute left-1/2 top-0 bottom-0 -translate-x-1/2 pointer-events-none z-10"
            style={{ width: `${gap}px` }}
            aria-hidden="true"
          >
            <div className="w-full h-full bg-gradient-to-r from-transparent via-line/50 to-transparent" />
          </div>
        )}

        {/* Multi-column track translated by page index */}
        <div
          ref={contentRef}
          style={{
            columnCount: isDesktop ? 2 : 1,
            columnGap: `${gap}px`,
            columnFill: 'auto',
            height: '100%',
            transform: `translateX(-${currentPage * pageStep}px)`,
          }}
          className="transition-transform duration-200 ease-out motion-reduce:transition-none cursor-default"
        >
          {/* Chapter header */}
          <header className="pb-6 mb-6 border-b border-line/60 space-y-2 break-inside-avoid [break-inside:avoid]">
            <div className="text-xs font-semibold uppercase tracking-wider text-accent">
              Chapter {chapter.number}
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-ink font-sans">
              {chapter.title}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted">
              <span>{chapter.wordCount.toLocaleString()} words</span>
              <span>&bull;</span>
              <span>{new Date(chapter.publishedAt).toLocaleDateString()}</span>
            </div>
          </header>

          {/* Blocks */}
          <div className="space-y-1">
            {chapter.blocks.map((block) => (
              <BlockRenderer key={block.id} block={block} isPaginated />
            ))}
          </div>

          {/* Author thoughts */}
          {chapter.authorThoughts && (
            <footer className="mt-8 pt-4 border-t border-line/40 text-xs text-muted italic break-inside-avoid [break-inside:avoid]">
              <span className="font-semibold not-italic text-ink">Author’s Note: </span>
              {chapter.authorThoughts}
            </footer>
          )}
        </div>
      </div>

      {/* Subtle Footer: Page Counter and Progress */}
      <footer className="pt-2 flex items-center justify-between text-xs text-muted font-mono select-none border-t border-line/40">
        <span>Chapter {chapter.number}</span>
        <span>
          Page {currentPage + 1} of {totalPages}
        </span>
        <span>{Math.round((currentPage / Math.max(1, totalPages - 1)) * 100)}%</span>
      </footer>
    </div>
  );
};
