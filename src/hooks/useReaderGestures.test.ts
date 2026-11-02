import { beforeEach, describe, expect, it } from 'vitest'
import { evaluateReaderGesture } from './useReaderGestures'
import { applyPrefs, FONT_FAMILY_MAP } from './useApplyPrefs'
import { usePrefs } from '../store/usePrefs'
import { useUI } from '../store/useUI'

function createMockElement(options: {
  tagName?: string
  attributes?: Record<string, string>
  parent?: unknown
}): HTMLElement {
  const { tagName = 'DIV', attributes = {}, parent = null } = options

  return {
    tagName,
    parentElement: parent,
    getAttribute(name: string) {
      return attributes[name] ?? null
    },
    closest(selector: string) {
      if (selector === '[data-interactive]' && attributes['data-interactive'] !== undefined) {
        return this
      }
      if (parent && typeof (parent as HTMLElement).closest === 'function') {
        return (parent as HTMLElement).closest(selector)
      }
      return null
    },
  } as unknown as HTMLElement
}

describe('Reader Gestures & Interaction Model', () => {
  beforeEach(() => {
    usePrefs.getState().reset()
    useUI.getState().setChromeVisible(true)
    Object.defineProperty(globalThis, 'window', {
      value: {
        innerWidth: 1000,
        getSelection: () => null,
      },
      writable: true,
      configurable: true,
    })
  })

  it('ignores clicks when text is selected', () => {
    globalThis.window.getSelection = () =>
      ({ toString: () => 'highlighted text' }) as unknown as Selection

    const action = evaluateReaderGesture({
      clientX: 500,
      target: createMockElement({ tagName: 'P' }),
    })
    expect(action).toBe('ignored')
  })

  it('allows clicks inside [data-interactive] to pass through', () => {
    globalThis.window.getSelection = () => ({ toString: () => '' }) as unknown as Selection

    const interactiveBadge = createMockElement({
      tagName: 'BUTTON',
      attributes: { 'data-interactive': 'comment-badge' },
    })

    const action = evaluateReaderGesture({
      clientX: 500,
      target: interactiveBadge,
    })
    expect(action).toBe('passThrough')
  })

  it('center 40% toggles chrome', () => {
    globalThis.window.getSelection = () => ({ toString: () => '' }) as unknown as Selection

    expect(evaluateReaderGesture({ clientX: 300, target: createMockElement({}) })).toBe('toggleChrome')
    expect(evaluateReaderGesture({ clientX: 500, target: createMockElement({}) })).toBe('toggleChrome')
    expect(evaluateReaderGesture({ clientX: 700, target: createMockElement({}) })).toBe('toggleChrome')
  })

  it('left/right 30% do nothing in scroll mode', () => {
    globalThis.window.getSelection = () => ({ toString: () => '' }) as unknown as Selection

    expect(
      evaluateReaderGesture({ clientX: 200, target: createMockElement({}) }, { readingMode: 'scroll' })
    ).toBe('ignored')
    expect(
      evaluateReaderGesture({ clientX: 850, target: createMockElement({}) }, { readingMode: 'scroll' })
    ).toBe('ignored')
  })

  it('left/right 30% navigate in paginated mode', () => {
    globalThis.window.getSelection = () => ({ toString: () => '' }) as unknown as Selection

    expect(
      evaluateReaderGesture({ clientX: 150, target: createMockElement({}) }, { readingMode: 'paginated' })
    ).toBe('prevPage')
    expect(
      evaluateReaderGesture({ clientX: 850, target: createMockElement({}) }, { readingMode: 'paginated' })
    ).toBe('nextPage')
  })

  it('paragraph body never triggers comments', () => {
    globalThis.window.getSelection = () => ({ toString: () => '' }) as unknown as Selection

    const paragraphEl = createMockElement({ tagName: 'P' })
    const action = evaluateReaderGesture({ clientX: 500, target: paragraphEl })
    expect(action).toBe('toggleChrome')
    expect(action).not.toBe('passThrough')
  })
})

describe('useApplyPrefs CSS & Theme variables', () => {
  it('writes data-theme and --reader-* styles to target element', () => {
    const styles: Record<string, string> = {}
    const attributes: Record<string, string> = {}

    const mockTarget = {
      setAttribute: (k: string, v: string) => {
        attributes[k] = v
      },
      style: {
        setProperty: (k: string, v: string) => {
          styles[k] = v
        },
      },
    } as unknown as HTMLElement

    applyPrefs(
      {
        theme: 'sepia',
        fontFamily: 'merriweather',
        fontSize: 22,
        lineHeight: 1.9,
        paragraphGap: 28,
        maxWidth: 680,
      },
      mockTarget
    )

    expect(attributes['data-theme']).toBe('sepia')
    expect(styles['--reader-font']).toBe(FONT_FAMILY_MAP.merriweather)
    expect(styles['--reader-size']).toBe('22px')
    expect(styles['--reader-leading']).toBe('1.9')
    expect(styles['--reader-gap']).toBe('28px')
    expect(styles['--reader-width']).toBe('680px')

    applyPrefs(
      {
        theme: 'midnight',
        fontFamily: 'mono',
        fontSize: 16,
        lineHeight: 1.6,
        paragraphGap: 16,
        maxWidth: 'full',
      },
      mockTarget
    )
    expect(attributes['data-theme']).toBe('midnight')
    expect(styles['--reader-width']).toBe('100%')
  })
})
