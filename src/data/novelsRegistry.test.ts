import { describe, expect, it } from 'vitest';
import { getLibraryNovels, getNovel } from './api';
import { defaultNovel } from './novel';
import { INITIALIZED_NOVELS } from './novelsRegistry';

describe('Scraped Novel Initializer & Registry', () => {
  it('registers only active novels and study material', () => {
    expect(INITIALIZED_NOVELS.length).toBe(3);

    const supremacy = INITIALIZED_NOVELS.find((n) => n.id === 'supremacy-games');
    expect(supremacy).toBeDefined();
    expect(supremacy?.title).toBe('Supremacy Games');
    expect(supremacy?.totalChapters).toBe(1958);
    expect(supremacy?.cover).toContain('/novels/supremacy-games/cover.svg');

    const godaan = INITIALIZED_NOVELS.find((n) => n.id === 'godaan');
    expect(godaan).toBeDefined();
    expect(godaan?.title).toContain('गोदान');
    expect(godaan?.author).toContain('मुंशी प्रेमचंद');
    expect(godaan?.totalChapters).toBe(36);
    expect(godaan?.category).not.toBe('study');
    expect(godaan?.cover).toContain('/novels/godaan/cover.svg');

    const study = INITIALIZED_NOVELS.find((n) => n.id === 'ai-and-ds-engineering-handbook');
    expect(study).toBeDefined();
    expect(study?.category).toBe('study');

    // Example novels removed
    expect(INITIALIZED_NOVELS.some((n) => n.id === 'top-class-comprehension-start-with-basic-fist-techniques')).toBe(false);
    expect(INITIALIZED_NOVELS.some((n) => n.id === 'shattered-reach')).toBe(false);
  });

  it('getLibraryNovels returns active catalog', async () => {
    const library = await getLibraryNovels();
    expect(library.length).toBe(3);

    expect(library.some((n) => n.id === 'supremacy-games')).toBe(true);
    expect(library.some((n) => n.id === 'godaan')).toBe(true);
    expect(library.some((n) => n.id === 'ai-and-ds-engineering-handbook')).toBe(true);
    expect(library.some((n) => n.id === 'shattered-reach')).toBe(false);
  });

  it('default novel fallback works for explicit mock calls', async () => {
    const novel2 = await getNovel('shattered-reach');
    expect(novel2.id).toBe(defaultNovel.id);
  });
});
