import React, { useRef, useState } from 'react';
import { EyeOff, Send, X } from 'lucide-react';
import { useEngagement } from '../../store/useEngagement';
import type { ParagraphComment } from '../../types/novel';

export interface CommentComposerProps {
  blockId: string;
  replyingTo?: ParagraphComment | null;
  onCancelReply?: () => void;
  onCommentAdded?: (comment: ParagraphComment) => void;
}

const MAX_COMMENT_LENGTH = 500;

export const CommentComposer: React.FC<CommentComposerProps> = ({
  blockId,
  replyingTo,
  onCancelReply,
  onCommentAdded,
}) => {
  const [text, setText] = useState<string>('');
  const [isSpoiler, setIsSpoiler] = useState<boolean>(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const charCount = text.length;
  const isTrimmedEmpty = text.trim().length === 0;
  const canSend = !isTrimmedEmpty && charCount <= MAX_COMMENT_LENGTH;

  const handleSubmit = () => {
    if (!canSend) return;

    const newComment: ParagraphComment = {
      id: `c-user-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      blockId,
      parentId: replyingTo?.id,
      user: 'You',
      avatarSeed: 'you-user',
      level: 1,
      text: text.trim(),
      likes: 0,
      createdAt: new Date().toISOString(),
      isSpoiler,
    };

    // Persist in useEngagement immediately
    useEngagement.getState().addComment(newComment);

    setText('');
    setIsSpoiler(false);
    onCancelReply?.();
    onCommentAdded?.(newComment);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter sends; Shift+Enter inserts newline
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (canSend) {
        handleSubmit();
      }
    }
  };

  return (
    <div className="space-y-2 pt-1">
      {/* Replying banner */}
      {replyingTo && (
        <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-raised border border-line text-xs text-muted">
          <span className="truncate">
            Replying to <strong className="text-ink">@{replyingTo.user}</strong>
          </span>
          <button
            type="button"
            onClick={onCancelReply}
            aria-label="Cancel reply"
            className="p-1 rounded text-muted hover:text-ink hover:bg-page transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-system focus-visible:outline-none"
          >
            <X className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>
      )}

      {/* Textarea container */}
      <div className="relative rounded-xl border border-line bg-page focus-within:border-accent focus-within:ring-1 focus-within:ring-accent transition-colors">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          maxLength={MAX_COMMENT_LENGTH}
          placeholder={
            replyingTo
              ? `Reply to @${replyingTo.user}... (Shift+Enter for newline)`
              : 'Leave a comment on this paragraph... (Enter to send)'
          }
          aria-label="Write a comment"
          rows={2}
          className="w-full px-3 py-2 text-xs sm:text-sm text-ink placeholder:text-muted bg-transparent resize-none outline-none leading-relaxed"
        />

        {/* Toolbar: Spoiler toggle, Char Counter, Submit button */}
        <div className="flex items-center justify-between px-3 py-2 border-t border-line/40 gap-2">
          {/* Spoiler toggle */}
          <button
            type="button"
            onClick={() => setIsSpoiler(!isSpoiler)}
            aria-pressed={isSpoiler}
            aria-label="Mark as spoiler"
            className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium border transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-system focus-visible:outline-none ${
              isSpoiler
                ? 'bg-accent/15 border-accent/40 text-accent font-semibold'
                : 'bg-raised border-line text-muted hover:text-ink'
            }`}
          >
            <EyeOff className="w-3 h-3" aria-hidden="true" />
            <span>Spoiler</span>
          </button>

          {/* Right side: live counter and send button */}
          <div className="flex items-center gap-3">
            <span
              aria-label={`${charCount} of ${MAX_COMMENT_LENGTH} characters`}
              className={`text-[11px] font-mono select-none ${
                charCount > 450 ? 'text-accent font-bold' : 'text-muted'
              }`}
            >
              {charCount}/{MAX_COMMENT_LENGTH}
            </span>

            <button
              type="button"
              disabled={!canSend}
              onClick={handleSubmit}
              aria-label="Post comment"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent text-white text-xs font-semibold hover:bg-accent/90 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-system focus-visible:outline-none shadow-xs motion-reduce:transition-none"
            >
              <span>Send</span>
              <Send className="w-3 h-3" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
