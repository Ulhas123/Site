import { type ReactNode, useId, useRef } from 'react'
import { X } from 'lucide-react'
import { useOverlay } from './useOverlay'

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  description?: string
  children: ReactNode
  footer?: ReactNode
  ariaLabel?: string
  maxWidthClass?: string
  className?: string
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  ariaLabel,
  maxWidthClass = 'max-w-lg',
  className = '',
}: ModalProps) {
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
      className="fixed inset-0 z-50 overflow-y-auto"
    >
      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className="fixed inset-0 bg-outer/75 backdrop-blur-xs transition-opacity duration-200 motion-reduce:transition-none cursor-pointer"
      />

      {/* Centered Modal Container */}
      <div className="fixed inset-0 pointer-events-none flex items-center justify-center p-4 sm:p-6">
        <div
          ref={containerRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-label={!titleId ? ariaLabel ?? 'Modal dialog' : undefined}
          aria-describedby={descriptionId}
          tabIndex={-1}
          className={`pointer-events-auto flex flex-col w-full bg-page text-ink border border-line rounded-2xl shadow-2xl overflow-hidden transition-all duration-200 ease-out motion-reduce:transition-none outline-none ${maxWidthClass} ${className}`}
        >
          {/* Header */}
          {(title || description) && (
            <div className="flex items-start justify-between px-6 py-5 border-b border-line gap-4 shrink-0">
              <div className="space-y-1 min-w-0">
                {title && (
                  <h2
                    id={titleId}
                    className="text-lg sm:text-xl font-bold tracking-tight text-ink truncate"
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
                aria-label="Close dialog"
                className="p-1.5 rounded-lg text-muted hover:text-ink hover:bg-raised transition-colors focus-visible:ring-2 focus-visible:ring-system focus-visible:outline-none cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>
          )}

          {/* Body */}
          <div className="px-6 py-5 overflow-y-auto max-h-[70vh]">
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className="px-6 py-4 border-t border-line bg-raised/40 flex items-center justify-end gap-3 shrink-0">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
