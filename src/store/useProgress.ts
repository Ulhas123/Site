import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { getSafeStorage } from './storage'

export interface NovelProgress {
  chapterId: string
  blockId?: string
  offsetRatio?: number
  percent: number
  updatedAt: number
}

export interface Bookmark {
  id: string
  novelId: string
  chapterId: string
  blockId?: string
  offsetRatio?: number
  snippet?: string
  createdAt: number
}

export interface ProgressState {
  progressByNovel: Record<string, NovelProgress>
  bookmarks: Bookmark[]
  readChapterIds: string[]
  saveProgress: (
    novelId: string,
    progress: Omit<NovelProgress, 'updatedAt'> & { updatedAt?: number }
  ) => void
  getProgress: (novelId: string) => NovelProgress | undefined
  addBookmark: (
    bookmark: Omit<Bookmark, 'id' | 'createdAt'> & { id?: string; createdAt?: number }
  ) => string
  removeBookmark: (bookmarkId: string) => void
  markChapterRead: (chapterId: string) => void
  isChapterRead: (chapterId: string) => boolean
  clearAllProgress: () => void
}

export const PROGRESS_STORAGE_KEY = 'wn-progress'

export const useProgress = create<ProgressState>()(
  persist(
    (set, get) => ({
      progressByNovel: {},
      bookmarks: [],
      readChapterIds: [],

      saveProgress: (novelId, progress) => {
        const updatedAt = progress.updatedAt ?? Date.now()
        set((state) => ({
          progressByNovel: {
            ...state.progressByNovel,
            [novelId]: {
              ...progress,
              updatedAt,
            },
          },
        }))
      },

      getProgress: (novelId) => get().progressByNovel[novelId],

      addBookmark: (bookmark) => {
        const id =
          bookmark.id ??
          `bm_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
        const createdAt = bookmark.createdAt ?? Date.now()
        const newBookmark: Bookmark = {
          ...bookmark,
          id,
          createdAt,
        }
        set((state) => ({
          bookmarks: [newBookmark, ...state.bookmarks.filter((b) => b.id !== id)],
        }))
        return id
      },

      removeBookmark: (bookmarkId) => {
        set((state) => ({
          bookmarks: state.bookmarks.filter((b) => b.id !== bookmarkId),
        }))
      },

      markChapterRead: (chapterId) => {
        set((state) => {
          if (state.readChapterIds.includes(chapterId)) return state
          return {
            readChapterIds: [...state.readChapterIds, chapterId],
          }
        })
      },

      isChapterRead: (chapterId) => get().readChapterIds.includes(chapterId),

      clearAllProgress: () => {
        set({
          progressByNovel: {},
          bookmarks: [],
          readChapterIds: [],
        })
      },
    }),
    {
      name: PROGRESS_STORAGE_KEY,
      storage: createJSONStorage(getSafeStorage),
    }
  )
)
