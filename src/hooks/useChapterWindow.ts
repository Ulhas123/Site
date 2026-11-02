import { useCallback, useEffect, useRef, useState } from 'react';
import { getChapter } from '../data/api';
import type { Chapter, Novel } from '../types/novel';

export interface WindowChapter {
  id: string;
  number: number;
  title: string;
  data?: Chapter;
  status: 'loading' | 'loaded' | 'error';
  errorMessage?: string;
  isCollapsed: boolean;
  measuredHeight: number;
}

interface UseChapterWindowOptions {
  novel: Novel | null;
  initialChapterId: string;
}

export function useChapterWindow({ novel, initialChapterId }: UseChapterWindowOptions) {
  const [chapters, setChapters] = useState<WindowChapter[]>(() => {
    if (!initialChapterId) return [];
    const meta = novel?.chapters.find(
      (c) => c.id === initialChapterId || `chapter-${c.number}` === initialChapterId
    );
    return [
      {
        id: initialChapterId,
        number: meta ? meta.number : 1,
        title: meta ? meta.title : `Chapter ${initialChapterId}`,
        status: 'loading',
        isCollapsed: false,
        measuredHeight: 0,
      },
    ];
  });

  const chapterRefs = useRef<Record<string, HTMLElement | null>>({});
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const loadingChapterIdsRef = useRef<Set<string>>(new Set());

  // Register DOM ref for measurement
  const registerChapterRef = useCallback((chapterId: string, el: HTMLElement | null) => {
    chapterRefs.current[chapterId] = el;
  }, []);

  // Measure chapter DOM node
  const measureChapterHeight = useCallback((chapterId: string): number => {
    const el = chapterRefs.current[chapterId];
    if (el) {
      const rect = el.getBoundingClientRect();
      if (rect.height > 0) {
        return Math.round(rect.height);
      }
    }
    return 1000;
  }, []);

  // Load a single chapter by ID
  const fetchChapter = useCallback(
    async (chapterId: string) => {
      if (loadingChapterIdsRef.current.has(chapterId)) return;
      loadingChapterIdsRef.current.add(chapterId);

      try {
        const data = await getChapter(chapterId);
        setChapters((prev) => {
          const index = prev.findIndex((c) => c.id === chapterId);
          const updatedItem: WindowChapter = {
            id: data.id,
            number: data.number,
            title: data.title,
            data,
            status: 'loaded',
            isCollapsed: false,
            measuredHeight: 0,
          };

          let nextChapters: WindowChapter[];
          if (index >= 0) {
            nextChapters = [...prev];
            nextChapters[index] = { ...prev[index], ...updatedItem };
          } else {
            nextChapters = [...prev, updatedItem];
          }

          // Enforce max 3 mounted chapters
          const mounted = nextChapters.filter((c) => !c.isCollapsed && c.status === 'loaded');
          if (mounted.length > 3) {
            const earliestMounted = mounted[0];
            const measuredHeight = measureChapterHeight(earliestMounted.id);

            return nextChapters.map((c) => {
              if (c.id === earliestMounted.id) {
                return {
                  ...c,
                  isCollapsed: true,
                  measuredHeight: measuredHeight > 0 ? measuredHeight : c.measuredHeight || 1000,
                };
              }
              return c;
            });
          }

          return nextChapters;
        });
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to load chapter';
        setChapters((prev) =>
          prev.map((c) =>
            c.id === chapterId ? { ...c, status: 'error', errorMessage: errorMsg } : c
          )
        );
      } finally {
        loadingChapterIdsRef.current.delete(chapterId);
      }
    },
    [measureChapterHeight]
  );

  // Load initial chapter
  useEffect(() => {
    if (!initialChapterId) return;
    let ignore = false;

    getChapter(initialChapterId)
      .then((data) => {
        if (ignore) return;
        setChapters([
          {
            id: data.id,
            number: data.number,
            title: data.title,
            data,
            status: 'loaded',
            isCollapsed: false,
            measuredHeight: 0,
          },
        ]);
      })
      .catch((err: unknown) => {
        if (ignore) return;
        const errorMsg = err instanceof Error ? err.message : 'Failed to load chapter';
        setChapters((prev) =>
          prev.map((c) =>
            c.id === initialChapterId ? { ...c, status: 'error', errorMessage: errorMsg } : c
          )
        );
      });

    return () => {
      ignore = true;
    };
  }, [initialChapterId]);

  // Expand a collapsed chapter (e.g. when scrolling back up)
  const expandChapter = useCallback(
    (chapterId: string) => {
      setChapters((prev) => {
        const target = prev.find((c) => c.id === chapterId);
        if (!target || !target.isCollapsed) return prev;

        // Un-collapse target
        const uncollapsed = prev.map((c) => (c.id === chapterId ? { ...c, isCollapsed: false } : c));

        // If mounted chapters now exceed 3, collapse the latest chapter at the bottom
        const mounted = uncollapsed.filter((c) => !c.isCollapsed && c.status === 'loaded');
        if (mounted.length > 3) {
          const latestMounted = mounted[mounted.length - 1];
          const measuredHeight = measureChapterHeight(latestMounted.id);

          return uncollapsed.map((c) => {
            if (c.id === latestMounted.id) {
              return {
                ...c,
                isCollapsed: true,
                measuredHeight: measuredHeight > 0 ? measuredHeight : c.measuredHeight || 1000,
              };
            }
            return c;
          });
        }

        return uncollapsed;
      });
    },
    [measureChapterHeight]
  );

  // Append next chapter
  const appendNextChapter = useCallback(() => {
    if (!novel || chapters.length === 0) return;

    const last = chapters[chapters.length - 1];
    if (last.status === 'loading') return;

    // Find next chapter metadata in novel
    const currentIndex = novel.chapters.findIndex(
      (c) => c.id === last.id || c.number === last.number
    );

    if (currentIndex >= 0 && currentIndex < novel.chapters.length - 1) {
      const nextMeta = novel.chapters[currentIndex + 1];
      if (chapters.some((c) => c.id === nextMeta.id)) return;

      const newItem: WindowChapter = {
        id: nextMeta.id,
        number: nextMeta.number,
        title: nextMeta.title,
        status: 'loading',
        isCollapsed: false,
        measuredHeight: 0,
      };

      setChapters((prev) => [...prev, newItem]);
      fetchChapter(nextMeta.id);
    }
  }, [novel, chapters, fetchChapter]);

  // Bottom sentinel observer with rootMargin 1200px
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          appendNextChapter();
        }
      },
      {
        root: null,
        rootMargin: '1200px',
        threshold: 0,
      }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [appendNextChapter]);

  const retryChapter = useCallback(
    (chapterId: string) => {
      setChapters((prev) =>
        prev.map((c) => (c.id === chapterId ? { ...c, status: 'loading', errorMessage: undefined } : c))
      );
      fetchChapter(chapterId);
    },
    [fetchChapter]
  );

  return {
    chapters,
    sentinelRef,
    registerChapterRef,
    expandChapter,
    appendNextChapter,
    retryChapter,
  };
}
