import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowDownUp, Search, X } from 'lucide-react'
import { useEngagement } from '../../store/useEngagement'
import { useProgress } from '../../store/useProgress'
import { useUI } from '../../store/useUI'
import type { ChapterMeta, Novel } from '../../types/novel'
import { Drawer } from '../ui/Drawer'
import { ChapterUnlockModal } from './ChapterUnlockModal'
import { TOCChapterRow } from './toc/TOCChapterRow'
import { TOCSynopsisHeader } from './toc/TOCSynopsisHeader'
import { useVirtualList } from './useVirtualList'

export interface TOCDrawerProps {
  novel: Novel | null
  activeChapterId?: string
}

const ROW_HEIGHT = 56

export const TOCDrawer: React.FC<TOCDrawerProps> = ({ novel, activeChapterId }) => {
  const navigate = useNavigate()
  const activePanel = useUI((s) => s.activePanel)
  const closePanel = useUI((s) => s.closePanel)

  const isChapterRead = useProgress((s) => s.isChapterRead)
  const isChapterUnlocked = useEngagement((s) => s.isChapterUnlocked)

  const isOpen = activePanel === 'toc'

  const [rawQuery, setRawQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [selectedLockedChapter, setSelectedLockedChapter] = useState<ChapterMeta | null>(null)

  // Debounce search query by 120ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(rawQuery.trim().toLowerCase())
    }, 120)
    return () => clearTimeout(timer)
  }, [rawQuery])

  const allChapters = useMemo(() => novel?.chapters ?? [], [novel?.chapters])

  // Fast filtered & sorted list
  const filteredChapters = useMemo(() => {
    if (!debouncedQuery) {
      return sortOrder === 'asc' ? allChapters : [...allChapters].reverse()
    }

    const numericMatch = debouncedQuery.match(/\d+/)
    const queryNum = numericMatch ? parseInt(numericMatch[0], 10) : null

    const result = allChapters.filter((ch) => {
      if (queryNum !== null && ch.number === queryNum) return true
      return ch.title.toLowerCase().includes(debouncedQuery)
    })

    return sortOrder === 'asc' ? result : [...result].reverse()
  }, [allChapters, debouncedQuery, sortOrder])

  // Fixed-row virtualization
  const { containerRef, handleScroll, virtualItems, totalHeight, scrollToItem } =
    useVirtualList({
      totalItems: filteredChapters.length,
      rowHeight: ROW_HEIGHT,
      containerHeight: 450,
    })

  // Auto-scroll to active chapter when opened
  const hasAutoScrolledRef = useRef(false)
  useEffect(() => {
    if (isOpen && !hasAutoScrolledRef.current && activeChapterId) {
      const idx = filteredChapters.findIndex((c) => c.id === activeChapterId)
      if (idx !== -1) {
        scrollToItem(idx, 'center')
        hasAutoScrolledRef.current = true
      }
    }
    if (!isOpen) {
      hasAutoScrolledRef.current = false
    }
  }, [isOpen, activeChapterId, filteredChapters, scrollToItem])

  const handleSelectChapter = (ch: ChapterMeta) => {
    const isFree = ch.number <= 4
    const isUnlocked = isFree || isChapterUnlocked(ch.id)

    if (!isUnlocked) {
      setSelectedLockedChapter(ch)
      return
    }

    closePanel()
    navigate(`/novel/${novel?.id || 'shattered-reach'}/chapter/${ch.id}`)
  }

  const handleUnlockSuccess = (chapterId: string) => {
    setSelectedLockedChapter(null)
    closePanel()
    navigate(`/novel/${novel?.id || 'shattered-reach'}/chapter/${chapterId}`)
  }

  return (
    <>
      <Drawer
        isOpen={isOpen}
        onClose={closePanel}
        title="Table of Contents"
        description={`${allChapters.length.toLocaleString()} Chapters • ${novel?.title || ''}`}
        widthClass="sm:max-w-md sm:w-full"
      >
        <div className="flex flex-col h-full -mx-5 -my-4">
          {/* Synopsis Header */}
          {novel && <TOCSynopsisHeader novel={novel} />}

          {/* Search Bar & Asc/Desc Toggle */}
          <div className="p-3 border-b border-line bg-page shrink-0 flex items-center gap-2">
            <div className="relative flex-1">
              <Search
                className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              />
              <input
                type="search"
                value={rawQuery}
                onChange={(e) => setRawQuery(e.target.value)}
                placeholder="Search number or title..."
                aria-label="Search chapters"
                className="w-full pl-9 pr-8 py-2 text-xs rounded-xl bg-raised border border-line text-ink placeholder:text-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-system"
              />
              {rawQuery && (
                <button
                  type="button"
                  onClick={() => setRawQuery('')}
                  aria-label="Clear search"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-ink cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              aria-label={`Sort ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}
              className="px-3 py-2 text-xs font-semibold rounded-xl border border-line bg-raised hover:bg-page text-ink flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 focus-visible:ring-2 focus-visible:ring-system"
            >
              <ArrowDownUp className="w-3.5 h-3.5 text-muted" aria-hidden="true" />
              <span>{sortOrder === 'asc' ? '1 → 1200' : '1200 → 1'}</span>
            </button>
          </div>

          {/* Virtualized Chapter List */}
          <div
            ref={containerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto relative min-h-0"
            role="list"
            aria-label="Chapters"
            tabIndex={0}
          >
            {filteredChapters.length === 0 ? (
              <div className="py-12 text-center text-xs text-muted">
                No chapters matching &ldquo;{rawQuery}&rdquo;
              </div>
            ) : (
              <div style={{ height: `${totalHeight}px`, position: 'relative', width: '100%' }}>
                {virtualItems.map(({ index, offsetTop }) => {
                  const ch = filteredChapters[index]
                  if (!ch) return null

                  return (
                    <TOCChapterRow
                      key={ch.id}
                      chapter={ch}
                      isActive={ch.id === activeChapterId}
                      isRead={isChapterRead(ch.id)}
                      isUnlocked={ch.number <= 4 || isChapterUnlocked(ch.id)}
                      offsetTop={offsetTop}
                      rowHeight={ROW_HEIGHT}
                      onSelect={handleSelectChapter}
                    />
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </Drawer>

      {/* Chapter Unlock Modal */}
      <ChapterUnlockModal
        isOpen={Boolean(selectedLockedChapter)}
        onClose={() => setSelectedLockedChapter(null)}
        chapter={selectedLockedChapter}
        onUnlockSuccess={handleUnlockSuccess}
      />
    </>
  )
}
