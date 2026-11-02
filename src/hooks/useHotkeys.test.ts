import { describe, expect, it, vi } from 'vitest'
import { isEditableElement, normalizeKey } from './useHotkeys'

function createMockElement(options: {
  tagName?: string
  isContentEditable?: boolean
  attributes?: Record<string, string>
}): HTMLElement {
  const {
    tagName = 'DIV',
    isContentEditable = false,
    attributes = {},
  } = options

  return {
    tagName,
    isContentEditable,
    getAttribute(name: string) {
      return attributes[name] ?? null
    },
  } as unknown as HTMLElement
}

describe('useHotkeys Input & Modifier Filtering', () => {
  it('identifies editable targets accurately', () => {
    const inputEl = createMockElement({ tagName: 'INPUT' })
    const textareaEl = createMockElement({ tagName: 'TEXTAREA' })
    const selectEl = createMockElement({ tagName: 'SELECT' })
    const contentEditableEl = createMockElement({
      tagName: 'DIV',
      isContentEditable: true,
    })
    const attrEditableEl = createMockElement({
      tagName: 'DIV',
      attributes: { contenteditable: 'true' },
    })
    const plainEl = createMockElement({ tagName: 'DIV' })
    const paragraphEl = createMockElement({ tagName: 'P' })

    expect(isEditableElement(inputEl)).toBe(true)
    expect(isEditableElement(textareaEl)).toBe(true)
    expect(isEditableElement(selectEl)).toBe(true)
    expect(isEditableElement(contentEditableEl)).toBe(true)
    expect(isEditableElement(attrEditableEl)).toBe(true)
    expect(isEditableElement(plainEl)).toBe(false)
    expect(isEditableElement(paragraphEl)).toBe(false)
    expect(isEditableElement(null)).toBe(false)
  })

  it('normalizes hotkey bindings', () => {
    expect(normalizeKey('T')).toBe('t')
    expect(normalizeKey(' ')).toBe(' ')
    expect(normalizeKey('Space')).toBe(' ')
    expect(normalizeKey('Escape')).toBe('escape')
  })

  it('hotkeys are ignored inside inputs and when modifiers are held', () => {
    const onHotkey = vi.fn()
    const handlers: Record<string, (e: KeyboardEvent) => void> = {
      t: onHotkey,
      escape: onHotkey,
      ' ': onHotkey,
    }

    const dispatch = (event: Partial<KeyboardEvent>) => {
      const e = {
        key: 't',
        code: 'KeyT',
        ctrlKey: false,
        metaKey: false,
        altKey: false,
        target: createMockElement({ tagName: 'DIV' }),
        ...event,
      } as unknown as KeyboardEvent

      if (e.ctrlKey || e.metaKey || e.altKey) return
      if (isEditableElement(e.target)) return

      const keyLower = normalizeKey(e.key)
      if (handlers[keyLower]) {
        handlers[keyLower](e)
      }
    }

    // 1. Normal div target: triggers
    dispatch({ key: 't', target: createMockElement({ tagName: 'DIV' }) })
    expect(onHotkey).toHaveBeenCalledTimes(1)

    // 2. Input target: ignored
    dispatch({ key: 't', target: createMockElement({ tagName: 'INPUT' }) })
    expect(onHotkey).toHaveBeenCalledTimes(1)

    // 3. Textarea target: ignored
    dispatch({ key: 't', target: createMockElement({ tagName: 'TEXTAREA' }) })
    expect(onHotkey).toHaveBeenCalledTimes(1)

    // 4. Select target: ignored
    dispatch({ key: 't', target: createMockElement({ tagName: 'SELECT' }) })
    expect(onHotkey).toHaveBeenCalledTimes(1)

    // 5. ContentEditable target: ignored
    dispatch({
      key: 't',
      target: createMockElement({ tagName: 'DIV', isContentEditable: true }),
    })
    expect(onHotkey).toHaveBeenCalledTimes(1)

    // 6. Ctrl key held: ignored
    dispatch({
      key: 't',
      ctrlKey: true,
      target: createMockElement({ tagName: 'DIV' }),
    })
    expect(onHotkey).toHaveBeenCalledTimes(1)

    // 7. Meta/Cmd key held: ignored
    dispatch({
      key: 't',
      metaKey: true,
      target: createMockElement({ tagName: 'DIV' }),
    })
    expect(onHotkey).toHaveBeenCalledTimes(1)

    // 8. Alt key held: ignored
    dispatch({
      key: 't',
      altKey: true,
      target: createMockElement({ tagName: 'DIV' }),
    })
    expect(onHotkey).toHaveBeenCalledTimes(1)
  })
})
