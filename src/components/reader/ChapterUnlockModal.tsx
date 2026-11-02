import React, { useState } from 'react'
import { Check, Coins, Sparkles, Ticket } from 'lucide-react'
import { useEngagement } from '../../store/useEngagement'
import type { ChapterMeta } from '../../types/novel'
import { Modal } from '../ui/Modal'

export interface ChapterUnlockModalProps {
  isOpen: boolean
  onClose: () => void
  chapter: ChapterMeta | null
  onUnlockSuccess: (chapterId: string) => void
}

const COIN_COST = 10
const PASS_COST = 1

export const ChapterUnlockModal: React.FC<ChapterUnlockModalProps> = ({
  isOpen,
  onClose,
  chapter,
  onUnlockSuccess,
}) => {
  const wallet = useEngagement((s) => s.wallet)
  const unlockWithCoins = useEngagement((s) => s.unlockWithCoins)
  const unlockWithPass = useEngagement((s) => s.unlockWithPass)
  const addCoins = useEngagement((s) => s.addCoins)
  const addFastPasses = useEngagement((s) => s.addFastPasses)

  const [feedback, setFeedback] = useState<string | null>(null)

  if (!chapter) return null

  const canUsePass = wallet.fastPasses >= PASS_COST
  const canUseCoins = wallet.coins >= COIN_COST

  const handleUnlockWithPass = () => {
    const success = unlockWithPass(chapter.id, PASS_COST)
    if (success) {
      setFeedback('Unlocked with Fast Pass!')
      setTimeout(() => {
        setFeedback(null)
        onUnlockSuccess(chapter.id)
      }, 350)
    }
  }

  const handleUnlockWithCoins = () => {
    const success = unlockWithCoins(chapter.id, COIN_COST)
    if (success) {
      setFeedback('Unlocked with Coins!')
      setTimeout(() => {
        setFeedback(null)
        onUnlockSuccess(chapter.id)
      }, 350)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Unlock Chapter ${chapter.number}`}
      description={chapter.title}
      maxWidthClass="max-w-md"
    >
      <div className="space-y-5">
        {feedback && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-accent/15 border border-accent/30 text-accent font-semibold text-sm">
            <Check className="w-5 h-5" aria-hidden="true" />
            <span>{feedback}</span>
          </div>
        )}

        {/* Wallet Balance Banner */}
        <div className="p-4 rounded-xl bg-raised border border-line space-y-2">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted">
            Your Wallet Balance
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-accent" aria-hidden="true" />
              <span className="text-lg font-bold text-ink">{wallet.coins}</span>
              <span className="text-xs text-muted">Coins</span>
            </div>
            <div className="h-4 w-px bg-line" aria-hidden="true" />
            <div className="flex items-center gap-2">
              <Ticket className="w-5 h-5 text-system" aria-hidden="true" />
              <span className="text-lg font-bold text-ink">{wallet.fastPasses}</span>
              <span className="text-xs text-muted">Fast Passes</span>
            </div>
          </div>
        </div>

        {/* Unlock Options */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={handleUnlockWithPass}
            disabled={!canUsePass}
            className={`w-full p-4 rounded-xl border flex items-center justify-between text-left transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-system ${
              canUsePass
                ? 'bg-page hover:bg-raised border-line text-ink hover:border-accent/60 shadow-xs'
                : 'bg-raised/30 border-line/50 text-muted opacity-60 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-system/10 text-system flex items-center justify-center shrink-0">
                <Ticket className="w-5 h-5" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold text-ink">Fast Pass</div>
                <div className="text-xs text-muted">1 Pass per chapter</div>
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="text-sm font-semibold text-ink">1 Pass</span>
              <div className="text-[11px] text-muted">
                {canUsePass ? `${wallet.fastPasses} left` : '0 left'}
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={handleUnlockWithCoins}
            disabled={!canUseCoins}
            className={`w-full p-4 rounded-xl border flex items-center justify-between text-left transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-system ${
              canUseCoins
                ? 'bg-page hover:bg-raised border-line text-ink hover:border-accent/60 shadow-xs'
                : 'bg-raised/30 border-line/50 text-muted opacity-60 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-accent/10 text-accent flex items-center justify-center shrink-0">
                <Coins className="w-5 h-5" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold text-ink">Coins</div>
                <div className="text-xs text-muted">Deduct 10 coins</div>
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="text-sm font-semibold text-ink">10 Coins</span>
              <div className="text-[11px] text-muted">
                {canUseCoins ? `${wallet.coins} left` : 'Insufficient'}
              </div>
            </div>
          </button>
        </div>

        {/* Quick Top-up / Refill helpers for testing or low balance */}
        {(!canUsePass || !canUseCoins) && (
          <div className="pt-2 border-t border-line/60 flex items-center justify-between gap-2 text-xs text-muted">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-accent" aria-hidden="true" />
              Need more balance?
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => addCoins(50)}
                className="px-2.5 py-1 rounded-md bg-raised hover:bg-page border border-line text-ink font-semibold text-[11px] transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-system"
              >
                +50 Coins
              </button>
              <button
                type="button"
                onClick={() => addFastPasses(2)}
                className="px-2.5 py-1 rounded-md bg-raised hover:bg-page border border-line text-ink font-semibold text-[11px] transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-system"
              >
                +2 Passes
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}
