import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { ThemeName } from '../theme/tokens'
import { getSafeStorage } from './storage'

export type ReaderFontFamily = 'lora' | 'inter' | 'merriweather' | 'mono'
export type ReaderMaxWidth = 680 | 800 | 960 | 'full'
export type ReadingMode = 'scroll' | 'paginated'

export interface ReaderPrefsValues {
  theme: ThemeName
  fontFamily: ReaderFontFamily
  fontSize: number
  lineHeight: number
  paragraphGap: number
  maxWidth: ReaderMaxWidth
  readingMode: ReadingMode
  autoHideChrome: boolean
}

export interface ReaderPrefsActions {
  setTheme: (theme: ThemeName) => void
  setFontFamily: (fontFamily: ReaderFontFamily) => void
  setFontSize: (fontSize: number) => void
  setLineHeight: (lineHeight: number) => void
  setParagraphGap: (paragraphGap: number) => void
  setMaxWidth: (maxWidth: ReaderMaxWidth) => void
  setReadingMode: (readingMode: ReadingMode) => void
  setAutoHideChrome: (autoHideChrome: boolean) => void
  setPrefs: (partial: Partial<ReaderPrefsValues>) => void
  reset: () => void
}

export type ReaderPrefsState = ReaderPrefsValues & ReaderPrefsActions

export const DEFAULT_PREFS: ReaderPrefsValues = {
  theme: 'dark',
  fontFamily: 'lora',
  fontSize: 18,
  lineHeight: 1.8,
  paragraphGap: 24,
  maxWidth: 800,
  readingMode: 'scroll',
  autoHideChrome: false,
}

export function clampFontSize(val: number): number {
  const rounded = Math.round(val / 2) * 2
  return Math.min(28, Math.max(14, rounded))
}

export function clampLineHeight(val: number): number {
  const clamped = Math.min(2.2, Math.max(1.6, val))
  return Math.round(clamped * 10) / 10
}

export function clampParagraphGap(val: number): number {
  return Math.min(32, Math.max(16, Math.round(val)))
}

export function migratePrefs(persisted: unknown, version: number): ReaderPrefsState {
  const base = { ...DEFAULT_PREFS }
  if (!persisted || typeof persisted !== 'object') {
    return base as unknown as ReaderPrefsState
  }

  const p = persisted as Record<string, unknown>

  // Version 0 (or unversioned) migration: legacy font name aliases or unconstrained numeric ranges
  const migratedTheme: ThemeName =
    p.theme === 'dark' || p.theme === 'sepia' || p.theme === 'midnight' || p.theme === 'light'
      ? p.theme
      : base.theme

  let migratedFont: ReaderFontFamily = base.fontFamily
  if (version < 1) {
    if (p.fontFamily === 'serif' || p.fontFamily === 'lora') migratedFont = 'lora'
    else if (p.fontFamily === 'sans' || p.fontFamily === 'inter') migratedFont = 'inter'
    else if (p.fontFamily === 'merriweather') migratedFont = 'merriweather'
    else if (p.fontFamily === 'mono') migratedFont = 'mono'
  } else if (
    p.fontFamily === 'lora' ||
    p.fontFamily === 'inter' ||
    p.fontFamily === 'merriweather' ||
    p.fontFamily === 'mono'
  ) {
    migratedFont = p.fontFamily
  }

  const migratedFontSize =
    typeof p.fontSize === 'number' ? clampFontSize(p.fontSize) : base.fontSize
  const migratedLineHeight =
    typeof p.lineHeight === 'number' ? clampLineHeight(p.lineHeight) : base.lineHeight
  const migratedParagraphGap =
    typeof p.paragraphGap === 'number' ? clampParagraphGap(p.paragraphGap) : base.paragraphGap

  const migratedMaxWidth: ReaderMaxWidth =
    p.maxWidth === 680 || p.maxWidth === 800 || p.maxWidth === 960 || p.maxWidth === 'full'
      ? p.maxWidth
      : base.maxWidth

  const migratedReadingMode: ReadingMode =
    p.readingMode === 'paginated' || p.readingMode === 'scroll'
      ? p.readingMode
      : base.readingMode

  const migratedAutoHide = typeof p.autoHideChrome === 'boolean' ? p.autoHideChrome : base.autoHideChrome

  return {
    ...base,
    theme: migratedTheme,
    fontFamily: migratedFont,
    fontSize: migratedFontSize,
    lineHeight: migratedLineHeight,
    paragraphGap: migratedParagraphGap,
    maxWidth: migratedMaxWidth,
    readingMode: migratedReadingMode,
    autoHideChrome: migratedAutoHide,
  } as unknown as ReaderPrefsState
}

export const PREFS_STORAGE_KEY = 'wn-prefs'
export const PREFS_STORAGE_VERSION = 1

export const usePrefs = create<ReaderPrefsState>()(
  persist(
    (set) => ({
      ...DEFAULT_PREFS,
      setTheme: (theme) => set({ theme }),
      setFontFamily: (fontFamily) => set({ fontFamily }),
      setFontSize: (fontSize) => set({ fontSize: clampFontSize(fontSize) }),
      setLineHeight: (lineHeight) => set({ lineHeight: clampLineHeight(lineHeight) }),
      setParagraphGap: (paragraphGap) => set({ paragraphGap: clampParagraphGap(paragraphGap) }),
      setMaxWidth: (maxWidth) => set({ maxWidth }),
      setReadingMode: (readingMode) => set({ readingMode }),
      setAutoHideChrome: (autoHideChrome) => set({ autoHideChrome }),
      setPrefs: (partial) =>
        set((state) => ({
          ...state,
          ...partial,
          ...(partial.fontSize !== undefined ? { fontSize: clampFontSize(partial.fontSize) } : {}),
          ...(partial.lineHeight !== undefined
            ? { lineHeight: clampLineHeight(partial.lineHeight) }
            : {}),
          ...(partial.paragraphGap !== undefined
            ? { paragraphGap: clampParagraphGap(partial.paragraphGap) }
            : {}),
        })),
      reset: () => set({ ...DEFAULT_PREFS }),
    }),
    {
      name: PREFS_STORAGE_KEY,
      version: PREFS_STORAGE_VERSION,
      storage: createJSONStorage(getSafeStorage),
      migrate: (persistedState, version) => migratePrefs(persistedState, version),
    }
  )
)
