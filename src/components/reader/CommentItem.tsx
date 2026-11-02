import React, { useState } from 'react';
import { Eye, EyeOff, Heart, MessageSquare } from 'lucide-react';
import { useEngagement } from '../../store/useEngagement';
import type { ParagraphComment } from '../../types/novel';

export interface CommentItemProps {
  comment: ParagraphComment;
  replies?: ParagraphComment[];
  isReply?: boolean;
  onReply?: (comment: ParagraphComment) => void;
}

export const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  replies,
  isReply = false,
  onReply,
}) => {
  const isLikedStore = useEngagement((s) => s.isLiked(comment.id));
  const toggleLikeStore = useEngagement((s) => s.toggleLike);

  // Local optimistic like state for instant feedback & rollback support
  const [optimisticLiked, setOptimisticLiked] = useState<boolean | null>(null);
  const [optimisticDelta, setOptimisticDelta] = useState<number>(0);

  // Spoilers: blurred until revealed with keyboard-operable control
  const [isRevealed, setIsRevealed] = useState<boolean>(!comment.isSpoiler);

  const currentlyLiked = optimisticLiked !== null ? optimisticLiked : isLikedStore;
  const displayLikes = Math.max(
    0,
    comment.likes + optimisticDelta + (isLikedStore && optimisticLiked === null ? 1 : 0)
  );

  const handleLike = () => {
    const prevLiked = currentlyLiked;
    const prevDelta = optimisticDelta;
    const nextLiked = !prevLiked;
    const nextDelta = nextLiked ? prevDelta + 1 : prevDelta - 1;

    // Apply optimistic state immediately
    setOptimisticLiked(nextLiked);
    setOptimisticDelta(nextDelta);
    toggleLikeStore(comment.id);

    try {
      // Check for simulated network error test hook
      if (
        typeof window !== 'undefined' &&
        (window as unknown as { __SIMULATE_LIKE_ERROR__?: boolean }).__SIMULATE_LIKE_ERROR__
      ) {
        throw new Error('Simulated network error');
      }
    } catch {
      // Rollback to previous state
      setOptimisticLiked(prevLiked);
      setOptimisticDelta(prevDelta);
      toggleLikeStore(comment.id);
    }
  };

  const formattedDate = (() => {
    try {
      const d = new Date(comment.createdAt);
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return '';
    }
  })();

  const avatarInitials = comment.user.slice(0, 2).toUpperCase();

  return (
    <article
      data-comment-id={comment.id}
      aria-label={`Comment by ${comment.user}`}
      className={`rounded-xl border border-line bg-raised/30 p-3 sm:p-3.5 space-y-2.5 transition-colors motion-reduce:transition-none ${
        isReply ? 'text-xs bg-raised/50' : 'text-sm'
      }`}
    >
      {/* Header: Avatar, Username, Level Badge, Date */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div
            aria-hidden="true"
            className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-raised border border-line flex items-center justify-center text-[10px] sm:text-xs font-bold text-ink shrink-0 select-none"
          >
            {avatarInitials}
          </div>
          <span className="font-semibold text-xs sm:text-sm text-ink truncate">
            {comment.user}
          </span>
          <span
            aria-label={`Level ${comment.level}`}
            className="px-1.5 py-0.2 rounded text-[10px] font-mono font-semibold bg-raised border border-line text-muted shrink-0 select-none"
          >
            Lv.{comment.level}
          </span>
        </div>

        <span className="text-[11px] text-muted shrink-0">{formattedDate}</span>
      </div>

      {/* Body: text with spoiler handling */}
      {comment.isSpoiler && !isRevealed ? (
        <div className="relative py-1">
          <p
            className="text-xs sm:text-sm text-ink filter blur-sm select-none pointer-events-none line-clamp-3"
            aria-hidden="true"
          >
            {comment.text}
          </p>
          <div className="absolute inset-0 flex items-center justify-center bg-raised/30 backdrop-blur-[2px] rounded-md">
            <button
              type="button"
              onClick={() => setIsRevealed(true)}
              aria-label={`Reveal spoiler from ${comment.user}`}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-page border border-line text-xs font-semibold text-accent hover:border-accent hover:bg-raised transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-system focus-visible:outline-none shadow-xs"
            >
              <Eye className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Reveal Spoiler</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-1">
          <p className="text-xs sm:text-sm text-ink leading-relaxed break-words">
            {comment.text}
          </p>
          {comment.isSpoiler && (
            <div className="flex items-center gap-2 pt-0.5">
              <span className="text-[10px] text-accent uppercase tracking-wider font-semibold">
                Spoiler
              </span>
              <button
                type="button"
                onClick={() => setIsRevealed(false)}
                aria-label="Hide spoiler"
                className="inline-flex items-center gap-1 text-[11px] text-muted hover:text-ink cursor-pointer focus-visible:ring-2 focus-visible:ring-system rounded"
              >
                <EyeOff className="w-3 h-3" aria-hidden="true" />
                <span>Hide</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Actions: Optimistic Like & Reply */}
      <div className="flex items-center gap-3 pt-1 border-t border-line/40 text-xs">
        {/* Like Button */}
        <button
          type="button"
          onClick={handleLike}
          aria-label={currentlyLiked ? 'Unlike comment' : 'Like comment'}
          aria-pressed={currentlyLiked}
          className={`inline-flex items-center gap-1 px-2 py-1 rounded-md transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-system focus-visible:outline-none ${
            currentlyLiked
              ? 'text-accent bg-accent/10 font-medium'
              : 'text-muted hover:text-ink hover:bg-raised'
          }`}
        >
          <Heart
            className={`w-3.5 h-3.5 ${currentlyLiked ? 'fill-accent text-accent' : ''}`}
            aria-hidden="true"
          />
          <span className="font-mono text-[11px]">{displayLikes}</span>
        </button>

        {/* Reply Button (available on top-level and replies) */}
        {onReply && (
          <button
            type="button"
            onClick={() => onReply(comment)}
            aria-label={`Reply to ${comment.user}`}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-muted hover:text-ink hover:bg-raised transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-system focus-visible:outline-none"
          >
            <MessageSquare className="w-3.5 h-3.5" aria-hidden="true" />
            <span className="text-[11px]">Reply</span>
          </button>
        )}
      </div>

      {/* One-Level Threaded Replies */}
      {replies && replies.length > 0 && (
        <div className="pl-3 sm:pl-4 border-l-2 border-line/70 space-y-2.5 mt-2.5">
          {replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              isReply
              onReply={onReply}
            />
          ))}
        </div>
      )}
    </article>
  );
};
