import React from 'react'
import { Minus, Plus, RotateCcw } from 'lucide-react'
import { FONT_FAMILY_MAP } from '../../hooks/useApplyPrefs'
import {
  type ReaderMaxWidth,
  type ReadingMode,
  usePrefs,
} from '../../store/usePrefs'
import { Drawer } from '../ui/Drawer'
import { FontSegmentedControl } from './settings/FontSegmentedControl'
import { ThemeRadiogroup } from './settings/ThemeRadiogroup'

const LINE_HEIGHT_OPTIONS = [1.6, 1.8, 2.0, 2.2]
const WIDTH_OPTIONS: { value: ReaderMaxWidth; label: string }[] = [
  { value: 680, label: '680px' },
  { value: 800, label: '800px' },
  { value: 960, label: '960px' },
  { value: 'full', label: 'Full' },
]

export const SettingsDrawer: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const {
    theme,
    fontFamily,
    fontSize,
    lineHeight,
    paragraphGap,
    maxWidth,
    readingMode,
    setTheme,
    setFontFamily,
    setFontSize,
    setLineHeight,
    setParagraphGap,
    setMaxWidth,
    setReadingMode,
    reset,
  } = usePrefs()

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Reading Preferences"
      description="Visual typography and reading environment"
      widthClass="sm:max-w-md sm:w-full"
    >
      <div className="space-y-6 pb-6 text-sm">
        {/* Live Preview Paragraph */}
        <section aria-label="Live preview" className="p-3.5 rounded-xl border border-line bg-raised/40">
          <div className="text-[10px] font-mono uppercase tracking-wider text-muted mb-2">
            Live Preview
          </div>
          <p
            className="text-ink transition-all duration-150 select-none"
            style={{
              fontFamily: FONT_FAMILY_MAP[fontFamily],
              fontSize: `${fontSize}px`,
              lineHeight: lineHeight,
              marginBottom: `${paragraphGap}px`,
            }}
          >
            A pale blue interface flickered at the edge of his vision, its sapphire glyphs humming with silent energy. Latency: absolute zero.
          </p>
        </section>

        {/* 4 Theme Swatches Radiogroup */}
        <ThemeRadiogroup currentTheme={theme} onSelectTheme={setTheme} />

        {/* Font Segmented Control in Own Typefaces */}
        <FontSegmentedControl currentFont={fontFamily} onSelectFont={setFontFamily} />

        {/* Size Stepper + Slider */}
        <section className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold uppercase tracking-wider text-muted">Font Size</span>
            <span className="font-mono font-bold text-ink">{fontSize}px</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Decrease font size"
              disabled={fontSize <= 14}
              onClick={() => setFontSize(fontSize - 2)}
              className="w-10 h-10 rounded-xl border border-line bg-raised hover:bg-page flex items-center justify-center text-ink disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-system"
            >
              <Minus className="w-4 h-4" aria-hidden="true" />
            </button>
            <input
              type="range"
              min="14"
              max="28"
              step="2"
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              aria-label="Font size"
              className="flex-1 accent-accent cursor-pointer"
            />
            <button
              type="button"
              aria-label="Increase font size"
              disabled={fontSize >= 28}
              onClick={() => setFontSize(fontSize + 2)}
              className="w-10 h-10 rounded-xl border border-line bg-raised hover:bg-page flex items-center justify-center text-ink disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-system"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </section>

        {/* Line Height Pills */}
        <section className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold uppercase tracking-wider text-muted">Line Height</span>
            <span className="font-mono font-bold text-ink">{lineHeight}</span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {LINE_HEIGHT_OPTIONS.map((lh) => {
              const isSelected = lineHeight === lh
              return (
                <button
                  key={lh}
                  type="button"
                  onClick={() => setLineHeight(lh)}
                  aria-pressed={isSelected}
                  className={`py-1.5 px-2 text-xs font-semibold rounded-xl border transition-colors cursor-pointer text-center focus-visible:ring-2 focus-visible:ring-system ${
                    isSelected
                      ? 'bg-page border-system text-ink shadow-xs'
                      : 'bg-raised/40 hover:bg-raised border-line text-muted hover:text-ink'
                  }`}
                >
                  {lh}
                </button>
              )
            })}
          </div>
        </section>

        {/* Paragraph Gap Slider */}
        <section className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold uppercase tracking-wider text-muted">Paragraph Gap</span>
            <span className="font-mono font-bold text-ink">{paragraphGap}px</span>
          </div>
          <input
            type="range"
            min="16"
            max="32"
            step="2"
            value={paragraphGap}
            onChange={(e) => setParagraphGap(Number(e.target.value))}
            aria-label="Paragraph gap"
            className="w-full accent-accent cursor-pointer"
          />
        </section>

        {/* Width Selector (hidden <768px) */}
        <section className="hidden md:block space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold uppercase tracking-wider text-muted">Content Width</span>
            <span className="font-mono font-bold text-ink">
              {maxWidth === 'full' ? 'Full' : `${maxWidth}px`}
            </span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {WIDTH_OPTIONS.map((w) => {
              const isSelected = maxWidth === w.value
              return (
                <button
                  key={String(w.value)}
                  type="button"
                  onClick={() => setMaxWidth(w.value)}
                  aria-pressed={isSelected}
                  className={`py-1.5 px-2 text-xs font-semibold rounded-xl border transition-colors cursor-pointer text-center focus-visible:ring-2 focus-visible:ring-system ${
                    isSelected
                      ? 'bg-page border-system text-ink shadow-xs'
                      : 'bg-raised/40 hover:bg-raised border-line text-muted hover:text-ink'
                  }`}
                >
                  {w.label}
                </button>
              )
            })}
          </div>
        </section>

        {/* Reading Mode Toggle */}
        <section className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted">Reading Mode</label>
          <div className="grid grid-cols-2 gap-2">
            {(['scroll', 'paginated'] as ReadingMode[]).map((mode) => {
              const isSelected = readingMode === mode
              return (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setReadingMode(mode)}
                  aria-pressed={isSelected}
                  className={`py-2 px-3 text-xs font-semibold rounded-xl border capitalize transition-colors cursor-pointer text-center focus-visible:ring-2 focus-visible:ring-system ${
                    isSelected
                      ? 'bg-page border-system text-ink shadow-xs'
                      : 'bg-raised/40 hover:bg-raised border-line text-muted hover:text-ink'
                  }`}
                >
                  {mode === 'scroll' ? 'Vertical Scroll' : 'Paginated'}
                </button>
              )
            })}
          </div>
        </section>

        {/* Reset Link */}
        <div className="pt-2 border-t border-line flex items-center justify-end">
          <button
            type="button"
            onClick={reset}
            className="flex items-center gap-1.5 text-xs text-muted hover:text-accent font-semibold underline cursor-pointer focus-visible:ring-2 focus-visible:ring-system rounded p-1"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Reset to defaults</span>
          </button>
        </div>
      </div>
    </Drawer>
  )
}
