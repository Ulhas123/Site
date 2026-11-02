import { useEffect, useState } from 'react'
import { Layers } from 'lucide-react'
import { useApplyPrefs, useHotkeys } from '../../hooks'
import { type ActivePanel, useUI } from '../../store'
import { Drawer, Modal } from '../ui'
import { GestureCanvasDemo } from './GestureCanvasDemo'
import { OverlayCards } from './OverlayCards'

export function OverlayShowcase() {
  useApplyPrefs()

  const { activePanel, openPanel, closePanel } = useUI()
  const [isModalOpen, setIsModalOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return new URLSearchParams(window.location.search).get('modal') === 'true'
    }
    return false
  })
  const [lastHotkey, setLastHotkey] = useState<string>('None')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const p = params.get('panel') as ActivePanel
      if (p) openPanel(p)
    }
  }, [openPanel])

  useHotkeys({
    t: () => {
      setLastHotkey('T (Opened TOC Drawer)')
      openPanel('toc')
    },
    s: () => {
      setLastHotkey('S (Opened Settings Drawer)')
      openPanel('settings')
    },
    c: () => {
      setLastHotkey('C (Opened Comments Drawer)')
      openPanel('comments')
    },
    m: () => {
      setLastHotkey('M (Opened Wallet Modal)')
      setIsModalOpen(true)
    },
  })

  return (
    <section aria-labelledby="interactive-architecture-heading" className="space-y-6">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-accent" aria-hidden="true" />
          <h2 id="interactive-architecture-heading" className="text-xl font-bold tracking-tight text-ink">
            State, Overlays & Gesture Architecture
          </h2>
        </div>
        <p className="text-sm text-muted">
          Interactive primitives testbed: Zustand stores, responsive Drawer/Modal overlays, hotkeys filter, and 3-zone gesture model.
        </p>
      </div>

      {/* Cards for stores & hotkeys */}
      <OverlayCards
        lastHotkey={lastHotkey}
        onOpenModal={() => setIsModalOpen(true)}
      />

      {/* Reader Canvas Zone Demo */}
      <GestureCanvasDemo />

      {/* Drawer Overlay Primitive Demo */}
      <Drawer
        isOpen={activePanel !== null}
        onClose={closePanel}
        title={
          activePanel === 'toc'
            ? 'Table of Contents'
            : activePanel === 'settings'
            ? 'Reader Settings'
            : activePanel === 'comments'
            ? 'Chapter Comments'
            : 'Audio Narration'
        }
        description="Responsive Drawer: Bottom-sheet on <640px, right-panel on >=640px."
        footer={
          <div className="flex justify-end">
            <button
              type="button"
              onClick={closePanel}
              className="px-4 py-2 rounded-lg bg-raised text-ink text-xs font-semibold hover:bg-page border border-line cursor-pointer"
            >
              Close
            </button>
          </div>
        }
      >
        <div className="space-y-4 text-xs text-ink">
          <p className="text-muted">
            Focus is trapped inside this drawer. Press <kbd className="px-1 py-0.5 rounded border border-line bg-raised font-mono">Esc</kbd> or click backdrop to close.
          </p>
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((ch) => (
              <div key={ch} className="p-3 rounded-lg border border-line bg-raised flex items-center justify-between">
                <span>Chapter {ch}: The Path of the Wanderer</span>
                <button
                  type="button"
                  data-interactive="read-btn"
                  className="px-2 py-1 rounded border border-line bg-page text-xs text-ink hover:border-system cursor-pointer"
                >
                  Read
                </button>
              </div>
            ))}
          </div>
        </div>
      </Drawer>

      {/* Modal Overlay Primitive Demo */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Personal Reader Shortcuts & Tips"
        description="Centered Modal primitive with focus trap, Esc, and scroll lock."
        footer={
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-lg bg-system text-white text-xs font-bold hover:bg-system/90 cursor-pointer shadow-xs"
            >
              Got It
            </button>
          </div>
        }
      >
        <div className="space-y-3 text-xs text-ink">
          <p className="text-muted">Quick navigation and reading shortcuts:</p>
          <div className="p-4 rounded-xl border border-line bg-raised space-y-2">
            <div className="flex justify-between">
              <span className="text-muted">Center Tap (30-70% width):</span>
              <span className="font-mono font-bold text-system">Toggle Chrome</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Scroll Down (&gt;60px):</span>
              <span className="font-mono font-bold text-ink">Hide Header</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Scroll Up (&gt;8px):</span>
              <span className="font-mono font-bold text-ink">Show Header</span>
            </div>
          </div>
        </div>
      </Modal>
    </section>
  )
}
