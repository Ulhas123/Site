import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  AudioDrawer,
  BlockRenderer,
  ChapterError,
  ChapterSkeleton,
  ChapterUnlockModal,
  CollapsedChapterPlaceholder,
  CommentsDrawer,
  PaginatedView,
  ProgressBar,
  ReaderDock,
  ReaderHeader,
  SettingsDrawer,
  TOCDrawer,
} from '../components/reader';
import { Toast } from '../components/ui';
import { getNovel } from '../data/api';
import {
  useActiveChapterSync,
  useApplyPrefs,
  useChapterWindow,
  useHeaderVisibility,
  useReaderGestures,
  useReaderResume,
} from '../hooks';
import { usePrefs } from '../store/usePrefs';
import { useProgress } from '../store/useProgress';
import { useUI } from '../store/useUI';
import type { ChapterMeta, Novel } from '../types/novel';

export const ReaderPage: React.FC = () => {
  const { novelId = 'shattered-reach', chapterId = 'chapter-1' } = useParams();
  const navigate = useNavigate();
  const [novel, setNovel] = useState<Novel | null>(null);
  const [lockedModalChapter, setLockedModalChapter] = useState<ChapterMeta | null>(null);

  const activePanel = useUI((s) => s.activePanel);
  const closePanel = useUI((s) => s.closePanel);
  const activeBlockId = useUI((s) => s.activeBlockId);
  const readingMode = usePrefs((s) => s.readingMode);

  useApplyPrefs();

  // Support URL testing params (?mode=paginated, ?resume=64)
  if (typeof window !== 'undefined') {
    const p = new URLSearchParams(window.location.search);
    const m = p.get('mode');
    if ((m === 'paginated' || m === 'scroll') && usePrefs.getState().readingMode !== m) {
      usePrefs.getState().setReadingMode(m);
    }
    if (p.get('resume') === '64') {
      const cur = useProgress.getState().getProgress(novelId);
      if (!cur || cur.percent !== 64) {
        useProgress.getState().saveProgress(novelId, {
          chapterId: 'chapter-1',
          blockId: 'ch01_p12',
          offsetRatio: 0.2,
          percent: 64,
        });
      }
    }
  }

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

  const { isVisible, toggleVisibility } = useHeaderVisibility({
    downThreshold: 60,
    upHysteresis: 8,
  });

  const { canvasRef, handleCanvasClick } = useReaderGestures({
    readingMode: 'scroll',
    onToggleChrome: toggleVisibility,
  });

  const {
    chapters,
    sentinelRef,
    registerChapterRef,
    expandChapter,
    retryChapter,
  } = useChapterWindow({ novel, initialChapterId: chapterId });

  const { activeChapterId, activeChapterTitle, chapterProgress } = useActiveChapterSync({
    novelId,
    novelTitle: novel?.title || 'Webnovel Reader',
    chapters,
  });

  const currentTargetChapterId = activeChapterId || chapterId;
  const currentChapterItem = useMemo(() => {
    return chapters.find((c) => c.id === currentTargetChapterId) ?? chapters[0];
  }, [chapters, currentTargetChapterId]);

  const currentChapterMeta = useMemo(() => {
    return novel?.chapters.find((c) => c.id === currentTargetChapterId) ?? null;
  }, [novel?.chapters, currentTargetChapterId]);

  const { toastMessage, dismissToast, resumeBlockId } = useReaderResume({
    novelId,
    novel,
    activeChapterLoaded: currentChapterItem?.status === 'loaded',
    readingMode,
    onNavigateChapter: (targetId) => navigate(`/novel/${novelId}/chapter/${targetId}`),
  });

  const handleNextChapter = useCallback(() => {
    const idx = novel?.chapters.findIndex((c) => c.id === currentTargetChapterId) ?? -1;
    if (idx !== -1 && idx < (novel?.chapters.length ?? 0) - 1) {
      navigate(`/novel/${novelId}/chapter/${novel!.chapters[idx + 1].id}`);
    }
  }, [novel, currentTargetChapterId, novelId, navigate]);

  const handlePrevChapter = useCallback(() => {
    const idx = novel?.chapters.findIndex((c) => c.id === currentTargetChapterId) ?? -1;
    if (idx > 0) navigate(`/novel/${novelId}/chapter/${novel!.chapters[idx - 1].id}`);
  }, [novel, currentTargetChapterId, novelId, navigate]);

  return (
    <div className="min-h-screen bg-page text-ink transition-colors duration-150 selection:bg-accent/25 selection:text-ink">
      <Toast message={toastMessage} onDismiss={dismissToast} />
      <ProgressBar progress={chapterProgress} />

      <ReaderHeader
        novelId={novelId}
        novelTitle={novel?.title || 'The Shattered Reach'}
        novelCover={novel?.cover || ''}
        chapterId={currentTargetChapterId}
        chapterTitle={activeChapterTitle || 'Loading chapter...'}
        isVisible={isVisible}
      />

      {readingMode === 'paginated' ? (
        <div className="w-full min-h-[calc(100dvh-4rem)]">
          {currentChapterItem?.status === 'loading' && (
            <div className="w-full max-w-[var(--reader-width)] mx-auto px-4 sm:px-6 pt-20"><ChapterSkeleton chapterNumber={currentChapterItem.number} /></div>
          )}
          {currentChapterItem?.status === 'error' && (
            <div className="w-full max-w-[var(--reader-width)] mx-auto px-4 sm:px-6 pt-20">
              <ChapterError chapterId={currentChapterItem.id} chapterNumber={currentChapterItem.number} errorMessage={currentChapterItem.errorMessage} onRetry={() => retryChapter(currentChapterItem.id)} />
            </div>
          )}
          {currentChapterItem?.data && (
            <PaginatedView
              novelId={novelId}
              chapter={currentChapterItem.data}
              initialBlockId={resumeBlockId || activeBlockId}
              onToggleChrome={toggleVisibility}
              onPrevChapter={handlePrevChapter}
              onNextChapter={handleNextChapter}
            />
          )}
        </div>
      ) : (
        <main
          ref={canvasRef}
          onClick={handleCanvasClick}
          className="w-full max-w-[var(--reader-width)] mx-auto px-4 sm:px-6 pt-20 pb-32 focus:outline-none"
          tabIndex={-1}
        >
          {chapters.map((item) => {
            if (item.isCollapsed) {
              return (
                <div key={item.id} id={`chapter-section-${item.id}`} ref={(el) => registerChapterRef(item.id, el)}>
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
              return <div key={item.id} id={`chapter-section-${item.id}`}><ChapterSkeleton chapterNumber={item.number} /></div>;
            }
            if (item.status === 'error') {
              return (
                <div key={item.id} id={`chapter-section-${item.id}`}>
                  <ChapterError chapterId={item.id} chapterNumber={item.number} errorMessage={item.errorMessage} onRetry={() => retryChapter(item.id)} />
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
                  <header className="pb-6 border-b border-line/60 space-y-2">
                    <div className="text-xs font-semibold uppercase tracking-wider text-accent">Chapter {ch.number}</div>
                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-ink font-sans">{ch.title}</h1>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted">
                      <span>{ch.wordCount.toLocaleString()} words</span>
                      <span>&bull;</span>
                      <span>{new Date(ch.publishedAt).toLocaleDateString()}</span>
                    </div>
                  </header>
                  <div className="space-y-1">
                    {ch.blocks.map((block) => <BlockRenderer key={block.id} block={block} />)}
                  </div>
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
          <div ref={sentinelRef} className="h-8 w-full flex items-center justify-center text-xs text-muted py-4" aria-hidden="true">
            <span className="inline-block w-2 h-2 rounded-full bg-accent/40 animate-ping" />
          </div>
        </main>
      )}

      <ReaderDock novelId={novelId} activeChapter={currentChapterMeta} allChapters={novel?.chapters} onOpenLockedModal={(ch) => setLockedModalChapter(ch)} />
      <TOCDrawer novel={novel} activeChapterId={currentTargetChapterId} />
      <SettingsDrawer isOpen={activePanel === 'settings'} onClose={closePanel} />
      <AudioDrawer chapterTitle={activeChapterTitle || 'Chapter 1'} novelTitle={novel?.title} />
      <CommentsDrawer chapters={chapters} />
      <ChapterUnlockModal isOpen={Boolean(lockedModalChapter)} onClose={() => setLockedModalChapter(null)} chapter={lockedModalChapter} onUnlockSuccess={() => setLockedModalChapter(null)} />
    </div>
  );
};
