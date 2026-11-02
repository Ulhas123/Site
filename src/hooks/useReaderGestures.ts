/**
 * ============================================================================
 * Reader Interaction Model & Single Tap / Gesture Architecture
 * ============================================================================
 *
 * This hook implements the central canvas interaction model for the webnovel reader:
 *
 * 1. Text Selection Safeguard:
 *    - If `window.getSelection()` is non-empty (e.g. reader is highlighting words,
 *      selecting paragraphs for translation, copying, or dictionary lookup),
 *      the gesture handler immediately bails out. No UI chrome is toggled.
 *
 * 2. Interactive Element Pass-Through:
 *    - Any click or tap originating within or targeting an element with
 *      `[data-interactive]` (e.g. comment counters, '+' badges, bookmark flags,
 *      action chips, buttons, links) is allowed to pass through unimpeded to its
 *      respective element handler.
 *
 * 3. Viewport Tap Distribution:
 *    - The viewport width is divided into three zones:
 *      * Left 30% (x-ratio: 0.00 -> 0.30): In 'scroll' mode, does nothing.
 *        In 'paginated' mode, turns to previous page.
 *      * Center 40% (x-ratio: 0.30 -> 0.70): Toggles reader chrome (top navbar & bottom toolbar).
 *      * Right 30% (x-ratio: 0.70 -> 1.00): In 'scroll' mode, does nothing.
 *        In 'paginated' mode, turns to next page.
 *
 * 4. Comment Trigger Exclusivity:
 *    - Paragraph bodies never trigger or open the comments drawer.
 *    - Only designated triggers marked as interactive (specifically the comment
 *      badge icon or inline `+` button) trigger the comments panel.
 * ============================================================================
 */

import { useCallback, useRef } from 'react'
import { usePrefs, type ReadingMode } from '../store/usePrefs'
import { useUI } from '../store/useUI'

export type GestureAction =
  | 'ignored'
  | 'passThrough'
  | 'toggleChrome'
  | 'prevPage'
  | 'nextPage'

export interface ReaderGestureOptions {
  readingMode?: ReadingMode
  onToggleChrome?: () => void
  onPrevPage?: () => void
  onNextPage?: () => void
}

export function evaluateReaderGesture(
  event: { clientX: number; target: EventTarget | null },
  options: ReaderGestureOptions = {}
): GestureAction {
  // 1. If text is currently selected, do nothing
  if (typeof window !== 'undefined') {
    const selection = window.getSelection()
    if (selection && selection.toString().trim().length > 0) {
      return 'ignored'
    }
  }

  // 2. Clicks inside [data-interactive] pass through
  const target = event.target as HTMLElement | null
  if (target && target.closest('[data-interactive]')) {
    return 'passThrough'
  }

  // 3. Viewport zone calculation
  const viewportWidth =
    typeof window !== 'undefined' && window.innerWidth > 0 ? window.innerWidth : 1000
  const xRatio = event.clientX / viewportWidth

  // Center 40%: 0.30 to 0.70
  if (xRatio >= 0.3 && xRatio <= 0.7) {
    return 'toggleChrome'
  }

  const mode = options.readingMode ?? usePrefs.getState().readingMode

  // In scroll mode, left and right 30% do nothing
  if (mode === 'scroll') {
    return 'ignored'
  }

  // In paginated mode, left 30% is prev, right 30% is next
  if (xRatio < 0.3) {
    return 'prevPage'
  }

  return 'nextPage'
}

export function useReaderGestures(options: ReaderGestureOptions = {}) {
  const canvasRef = useRef<HTMLDivElement | null>(null)

  const handleCanvasClick = useCallback(
    (event: React.MouseEvent | MouseEvent) => {
      const action = evaluateReaderGesture(event, options)

      switch (action) {
        case 'toggleChrome':
          if (options.onToggleChrome) {
            options.onToggleChrome()
          } else {
            useUI.getState().toggleChrome()
          }
          break
        case 'prevPage':
          options.onPrevPage?.()
          break
        case 'nextPage':
          options.onNextPage?.()
          break
        case 'passThrough':
        case 'ignored':
        default:
          break
      }
    },
    [options]
  )

  return {
    canvasRef,
    handleCanvasClick,
  }
}
