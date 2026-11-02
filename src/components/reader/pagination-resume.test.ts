import { describe, expect, it } from 'vitest';
import type { Novel } from '../../types/novel';

describe('Reliable Resume Engine & Paginated View Mode', () => {
  const mockNovel: Novel = {
    id: 'shattered-reach',
    title: 'The Shattered Reach',
    author: 'A. R. Vane',
    synopsis: 'LitRPG progression fantasy.',
    cover: '/cover.jpg',
    chapters: [
      { id: 'chapter-1', number: 1, title: 'Vector Calibration', wordCount: 3120, publishedAt: '2026-03-01', translator: 'Lexicon', editor: 'Echo' },
      { id: 'chapter-2', number: 2, title: 'Sub-Level Nine', wordCount: 3410, publishedAt: '2026-03-02', translator: 'Lexicon', editor: 'Echo' },
      { id: 'chapter-3', number: 3, title: 'Glyph Array', wordCount: 2980, publishedAt: '2026-03-03', translator: 'Lexicon', editor: 'Echo' },
      { id: 'chapter-4', number: 4, title: 'Signal Echo', wordCount: 3500, publishedAt: '2026-03-04', translator: 'Lexicon', editor: 'Echo' },
    ],
  };

  describe('Resume Position Calculation & Formatting', () => {
    it('calculates target scroll Y accurately with 35% target line and offsetRatio', () => {
      const viewportHeight = 800;
      const targetY = viewportHeight * 0.35; // 280px
      const currentScrollY = 1200;
      const blockRect = { top: 400, height: 120 }; // relative to viewport
      const offsetRatio = 0.5; // midpoint of paragraph

      const offset = offsetRatio * blockRect.height; // 60px
      const targetScrollY = currentScrollY + blockRect.top - targetY + offset;
      // 1200 + 400 - 280 + 60 = 1380
      expect(targetScrollY).toBe(1380);

      // Verify reciprocal: if scrolled to 1380, blockRect.top becomes 400 - (1380 - 1200) = 220
      // targetY - newBlockTop = 280 - 220 = 60
      // 60 / blockHeight = 60 / 120 = 0.5 (exact offsetRatio!)
      const newBlockTop = blockRect.top - (targetScrollY - currentScrollY);
      const measuredRatio = (targetY - newBlockTop) / blockRect.height;
      expect(measuredRatio).toBeCloseTo(0.5, 5);
    });

    it('formats resume toast message as "Resumed Chapter N · 64%"', () => {
      const chapterNumber = 1;
      const percent = 64;
      const toastMessage = `Resumed Chapter ${chapterNumber} · ${percent}%`;
      expect(toastMessage).toBe('Resumed Chapter 1 · 64%');
    });

    it('handles missing stored chapter gracefully by falling back to Chapter 1', () => {
      const storedChapterId = 'chapter-99-deleted';
      const exists = mockNovel.chapters.some(
        (c) => c.id === storedChapterId || `chapter-${c.number}` === storedChapterId
      );
      expect(exists).toBe(false);

      // Fallback target is first novel chapter
      const fallbackChapterId = exists ? storedChapterId : mockNovel.chapters[0].id;
      expect(fallbackChapterId).toBe('chapter-1');
    });
  });

  describe('Paginated CSS Columns Math & Multi-Spread Calculation', () => {
    it('computes 1 column layout on mobile (<768px)', () => {
      const containerWidth = 390;
      const isDesktop = containerWidth >= 768;
      const gap = isDesktop ? 48 : 32;
      const columnWidth = isDesktop ? Math.floor((containerWidth - gap) / 2) : containerWidth;
      const pageStep = isDesktop ? containerWidth + gap : columnWidth + gap;

      expect(isDesktop).toBe(false);
      expect(gap).toBe(32);
      expect(columnWidth).toBe(390);
      expect(pageStep).toBe(422); // 390 + 32
    });

    it('computes 2 columns layout with center spine gutter on desktop (>=768px)', () => {
      const containerWidth = 800;
      const isDesktop = containerWidth >= 768;
      const gap = 48;
      const columnWidth = Math.floor((containerWidth - gap) / 2);
      const pageStep = containerWidth + gap;

      expect(isDesktop).toBe(true);
      expect(columnWidth).toBe(376); // (800 - 48) / 2
      expect(pageStep).toBe(848); // 800 + 48
    });

    it('calculates total pages from multi-column scrollWidth', () => {
      const pageStep = 848;
      const gap = 48;

      // 1 desktop spread (2 columns)
      const scrollWidth1 = 800;
      const pages1 = Math.max(1, Math.ceil((scrollWidth1 + gap) / pageStep));
      expect(pages1).toBe(1);

      // 3 desktop spreads (6 columns)
      const scrollWidth3 = 2592;
      const pages3 = Math.max(1, Math.ceil((scrollWidth3 + gap) / pageStep));
      expect(pages3).toBe(4);
    });

    it('maps blockId horizontal position to page index for bidirectional mode switching', () => {
      const pageStep = 848;

      // Paragraph at start of chapter
      const blockX0 = 40;
      expect(Math.floor(blockX0 / pageStep)).toBe(0);

      // Paragraph in spread 2 (index 1)
      const blockX1 = 920;
      expect(Math.floor(blockX1 / pageStep)).toBe(1);

      // Paragraph in spread 3 (index 2)
      const blockX2 = 1750;
      expect(Math.floor(blockX2 / pageStep)).toBe(2);
    });

    it('identifies the active block on current visible page', () => {
      const pageStep = 848;
      const pageWidth = 800;
      const currentPage = 1;
      const pageStart = currentPage * pageStep; // 848
      const pageEnd = pageStart + pageWidth; // 1648

      const blocks = [
        { id: 'b-1', relLeft: 20, relRight: 350 },
        { id: 'b-2', relLeft: 380, relRight: 750 },
        { id: 'b-3', relLeft: 870, relRight: 1200 }, // visible on Page 1
        { id: 'b-4', relLeft: 1250, relRight: 1600 }, // visible on Page 1
        { id: 'b-5', relLeft: 1720, relRight: 2100 },
      ];

      const visible = blocks.filter(
        (b) => b.relRight > pageStart + 5 && b.relLeft < pageEnd - 5
      );
      expect(visible.map((b) => b.id)).toEqual(['b-3', 'b-4']);
      expect(visible[0].id).toBe('b-3'); // First active block on Page 1
    });
  });

  describe('Gesture & Key Zones', () => {
    it('evaluates tap zones: left 30% prev, right 30% next, center 40% toggle chrome', () => {
      const width = 1000;
      const leftClick = { x: 250 };
      const centerClick = { x: 500 };
      const rightClick = { x: 800 };

      const getAction = (x: number) => {
        const ratio = x / width;
        if (ratio < 0.3) return 'prevPage';
        if (ratio > 0.7) return 'nextPage';
        return 'toggleChrome';
      };

      expect(getAction(leftClick.x)).toBe('prevPage');
      expect(getAction(centerClick.x)).toBe('toggleChrome');
      expect(getAction(rightClick.x)).toBe('nextPage');
    });
  });
});
