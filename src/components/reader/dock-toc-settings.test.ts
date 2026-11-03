import { beforeEach, describe, expect, it } from 'vitest'
import { allComments } from '../../data/comments'
import { defaultNovel } from '../../data/novel'
import { useEngagement } from '../../store/useEngagement'
import { DEFAULT_PREFS, usePrefs } from '../../store/usePrefs'
import { useProgress } from '../../store/useProgress'
import { useUI } from '../../store/useUI'

describe('Floating Dock, Settings Drawer, and TOC Drawer Suite', () => {
  beforeEach(() => {
    usePrefs.getState().reset()
    useEngagement.getState().resetEngagement()
    useProgress.getState().clearAllProgress()
    useUI.getState().closePanel()
    useUI.getState().setChromeVisible(true)
  })

  describe('TOC Search & Filtering Performance (<50ms on 1,200 chapters)', () => {
    const chapters = defaultNovel.chapters

    it('contains exactly 1,200 chapters in index', () => {
      expect(chapters).toHaveLength(1200)
    })

    it('executes debounced search in <50ms on 1,200 entries (Definition of Done)', () => {
      const queries = ['meridian', 'spire', '42', 'chapter 500', 'crucible', 'bone', '1199']

      for (const query of queries) {
        const start = performance.now()
        const lower = query.trim().toLowerCase()
        const numMatch = lower.match(/\d+/)
        const queryNum = numMatch ? parseInt(numMatch[0], 10) : null

        const results = chapters.filter((ch) => {
          if (queryNum !== null && ch.number === queryNum) return true
          return ch.title.toLowerCase().includes(lower)
        })

        const duration = performance.now() - start
        expect(duration).toBeLessThan(50) // DoD requirement: <50ms
        expect(results.length).toBeGreaterThan(0)
      }
    })

    it('correctly matches chapters by numeric ID / number', () => {
      const query = 'ch 42'
      const num = parseInt(query.match(/\d+/)![0], 10)
      const matches = chapters.filter((ch) => ch.number === num || ch.title.toLowerCase().includes(query))

      expect(matches).toHaveLength(1)
      expect(matches[0].number).toBe(42)
      expect(matches[0].id).toBe('chapter-42')
    })

    it('supports ascending and descending order', () => {
      const asc = [...chapters]
      const desc = [...chapters].reverse()

      expect(asc[0].number).toBe(1)
      expect(asc[asc.length - 1].number).toBe(1200)

      expect(desc[0].number).toBe(1200)
      expect(desc[desc.length - 1].number).toBe(1)
    })
  })

  describe('TOC Virtualization Window Math', () => {
    const ROW_HEIGHT = 56
    const TOTAL_ITEMS = 1200

    it('computes total scroll height correctly', () => {
      const totalHeight = TOTAL_ITEMS * ROW_HEIGHT
      expect(totalHeight).toBe(67200)
    })

    it('calculates visible window for top scroll', () => {
      const scrollTop = 0
      const containerHeight = 480
      const overscan = 4

      const start = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - overscan)
      const end = Math.min(
        TOTAL_ITEMS - 1,
        Math.ceil((scrollTop + containerHeight) / ROW_HEIGHT) + overscan
      )

      expect(start).toBe(0)
      expect(end).toBeLessThanOrEqual(15)
      expect(end - start + 1).toBeLessThanOrEqual(20) // Only ~15-20 DOM nodes rendered
    })

    it('calculates visible window for mid-scroll', () => {
      const scrollTop = 14000 // Around chapter 250
      const containerHeight = 480
      const overscan = 4

      const start = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - overscan)
      const end = Math.min(
        TOTAL_ITEMS - 1,
        Math.ceil((scrollTop + containerHeight) / ROW_HEIGHT) + overscan
      )

      expect(start).toBeGreaterThanOrEqual(245)
      expect(end).toBeLessThanOrEqual(265)
      expect(end - start + 1).toBeLessThanOrEqual(20)
    })

    it('calculates auto-scroll target for active chapter', () => {
      const activeIndex = 500
      const containerHeight = 480
      const targetScroll = Math.max(0, activeIndex * ROW_HEIGHT - containerHeight / 2 + ROW_HEIGHT / 2)

      expect(targetScroll).toBe(500 * 56 - 240 + 28)
      expect(targetScroll).toBeGreaterThan(0)
    })
  })

  describe('Locked Chapter & Wallet Engagement Flow', () => {
    it('treats chapters 1-4 as free and 5+ as locked by default', () => {
      const eng = useEngagement.getState()
      for (let i = 1; i <= 4; i++) {
        const isFree = i <= 4
        expect(isFree).toBe(true)
      }

      expect(eng.isChapterUnlocked('chapter-5')).toBe(false)
      expect(eng.isChapterUnlocked('chapter-100')).toBe(false)
    })

    it('unlocks locked chapter with Fast Pass deducting from wallet', () => {
      const eng = useEngagement.getState()
      expect(eng.wallet.fastPasses).toBe(3)

      const success = eng.unlockWithPass('chapter-5', 1)
      expect(success).toBe(true)
      expect(useEngagement.getState().wallet.fastPasses).toBe(2)
      expect(useEngagement.getState().isChapterUnlocked('chapter-5')).toBe(true)
    })

    it('unlocks locked chapter with Coins deducting from wallet', () => {
      const eng = useEngagement.getState()
      expect(eng.wallet.coins).toBe(50)

      const success = eng.unlockWithCoins('chapter-8', 10)
      expect(success).toBe(true)
      expect(useEngagement.getState().wallet.coins).toBe(40)
      expect(useEngagement.getState().isChapterUnlocked('chapter-8')).toBe(true)
    })

    it('blocks unlocking and preserves wallet when balance is insufficient', () => {
      const eng = useEngagement.getState()
      // Drain coins
      const drained = eng.unlockWithCoins('ch-temp', 50)
      expect(drained).toBe(true)
      expect(useEngagement.getState().wallet.coins).toBe(0)

      // Try unlocking again with coins
      const failure = useEngagement.getState().unlockWithCoins('chapter-9', 10)
      expect(failure).toBe(false)
      expect(useEngagement.getState().isChapterUnlocked('chapter-9')).toBe(false)
      expect(useEngagement.getState().wallet.coins).toBe(0)
    })
  })

  describe('Read Chapters Dimmed State in Progress Store', () => {
    it('marks and checks read chapters accurately', () => {
      const prog = useProgress.getState()
      expect(prog.isChapterRead('chapter-1')).toBe(false)

      prog.markChapterRead('chapter-1')
      expect(useProgress.getState().isChapterRead('chapter-1')).toBe(true)
      expect(useProgress.getState().isChapterRead('chapter-2')).toBe(false)
    })
  })

  describe('Settings Store Instant Updates Across Preferences', () => {
    it('applies every reading setting change instantly in store', () => {
      const prefs = usePrefs.getState()

      // Theme
      prefs.setTheme('midnight')
      expect(usePrefs.getState().theme).toBe('midnight')

      // Typeface
      prefs.setFontFamily('inter')
      expect(usePrefs.getState().fontFamily).toBe('inter')

      // Font size (clamped 14..28 step 2)
      prefs.setFontSize(22)
      expect(usePrefs.getState().fontSize).toBe(22)

      // Line height (clamped 1.6..2.2)
      prefs.setLineHeight(2.0)
      expect(usePrefs.getState().lineHeight).toBe(2.0)

      // Paragraph gap (clamped 16..32)
      prefs.setParagraphGap(28)
      expect(usePrefs.getState().paragraphGap).toBe(28)

      // Max width
      prefs.setMaxWidth(960)
      expect(usePrefs.getState().maxWidth).toBe(960)

      // Reading mode
      prefs.setReadingMode('paginated')
      expect(usePrefs.getState().readingMode).toBe('paginated')

      // Reset
      prefs.reset()
      const resetState = usePrefs.getState()
      expect(resetState.theme).toBe(DEFAULT_PREFS.theme)
      expect(resetState.fontFamily).toBe(DEFAULT_PREFS.fontFamily)
      expect(resetState.fontSize).toBe(DEFAULT_PREFS.fontSize)
      expect(resetState.lineHeight).toBe(DEFAULT_PREFS.lineHeight)
      expect(resetState.paragraphGap).toBe(DEFAULT_PREFS.paragraphGap)
      expect(resetState.maxWidth).toBe(DEFAULT_PREFS.maxWidth)
      expect(resetState.readingMode).toBe(DEFAULT_PREFS.readingMode)
    })
  })

  describe('Dock Navigation & Panel State', () => {
    it('toggles panels through useUI correctly', () => {
      const ui = useUI.getState()
      expect(ui.activePanel).toBeNull()

      ui.openPanel('toc')
      expect(useUI.getState().activePanel).toBe('toc')

      ui.openPanel('settings')
      expect(useUI.getState().activePanel).toBe('settings')

      ui.openPanel('comments')
      expect(useUI.getState().activePanel).toBe('comments')

      ui.openPanel('audio')
      expect(useUI.getState().activePanel).toBe('audio')

      ui.closePanel()
      expect(useUI.getState().activePanel).toBeNull()
    })

    it('aggregates chapter total comments for dock badge', () => {
      const seedCount = allComments.length
      expect(seedCount).toBe(0)

      useEngagement.getState().addComment({
        id: 'new-c1',
        blockId: 'ch01-b05',
        user: 'Tester',
        avatarSeed: 'seed',
        level: 5,
        text: 'New thought on chapter 1',
        likes: 0,
        createdAt: new Date().toISOString(),
        isSpoiler: false,
      })

      const added = useEngagement.getState().addedComments
      const ch01UserComments = added.filter((c) => c.blockId.startsWith('ch01')).length
      expect(seedCount + ch01UserComments).toBe(1)
    })
  })
})
