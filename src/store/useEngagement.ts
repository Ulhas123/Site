import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { ParagraphComment } from '../types/novel'
import { getSafeStorage } from './storage'

export interface Wallet {
  coins: number
  fastPass: number
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
  unlockChapter: (chapterId: string, cost?: { coins?: number; fastPass?: number }) => boolean
  isChapterUnlocked: (chapterId: string) => boolean
  addCoins: (amount: number) => void
  spendCoins: (amount: number) => boolean
  spendFastPass: (amount?: number) => boolean
  resetEngagement: () => void
}

export const ENGAGEMENT_STORAGE_KEY = 'wn-engagement'

const DEFAULT_WALLET: Wallet = {
  coins: 50,
  fastPass: 3,
}

export const useEngagement = create<EngagementState>()(
  persist(
    (set, get) => ({
      addedComments: [],
      likedIds: [],
      reactions: {},
      wallet: DEFAULT_WALLET,
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

      unlockChapter: (chapterId, cost) => {
        const { unlockedChapterIds, wallet } = get()
        if (unlockedChapterIds.includes(chapterId)) return true

        const coinsCost = cost?.coins ?? 0
        const fpCost = cost?.fastPass ?? 0

        if (fpCost > 0 && wallet.fastPass >= fpCost) {
          set({
            wallet: { ...wallet, fastPass: wallet.fastPass - fpCost },
            unlockedChapterIds: [...unlockedChapterIds, chapterId],
          })
          return true
        }

        if (coinsCost > 0 && wallet.coins >= coinsCost) {
          set({
            wallet: { ...wallet, coins: wallet.coins - coinsCost },
            unlockedChapterIds: [...unlockedChapterIds, chapterId],
          })
          return true
        }

        if (coinsCost === 0 && fpCost === 0) {
          set({
            unlockedChapterIds: [...unlockedChapterIds, chapterId],
          })
          return true
        }

        return false
      },

      isChapterUnlocked: (chapterId) => get().unlockedChapterIds.includes(chapterId),

      addCoins: (amount) => {
        set((state) => ({
          wallet: { ...state.wallet, coins: state.wallet.coins + Math.max(0, amount) },
        }))
      },

      spendCoins: (amount) => {
        const current = get().wallet.coins
        if (current < amount) return false
        set((state) => ({
          wallet: { ...state.wallet, coins: state.wallet.coins - amount },
        }))
        return true
      },

      spendFastPass: (amount = 1) => {
        const current = get().wallet.fastPass
        if (current < amount) return false
        set((state) => ({
          wallet: { ...state.wallet, fastPass: state.wallet.fastPass - amount },
        }))
        return true
      },

      resetEngagement: () => {
        set({
          addedComments: [],
          likedIds: [],
          reactions: {},
          wallet: DEFAULT_WALLET,
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
