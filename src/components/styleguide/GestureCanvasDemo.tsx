import { useState } from 'react'
import { Eye, EyeOff, MessageSquare, Sparkles } from 'lucide-react'
import { useReaderGestures } from '../../hooks'
import { usePrefs, useUI } from '../../store'

export function GestureCanvasDemo() {
  const prefs = usePrefs()
  const { chromeVisible, toggleChrome, openPanel } = useUI()
  const [gestureFeedback, setGestureFeedback] = useState<string>(
    'Tap anywhere on the reader canvas below'
  )

  const { handleCanvasClick } = useReaderGestures({
    readingMode: prefs.readingMode,
    onToggleChrome: () => {
      toggleChrome()
      setGestureFeedback(`Center 40% tapped! Chrome is now ${!chromeVisible ? 'Visible' : 'Hidden'}`)
    },
    onPrevPage: () => setGestureFeedback('Left 30% tapped in Paginated mode: Prev Page'),
    onNextPage: () => setGestureFeedback('Right 30% tapped in Paginated mode: Next Page'),
  })

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-accent" aria-hidden="true" />
          <span className="text-sm font-bold text-ink">Reader Canvas Gesture Model Test</span>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-muted">Chrome:</span>
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold ${
              chromeVisible
                ? 'bg-system/10 text-system border border-system/20'
                : 'bg-muted/10 text-muted border border-line'
            }`}
          >
            {chromeVisible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            {chromeVisible ? 'Visible' : 'Hidden'}
          </span>
        </div>
      </div>

      <div className="px-3 py-1.5 rounded-lg border border-line bg-raised text-xs font-mono text-accent truncate">
        {gestureFeedback}
      </div>

      <div
        onClick={handleCanvasClick}
        className="relative p-6 sm:p-8 rounded-2xl border-2 border-dashed border-line bg-page select-text cursor-pointer transition-colors hover:border-line/80 space-y-4"
      >
        {/* Overlay visual zone guides */}
        <div className="grid grid-cols-10 gap-1 absolute inset-0 pointer-events-none opacity-20 p-2">
          <div className="col-span-3 rounded-lg border border-line bg-raised flex items-center justify-center text-[10px] font-mono text-muted">
            Left 30% (Scroll: None / Paged: Prev)
          </div>
          <div className="col-span-4 rounded-lg border border-system bg-system/10 flex items-center justify-center text-[10px] font-mono text-system font-bold">
            Center 40% (Toggle Chrome)
          </div>
          <div className="col-span-3 rounded-lg border border-line bg-raised flex items-center justify-center text-[10px] font-mono text-muted">
            Right 30% (Scroll: None / Paged: Next)
          </div>
        </div>

        {/* Reader Article Body */}
        <article
          className="mx-auto text-ink relative z-10"
          style={{
            fontFamily: 'var(--reader-font)',
            fontSize: 'var(--reader-size)',
            lineHeight: 'var(--reader-leading)',
            maxWidth: 'min(var(--reader-width), 100%)',
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold font-inter text-ink">
              Chapter 1: The First Spark
            </h3>

            {/* Interactive Comment Badge (data-interactive) */}
            <button
              type="button"
              data-interactive="comment-badge"
              onClick={(e) => {
                e.stopPropagation()
                openPanel('comments')
                setGestureFeedback('Interactive comment badge clicked! Opened comments.')
              }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-line bg-raised hover:bg-page hover:border-accent text-ink text-xs font-medium cursor-pointer transition-colors focus-visible:ring-2 focus-visible:ring-system"
              aria-label="View 14 comments"
            >
              <MessageSquare className="w-3.5 h-3.5 text-accent" />
              <span>14</span>
            </button>
          </div>

          <p className="mb-[var(--reader-gap)]">
            The ancient runestone hummed with low resonant energy, vibrating under Sunny's fingertips like the heartbeat of a sleeping leviathan. Try selecting any of these words to test text selection protection.
          </p>

          <p className="mb-[var(--reader-gap)]">
            Tapping the center 40% toggles the reader chrome. Tapping the left or right sides does nothing in scroll mode. Clicking paragraph body never triggers comments.
          </p>
        </article>
      </div>
    </div>
  )
}
