import React from 'react'
import { Check, Coins, Lock } from 'lucide-react'
import type { ChapterMeta } from '../../../types/novel'

export interface TOCChapterRowProps {
  chapter: ChapterMeta
  isActive: boolean
  isRead: boolean
  isUnlocked: boolean
  offsetTop: number
  rowHeight: number
  onSelect: (chapter: ChapterMeta) => void
}

export const TOCChapterRow: React.FC<TOCChapterRowProps> = ({
  chapter,
  isActive,
  isRead,
  isUnlocked,
  offsetTop,
  rowHeight,
  onSelect,
}) => {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: `${rowHeight}px`,
        transform: `translateY(${offsetTop}px)`,
      }}
      className="px-3 py-1"
    >
      <button
        type="button"
        onClick={() => onSelect(chapter)}
        className={`w-full h-full px-3 rounded-xl flex items-center justify-between text-left transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-system ${
          isActive
            ? 'bg-accent/15 border-l-4 border-accent text-accent font-bold'
            : isRead
            ? 'bg-page/40 hover:bg-raised text-muted opacity-60 hover:opacity-100'
            : 'bg-page hover:bg-raised text-ink'
        }`}
      >
        <div className="min-w-0 flex-1 pr-2">
          <div className="text-xs font-semibold truncate leading-tight">
            {chapter.title}
          </div>
          <div className="text-[10px] text-muted truncate">
            Chapter {chapter.number} • {chapter.wordCount.toLocaleString()} words
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-1.5">
          {isRead && (
            <span
              className="text-[10px] font-medium text-muted flex items-center gap-0.5"
              title="Read"
            >
              <Check className="w-3.5 h-3.5 text-accent" aria-hidden="true" />
              <span className="hidden xs:inline">Read</span>
            </span>
          )}

          {!isUnlocked && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-accent/15 text-accent border border-accent/30 flex items-center gap-1">
              <Lock className="w-3 h-3" aria-hidden="true" />
              <Coins className="w-2.5 h-2.5" aria-hidden="true" />
              <span>10</span>
            </span>
          )}
        </div>
      </button>
    </div>
  )
}
