/**
 * WCAG 2.1 Contrast Calculation Utilities
 * Relative luminance and contrast ratio according to W3C specifications.
 */

export function hexToRgb(hex: string): [number, number, number] {
  let cleaned = hex.trim().replace(/^#/, '')
  if (cleaned.length === 3) {
    cleaned = cleaned
      .split('')
      .map((char) => char + char)
      .join('')
  }
  const num = parseInt(cleaned, 16)
  const r = (num >> 16) & 255
  const g = (num >> 8) & 255
  const b = num & 255
  return [r, g, b]
}

export function getLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((val) => {
    const sRGB = val / 255
    return sRGB <= 0.03928 ? sRGB / 12.92 : Math.pow((sRGB + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

export function getContrastRatio(foregroundHex: string, backgroundHex: string): number {
  const lum1 = getLuminance(foregroundHex)
  const lum2 = getLuminance(backgroundHex)
  const lighter = Math.max(lum1, lum2)
  const darker = Math.min(lum1, lum2)
  return (lighter + 0.05) / (darker + 0.05)
}

export interface ContrastResult {
  pairName: string
  fgName: string
  fgHex: string
  bgName: string
  bgHex: string
  ratio: number
  passesAA: boolean
  passesAALarge: boolean
  level: 'AAA' | 'AA' | 'AA Large' | 'FAIL'
}

export function evaluateContrast(
  pairName: string,
  fgName: string,
  fgHex: string,
  bgName: string,
  bgHex: string,
): ContrastResult {
  const ratio = Math.round(getContrastRatio(fgHex, bgHex) * 100) / 100
  const passesAA = ratio >= 4.5
  const passesAALarge = ratio >= 3.0
  let level: ContrastResult['level'] = 'FAIL'
  if (ratio >= 7.0) {
    level = 'AAA'
  } else if (passesAA) {
    level = 'AA'
  } else if (passesAALarge) {
    level = 'AA Large'
  }

  return {
    pairName,
    fgName,
    fgHex,
    bgName,
    bgHex,
    ratio,
    passesAA,
    passesAALarge,
    level,
  }
}
