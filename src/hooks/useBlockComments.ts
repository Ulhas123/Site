import { useMemo } from 'react';
import { commentsByBlockId } from '../data/comments';
import { useEngagement } from '../store/useEngagement';
import type { ParagraphComment } from '../types/novel';

export interface BlockCommentsData {
  comments: ParagraphComment[];
  count: number;
}

/**
 * Returns all comments for a block, combining seed data and user-persisted comments.
 * Reactively updates when useEngagement changes.
 */
export function useBlockComments(blockId: string | null | undefined): BlockCommentsData {
  const addedComments = useEngagement((state) => state.addedComments);

  return useMemo(() => {
    if (!blockId) {
      return { comments: [], count: 0 };
    }

    const seedComments = commentsByBlockId[blockId] || [];
    const userComments = addedComments.filter((c) => c.blockId === blockId);

    // Merge: user-created comments come first, then seed comments (avoiding duplicates)
    const seen = new Set<string>();
    const all: ParagraphComment[] = [];

    for (const comment of userComments) {
      if (!seen.has(comment.id)) {
        seen.add(comment.id);
        all.push(comment);
      }
    }

    for (const comment of seedComments) {
      if (!seen.has(comment.id)) {
        seen.add(comment.id);
        all.push(comment);
      }
    }

    return {
      comments: all,
      count: all.length,
    };
  }, [blockId, addedComments]);
}

/**
 * Synchronous non-reactive helper to get block comments from current state.
 */
export function getBlockComments(blockId: string): BlockCommentsData {
  const seedComments = commentsByBlockId[blockId] || [];
  const added = useEngagement.getState().addedComments.filter((c) => c.blockId === blockId);

  const seen = new Set<string>();
  const all: ParagraphComment[] = [];

  for (const c of added) {
    if (!seen.has(c.id)) {
      seen.add(c.id);
      all.push(c);
    }
  }

  for (const c of seedComments) {
    if (!seen.has(c.id)) {
      seen.add(c.id);
      all.push(c);
    }
  }

  return {
    comments: all,
    count: all.length,
  };
}
