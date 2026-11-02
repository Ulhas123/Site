import { create } from 'zustand'

export type ActivePanel = null | 'toc' | 'settings' | 'comments' | 'audio'

export interface UIState {
  activePanel: ActivePanel
  activeBlockId: string | null
  chromeVisible: boolean

  setActivePanel: (panel: ActivePanel) => void
  openPanel: (panel: Exclude<ActivePanel, null>) => void
  closePanel: () => void
  setActiveBlockId: (blockId: string | null) => void
  setChromeVisible: (visible: boolean) => void
  toggleChrome: () => void
}

export const useUI = create<UIState>()((set) => ({
  activePanel: null,
  activeBlockId: null,
  chromeVisible: true,

  setActivePanel: (panel) => set({ activePanel: panel }),
  openPanel: (panel) => set({ activePanel: panel }),
  closePanel: () => set({ activePanel: null }),
  setActiveBlockId: (blockId) => set({ activeBlockId: blockId }),
  setChromeVisible: (chromeVisible) => set({ chromeVisible }),
  toggleChrome: () => set((state) => ({ chromeVisible: !state.chromeVisible })),
}))
