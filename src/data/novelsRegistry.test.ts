import { describe, expect, it } from 'vitest';
import { getLibraryNovels, getNovel } from './api';
import { defaultNovel } from './novel';
import { INITIALIZED_NOVELS } from './novelsRegistry';

describe('Scraped Novel Initializer & Registry', () => {
  it('registers all downloaded novels from scraper', () => {
    expect(INITIALIZED_NOVELS.length).toBeGreaterThanOrEqual(2);

    const supremacy = INITIALIZED_NOVELS.find((n) => n.id === 'supremacy-games');
    expect(supremacy).toBeDefined();
    expect(supremacy?.title).toBe('Supremacy Games');
    expect(supremacy?.totalChapters).toBe(1958);
    expect(supremacy?.cover).toContain('/novels/supremacy-games/cover.svg');

    const topClass = INITIALIZED_NOVELS.find(
      (n) => n.id === 'top-class-comprehension-start-with-basic-fist-techniques'
    );
    expect(topClass).toBeDefined();
    expect(topClass?.title).toBe('Top-Class Comprehension: Start with Basic Fist Techniques');
    expect(topClass?.totalChapters).toBe(3);
  });

  it('getLibraryNovels aggregates default novel and initialized novels', async () => {
    const library = await getLibraryNovels();
    expect(library.length).toBeGreaterThanOrEqual(3);

    // Default novel is present
    expect(library.some((n) => n.id === defaultNovel.id)).toBe(true);
    // Scraped novels are present
    expect(library.some((n) => n.id === 'supremacy-games')).toBe(true);
    expect(
      library.some((n) => n.id === 'top-class-comprehension-start-with-basic-fist-techniques')
    ).toBe(true);
  });

  it('default novel fallback works when novelId is default or omitted', async () => {
    const novel1 = await getNovel();
    expect(novel1.id).toBe(defaultNovel.id);

    const novel2 = await getNovel('shattered-reach');
    expect(novel2.id).toBe(defaultNovel.id);
  });
});
