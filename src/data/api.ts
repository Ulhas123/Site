import type { Chapter, Novel, ParagraphComment } from '../types/novel';
import { chapter01 } from './chapters/ch01';
import { chapter02 } from './chapters/ch02';
import { chapter03 } from './chapters/ch03';
import { chapter04 } from './chapters/ch04';
import { allComments, commentsByBlockId } from './comments';
import { defaultNovel } from './novel';
import { INITIALIZED_NOVELS, type NovelSummary } from './novelsRegistry';

const DELAY_MS = 150;

const delay = (ms: number = DELAY_MS): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

const chaptersById: Record<string, Chapter> = {
  [chapter01.id]: chapter01,
  ch01: chapter01,
  '1': chapter01,
  [chapter02.id]: chapter02,
  ch02: chapter02,
  '2': chapter02,
  [chapter03.id]: chapter03,
  ch03: chapter03,
  '3': chapter03,
  [chapter04.id]: chapter04,
  ch04: chapter04,
  '4': chapter04,
};

const novelCache = new Map<string, Novel>();
const chapterCache = new Map<string, Chapter>();

export async function getNovel(novelId: string = 'supremacy-games'): Promise<Novel> {
  await delay(DELAY_MS);

  if (novelId === 'shattered-reach' || novelId === defaultNovel.id) {
    return defaultNovel;
  }

  if (novelCache.has(novelId)) {
    return novelCache.get(novelId)!;
  }

  if (typeof window !== 'undefined' && typeof fetch === 'function') {
    try {
      const res = await fetch(`/novels/${encodeURIComponent(novelId)}/novel.json`);
      if (res.ok) {
        const loaded = (await res.json()) as Novel;
        novelCache.set(novelId, loaded);
        return loaded;
      }
    } catch {
      // Network or file fetch error fallback
    }
  }

  return defaultNovel;
}

export async function getChapter(id: string, novelId: string = 'supremacy-games'): Promise<Chapter> {
  await delay(DELAY_MS);

  const cacheKey = `${novelId}:${id}`;
  if (chapterCache.has(cacheKey)) {
    return chapterCache.get(cacheKey)!;
  }

  // Check built-in mock chapters for test fallback
  if (novelId === 'shattered-reach' || novelId === defaultNovel.id) {
    const mock = chaptersById[id];
    if (mock) return mock;
  }

  // Fetch chapter JSON from public/novels/<novelId>/chapters/<id>.json
  if (typeof window !== 'undefined' && typeof fetch === 'function') {
    const formattedId = id.startsWith('chapter-') ? id : `chapter-${id}`;
    const targetUrl = `/novels/${encodeURIComponent(novelId)}/chapters/${encodeURIComponent(formattedId)}.json`;

    try {
      const res = await fetch(targetUrl);
      if (res.ok) {
        const loaded = (await res.json()) as Chapter;
        chapterCache.set(cacheKey, loaded);
        return loaded;
      }
    } catch {
      // Fallback
    }
  }

  // Check alias fallback for test compatibility
  const fallback = chaptersById[id];
  if (fallback) return fallback;

  throw new Error(`Chapter not found: ${id}`);
}

export async function getLibraryNovels(): Promise<NovelSummary[]> {
  await delay(50);
  return [...INITIALIZED_NOVELS];
}

export async function getComments(chapterId: string): Promise<ParagraphComment[]> {
  await delay(DELAY_MS);
  if (chapterId === chapter01.id || chapterId === 'ch01' || chapterId === '1') {
    return allComments;
  }
  return [];
}

export async function getCommentsByBlock(
  chapterId: string
): Promise<Record<string, ParagraphComment[]>> {
  await delay(DELAY_MS);
  if (chapterId === chapter01.id || chapterId === 'ch01' || chapterId === '1') {
    return commentsByBlockId;
  }
  return {};
}
