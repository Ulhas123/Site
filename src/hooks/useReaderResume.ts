import { useEffect, useRef, useState } from 'react';
import { useProgress, type NovelProgress } from '../store/useProgress';
import type { Novel } from '../types/novel';

interface UseReaderResumeOptions {
  novelId: string;
  novel: Novel | null;
  activeChapterLoaded: boolean;
  readingMode: 'scroll' | 'paginated';
  onNavigateChapter?: (chapterId: string) => void;
}

export function useReaderResume({
  novelId,
  novel,
  activeChapterLoaded,
  readingMode,
  onNavigateChapter,
}: UseReaderResumeOptions) {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [resumeBlockId, setResumeBlockId] = useState<string | null>(null);
  const hasResumedRef = useRef(false);

  useEffect(() => {
    if (hasResumedRef.current || !novel || !activeChapterLoaded) {
      return;
    }

    const storedProgress: NovelProgress | undefined =
      useProgress.getState().getProgress(novelId);

    if (!storedProgress) {
      hasResumedRef.current = true;
      return;
    }

    // 1. Verify stored chapter exists in novel metadata
    const targetChapter = novel.chapters.find(
      (c) =>
        c.id === storedProgress.chapterId ||
        `chapter-${c.number}` === storedProgress.chapterId
    );

    if (!targetChapter) {
      // Stored chapter no longer exists -> fallback cleanly
      hasResumedRef.current = true;
      if (novel.chapters.length > 0 && onNavigateChapter) {
        onNavigateChapter(novel.chapters[0].id);
      }
      return;
    }

    // 2. Perform font-ready layout sync and scroll restoration
    let cancelled = false;

    const performResume = async () => {
      if (typeof document !== 'undefined' && document.fonts?.ready) {
        try {
          await document.fonts.ready;
        } catch {
          // Ignore font loading errors
        }
      }

      if (cancelled) return;

      // Ensure DOM has settled
      window.requestAnimationFrame(() => {
        if (cancelled) return;

        if (storedProgress.blockId) {
          setResumeBlockId(storedProgress.blockId);
        }

        if (readingMode === 'scroll') {
          let scrolled = false;
          if (storedProgress.blockId) {
            const blockEl = document.querySelector<HTMLElement>(
              `[data-block-id="${storedProgress.blockId}"]`
            );
            if (blockEl) {
              const rect = blockEl.getBoundingClientRect();
              const targetY = window.innerHeight * 0.35;
              const offsetRatio = storedProgress.offsetRatio ?? 0;
              const offset = offsetRatio * rect.height;
              const targetScrollY = window.scrollY + rect.top - targetY + offset;

              window.scrollTo({
                top: Math.max(0, Math.round(targetScrollY)),
                behavior: 'instant' as ScrollBehavior,
              });
              scrolled = true;
            }
          }

          if (!scrolled) {
            const chapterEl = document.getElementById(
              `chapter-section-${targetChapter.id}`
            );
            if (chapterEl) {
              const rect = chapterEl.getBoundingClientRect();
              const percent = (storedProgress.percent || 0) / 100;
              const targetScrollY = window.scrollY + rect.top + percent * rect.height;
              window.scrollTo({
                top: Math.max(0, Math.round(targetScrollY)),
                behavior: 'instant' as ScrollBehavior,
              });
            }
          }
        }

        // Show resume toast: "Resumed Chapter N · 64%"
        const chapterNumber = targetChapter.number;
        const percent = Math.min(100, Math.max(0, Math.round(storedProgress.percent || 0)));
        setToastMessage(`Resumed Chapter ${chapterNumber} · ${percent}%`);
        hasResumedRef.current = true;
      });
    };

    performResume();

    return () => {
      cancelled = true;
    };
  }, [novelId, novel, activeChapterLoaded, readingMode, onNavigateChapter]);

  return {
    toastMessage,
    dismissToast: () => setToastMessage(null),
    resumeBlockId,
  };
}
