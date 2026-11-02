import { BookMarked, Sparkles } from 'lucide-react'
import type { ThemeName, ThemePalette } from '../../theme/tokens'

interface ThemeCardProps {
  themeName: ThemeName
  palette: ThemePalette
  isActiveTheme: boolean
  onSelectTheme: (name: ThemeName) => void
}

export function ThemeCard({
  themeName,
  palette,
  isActiveTheme,
  onSelectTheme,
}: ThemeCardProps) {
  return (
    <div
      data-theme={themeName}
      className="bg-outer text-ink border border-line rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col gap-4 transition-shadow hover:shadow-md min-w-0"
    >
      {/* Theme Card Header */}
      <div className="flex items-center justify-between gap-1.5 border-b border-line pb-3">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="w-3.5 h-3.5 rounded-full border border-line shadow-inner shrink-0"
            style={{ backgroundColor: palette.page }}
            aria-hidden="true"
          />
          <h3 className="font-bold text-base capitalize tracking-tight text-ink truncate">
            {themeName}
          </h3>
        </div>
        <button
          type="button"
          onClick={() => onSelectTheme(themeName)}
          className={`text-xs px-2 sm:px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer shrink-0 focus-visible:ring-2 focus-visible:ring-system focus-visible:outline-none ${
            isActiveTheme
              ? 'bg-system text-white'
              : 'bg-raised text-muted hover:text-ink border border-line'
          }`}
          aria-label={`Apply ${themeName} theme to page`}
        >
          {isActiveTheme ? 'Active Global' : 'Apply'}
        </button>
      </div>

      {/* Semantic Swatches */}
      <div className="space-y-1.5 text-xs">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-muted">
          Semantic Surfaces
        </div>
        <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
          <div className="p-2 sm:p-2.5 rounded-lg border border-line bg-outer flex flex-col gap-0.5 min-w-0">
            <span className="font-mono text-[10px] text-muted">outer</span>
            <span className="font-semibold text-ink text-[11px] sm:text-xs truncate">{palette.outer}</span>
          </div>
          <div className="p-2 sm:p-2.5 rounded-lg border border-line bg-page flex flex-col gap-0.5 min-w-0">
            <span className="font-mono text-[10px] text-muted">page</span>
            <span className="font-semibold text-ink text-[11px] sm:text-xs truncate">{palette.page}</span>
          </div>
          <div className="p-2 sm:p-2.5 rounded-lg border border-line bg-raised flex flex-col gap-0.5 min-w-0">
            <span className="font-mono text-[10px] text-muted">raised</span>
            <span className="font-semibold text-ink text-[11px] sm:text-xs truncate">{palette.raised}</span>
          </div>
        </div>
      </div>

      {/* Semantic Text & Accents */}
      <div className="p-3.5 rounded-xl border border-line bg-page space-y-3 min-w-0">
        <div className="flex items-center justify-between gap-1 text-xs border-b border-line pb-2">
          <span className="font-semibold text-ink truncate">Page Surface</span>
          {/* Opacity token test: bg-accent/10 */}
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-accent/10 text-accent shrink-0">
            <Sparkles className="w-3 h-3" aria-hidden="true" />
            <span>bg-accent/10</span>
          </span>
        </div>

        <div className="space-y-1 text-xs">
          <p className="text-ink font-medium truncate">text-ink: Primary story narration</p>
          <p className="text-muted text-[11px] truncate">text-muted: Chapter 4 • 2,430 words</p>
          <p className="text-accent-ink font-medium text-[11px] truncate">
            text-accent-ink: High contrast link
          </p>
        </div>

        {/* Buttons / Actions */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <button
            type="button"
            className="px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold bg-accent text-white shadow-xs hover:opacity-90 transition-opacity focus-visible:ring-2 focus-visible:ring-system focus-visible:outline-none cursor-pointer"
          >
            accent
          </button>
          <button
            type="button"
            className="px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold bg-system text-white shadow-xs hover:opacity-90 transition-opacity focus-visible:ring-2 focus-visible:ring-system focus-visible:outline-none cursor-pointer"
          >
            system
          </button>
          <button
            type="button"
            className="px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium bg-raised text-ink border border-line hover:bg-page transition-colors focus-visible:ring-2 focus-visible:ring-system focus-visible:outline-none cursor-pointer"
          >
            raised
          </button>
        </div>
      </div>

      {/* Reader Prose Sample */}
      <div className="p-3.5 rounded-xl border border-line bg-raised space-y-2 min-w-0">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-muted">
          <BookMarked className="w-3.5 h-3.5 text-accent shrink-0" aria-hidden="true" />
          <span>Reader Variables</span>
        </div>
        <p
          className="text-ink"
          style={{
            fontFamily: 'var(--reader-font)',
            fontSize: 'var(--reader-size)',
            lineHeight: 'var(--reader-leading)',
          }}
        >
          The ancient lantern flickered softly, casting long shadows across the stone hallway.
        </p>
      </div>
    </div>
  )
}
