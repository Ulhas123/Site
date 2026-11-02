import { describe, expect, it } from 'vitest';
import { getChapter, getComments, getCommentsByBlock, getNovel } from './api';
import { chapter01 } from './chapters/ch01';
import { allComments, commentsByBlockId } from './comments';
import { defaultNovel } from './novel';

describe('Novel Content & Types', () => {
  it('asserts block-id uniqueness in chapter 1', () => {
    const blockIds = chapter01.blocks.map((b) => b.id);
    const uniqueIds = new Set(blockIds);

    expect(uniqueIds.size).toBe(blockIds.length);
    expect(blockIds.length).toBeGreaterThanOrEqual(28);
    expect(blockIds.length).toBeLessThanOrEqual(32);
  });

  it("asserts that every comment's blockId exists in chapter 1 blocks", () => {
    const validBlockIds = new Set(chapter01.blocks.map((b) => b.id));

    expect(allComments.length).toBeGreaterThan(0);

    for (const [keyedBlockId, comments] of Object.entries(commentsByBlockId)) {
      expect(validBlockIds.has(keyedBlockId)).toBe(true);

      for (const comment of comments) {
        expect(comment.blockId).toBe(keyedBlockId);
        expect(validBlockIds.has(comment.blockId)).toBe(true);
      }
    }
  });

  it('validates chapter 1 structure (dialogue, 1 system, 1 authorNote, 1 sceneBreak)', () => {
    const dialogueBlocks = chapter01.blocks.filter((b) => b.type === 'dialogue');
    const systemBlocks = chapter01.blocks.filter((b) => b.type === 'system');
    const authorNoteBlocks = chapter01.blocks.filter((b) => b.type === 'authorNote');
    const sceneBreakBlocks = chapter01.blocks.filter((b) => b.type === 'sceneBreak');

    expect(dialogueBlocks.length).toBeGreaterThan(0);
    expect(systemBlocks).toHaveLength(1);
    expect(authorNoteBlocks).toHaveLength(1);
    expect(sceneBreakBlocks).toHaveLength(1);

    // Verify system block has status window details
    const statusWindow = systemBlocks[0];
    expect(statusWindow.title).toContain('SYSTEM NOTIFICATION');
    expect(statusWindow.lines?.length).toBeGreaterThanOrEqual(5);

    // Verify author note has text and title
    expect(authorNoteBlocks[0].text).toBeTruthy();

    // Verify scene break has marker
    expect(sceneBreakBlocks[0].marker).toBe('* * *');
  });

  it('validates comments distribution (6+ blocks, 2 with 10+, 2 spoilers, 3+ replies)', () => {
    const blocksWithComments = Object.keys(commentsByBlockId);
    expect(blocksWithComments.length).toBeGreaterThanOrEqual(6);

    const blocksWithTenOrMore = blocksWithComments.filter(
      (bId) => commentsByBlockId[bId].length >= 10
    );
    expect(blocksWithTenOrMore.length).toBeGreaterThanOrEqual(2);

    const spoilers = allComments.filter((c) => c.isSpoiler);
    expect(spoilers).toHaveLength(2);

    const replies = allComments.filter((c) => Boolean(c.parentId));
    expect(replies.length).toBeGreaterThanOrEqual(3);

    // Validate that every reply parentId points to an existing comment
    const commentIds = new Set(allComments.map((c) => c.id));
    for (const reply of replies) {
      expect(commentIds.has(reply.parentId!)).toBe(true);
    }
  });

  it('validates 1,200 generated chapter metadata entries and locking rules', () => {
    expect(defaultNovel.chapters).toHaveLength(1200);

    // Chapters 1-3 are real and unlocked
    for (let i = 0; i < 3; i++) {
      const ch = defaultNovel.chapters[i];
      expect(ch.number).toBe(i + 1);
      expect(ch.isLocked).toBe(false);
      expect(ch.cost).toEqual({ coins: 0 });
    }

    // Chapters 5+ are locked
    for (let i = 4; i < defaultNovel.chapters.length; i++) {
      const ch = defaultNovel.chapters[i];
      expect(ch.number).toBe(i + 1);
      expect(ch.isLocked).toBe(true);
      expect(ch.cost).toBeDefined();
      const hasCoinsOrFastPass = 'coins' in ch.cost || 'fastPass' in ch.cost;
      expect(hasCoinsOrFastPass).toBe(true);
    }

    // Cover is inline SVG data URI with no network dependency
    expect(defaultNovel.cover.startsWith('data:image/svg+xml')).toBe(true);
    expect(defaultNovel.cover).toContain('THE%20SHATTERED');
  });
});

describe('Async Content API', () => {
  it('getNovel resolves with novel data after simulated delay', async () => {
    const start = Date.now();
    const novel = await getNovel();
    const elapsed = Date.now() - start;

    expect(elapsed).toBeGreaterThanOrEqual(140);
    expect(novel.id).toBe('shattered-reach');
    expect(novel.chapters).toHaveLength(1200);
  });

  it('getChapter resolves for valid id and rejects for unknown id', async () => {
    const ch = await getChapter('chapter-1');
    expect(ch.number).toBe(1);
    expect(ch.blocks).toHaveLength(30);

    // Alias 'ch01' also resolves
    const chAlias = await getChapter('ch01');
    expect(chAlias.id).toBe('chapter-1');

    // Unknown id rejects
    await expect(getChapter('unknown-id')).rejects.toThrow('Chapter not found: unknown-id');
    await expect(getChapter('chapter-999')).rejects.toThrow('Chapter not found: chapter-999');
  });

  it('getComments and getCommentsByBlock return comments for chapter', async () => {
    const comments = await getComments('chapter-1');
    expect(comments.length).toBe(allComments.length);

    const commentsMap = await getCommentsByBlock('chapter-1');
    expect(Object.keys(commentsMap)).toEqual(Object.keys(commentsByBlockId));

    // Non-existent chapter returns empty results
    const emptyComments = await getComments('chapter-999');
    expect(emptyComments).toEqual([]);
  });
});
