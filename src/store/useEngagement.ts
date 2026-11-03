import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { ParagraphComment } from '../types/novel'
import { getSafeStorage } from './storage'

export interface EngagementState {
  addedComments: ParagraphComment[]
  likedIds: string[]
  reactions: Record<string, string | number>

  addComment: (comment: ParagraphComment) => void
  toggleLike: (id: string) => void
  isLiked: (id: string) => boolean
  setReaction: (targetId: string, reaction: string | number) => void
  setVote: (targetId: string, vote: string | number) => void
  getReaction: (targetId: string) => string | number | undefined
  resetEngagement: () => void
}

export const ENGAGEMENT_STORAGE_KEY = 'wn-engagement'

export const useEngagement = create<EngagementState>()(
  persist(
    (set, get) => ({
      addedComments: [],
      likedIds: [],
      reactions: {},

      addComment: (comment) => {
        set((state) => ({
          addedComments: [comment, ...state.addedComments],
        }))
      },

      toggleLike: (id) => {
        set((state) => {
          const exists = state.likedIds.includes(id)
          return {
            likedIds: exists ? state.likedIds.filter((item) => item !== id) : [...state.likedIds, id],
          }
        })
      },

      isLiked: (id) => get().likedIds.includes(id),

      setReaction: (targetId, reaction) => {
        set((state) => ({
          reactions: {
            ...state.reactions,
            [targetId]: reaction,
          },
        }))
      },

      setVote: (targetId, vote) => {
        get().setReaction(targetId, vote)
      },

      getReaction: (targetId) => get().reactions[targetId],

      resetEngagement: () => {
        set({
          addedComments: [],
          likedIds: [],
          reactions: {},
        })
      },
    }),
    {
      name: ENGAGEMENT_STORAGE_KEY,
      storage: createJSONStorage(getSafeStorage),
    }
  )
)
