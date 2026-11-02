import tokensCss from './tokens.css?raw'

export type ThemeName = 'dark' | 'sepia' | 'midnight' | 'light'

export interface ThemePalette {
  outer: string
  page: string
  raised: string
  line: string
  ink: string
  muted: string
  accent: string
  accentInk: string
  accentText: string
  system: string
}

export function parseThemeTokens(css: string): Record<ThemeName, ThemePalette> {
  const themeNames: ThemeName[] = ['dark', 'sepia', 'midnight', 'light']
  const result: Record<ThemeName, ThemePalette> = {
    dark: {} as ThemePalette,
    sepia: {} as ThemePalette,
    midnight: {} as ThemePalette,
    light: {} as ThemePalette,
  }

  for (const name of themeNames) {
    const pattern = `\\[data-theme=["']${name}["']\\]\\s*\\{([\\s\\S]*?)\\}`
    const regex = new RegExp(pattern)
    const match = css.match(regex)
    if (!match) continue

    const block = match[1]
    const props: Record<string, string> = {}
    const lines = block.split('\n')
    for (const line of lines) {
      const trimmed = line.trim()
      if (trimmed.startsWith('--')) {
        const colonIdx = trimmed.indexOf(':')
        const semiIdx = trimmed.lastIndexOf(';')
        if (colonIdx > 2) {
          const key = trimmed.slice(2, colonIdx).trim()
          const end = semiIdx > colonIdx ? semiIdx : undefined
          const val = trimmed.slice(colonIdx + 1, end).trim()
          props[key] = val
        }
      }
    }

    result[name] = {
      outer: props['outer'] ?? '#000000',
      page: props['page'] ?? '#000000',
      raised: props['raised'] ?? '#000000',
      line: props['line'] ?? '#333333',
      ink: props['ink'] ?? '#ffffff',
      muted: props['muted'] ?? '#888888',
      accent: props['accent'] ?? '#FF6B00',
      accentInk: props['accent-ink'] ?? props['accent-text'] ?? '#FF6B00',
      accentText: props['accent-text'] ?? props['accent-ink'] ?? '#FF6B00',
      system: props['system'] ?? '#3B66F5',
    }
  }

  return result
}

export const THEME_NAMES: ThemeName[] = ['dark', 'sepia', 'midnight', 'light']
export const THEMES = parseThemeTokens(tokensCss)
