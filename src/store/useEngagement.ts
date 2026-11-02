import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { ParagraphComment } from '../types/novel'
import { getSafeStorage } from './storage'

export interface Wallet {
  coins: number
  fastPasses: number
}

export interface EngagementState {
  addedComments: ParagraphComment[]
  likedIds: string[]
  reactions: Record<string, string | number>
  wallet: Wallet
  unlockedChapterIds: string[]

  addComment: (comment: ParagraphComment) => void
  toggleLike: (id: string) => void
  isLiked: (id: string) => boolean
  setReaction: (targetId: string, reaction: string | number) => void
  setVote: (targetId: string, vote: string | number) => void
  getReaction: (targetId: string) => string | number | undefined
  unlockWithCoins: (chapterId: string, cost?: number) => boolean
  unlockWithPass: (chapterId: string, cost?: number) => boolean
  isChapterUnlocked: (chapterId: string) => boolean
  addCoins: (amount: number) => void
  addFastPasses: (amount: number) => void
  resetEngagement: () => void
}

export const DEFAULT_WALLET: Wallet = {
  coins: 50,
  fastPasses: 3,
}

export const ENGAGEMENT_STORAGE_KEY = 'wn-engagement'

export const useEngagement = create<EngagementState>()(
  persist(
    (set, get) => ({
      addedComments: [],
      likedIds: [],
      reactions: {},
      wallet: { ...DEFAULT_WALLET },
      unlockedChapterIds: [],

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

      unlockWithCoins: (chapterId, cost = 10) => {
        const state = get()
        if (state.unlockedChapterIds.includes(chapterId)) return true
        if (state.wallet.coins < cost) return false

        set((s) => ({
          wallet: {
            ...s.wallet,
            coins: s.wallet.coins - cost,
          },
          unlockedChapterIds: [...s.unlockedChapterIds, chapterId],
        }))
        return true
      },

      unlockWithPass: (chapterId, cost = 1) => {
        const state = get()
        if (state.unlockedChapterIds.includes(chapterId)) return true
        if (state.wallet.fastPasses < cost) return false

        set((s) => ({
          wallet: {
            ...s.wallet,
            fastPasses: s.wallet.fastPasses - cost,
          },
          unlockedChapterIds: [...s.unlockedChapterIds, chapterId],
        }))
        return true
      },

      isChapterUnlocked: (chapterId) => get().unlockedChapterIds.includes(chapterId),

      addCoins: (amount) => {
        set((s) => ({
          wallet: { ...s.wallet, coins: s.wallet.coins + Math.max(0, amount) },
        }))
      },

      addFastPasses: (amount) => {
        set((s) => ({
          wallet: { ...s.wallet, fastPasses: s.wallet.fastPasses + Math.max(0, amount) },
        }))
      },

      resetEngagement: () => {
        set({
          addedComments: [],
          likedIds: [],
          reactions: {},
          wallet: { ...DEFAULT_WALLET },
          unlockedChapterIds: [],
        })
      },
    }),
    {
      name: ENGAGEMENT_STORAGE_KEY,
      storage: createJSONStorage(getSafeStorage),
    }
  )
)
