import type { ReaderFontFamily, ReaderMaxWidth, ReadingMode } from '../../store'
import { useEngagement, usePrefs, useProgress, useUI } from '../../store'
import { Bookmark, Compass, HelpCircle, Keyboard, RotateCcw, Settings } from 'lucide-react'

export interface OverlayCardsProps {
  lastHotkey: string
  onOpenModal: () => void
}

export function OverlayCards({ lastHotkey, onOpenModal }: OverlayCardsProps) {
  const prefs = usePrefs()
  const { openPanel } = useUI()
  const { likedIds, toggleLike } = useEngagement()
  const { saveProgress, getProgress } = useProgress()

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Card 1: Preferences */}
      <div className="p-5 rounded-2xl border border-line bg-page space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-ink flex items-center gap-2">
            <Settings className="w-4 h-4 text-accent" aria-hidden="true" />
            usePrefs
          </h3>
          <button
            type="button"
            onClick={() => prefs.reset()}
            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-md border border-line bg-raised hover:text-ink text-muted transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-system"
            aria-label="Reset preferences"
          >
            <RotateCcw className="w-3 h-3" />
            Reset
          </button>
        </div>

        <div className="space-y-3 text-xs">
          <div className="space-y-1">
            <div className="flex justify-between text-muted">
              <span>Font Size (14-28 / 2):</span>
              <span className="font-mono text-ink font-bold">{prefs.fontSize}px</span>
            </div>
            <div className="flex gap-1.5">
              {[14, 16, 18, 20, 22, 24, 28].map((sz) => (
                <button
                  key={sz}
                  type="button"
                  onClick={() => prefs.setFontSize(sz)}
                  className={`flex-1 py-1 rounded text-xs font-mono font-medium border transition-colors cursor-pointer ${
                    prefs.fontSize === sz
                      ? 'bg-system text-white font-bold border-system shadow-xs'
                      : 'bg-raised text-muted hover:text-ink hover:bg-page border-line'
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-muted">Font Family:</span>
            <div className="grid grid-cols-2 gap-1.5">
              {(['lora', 'inter', 'merriweather', 'mono'] as ReaderFontFamily[]).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => prefs.setFontFamily(f)}
                  className={`py-1 px-2 rounded text-xs capitalize border transition-colors cursor-pointer ${
                    prefs.fontFamily === f
                      ? 'bg-system text-white font-bold border-system shadow-xs'
                      : 'bg-raised text-muted hover:text-ink hover:bg-page border-line'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <div className="flex-1 space-y-1">
              <span className="text-muted">Max Width:</span>
              <div className="flex gap-1">
                {([680, 800, 960, 'full'] as ReaderMaxWidth[]).map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => prefs.setMaxWidth(w)}
                    className={`flex-1 py-1 rounded text-[11px] font-mono border transition-colors cursor-pointer ${
                      prefs.maxWidth === w
                        ? 'bg-system text-white font-bold border-system shadow-xs'
                        : 'bg-raised text-muted hover:text-ink hover:bg-page border-line'
                    }`}
                  >
                    {w}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-muted">Mode:</span>
              <div className="flex gap-1">
                {(['scroll', 'paginated'] as ReadingMode[]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => prefs.setReadingMode(m)}
                    className={`py-1 px-2 rounded text-[11px] capitalize border transition-colors cursor-pointer ${
                      prefs.readingMode === m
                        ? 'bg-system text-white font-bold border-system shadow-xs'
                        : 'bg-raised text-muted hover:text-ink hover:bg-page border-line'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Card 2: Hotkeys */}
      <div className="p-5 rounded-2xl border border-line bg-page space-y-4">
        <h3 className="text-sm font-bold text-ink flex items-center gap-2">
          <Keyboard className="w-4 h-4 text-system" aria-hidden="true" />
          Hotkeys & Overlays
        </h3>

        <div className="space-y-2.5 text-xs">
          <div className="p-2.5 rounded-lg border border-line bg-raised flex items-center justify-between">
            <span className="text-muted">Last Hotkey:</span>
            <span className="font-mono text-system font-bold">{lastHotkey}</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => openPanel('toc')}
              className="p-2 rounded-lg border border-line bg-raised hover:bg-page hover:border-system text-ink font-medium text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-system"
            >
              <Compass className="w-3.5 h-3.5 text-system" />
              Drawer [T]
            </button>
            <button
              type="button"
              onClick={onOpenModal}
              className="p-2 rounded-lg border border-line bg-raised hover:bg-page hover:border-system text-ink font-medium text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-system"
            >
              <HelpCircle className="w-3.5 h-3.5 text-system" />
              Modal [M]
            </button>
          </div>

          <div className="space-y-1">
            <label htmlFor="hotkey-test-input" className="text-muted text-[11px] block">
              Input test (hotkeys ignored inside):
            </label>
            <input
              id="hotkey-test-input"
              type="text"
              placeholder="Type 't', 'm', 'c' here..."
              className="w-full px-3 py-1.5 rounded-lg border border-line bg-raised text-ink text-xs focus-visible:ring-2 focus-visible:ring-system focus-visible:outline-none placeholder:text-muted/60"
            />
          </div>
        </div>
      </div>

      {/* Card 3: Progress & Engagement */}
      <div className="p-5 rounded-2xl border border-line bg-page space-y-4">
        <h3 className="text-sm font-bold text-ink flex items-center gap-2">
          <Bookmark className="w-4 h-4 text-accent" aria-hidden="true" />
          useProgress & useEngagement
        </h3>

        <div className="space-y-2 text-xs">
          <div className="flex justify-between p-2 rounded-lg border border-line bg-raised">
            <span className="text-muted">Likes & Bookmarks:</span>
            <span className="font-mono text-ink font-bold">
              {likedIds.length} liked
            </span>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => toggleLike('sample-item')}
              className="flex-1 py-1.5 px-2 rounded-lg border border-line bg-raised hover:bg-page text-ink text-xs font-medium cursor-pointer transition-colors"
            >
              Toggle Like
            </button>
            <button
              type="button"
              onClick={() => saveProgress('novel-demo', { chapterId: 'ch-01', percent: 45 })}
              className="flex-1 py-1.5 px-2 rounded-lg border border-line bg-raised hover:bg-page text-ink text-xs font-medium cursor-pointer transition-colors"
            >
              Save Progress
            </button>
          </div>

          <div className="text-[11px] text-muted p-2 rounded-lg border border-line bg-raised font-mono">
            Saved: {getProgress('novel-demo') ? `${getProgress('novel-demo')?.percent}%` : 'None'}
          </div>
        </div>
      </div>
    </div>
  )
}
