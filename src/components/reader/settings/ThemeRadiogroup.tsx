import React from 'react'
import { THEME_NAMES, type ThemeName } from '../../../theme/tokens'

const THEME_LABELS: Record<ThemeName, { label: string; bg: string; text: string; border: string }> = {
  dark: { label: 'Dark', bg: '#121316', text: '#E6EDF3', border: '#2A2E35' },
  sepia: { label: 'Sepia', bg: '#F4ECD8', text: '#2C2218', border: '#D8CCA8' },
  midnight: { label: 'Midnight', bg: '#080A10', text: '#D1E0F5', border: '#1C263B' },
  light: { label: 'Light', bg: '#FFFFFF', text: '#1A1D20', border: '#E2E8F0' },
}

export interface ThemeRadiogroupProps {
  currentTheme: ThemeName
  onSelectTheme: (theme: ThemeName) => void
}

export const ThemeRadiogroup: React.FC<ThemeRadiogroupProps> = ({
  currentTheme,
  onSelectTheme,
}) => {
  return (
    <section className="space-y-2">
      <label className="text-xs font-semibold uppercase tracking-wider text-muted">Theme</label>
      <div role="radiogroup" aria-label="Theme" className="grid grid-cols-4 gap-2">
        {THEME_NAMES.map((t) => {
          const info = THEME_LABELS[t]
          const isSelected = currentTheme === t
          return (
            <button
              key={t}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onSelectTheme(t)}
              className={`p-2 rounded-xl flex flex-col items-center gap-1.5 transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-system ${
                isSelected ? 'ring-2 ring-system shadow-md scale-102' : 'hover:opacity-90 opacity-80'
              }`}
              style={{ backgroundColor: info.bg, color: info.text, border: `1px solid ${info.border}` }}
            >
              <span className="text-xs font-bold leading-none">{info.label}</span>
              <span className="text-[10px] opacity-75 font-serif leading-none">Aa</span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
