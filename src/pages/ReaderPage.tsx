import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  AudioDrawer,
  BlockRenderer,
  ChapterError,
  ChapterSkeleton,
  ChapterUnlockModal,
  CollapsedChapterPlaceholder,
  CommentsDrawer,
  ProgressBar,
  ReaderDock,
  ReaderHeader,
  SettingsDrawer,
  TOCDrawer,
} from '../components/reader';
import { getNovel } from '../data/api';
import {
  useActiveChapterSync,
  useApplyPrefs,
  useChapterWindow,
  useHeaderVisibility,
  useReaderGestures,
} from '../hooks';
import { useUI } from '../store/useUI';
import type { ChapterMeta, Novel } from '../types/novel';

export const ReaderPage: React.FC = () => {
  const { novelId = 'shattered-reach', chapterId = 'chapter-1' } = useParams();
  const [novel, setNovel] = useState<Novel | null>(null);
  const [lockedModalChapter, setLockedModalChapter] = useState<ChapterMeta | null>(null);

  const activePanel = useUI((s) => s.activePanel);
  const closePanel = useUI((s) => s.closePanel);

  // Apply user reading preferences to CSS root variables
  useApplyPrefs();

  // Load novel metadata
  useEffect(() => {
    let mounted = true;
    getNovel()
      .then((data) => {
        if (mounted) setNovel(data);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, [novelId]);

  // Header scroll hysteresis & visibility
  const { isVisible, toggleVisibility } = useHeaderVisibility({
    downThreshold: 60,
    upHysteresis: 8,
  });

  // Gestures: center 40% tap toggles chrome/header
  const { canvasRef, handleCanvasClick } = useReaderGestures({
    readingMode: 'scroll',
    onToggleChrome: toggleVisibility,
  });

  // Chapter sliding window engine (max 3 mounted, collapses earlier with exact height)
  const {
    chapters,
    sentinelRef,
    registerChapterRef,
    expandChapter,
    retryChapter,
  } = useChapterWindow({
    novel,
    initialChapterId: chapterId,
  });

  // Active chapter detection at 35% viewport threshold & progress sync
  const { activeChapterId, activeChapterTitle, chapterProgress } = useActiveChapterSync({
    novelId,
    novelTitle: novel?.title || 'Webnovel Reader',
    chapters,
  });

  const currentChapterMeta = useMemo(() => {
    const targetId = activeChapterId || chapterId;
    return novel?.chapters.find((c) => c.id === targetId) ?? null;
  }, [novel?.chapters, activeChapterId, chapterId]);

  return (
    <div className="min-h-screen bg-page text-ink transition-colors duration-150 selection:bg-accent/25 selection:text-ink">
      {/* 2px fixed top progress bar (rAF-throttled) */}
      <ProgressBar progress={chapterProgress} />

      {/* 56px auto-hiding header with hysteresis */}
      <ReaderHeader
        novelId={novelId}
        novelTitle={novel?.title || 'The Shattered Reach'}
        novelCover={novel?.cover || ''}
        chapterId={activeChapterId || chapterId}
        chapterTitle={activeChapterTitle || 'Loading chapter...'}
        isVisible={isVisible}
      />

      {/* Main Reading Canvas */}
      <main
        ref={canvasRef}
        onClick={handleCanvasClick}
        className="w-full max-w-[var(--reader-width)] mx-auto px-4 sm:px-6 pt-20 pb-32 focus:outline-none"
        tabIndex={-1}
      >
        {chapters.map((item) => {
          if (item.isCollapsed) {
            return (
              <div
                key={item.id}
                id={`chapter-section-${item.id}`}
                ref={(el) => registerChapterRef(item.id, el)}
              >
                <CollapsedChapterPlaceholder
                  chapterId={item.id}
                  chapterNumber={item.number}
                  chapterTitle={item.title}
                  height={item.measuredHeight}
                  onExpand={() => expandChapter(item.id)}
                />
              </div>
            );
          }

          if (item.status === 'loading') {
            return (
              <div key={item.id} id={`chapter-section-${item.id}`}>
                <ChapterSkeleton chapterNumber={item.number} />
              </div>
            );
          }

          if (item.status === 'error') {
            return (
              <div key={item.id} id={`chapter-section-${item.id}`}>
                <ChapterError
                  chapterId={item.id}
                  chapterNumber={item.number}
                  errorMessage={item.errorMessage}
                  onRetry={() => retryChapter(item.id)}
                />
              </div>
            );
          }

          if (item.data) {
            const ch = item.data;
            return (
              <article
                key={ch.id}
                id={`chapter-section-${ch.id}`}
                data-chapter-id={ch.id}
                ref={(el) => registerChapterRef(ch.id, el)}
                className="py-8 space-y-6 border-b border-line/40 last:border-b-0"
                aria-label={ch.title}
              >
                {/* Chapter Title & Meta */}
                <header className="pb-6 border-b border-line/60 space-y-2">
                  <div className="text-xs font-semibold uppercase tracking-wider text-accent">
                    Chapter {ch.number}
                  </div>
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-ink font-sans">
                    {ch.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted">
                    <span>{ch.wordCount.toLocaleString()} words</span>
                    <span>&bull;</span>
                    <span>{new Date(ch.publishedAt).toLocaleDateString()}</span>
                  </div>
                </header>

                {/* Blocks */}
                <div className="space-y-1">
                  {ch.blocks.map((block) => (
                    <BlockRenderer key={block.id} block={block} />
                  ))}
                </div>

                {/* Author Thoughts */}
                {ch.authorThoughts && (
                  <footer className="mt-8 pt-4 border-t border-line/40 text-xs text-muted italic">
                    <span className="font-semibold not-italic text-ink">Author’s Note: </span>
                    {ch.authorThoughts}
                  </footer>
                )}
              </article>
            );
          }

          return null;
        })}

        {/* Bottom sentinel for multi-chapter infinite scroll */}
        <div
          ref={sentinelRef}
          className="h-8 w-full flex items-center justify-center text-xs text-muted py-4"
          aria-hidden="true"
        >
          <span className="inline-block w-2 h-2 rounded-full bg-accent/40 animate-ping" />
        </div>
      </main>

      {/* Floating Dock & Mobile Bottom Bar */}
      <ReaderDock
        novelId={novelId}
        activeChapter={currentChapterMeta}
        allChapters={novel?.chapters}
        onOpenLockedModal={(ch) => setLockedModalChapter(ch)}
      />

      {/* Table of Contents Drawer with Virtualized List */}
      <TOCDrawer novel={novel} activeChapterId={activeChapterId || chapterId} />

      {/* Settings Drawer */}
      <SettingsDrawer
        isOpen={activePanel === 'settings'}
        onClose={closePanel}
      />

      {/* Audio Narration Drawer */}
      <AudioDrawer
        chapterTitle={activeChapterTitle || 'Chapter 1'}
        novelTitle={novel?.title}
      />

      {/* Threaded Comments Drawer */}
      <CommentsDrawer chapters={chapters} />

      {/* Standalone Locked Chapter Modal (e.g. from Dock Prev/Next) */}
      <ChapterUnlockModal
        isOpen={Boolean(lockedModalChapter)}
        onClose={() => setLockedModalChapter(null)}
        chapter={lockedModalChapter}
        onUnlockSuccess={() => setLockedModalChapter(null)}
      />
    </div>
  );
};
