import type { Chapter, Novel, ParagraphComment } from '../types/novel';
import { chapter01 } from './chapters/ch01';
import { allComments, commentsByBlockId } from './comments';
import { defaultNovel } from './novel';

const DELAY_MS = 150;

const delay = (ms: number = DELAY_MS): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

const chaptersById: Record<string, Chapter> = {
  [chapter01.id]: chapter01,
  ch01: chapter01,
  '1': chapter01,
};

export async function getNovel(): Promise<Novel> {
  await delay(DELAY_MS);
  return defaultNovel;
}

export async function getChapter(id: string): Promise<Chapter> {
  await delay(DELAY_MS);
  const chapter = chaptersById[id];
  if (!chapter) {
    throw new Error(`Chapter not found: ${id}`);
  }
  return chapter;
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
