import { type ReactNode, useId, useRef } from 'react'
import { X } from 'lucide-react'
import { useOverlay } from './useOverlay'

export interface DrawerProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  description?: string
  children: ReactNode
  footer?: ReactNode
  ariaLabel?: string
  className?: string
  widthClass?: string
}

export function Drawer({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  ariaLabel,
  className = '',
  widthClass = 'sm:max-w-md sm:w-full',
}: DrawerProps) {
  const generatedTitleId = useId()
  const generatedDescId = useId()
  const containerRef = useRef<HTMLDivElement | null>(null)
  const closeBtnRef = useRef<HTMLButtonElement | null>(null)

  const titleId = title ? generatedTitleId : undefined
  const descriptionId = description ? generatedDescId : undefined

  useOverlay({
    isOpen,
    onClose,
    containerRef,
    initialFocusRef: closeBtnRef,
    closeOnEsc: true,
    lockScroll: true,
  })

  if (!isOpen) return null

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-50 overflow-hidden"
    >
      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className="fixed inset-0 bg-outer/70 backdrop-blur-xs transition-opacity duration-200 motion-reduce:transition-none cursor-pointer"
      />

      {/* Sheet / Panel Container: Bottom-sheet on <640px, right panel on >=640px */}
      <div className="fixed inset-0 pointer-events-none flex flex-col justify-end sm:flex-row sm:justify-end">
        <div
          ref={containerRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-label={!titleId ? ariaLabel ?? 'Drawer dialog' : undefined}
          aria-describedby={descriptionId}
          tabIndex={-1}
          className={`pointer-events-auto flex flex-col w-full max-h-[88vh] sm:max-h-full sm:h-full bg-page text-ink border-t sm:border-t-0 sm:border-l border-line shadow-2xl rounded-t-2xl sm:rounded-none transition-transform duration-200 ease-out motion-reduce:transition-none outline-none ${widthClass} ${className}`}
        >
          {/* Mobile bottom-sheet drag handle */}
          <div className="sm:hidden pt-3 pb-1 flex justify-center">
            <div className="h-1.5 w-12 rounded-full bg-line" aria-hidden="true" />
          </div>

          {/* Header */}
          {(title || description) && (
            <div className="flex items-start justify-between px-5 py-4 border-b border-line gap-4 shrink-0">
              <div className="space-y-1 min-w-0">
                {title && (
                  <h2
                    id={titleId}
                    className="text-base sm:text-lg font-bold tracking-tight text-ink truncate"
                  >
                    {title}
                  </h2>
                )}
                {description && (
                  <p id={descriptionId} className="text-xs sm:text-sm text-muted">
                    {description}
                  </p>
                )}
              </div>

              <button
                ref={closeBtnRef}
                type="button"
                onClick={onClose}
                aria-label="Close drawer"
                className="p-1.5 rounded-lg text-muted hover:text-ink hover:bg-raised transition-colors focus-visible:ring-2 focus-visible:ring-system focus-visible:outline-none cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>
          )}

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto px-5 py-4 min-h-0">
            {children}
          </div>

          {/* Optional Footer */}
          {footer && (
            <div className="px-5 py-3 border-t border-line bg-raised/40 shrink-0">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
