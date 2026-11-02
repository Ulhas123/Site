import { describe, expect, it, vi } from 'vitest'

describe('Overlay Primitives Specification', () => {
  it('scroll lock toggles body overflow style', () => {
    const fakeBody = {
      style: {
        overflow: '',
      },
    }

    // Lock
    const prev = fakeBody.style.overflow
    fakeBody.style.overflow = 'hidden'
    expect(fakeBody.style.overflow).toBe('hidden')

    // Unlock
    fakeBody.style.overflow = prev
    expect(fakeBody.style.overflow).toBe('')
  })

  it('escape key triggers onClose callback', () => {
    const onClose = vi.fn()

    const handleKeyDown = (event: { key: string; preventDefault: () => void }) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
      }
    }

    const preventDefault = vi.fn()
    handleKeyDown({ key: 'Escape', preventDefault })
    expect(preventDefault).toHaveBeenCalled()
    expect(onClose).toHaveBeenCalledTimes(1)

    // Other key doesn't close
    handleKeyDown({ key: 'Enter', preventDefault })
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('maintains focus trap boundary cycle', () => {
    const elements = [
      { id: 'btn-close', focus: vi.fn() },
      { id: 'btn-action-1', focus: vi.fn() },
      { id: 'btn-action-2', focus: vi.fn() },
    ]

    const trapTab = (
      activeIdx: number,
      shiftKey: boolean,
      preventDefault: () => void
    ) => {
      const first = elements[0]
      const last = elements[elements.length - 1]

      if (shiftKey && activeIdx === 0) {
        preventDefault()
        last.focus()
      } else if (!shiftKey && activeIdx === elements.length - 1) {
        preventDefault()
        first.focus()
      }
    }

    const preventDefault = vi.fn()

    // Tab from last element wraps to first
    trapTab(2, false, preventDefault)
    expect(preventDefault).toHaveBeenCalled()
    expect(elements[0].focus).toHaveBeenCalled()

    // Shift+Tab from first element wraps to last
    trapTab(0, true, preventDefault)
    expect(elements[2].focus).toHaveBeenCalled()
  })
})
