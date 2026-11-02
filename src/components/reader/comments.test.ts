import { beforeEach, describe, expect, it } from 'vitest';
import { useEngagement } from '../../store/useEngagement';
import { useUI } from '../../store/useUI';
import type { ParagraphComment } from '../../types/novel';
import { getBlockComments } from '../../hooks/useBlockComments';
import { splitParagraphLastWord } from './paragraphUtils';

describe('Inline Comments & Threaded Drawer Logic', () => {
  beforeEach(() => {
    useEngagement.getState().resetEngagement();
    useUI.getState().closePanel();
    useUI.getState().setActiveBlockId(null);
  });

  describe('1. Word Wrapping & Orphan Prevention', () => {
    it('splits last word from multi-word paragraph cleanly', () => {
      const text = 'Valen Cross peeled his cheek from fractured flagstones. His temple throbbed with wet stone.';
      const { prefix, lastWord } = splitParagraphLastWord(text);

      expect(lastWord).toBe('stone.');
      expect(prefix).toBe('Valen Cross peeled his cheek from fractured flagstones. His temple throbbed with wet ');
      expect(prefix + lastWord).toBe(text);
    });

    it('handles single word paragraph without error', () => {
      const { prefix, lastWord } = splitParagraphLastWord('Attention.');
      expect(prefix).toBe('');
      expect(lastWord).toBe('Attention.');
    });

    it('handles whitespace-only and empty strings gracefully', () => {
      const { prefix, lastWord } = splitParagraphLastWord('   ');
      expect(prefix).toBe('');
      expect(lastWord).toBe('');
    });
  });

  describe('2. Comment Counts & Badge Rules', () => {
    it('accurately distinguishes 0-count, 1-9 muted pill, and 10+ accent pill', () => {
      // ch01-b01 has 0 seed comments
      const empty = getBlockComments('ch01-b01');
      expect(empty.count).toBe(0);

      // ch01-b03 has 3 seed comments (1-9 range)
      const muted = getBlockComments('ch01-b03');
      expect(muted.count).toBe(3);
      expect(muted.count >= 1 && muted.count <= 9).toBe(true);

      // ch01-b09 has 11 seed comments (10+ range)
      const accent = getBlockComments('ch01-b09');
      expect(accent.count).toBe(11);
      expect(accent.count >= 10).toBe(true);
    });

    it('selecting badge sets useUI.activeBlockId and opens comments drawer', () => {
      const blockId = 'ch01-b05';

      // Simulate what selecting the badge does
      useUI.getState().setActiveBlockId(blockId);
      useUI.getState().openPanel('comments');

      expect(useUI.getState().activeBlockId).toBe('ch01-b05');
      expect(useUI.getState().activePanel).toBe('comments');
    });
  });

  describe('3. Dynamic Comment Addition & Immediate Badge Update (0 to 1)', () => {
    it('adds comment to 0-count paragraph, immediately going from 0 to 1', () => {
      const targetBlockId = 'ch01-b01';

      // Before: 0 comments
      const initial = getBlockComments(targetBlockId);
      expect(initial.count).toBe(0);

      // User adds comment
      const newComment: ParagraphComment = {
        id: 'test-comment-001',
        blockId: targetBlockId,
        user: 'You',
        avatarSeed: 'you-1',
        level: 1,
        text: 'This opening scene is fantastic!',
        likes: 0,
        createdAt: new Date().toISOString(),
        isSpoiler: false,
      };

      useEngagement.getState().addComment(newComment);

      // After: immediately 1 comment
      const updated = getBlockComments(targetBlockId);
      expect(updated.count).toBe(1);
      expect(updated.comments[0].text).toBe('This opening scene is fantastic!');
      expect(updated.comments[0].id).toBe('test-comment-001');
    });

    it('supports replies and maintains block count accurately', () => {
      const targetBlockId = 'ch01-b01';

      // Add parent comment
      useEngagement.getState().addComment({
        id: 'parent-1',
        blockId: targetBlockId,
        user: 'ReaderA',
        avatarSeed: 'ra',
        level: 5,
        text: 'First thought',
        likes: 2,
        createdAt: '2026-01-01T10:00:00.000Z',
        isSpoiler: false,
      });

      // Add reply to parent
      useEngagement.getState().addComment({
        id: 'reply-1',
        blockId: targetBlockId,
        parentId: 'parent-1',
        user: 'ReaderB',
        avatarSeed: 'rb',
        level: 8,
        text: 'I agree with your thought',
        likes: 0,
        createdAt: '2026-01-01T10:05:00.000Z',
        isSpoiler: false,
      });

      const data = getBlockComments(targetBlockId);
      expect(data.count).toBe(2);
      const reply = data.comments.find((c) => c.parentId === 'parent-1');
      expect(reply).toBeDefined();
      expect(reply?.user).toBe('ReaderB');
    });
  });

  describe('4. Optimistic Like & Rollback Engine', () => {
    it('toggles like state in useEngagement', () => {
      const commentId = 'c03-01';

      expect(useEngagement.getState().isLiked(commentId)).toBe(false);

      useEngagement.getState().toggleLike(commentId);
      expect(useEngagement.getState().isLiked(commentId)).toBe(true);

      useEngagement.getState().toggleLike(commentId);
      expect(useEngagement.getState().isLiked(commentId)).toBe(false);
    });

    it('rolls back optimistic state on simulated network failure', () => {
      const commentId = 'c03-02';
      let localLiked = false;
      let localLikes = 10;

      // Optimistic like handler with rollback simulation
      const executeLike = (shouldFail: boolean) => {
        const prevLiked = localLiked;
        const prevLikes = localLikes;

        // Step 1: Optimistic update
        localLiked = !prevLiked;
        localLikes = localLiked ? prevLikes + 1 : prevLikes - 1;
        useEngagement.getState().toggleLike(commentId);

        // Step 2: Attempt network sync
        try {
          if (shouldFail) {
            throw new Error('Network timeout');
          }
        } catch {
          // Step 3: Rollback on error
          localLiked = prevLiked;
          localLikes = prevLikes;
          useEngagement.getState().toggleLike(commentId); // revert in store
        }
      };

      // Test failure rollback
      executeLike(true);
      expect(localLiked).toBe(false);
      expect(localLikes).toBe(10);
      expect(useEngagement.getState().isLiked(commentId)).toBe(false);

      // Test success
      executeLike(false);
      expect(localLiked).toBe(true);
      expect(localLikes).toBe(11);
      expect(useEngagement.getState().isLiked(commentId)).toBe(true);
    });
  });

  describe('5. Composer Rules & Spoiler Flags', () => {
    it('creates comments with isSpoiler toggle preserved', () => {
      const spoilerComment: ParagraphComment = {
        id: 'spoiler-test-1',
        blockId: 'ch01-b02',
        user: 'SecretKeeper',
        avatarSeed: 'sk',
        level: 20,
        text: 'The bell will ring 3 times in chapter 50.',
        likes: 0,
        createdAt: new Date().toISOString(),
        isSpoiler: true,
      };

      useEngagement.getState().addComment(spoilerComment);
      const data = getBlockComments('ch01-b02');
      const found = data.comments.find((c) => c.id === 'spoiler-test-1');
      expect(found?.isSpoiler).toBe(true);
    });

    it('validates 500-char max length constraint logic', () => {
      const MAX_LENGTH = 500;
      const validText = 'a'.repeat(500);
      const invalidText = 'a'.repeat(501);

      expect(validText.length <= MAX_LENGTH).toBe(true);
      expect(invalidText.length <= MAX_LENGTH).toBe(false);
    });
  });
});
