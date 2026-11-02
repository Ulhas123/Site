import { useEffect, useRef, useState } from 'react';
import { useProgress } from '../store/useProgress';
import type { WindowChapter } from './useChapterWindow';

interface UseActiveChapterSyncOptions {
  novelId: string;
  novelTitle: string;
  chapters: WindowChapter[];
}

export function useActiveChapterSync({
  novelId,
  novelTitle,
  chapters,
}: UseActiveChapterSyncOptions) {
  const [activeChapterId, setActiveChapterId] = useState<string>('');
  const [activeChapterTitle, setActiveChapterTitle] = useState<string>('');
  const [chapterProgress, setChapterProgress] = useState<number>(0);

  const activeChapterIdRef = useRef<string>('');
  const rAFRef = useRef<number | null>(null);
  const lastSaveTimeRef = useRef<number>(0);
  const pendingProgressRef = useRef<{
    chapterId: string;
    blockId?: string;
    offsetRatio?: number;
    percent: number;
  } | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleScrollOrResize = () => {
      if (rAFRef.current !== null) return;

      rAFRef.current = window.requestAnimationFrame(() => {
        rAFRef.current = null;

        const viewportHeight = window.innerHeight;
        const targetY = viewportHeight * 0.35; // 35% line

        // Find active chapter
        let matchedChapter: WindowChapter | null = null;
        let matchedPercent = 0;
        let matchedEl: HTMLElement | null = null;

        for (const item of chapters) {
          const el = document.getElementById(`chapter-section-${item.id}`);
          if (!el) continue;

          const rect = el.getBoundingClientRect();
          if (rect.top <= targetY && rect.bottom > targetY) {
            matchedChapter = item;
            matchedEl = el;
            const progress = (targetY - rect.top) / rect.height;
            matchedPercent = Math.min(1, Math.max(0, progress));
            break;
          }
        }

        // Fallbacks for top or bottom boundaries
        if (!matchedChapter && chapters.length > 0) {
          const firstEl = document.getElementById(`chapter-section-${chapters[0].id}`);
          if (firstEl && firstEl.getBoundingClientRect().top > targetY) {
            matchedChapter = chapters[0];
            matchedEl = firstEl;
            matchedPercent = 0;
          } else {
            const last = chapters[chapters.length - 1];
            const lastEl = document.getElementById(`chapter-section-${last.id}`);
            if (lastEl) {
              matchedChapter = last;
              matchedEl = lastEl;
              matchedPercent = 1;
            }
          }
        }

        if (matchedChapter) {
          setChapterProgress(matchedPercent);

          // If active chapter changed
          if (matchedChapter.id !== activeChapterIdRef.current) {
            activeChapterIdRef.current = matchedChapter.id;
            setActiveChapterId(matchedChapter.id);
            setActiveChapterTitle(matchedChapter.title);

            // 1. Update document.title
            document.title = `${matchedChapter.title} — ${novelTitle}`;

            // 2. Update browser history path (not hash)
            const targetPath = `/novel/${novelId}/chapter/${matchedChapter.id}`;
            if (window.location.pathname !== targetPath) {
              window.history.replaceState(null, '', targetPath);
            }
          }

          // 3. Find active block crossing 35% line
          let activeBlockId: string | undefined;
          let offsetRatio: number | undefined;

          if (matchedEl) {
            const blockEls = matchedEl.querySelectorAll<HTMLElement>('[data-block-id]');
            for (let i = 0; i < blockEls.length; i++) {
              const bEl = blockEls[i];
              const bRect = bEl.getBoundingClientRect();
              if (bRect.top <= targetY && bRect.bottom > targetY) {
                activeBlockId = bEl.getAttribute('data-block-id') || undefined;
                offsetRatio = Math.min(1, Math.max(0, (targetY - bRect.top) / bRect.height));
                break;
              }
            }
          }

          // 4. Save progress (throttled 250ms)
          pendingProgressRef.current = {
            chapterId: matchedChapter.id,
            blockId: activeBlockId,
            offsetRatio: offsetRatio ? Math.round(offsetRatio * 100) / 100 : undefined,
            percent: Math.round(matchedPercent * 100),
          };

          const now = Date.now();
          if (now - lastSaveTimeRef.current >= 250) {
            lastSaveTimeRef.current = now;
            if (pendingProgressRef.current) {
              useProgress.getState().saveProgress(novelId, pendingProgressRef.current);
            }
          }
        }
      });
    };

    window.addEventListener('scroll', handleScrollOrResize, { passive: true });
    window.addEventListener('resize', handleScrollOrResize, { passive: true });
    handleScrollOrResize();

    return () => {
      window.removeEventListener('scroll', handleScrollOrResize);
      window.removeEventListener('resize', handleScrollOrResize);
      if (rAFRef.current !== null) {
        window.cancelAnimationFrame(rAFRef.current);
      }
    };
  }, [chapters, novelId, novelTitle]);

  return {
    activeChapterId,
    activeChapterTitle,
    chapterProgress,
  };
}
