import React, { useMemo, useState } from 'react';
import { chapter01 } from '../../data/chapters/ch01';
import { chapter02 } from '../../data/chapters/ch02';
import { chapter03 } from '../../data/chapters/ch03';
import { chapter04 } from '../../data/chapters/ch04';
import { useBlockComments } from '../../hooks/useBlockComments';
import { type WindowChapter } from '../../hooks/useChapterWindow';
import { useUI } from '../../store/useUI';
import type { Block, ParagraphComment } from '../../types/novel';
import { Drawer } from '../ui/Drawer';
import { CommentComposer } from './CommentComposer';
import { CommentItem } from './CommentItem';

export interface CommentsDrawerProps {
  chapters?: WindowChapter[];
}

type SortMode = 'top' | 'newest';

const staticChapters = [chapter01, chapter02, chapter03, chapter04];

function findBlockQuote(blockId: string | null, chapters?: WindowChapter[]): string {
  if (!blockId) return '';

  // 1. Check windowed chapters
  if (chapters) {
    for (const item of chapters) {
      if (item.data) {
        const found = item.data.blocks.find((b: Block) => b.id === blockId);
        if (found) return extractText(found);
      }
    }
  }

  // 2. Fallback to static chapters
  for (const ch of staticChapters) {
    const found = ch.blocks.find((b: Block) => b.id === blockId);
    if (found) return extractText(found);
  }

  return '';
}

function extractText(block: Block): string {
  switch (block.type) {
    case 'text':
      return block.text;
    case 'dialogue':
      return block.speaker ? `${block.speaker}: ${block.text}` : block.text;
    case 'system':
      return block.text || block.lines?.join(' ') || block.title || '';
    case 'authorNote':
      return block.text;
    case 'sceneBreak':
      return block.marker || '* * *';
    default:
      return '';
  }
}

export const CommentsDrawer: React.FC<CommentsDrawerProps> = ({ chapters }) => {
  const activePanel = useUI((s) => s.activePanel);
  const activeBlockId = useUI((s) => s.activeBlockId);
  const closePanel = useUI((s) => s.closePanel);

  const isOpen = activePanel === 'comments';
  const { comments, count } = useBlockComments(activeBlockId);

  const [sortMode, setSortMode] = useState<SortMode>('top');
  const [isQuoteExpanded, setIsQuoteExpanded] = useState<boolean>(false);
  const [replyingTo, setReplyingTo] = useState<ParagraphComment | null>(null);

  const quoteText = useMemo(
    () => findBlockQuote(activeBlockId, chapters),
    [activeBlockId, chapters]
  );

  // Separate top-level comments and replies
  const { topLevelComments, repliesByParent } = useMemo(() => {
    const topLevel: ParagraphComment[] = [];
    const repliesMap = new Map<string, ParagraphComment[]>();

    for (const c of comments) {
      if (!c.parentId) {
        topLevel.push(c);
      } else {
        const list = repliesMap.get(c.parentId) || [];
        list.push(c);
        repliesMap.set(c.parentId, list);
      }
    }

    // Sort top-level comments
    topLevel.sort((a, b) => {
      if (sortMode === 'top') {
        if (b.likes !== a.likes) {
          return b.likes - a.likes;
        }
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return { topLevelComments: topLevel, repliesByParent: repliesMap };
  }, [comments, sortMode]);

  const handleStartReply = (comment: ParagraphComment) => {
    // If replying to a reply, attach to root parent to maintain 1-level threading
    const target = comment.parentId
      ? comments.find((c) => c.id === comment.parentId) || comment
      : comment;
    setReplyingTo(target);
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={closePanel}
      title="Paragraph Comments"
      description={activeBlockId ? `Comments on paragraph (${activeBlockId})` : undefined}
      widthClass="sm:max-w-lg sm:w-full"
      footer={
        activeBlockId ? (
          <CommentComposer
            blockId={activeBlockId}
            replyingTo={replyingTo}
            onCancelReply={() => setReplyingTo(null)}
          />
        ) : null
      }
    >
      <div className="space-y-4">
        {/* Sticky Header with Quote, Count, and Top/Newest Tabs */}
        <div className="sticky -top-4 -mx-5 px-5 pt-2 pb-3 bg-page/95 backdrop-blur-md border-b border-line z-10 space-y-3">
          {quoteText && (
            <div className="p-3 rounded-lg bg-raised/50 border border-line/60 space-y-1.5">
              <blockquote
                className={`text-xs sm:text-sm text-ink/85 italic font-[family-name:var(--reader-font)] leading-relaxed ${
                  isQuoteExpanded ? '' : 'line-clamp-2'
                }`}
              >
                “{quoteText}”
              </blockquote>
              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] font-mono text-muted uppercase">
                  Quote
                </span>
                <button
                  type="button"
                  onClick={() => setIsQuoteExpanded(!isQuoteExpanded)}
                  aria-expanded={isQuoteExpanded}
                  className="text-[11px] font-semibold text-accent hover:underline cursor-pointer focus-visible:ring-2 focus-visible:ring-system rounded px-1"
                >
                  {isQuoteExpanded ? 'Show less' : 'Expand quote'}
                </button>
              </div>
            </div>
          )}

          {/* Counts and Sort Tabs */}
          <div className="flex items-center justify-between gap-2 pt-0.5">
            <span className="text-xs font-medium text-muted">
              <strong className="text-ink font-semibold">{count}</strong>{' '}
              {count === 1 ? 'comment' : 'comments'}
            </span>

            <div
              role="tablist"
              aria-label="Sort comments"
              className="flex items-center p-0.5 rounded-lg bg-raised border border-line"
            >
              <button
                type="button"
                role="tab"
                aria-selected={sortMode === 'top'}
                onClick={() => setSortMode('top')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-system ${
                  sortMode === 'top'
                    ? 'bg-page text-ink font-semibold shadow-xs border border-line'
                    : 'text-muted hover:text-ink'
                }`}
              >
                Top
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={sortMode === 'newest'}
                onClick={() => setSortMode('newest')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-system ${
                  sortMode === 'newest'
                    ? 'bg-page text-ink font-semibold shadow-xs border border-line'
                    : 'text-muted hover:text-ink'
                }`}
              >
                Newest
              </button>
            </div>
          </div>
        </div>

        {/* Comment Thread List */}
        {topLevelComments.length === 0 ? (
          <div className="py-12 px-4 text-center space-y-2">
            <p className="text-sm font-medium text-ink">No comments here yet</p>
            <p className="text-xs text-muted max-w-xs mx-auto">
              Be the first to share your reaction, theory, or thoughts on this paragraph below.
            </p>
          </div>
        ) : (
          <div className="space-y-3 pt-1">
            {topLevelComments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                replies={repliesByParent.get(comment.id)}
                onReply={handleStartReply}
              />
            ))}
          </div>
        )}
      </div>
    </Drawer>
  );
};
