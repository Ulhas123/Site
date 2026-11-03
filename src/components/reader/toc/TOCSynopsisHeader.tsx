import React, { useState } from 'react'
import { ChevronDown, ChevronUp, Library } from 'lucide-react'
import { useUI } from '../../../store/useUI'
import type { Novel } from '../../../types/novel'

export interface TOCSynopsisHeaderProps {
  novel: Novel
}

export const TOCSynopsisHeader: React.FC<TOCSynopsisHeaderProps> = ({ novel }) => {
  const [isSynopsisOpen, setIsSynopsisOpen] = useState(false)

  return (
    <div className="p-4 border-b border-line bg-raised/20 shrink-0 space-y-2">
      <div className="flex items-start gap-3">
        {novel.cover && (
          <img
            src={novel.cover}
            alt={novel.title}
            className="w-12 h-16 rounded object-cover border border-line shrink-0 select-none"
          />
        )}
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-bold text-ink truncate">{novel.title}</h3>
          <p className="text-xs text-muted truncate">By {novel.author}</p>
          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => setIsSynopsisOpen(!isSynopsisOpen)}
              aria-expanded={isSynopsisOpen}
              className="flex items-center gap-1 text-[11px] font-semibold text-accent hover:underline cursor-pointer focus-visible:ring-2 focus-visible:ring-system rounded"
            >
              <span>{isSynopsisOpen ? 'Hide Synopsis' : 'Show Synopsis'}</span>
              {isSynopsisOpen ? (
                <ChevronUp className="w-3.5 h-3.5" aria-hidden="true" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
              )}
            </button>
            <button
              type="button"
              onClick={() => useUI.getState().openPanel('library')}
              aria-label="Browse all novels in library"
              className="flex items-center gap-1 text-[11px] font-semibold text-muted hover:text-ink cursor-pointer focus-visible:ring-2 focus-visible:ring-system rounded"
            >
              <Library className="w-3.5 h-3.5 text-accent" aria-hidden="true" />
              <span>Library</span>
            </button>
          </div>
        </div>
      </div>

      {isSynopsisOpen && (
        <div className="pt-2 text-xs text-muted leading-relaxed border-t border-line/60">
          {novel.synopsis}
        </div>
      )}
    </div>
  )
}
