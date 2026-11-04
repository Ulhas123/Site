import { useEffect } from 'react'
import {
  type ReaderFontFamily,
  type ReaderPrefsValues,
  usePrefs,
} from '../store/usePrefs'

export const FONT_FAMILY_MAP: Record<ReaderFontFamily, string> = {
  lora: "'Lora Variable', 'Noto Serif Devanagari', 'Nirmala UI', serif",
  inter: "'Inter Variable', 'Noto Sans Devanagari', 'Nirmala UI', sans-serif",
  merriweather: "'Merriweather Variable', 'Noto Serif Devanagari', 'Nirmala UI', serif",
  mono: "'JetBrains Mono Variable', monospace",
}

export function applyPrefs(
  prefs: Pick<
    ReaderPrefsValues,
    'theme' | 'fontFamily' | 'fontSize' | 'lineHeight' | 'paragraphGap' | 'maxWidth'
  >,
  target?: HTMLElement
): void {
  const el = target ?? (typeof document !== 'undefined' ? document.documentElement : null)
  if (!el) return

  // Theme attribute
  el.setAttribute('data-theme', prefs.theme)

  // Reader CSS variables
  const fontValue = FONT_FAMILY_MAP[prefs.fontFamily] ?? FONT_FAMILY_MAP.lora
  el.style.setProperty('--reader-font', fontValue)
  el.style.setProperty('--reader-size', `${prefs.fontSize}px`)
  el.style.setProperty('--reader-leading', `${prefs.lineHeight}`)
  el.style.setProperty('--reader-gap', `${prefs.paragraphGap}px`)
  el.style.setProperty(
    '--reader-width',
    prefs.maxWidth === 'full' ? '100%' : `${prefs.maxWidth}px`
  )
}

export function useApplyPrefs(): void {
  const theme = usePrefs((s) => s.theme)
  const fontFamily = usePrefs((s) => s.fontFamily)
  const fontSize = usePrefs((s) => s.fontSize)
  const lineHeight = usePrefs((s) => s.lineHeight)
  const paragraphGap = usePrefs((s) => s.paragraphGap)
  const maxWidth = usePrefs((s) => s.maxWidth)

  useEffect(() => {
    applyPrefs({
      theme,
      fontFamily,
      fontSize,
      lineHeight,
      paragraphGap,
      maxWidth,
    })
  }, [theme, fontFamily, fontSize, lineHeight, paragraphGap, maxWidth])
}
