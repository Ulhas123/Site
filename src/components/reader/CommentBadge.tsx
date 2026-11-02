import React from 'react';
import { MessageSquare, Plus } from 'lucide-react';
import { useUI } from '../../store/useUI';

export interface CommentBadgeProps {
  blockId: string;
  count: number;
  isActive: boolean;
  onSelect?: () => void;
}

export const CommentBadge: React.FC<CommentBadgeProps> = ({
  blockId,
  count,
  isActive,
  onSelect,
}) => {
  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    useUI.getState().setActiveBlockId(blockId);
    useUI.getState().openPanel('comments');
    onSelect?.();
  };

  // 0 count: '+' bubble on hover (pointer:fine) or only on active block on touch
  if (count === 0) {
    return (
      <button
        type="button"
        data-interactive="comment-badge"
        onClick={handleSelect}
        aria-label="Add comment to paragraph"
        className={`inline-flex items-center justify-center w-5 h-5 ml-1.5 align-middle rounded-full text-xs font-semibold border transition-all duration-150 cursor-pointer focus-visible:ring-2 focus-visible:ring-system focus-visible:outline-none select-none motion-reduce:transition-none ${
          isActive
            ? 'opacity-100 scale-100 bg-accent/15 text-accent border-accent/40 shadow-xs'
            : 'opacity-0 group-hover:opacity-100 [@media(pointer:coarse)]:group-hover:opacity-0 focus-visible:opacity-100 bg-raised text-muted border-line hover:border-accent hover:text-accent'
        }`}
      >
        <Plus className="w-3 h-3" aria-hidden="true" />
      </button>
    );
  }

  // 1-9 count: muted pill
  if (count < 10) {
    return (
      <button
        type="button"
        data-interactive="comment-badge"
        onClick={handleSelect}
        aria-label={`${count} comments on paragraph`}
        className="inline-flex items-center gap-1 px-1.5 py-0.5 ml-1.5 align-middle rounded-full text-[11px] font-mono font-medium bg-raised text-muted border border-line hover:text-ink hover:border-muted/50 transition-colors cursor-pointer select-none focus-visible:ring-2 focus-visible:ring-system focus-visible:outline-none motion-reduce:transition-none"
      >
        <MessageSquare className="w-2.5 h-2.5" aria-hidden="true" />
        <span>{count}</span>
      </button>
    );
  }

  // 10+ count: accent pill
  return (
    <button
      type="button"
      data-interactive="comment-badge"
      onClick={handleSelect}
      aria-label={`${count} comments on paragraph`}
      className="inline-flex items-center gap-1 px-1.5 py-0.5 ml-1.5 align-middle rounded-full text-[11px] font-mono font-semibold bg-accent/15 text-accent border border-accent/40 hover:bg-accent/25 transition-colors cursor-pointer select-none focus-visible:ring-2 focus-visible:ring-system focus-visible:outline-none shadow-xs motion-reduce:transition-none"
    >
      <MessageSquare className="w-2.5 h-2.5 fill-accent/20" aria-hidden="true" />
      <span>{count}</span>
    </button>
  );
};
