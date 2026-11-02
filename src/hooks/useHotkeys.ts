import { useEffect } from 'react'

export type HotkeyCallback = (event: KeyboardEvent) => void
export type HotkeyMap = Record<string, HotkeyCallback>

export interface UseHotkeysOptions {
  enabled?: boolean
}

export function isEditableElement(target: EventTarget | null): boolean {
  if (!target) return false

  if (typeof HTMLElement !== 'undefined' && !(target instanceof HTMLElement)) {
    return false
  }

  const el = target as Partial<HTMLElement> & {
    tagName?: string
    isContentEditable?: boolean
    getAttribute?: (attr: string) => string | null
  }

  const tagName = typeof el.tagName === 'string' ? el.tagName.toUpperCase() : ''
  if (tagName === 'INPUT' || tagName === 'TEXTAREA' || tagName === 'SELECT') {
    return true
  }

  if (el.isContentEditable) {
    return true
  }

  if (typeof el.getAttribute === 'function') {
    const contentEditableAttr = el.getAttribute('contenteditable')
    if (
      contentEditableAttr !== null &&
      contentEditableAttr !== 'false' &&
      contentEditableAttr !== 'inherit'
    ) {
      return true
    }
  }

  return false
}

export function normalizeKey(key: string): string {
  if (key === ' ' || key.toLowerCase() === 'space') return ' '
  return key.toLowerCase()
}

export function useHotkeys(
  keyMap: HotkeyMap,
  options: UseHotkeysOptions = {}
): void {
  const { enabled = true } = options

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return

    const handleKeyDown = (event: KeyboardEvent) => {
      // 1. Ignore if modifier keys (Ctrl, Meta/Command, Alt) are held
      if (event.ctrlKey || event.metaKey || event.altKey) {
        return
      }

      // 2. Ignore if focused inside input, textarea, select, or contenteditable
      if (isEditableElement(event.target)) {
        return
      }

      // 3. Match hotkey
      const eventKeyLower = normalizeKey(event.key)
      const eventCodeLower = normalizeKey(event.code)

      for (const [binding, handler] of Object.entries(keyMap)) {
        const normalizedBinding = normalizeKey(binding)
        if (
          normalizedBinding === eventKeyLower ||
          normalizedBinding === eventCodeLower ||
          binding === event.key
        ) {
          handler(event)
          break
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [keyMap, enabled])
}
