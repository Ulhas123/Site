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

  it('asserts that no mock comments are generated in chapter 1', () => {
    expect(allComments).toHaveLength(0);
    expect(Object.keys(commentsByBlockId)).toHaveLength(0);
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

    const statusWindow = systemBlocks[0];
    expect(statusWindow.title).toContain('SYSTEM NOTIFICATION');
    expect(statusWindow.lines?.length).toBeGreaterThanOrEqual(5);

    expect(authorNoteBlocks[0].text).toBeTruthy();

    expect(sceneBreakBlocks[0].marker).toBe('* * *');
  });

  it('validates 1,200 generated chapter metadata entries for personal reader', () => {
    expect(defaultNovel.chapters).toHaveLength(1200);

    // All chapters are accessible without paywalls
    for (let i = 0; i < 10; i++) {
      const ch = defaultNovel.chapters[i];
      expect(ch.number).toBe(i + 1);
      expect(ch.title).toBeTruthy();
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
