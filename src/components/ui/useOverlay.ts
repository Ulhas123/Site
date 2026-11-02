import { useEffect, useRef } from 'react'

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ')

export interface UseOverlayOptions {
  isOpen: boolean
  onClose: () => void
  containerRef: React.RefObject<HTMLElement | null>
  initialFocusRef?: React.RefObject<HTMLElement | null>
  closeOnEsc?: boolean
  lockScroll?: boolean
}

export function useOverlay({
  isOpen,
  onClose,
  containerRef,
  initialFocusRef,
  closeOnEsc = true,
  lockScroll = true,
}: UseOverlayOptions): void {
  const previouslyFocusedElement = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!isOpen || typeof document === 'undefined') return

    // 1. Store currently focused element before opening
    previouslyFocusedElement.current = document.activeElement as HTMLElement | null

    // 2. Lock body scroll
    const originalOverflow = document.body.style.overflow
    if (lockScroll) {
      document.body.style.overflow = 'hidden'
    }

    // 3. Move initial focus inside overlay
    const timer = setTimeout(() => {
      if (initialFocusRef?.current) {
        initialFocusRef.current.focus()
      } else if (containerRef.current) {
        const firstFocusable =
          containerRef.current.querySelector<HTMLElement>(FOCUSABLE_SELECTOR)
        if (firstFocusable) {
          firstFocusable.focus()
        } else {
          containerRef.current.focus()
        }
      }
    }, 16)

    // 4. Trap focus & handle Esc
    const handleKeyDown = (event: KeyboardEvent) => {
      if (closeOnEsc && event.key === 'Escape') {
        event.preventDefault()
        event.stopPropagation()
        onClose()
        return
      }

      if (event.key === 'Tab' && containerRef.current) {
        const focusables = Array.from(
          containerRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
        ).filter((el) => el.offsetParent !== null || el === document.activeElement)

        if (focusables.length === 0) {
          event.preventDefault()
          return
        }

        const first = focusables[0]
        const last = focusables[focusables.length - 1]
        const active = document.activeElement

        if (event.shiftKey) {
          if (active === first || !containerRef.current.contains(active)) {
            event.preventDefault()
            last.focus()
          }
        } else {
          if (active === last || !containerRef.current.contains(active)) {
            event.preventDefault()
            first.focus()
          }
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    // Cleanup: restore scroll lock & restore prior focus
    return () => {
      clearTimeout(timer)
      document.removeEventListener('keydown', handleKeyDown)
      if (lockScroll) {
        document.body.style.overflow = originalOverflow
      }
      if (previouslyFocusedElement.current?.focus) {
        previouslyFocusedElement.current.focus()
      }
    }
  }, [isOpen, onClose, containerRef, initialFocusRef, closeOnEsc, lockScroll])
}
