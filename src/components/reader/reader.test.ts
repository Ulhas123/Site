import { describe, expect, it } from 'vitest';
import type { Block } from '../../types/novel';

describe('Reader Canvas Specification & Logic', () => {
  describe('Block Types & Data Integrity', () => {
    it('verifies text block structure', () => {
      const block: Block = {
        id: 'b-text-1',
        type: 'text',
        text: 'A quiet mist crept through the obsidian gate.',
      };
      expect(block.type).toBe('text');
      expect(block.text).toContain('obsidian gate');
    });

    it('verifies dialogue block structure with speaker', () => {
      const block: Block = {
        id: 'b-dialogue-1',
        type: 'dialogue',
        speaker: 'Valen Cross',
        text: '“We need to secure the perimeter.”',
      };
      expect(block.type).toBe('dialogue');
      expect(block.speaker).toBe('Valen Cross');
      expect(block.text).toBeTruthy();
    });

    it('verifies system block structure (blue holographic litRPG panel)', () => {
      const block: Block = {
        id: 'b-sys-1',
        type: 'system',
        title: '[ SYSTEM ALERT: VECTOR ANOMALY ]',
        lines: ['Tier: Rank E', 'HP: 110 / 110', 'MP: 85 / 85'],
        text: 'Initiation complete.',
      };
      expect(block.type).toBe('system');
      expect(block.lines).toHaveLength(3);
      expect(block.title).toContain('SYSTEM ALERT');
    });

    it('verifies authorNote and sceneBreak blocks', () => {
      const authorBlock: Block = {
        id: 'b-author-1',
        type: 'authorNote',
        title: 'Author Note',
        text: 'Thanks for reading chapter 1!',
      };
      const breakBlock: Block = {
        id: 'b-break-1',
        type: 'sceneBreak',
        marker: '* * *',
      };
      expect(authorBlock.type).toBe('authorNote');
      expect(breakBlock.type).toBe('sceneBreak');
      expect(breakBlock.marker).toBe('* * *');
    });
  });

  describe('Scroll Hysteresis Engine (>60px down, 8px up hysteresis)', () => {
    interface HysteresisState {
      isVisible: boolean;
      accumulatedDown: number;
      accumulatedUp: number;
    }

    const evaluateScrollStep = (
      state: HysteresisState,
      currentY: number,
      lastY: number,
      downThreshold = 60,
      upHysteresis = 8,
      topBoundary = 56
    ): HysteresisState => {
      if (currentY <= topBoundary) {
        return { isVisible: true, accumulatedDown: 0, accumulatedUp: 0 };
      }

      const delta = currentY - lastY;
      if (delta > 0) {
        // Scrolling down
        const newDown = state.accumulatedDown + delta;
        return {
          isVisible: newDown > downThreshold ? false : state.isVisible,
          accumulatedDown: newDown,
          accumulatedUp: 0,
        };
      } else if (delta < 0) {
        // Scrolling up
        const newUp = state.accumulatedUp + Math.abs(delta);
        return {
          isVisible: newUp >= upHysteresis ? true : state.isVisible,
          accumulatedDown: 0,
          accumulatedUp: newUp,
        };
      }
      return state;
    };

    it('keeps header visible when scrolling within initial 60px down', () => {
      let state: HysteresisState = { isVisible: true, accumulatedDown: 0, accumulatedUp: 0 };
      // Scroll from 60 to 100 (delta = 40)
      state = evaluateScrollStep(state, 100, 60);
      expect(state.isVisible).toBe(true);
      expect(state.accumulatedDown).toBe(40);
    });

    it('hides header when downward scroll exceeds 60px threshold', () => {
      let state: HysteresisState = { isVisible: true, accumulatedDown: 0, accumulatedUp: 0 };
      // Scroll from 60 to 130 (delta = 70 > 60)
      state = evaluateScrollStep(state, 130, 60);
      expect(state.isVisible).toBe(false);
      expect(state.accumulatedDown).toBe(70);
    });

    it('respects 8px hysteresis on upward scroll before showing header', () => {
      let state: HysteresisState = { isVisible: false, accumulatedDown: 70, accumulatedUp: 0 };

      // Micro-jitter upward by 5px (5 < 8)
      state = evaluateScrollStep(state, 125, 130);
      expect(state.isVisible).toBe(false);
      expect(state.accumulatedUp).toBe(5);

      // Further upward scroll by 4px (total up = 9 >= 8)
      state = evaluateScrollStep(state, 121, 125);
      expect(state.isVisible).toBe(true);
      expect(state.accumulatedUp).toBe(9);
    });

    it('always shows header when near the top of the viewport (scrollY <= 56)', () => {
      const state: HysteresisState = { isVisible: false, accumulatedDown: 100, accumulatedUp: 0 };
      const next = evaluateScrollStep(state, 40, 100);
      expect(next.isVisible).toBe(true);
    });
  });

  describe('Sliding Window Engine (Max 3 mounted, height preservation)', () => {
    interface ChapterState {
      id: string;
      isCollapsed: boolean;
      measuredHeight: number;
    }

    const enforceMax3Mounted = (
      chapters: ChapterState[],
      measureHeight: (id: string) => number
    ): ChapterState[] => {
      const mounted = chapters.filter((c) => !c.isCollapsed);
      if (mounted.length > 3) {
        const earliest = mounted[0];
        const h = measureHeight(earliest.id);
        return chapters.map((c) =>
          c.id === earliest.id ? { ...c, isCollapsed: true, measuredHeight: h } : c
        );
      }
      return chapters;
    };

    it('keeps 3 chapters uncollapsed when mounting 3 chapters', () => {
      const chapters: ChapterState[] = [
        { id: 'ch-1', isCollapsed: false, measuredHeight: 0 },
        { id: 'ch-2', isCollapsed: false, measuredHeight: 0 },
        { id: 'ch-3', isCollapsed: false, measuredHeight: 0 },
      ];
      const result = enforceMax3Mounted(chapters, () => 1200);
      expect(result.filter((c) => !c.isCollapsed)).toHaveLength(3);
    });

    it('collapses earliest chapter with preserved height when 4th chapter appends', () => {
      const chapters: ChapterState[] = [
        { id: 'ch-1', isCollapsed: false, measuredHeight: 0 },
        { id: 'ch-2', isCollapsed: false, measuredHeight: 0 },
        { id: 'ch-3', isCollapsed: false, measuredHeight: 0 },
        { id: 'ch-4', isCollapsed: false, measuredHeight: 0 },
      ];
      const result = enforceMax3Mounted(chapters, (id) => (id === 'ch-1' ? 1450 : 1000));
      expect(result[0].id).toBe('ch-1');
      expect(result[0].isCollapsed).toBe(true);
      expect(result[0].measuredHeight).toBe(1450);

      // Remaining 3 chapters are mounted
      expect(result.filter((c) => !c.isCollapsed)).toHaveLength(3);
    });
  });

  describe('Active Chapter 35% Viewport Detection', () => {
    it('calculates active chapter crossing 35% line', () => {
      const viewportHeight = 1000;
      const targetY = viewportHeight * 0.35; // 350px

      // Chapter 1 is from 0 to 400 (crosses 350)
      const ch1Rect = { top: 0, bottom: 400, height: 400 };
      const ch1Active = ch1Rect.top <= targetY && ch1Rect.bottom > targetY;
      expect(ch1Active).toBe(true);

      // Progress within chapter 1
      const progress = (targetY - ch1Rect.top) / ch1Rect.height;
      expect(progress).toBe(0.875);

      // Chapter 2 starts at 400 (does not cross 350 yet)
      const ch2Rect = { top: 400, bottom: 850, height: 450 };
      const ch2Active = ch2Rect.top <= targetY && ch2Rect.bottom > targetY;
      expect(ch2Active).toBe(false);
    });
  });
});
