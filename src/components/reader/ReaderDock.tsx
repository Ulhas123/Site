import React, { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ChevronLeft,
  ChevronRight,
  Headphones,
  List,
  MessageSquare,
  Sliders,
} from 'lucide-react'
import { allComments } from '../../data/comments'
import { useEngagement } from '../../store/useEngagement'
import { useUI } from '../../store/useUI'
import type { ChapterMeta } from '../../types/novel'

export interface ReaderDockProps {
  novelId: string
  activeChapter?: ChapterMeta | null
  allChapters?: ChapterMeta[]
}

export const ReaderDock: React.FC<ReaderDockProps> = ({
  novelId,
  activeChapter,
  allChapters = [],
}) => {
  const navigate = useNavigate()
  const activePanel = useUI((s) => s.activePanel)
  const openPanel = useUI((s) => s.openPanel)
  const closePanel = useUI((s) => s.closePanel)
  const chromeVisible = useUI((s) => s.chromeVisible)

  const addedComments = useEngagement((s) => s.addedComments)

  // Chapter comment total badge
  const chapterCommentsTotal = useMemo(() => {
    if (!activeChapter) return 0
    // Chapter 1 has 31 seed comments
    const seedCount =
      activeChapter.id === 'chapter-1' || activeChapter.number === 1
        ? allComments.length
        : 0
    const userCount = addedComments.filter((c) =>
      c.blockId.startsWith(`ch0${activeChapter.number}`) ||
      c.blockId.startsWith(`ch${activeChapter.number}`)
    ).length
    return seedCount + userCount
  }, [activeChapter, addedComments])

  // Prev / Next Chapter calculations
  const currentIndex = useMemo(() => {
    if (!activeChapter) return -1
    return allChapters.findIndex((c) => c.id === activeChapter.id)
  }, [activeChapter, allChapters])

  const prevChapter = currentIndex > 0 ? allChapters[currentIndex - 1] : null
  const nextChapter =
    currentIndex !== -1 && currentIndex < allChapters.length - 1
      ? allChapters[currentIndex + 1]
      : null

  const handleNavigateChapter = (target: ChapterMeta | null) => {
    if (!target) return
    navigate(`/novel/${novelId}/chapter/${target.id}`)
  }

  const togglePanel = (panel: 'toc' | 'settings' | 'comments' | 'audio') => {
    if (activePanel === panel) {
      closePanel()
    } else {
      openPanel(panel)
    }
  }

  return (
    <nav
      aria-label="Reader Navigation Dock"
      className={`fixed bottom-0 left-0 right-0 z-40 bg-page/95 backdrop-blur-md border-t border-line text-ink transition-transform duration-200 ease-in-out motion-reduce:transition-none pb-[max(0.5rem,env(safe-area-inset-bottom))] md:bottom-6 md:left-1/2 md:-translate-x-1/2 md:right-auto md:w-auto md:rounded-2xl md:border md:border-line md:shadow-2xl md:pb-1.5 md:pt-1.5 md:px-3 md:transition-all ${
        chromeVisible
          ? 'translate-y-0 md:opacity-100'
          : 'translate-y-full md:translate-y-20 md:opacity-0 md:pointer-events-none'
      }`}
    >
      <div className="max-w-md mx-auto md:max-w-none flex items-center justify-around md:justify-center gap-1 sm:gap-2 px-2 py-1">
        {/* Prev Chapter */}
        <button
          type="button"
          disabled={!prevChapter}
          onClick={() => handleNavigateChapter(prevChapter)}
          aria-label={prevChapter ? `Previous: ${prevChapter.title}` : 'No previous chapter'}
          className="min-w-[44px] min-h-[44px] w-11 h-11 rounded-xl flex items-center justify-center text-muted hover:text-ink hover:bg-raised transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-system"
        >
          <ChevronLeft className="w-5 h-5" aria-hidden="true" />
        </button>

        {/* TOC Button */}
        <button
          type="button"
          onClick={() => togglePanel('toc')}
          aria-label="Table of Contents"
          aria-expanded={activePanel === 'toc'}
          className={`min-w-[44px] min-h-[44px] w-11 h-11 rounded-xl flex items-center justify-center transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-system ${
            activePanel === 'toc'
              ? 'bg-accent/20 text-accent font-bold shadow-xs'
              : 'text-muted hover:text-ink hover:bg-raised'
          }`}
        >
          <List className="w-5 h-5" aria-hidden="true" />
        </button>

        {/* Settings Button */}
        <button
          type="button"
          onClick={() => togglePanel('settings')}
          aria-label="Reading Settings"
          aria-expanded={activePanel === 'settings'}
          className={`min-w-[44px] min-h-[44px] w-11 h-11 rounded-xl flex items-center justify-center transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-system ${
            activePanel === 'settings'
              ? 'bg-accent/20 text-accent font-bold shadow-xs'
              : 'text-muted hover:text-ink hover:bg-raised'
          }`}
        >
          <Sliders className="w-5 h-5" aria-hidden="true" />
        </button>

        {/* Comments Button with Chapter Total Badge */}
        <button
          type="button"
          onClick={() => togglePanel('comments')}
          aria-label={`Comments (${chapterCommentsTotal} total on this chapter)`}
          aria-expanded={activePanel === 'comments'}
          className={`relative min-w-[44px] min-h-[44px] w-11 h-11 rounded-xl flex items-center justify-center transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-system ${
            activePanel === 'comments'
              ? 'bg-accent/20 text-accent font-bold shadow-xs'
              : 'text-muted hover:text-ink hover:bg-raised'
          }`}
        >
          <MessageSquare className="w-5 h-5" aria-hidden="true" />
          {chapterCommentsTotal > 0 && (
            <span
              className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-accent text-accent-ink text-[10px] font-bold flex items-center justify-center shadow-xs"
              aria-label={`${chapterCommentsTotal} comments`}
            >
              {chapterCommentsTotal > 99 ? '99+' : chapterCommentsTotal}
            </span>
          )}
        </button>

        {/* Audio Narration Button */}
        <button
          type="button"
          onClick={() => togglePanel('audio')}
          aria-label="Audio Narration"
          aria-expanded={activePanel === 'audio'}
          className={`min-w-[44px] min-h-[44px] w-11 h-11 rounded-xl flex items-center justify-center transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-system ${
            activePanel === 'audio'
              ? 'bg-accent/20 text-accent font-bold shadow-xs'
              : 'text-muted hover:text-ink hover:bg-raised'
          }`}
        >
          <Headphones className="w-5 h-5" aria-hidden="true" />
        </button>

        {/* Next Chapter */}
        <button
          type="button"
          disabled={!nextChapter}
          onClick={() => handleNavigateChapter(nextChapter)}
          aria-label={nextChapter ? `Next: ${nextChapter.title}` : 'No next chapter'}
          className="min-w-[44px] min-h-[44px] w-11 h-11 rounded-xl flex items-center justify-center text-muted hover:text-ink hover:bg-raised transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-system"
        >
          <ChevronRight className="w-5 h-5" aria-hidden="true" />
        </button>
      </div>
    </nav>
  )
}
