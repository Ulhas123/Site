import React from 'react'
import type { ReaderFontFamily } from '../../../store/usePrefs'

const FONT_OPTIONS: { id: ReaderFontFamily; label: string; style: React.CSSProperties }[] = [
  { id: 'lora', label: 'Lora', style: { fontFamily: "'Lora Variable', serif" } },
  { id: 'inter', label: 'Inter', style: { fontFamily: "'Inter Variable', sans-serif" } },
  { id: 'merriweather', label: 'Merriweather', style: { fontFamily: "'Merriweather Variable', serif" } },
  { id: 'mono', label: 'Mono', style: { fontFamily: "'JetBrains Mono Variable', monospace" } },
]

export interface FontSegmentedControlProps {
  currentFont: ReaderFontFamily
  onSelectFont: (font: ReaderFontFamily) => void
}

export const FontSegmentedControl: React.FC<FontSegmentedControlProps> = ({
  currentFont,
  onSelectFont,
}) => {
  return (
    <section className="space-y-2">
      <label className="text-xs font-semibold uppercase tracking-wider text-muted">Typeface</label>
      <div role="radiogroup" aria-label="Font family" className="grid grid-cols-2 gap-2">
        {FONT_OPTIONS.map((f) => {
          const isSelected = currentFont === f.id
          return (
            <button
              key={f.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onSelectFont(f.id)}
              style={f.style}
              className={`py-2 px-3 text-sm rounded-xl border transition-colors cursor-pointer text-center focus-visible:ring-2 focus-visible:ring-system ${
                isSelected
                  ? 'bg-page border-system text-ink font-bold shadow-xs'
                  : 'bg-raised/40 hover:bg-raised border-line text-muted hover:text-ink'
              }`}
            >
              {f.label}
            </button>
          )
        })}
      </div>
    </section>
  )
}
