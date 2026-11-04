import { describe, expect, it } from 'vitest';
import { getLibraryNovels } from '../data/api';
import type { NovelSummary } from '../data/novelsRegistry';

describe('Home Page Novels & Catalog Logic', () => {
  it('loads active novels and study material for home page display', async () => {
    const novels = await getLibraryNovels();
    expect(novels.length).toBe(2);

    const titles = novels.map((n) => n.title);
    expect(titles).toContain('Supremacy Games');
    expect(titles).toContain('The First-Year AI & Data Science Engineering Compendium');
    expect(titles).not.toContain('The Shattered Reach');
    expect(titles).not.toContain('Top-Class Comprehension: Start with Basic Fist Techniques');

    for (const novel of novels) {
      expect(novel.id).toBeTruthy();
      expect(novel.title).toBeTruthy();
      expect(novel.author).toBeTruthy();
      expect(novel.synopsis).toBeTruthy();
      expect(novel.cover).toBeTruthy();
      expect(novel.totalChapters).toBeGreaterThan(0);
      expect(novel.firstChapterId).toBeTruthy();
    }
  });

  it('filters novels accurately by title, author, or synopsis keywords', () => {
    const sampleNovels: NovelSummary[] = [
      {
        id: 'shattered-reach',
        title: 'The Shattered Reach',
        author: 'V. C. Sterling',
        synopsis: 'Transported through a dying rift into the shattered borderlands...',
        cover: '/cover1.svg',
        totalChapters: 1200,
        firstChapterId: 'chapter-1',
      },
      {
        id: 'supremacy-games',
        title: 'Supremacy Games',
        author: 'Midgard',
        synopsis: 'Felix clutched his cheeks tightly...',
        cover: '/cover2.svg',
        totalChapters: 1958,
        firstChapterId: 'chapter-1',
      },
    ];

    const filterNovels = (novels: NovelSummary[], q: string) => {
      const query = q.trim().toLowerCase();
      if (!query) return novels;
      return novels.filter(
        (n) =>
          n.title.toLowerCase().includes(query) ||
          n.author.toLowerCase().includes(query) ||
          n.synopsis.toLowerCase().includes(query)
      );
    };

    // By title
    expect(filterNovels(sampleNovels, 'shattered')).toHaveLength(1);
    expect(filterNovels(sampleNovels, 'shattered')[0].id).toBe('shattered-reach');

    // By author
    expect(filterNovels(sampleNovels, 'Midgard')).toHaveLength(1);
    expect(filterNovels(sampleNovels, 'Midgard')[0].id).toBe('supremacy-games');

    // By synopsis keyword
    expect(filterNovels(sampleNovels, 'borderlands')).toHaveLength(1);

    // Empty query returns all
    expect(filterNovels(sampleNovels, '')).toHaveLength(2);

    // Unmatched query returns empty
    expect(filterNovels(sampleNovels, 'nonexistent query')).toHaveLength(0);
  });

  it('determines the most recently read novel correctly', () => {
    const progressMap = {
      'shattered-reach': {
        chapterId: 'chapter-3',
        percent: 45,
        updatedAt: 1000,
      },
      'supremacy-games': {
        chapterId: 'chapter-10',
        percent: 80,
        updatedAt: 5000,
      },
    };

    const recent = Object.entries(progressMap).reduce<
      { novelId: string; updatedAt: number } | null
    >((latest, [novelId, prog]) => {
      if (!prog || !prog.updatedAt) return latest;
      if (!latest || prog.updatedAt > latest.updatedAt) {
        return { novelId, updatedAt: prog.updatedAt };
      }
      return latest;
    }, null);

    expect(recent?.novelId).toBe('supremacy-games');
  });
});
