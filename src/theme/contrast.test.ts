import { describe, expect, it } from 'vitest'
import { evaluateContrast, getContrastRatio, getLuminance, hexToRgb } from './contrast'
import { THEMES } from './tokens'

describe('Contrast utilities', () => {
  it('converts hex to RGB accurately', () => {
    expect(hexToRgb('#ffffff')).toEqual([255, 255, 255])
    expect(hexToRgb('#000000')).toEqual([0, 0, 0])
    expect(hexToRgb('#fff')).toEqual([255, 255, 255])
    expect(hexToRgb('#1A1A1D')).toEqual([26, 26, 29])
  })

  it('calculates relative luminance', () => {
    expect(getLuminance('#ffffff')).toBeCloseTo(1, 2)
    expect(getLuminance('#000000')).toBeCloseTo(0, 2)
  })

  it('calculates contrast ratio', () => {
    expect(getContrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 0)
    expect(getContrastRatio('#ffffff', '#ffffff')).toBeCloseTo(1, 1)
  })

  it('evaluates WCAG compliance flags correctly', () => {
    const passing = evaluateContrast('Test Pass', 'ink', '#000000', 'page', '#ffffff')
    expect(passing.passesAA).toBe(true)
    expect(passing.ratio).toBeGreaterThanOrEqual(4.5)

    const failing = evaluateContrast('Test Fail', 'muted', '#888888', 'page', '#777777')
    expect(failing.passesAA).toBe(false)
    expect(failing.level).toBe('FAIL')
  })
})

describe('Theme token parser', () => {
  it('parses all four themes from tokens.css', () => {
    expect(THEMES.dark.page).toBe('#1A1A1D')
    expect(THEMES.dark.outer).toBe('#121214')
    expect(THEMES.sepia.page).toBe('#F4ECD8')
    expect(THEMES.midnight.page).toBe('#09090B')
    expect(THEMES.light.page).toBe('#FFFFFF')
  })

  it('ensures accent-text meets 4.5:1 on light and sepia', () => {
    const lightAccentContrast = getContrastRatio(THEMES.light.accentText, THEMES.light.page)
    expect(lightAccentContrast).toBeGreaterThanOrEqual(4.5)

    const sepiaAccentContrast = getContrastRatio(THEMES.sepia.accentText, THEMES.sepia.page)
    expect(sepiaAccentContrast).toBeGreaterThanOrEqual(4.5)

    const darkAccentContrast = getContrastRatio(THEMES.dark.accentText, THEMES.dark.page)
    expect(darkAccentContrast).toBeGreaterThanOrEqual(4.5)

    const midnightAccentContrast = getContrastRatio(THEMES.midnight.accentText, THEMES.midnight.page)
    expect(midnightAccentContrast).toBeGreaterThanOrEqual(4.5)
  })
})
