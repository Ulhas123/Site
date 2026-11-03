import { beforeEach, describe, expect, it } from 'vitest'
import {
  DEFAULT_PREFS,
  migratePrefs,
  PREFS_STORAGE_KEY,
  usePrefs,
} from './usePrefs'
import { PROGRESS_STORAGE_KEY, useProgress } from './useProgress'
import { useEngagement } from './useEngagement'
import { useUI } from './useUI'

describe('usePrefs Store & Migration', () => {
  beforeEach(() => {
    usePrefs.getState().reset()
    useProgress.getState().clearAllProgress()
  })

  it('initializes with default preferences', () => {
    const state = usePrefs.getState()
    expect(state.theme).toBe('dark')
    expect(state.fontFamily).toBe('lora')
    expect(state.fontSize).toBe(18)
    expect(state.lineHeight).toBe(1.8)
    expect(state.paragraphGap).toBe(24)
    expect(state.maxWidth).toBe(800)
    expect(state.readingMode).toBe('scroll')
    expect(state.autoHideChrome).toBe(false)
  })

  it('updates preferences with constraints', () => {
    const { setFontSize, setLineHeight, setParagraphGap, setTheme } = usePrefs.getState()

    setTheme('sepia')
    expect(usePrefs.getState().theme).toBe('sepia')

    // Clamps font size to 14-28 step 2
    setFontSize(10)
    expect(usePrefs.getState().fontSize).toBe(14)
    setFontSize(35)
    expect(usePrefs.getState().fontSize).toBe(28)
    setFontSize(19)
    expect(usePrefs.getState().fontSize).toBe(20)

    // Clamps line height to 1.6-2.2
    setLineHeight(1.2)
    expect(usePrefs.getState().lineHeight).toBe(1.6)
    setLineHeight(3.0)
    expect(usePrefs.getState().lineHeight).toBe(2.2)

    // Clamps paragraph gap to 16-32
    setParagraphGap(10)
    expect(usePrefs.getState().paragraphGap).toBe(16)
    setParagraphGap(40)
    expect(usePrefs.getState().paragraphGap).toBe(32)
  })

  it('migrate works for legacy version 0 and missing fields', () => {
    // Legacy v0 state with old font names 'serif', out-of-range font sizes
    const legacyState = {
      theme: 'midnight',
      fontFamily: 'serif',
      fontSize: 34,
      lineHeight: 2.8,
      paragraphGap: 50,
      maxWidth: 960,
    }

    const migrated = migratePrefs(legacyState, 0)
    expect(migrated.theme).toBe('midnight')
    expect(migrated.fontFamily).toBe('lora') // Migrated from 'serif' -> 'lora'
    expect(migrated.fontSize).toBe(28) // Clamped to max 28
    expect(migrated.lineHeight).toBe(2.2) // Clamped to max 2.2
    expect(migrated.paragraphGap).toBe(32) // Clamped to max 32
    expect(migrated.maxWidth).toBe(960)
    expect(migrated.readingMode).toBe('scroll') // Default filled in
    expect(migrated.autoHideChrome).toBe(false) // Default filled in
  })

  it('migrate works with sans -> inter and invalid values', () => {
    const legacyState = {
      fontFamily: 'sans',
      fontSize: 12,
      lineHeight: 1.0,
      paragraphGap: 5,
    }

    const migrated = migratePrefs(legacyState, 0)
    expect(migrated.fontFamily).toBe('inter')
    expect(migrated.fontSize).toBe(14) // Clamped to min 14
    expect(migrated.lineHeight).toBe(1.6) // Clamped to min 1.6
    expect(migrated.paragraphGap).toBe(16) // Clamped to min 16
  })

  it('migrate handles null or non-object gracefully', () => {
    const migrated = migratePrefs(null, 0)
    expect(migrated.theme).toBe(DEFAULT_PREFS.theme)
    expect(migrated.fontSize).toBe(DEFAULT_PREFS.fontSize)
  })
})

describe('Separation of Concerns: Prefs reset vs Progress', () => {
  beforeEach(() => {
    usePrefs.getState().reset()
    useProgress.getState().clearAllProgress()
  })

  it('prefs reset leaves progress intact', () => {
    // 1. Establish progress for novel-1
    const progressData = {
      chapterId: 'ch-05',
      blockId: 'b-12',
      offsetRatio: 0.42,
      percent: 68,
      updatedAt: 1234567890,
    }
    useProgress.getState().saveProgress('novel-shadow-slave', progressData)
    const bmId = useProgress.getState().addBookmark({
      novelId: 'novel-shadow-slave',
      chapterId: 'ch-05',
      blockId: 'b-12',
      snippet: 'Sunny looked into the abyss...',
    })
    useProgress.getState().markChapterRead('ch-01')
    useProgress.getState().markChapterRead('ch-02')

    // 2. Mutate prefs to custom values
    usePrefs.getState().setTheme('light')
    usePrefs.getState().setFontSize(26)
    usePrefs.getState().setFontFamily('mono')
    usePrefs.getState().setMaxWidth(680)

    expect(usePrefs.getState().theme).toBe('light')
    expect(usePrefs.getState().fontSize).toBe(26)

    // 3. Reset preferences
    usePrefs.getState().reset()

    // 4. Verify prefs are back to defaults
    expect(usePrefs.getState().theme).toBe('dark')
    expect(usePrefs.getState().fontSize).toBe(18)
    expect(usePrefs.getState().fontFamily).toBe('lora')
    expect(usePrefs.getState().maxWidth).toBe(800)

    // 5. CRITICAL: Verify useProgress was NEVER touched
    const progressAfter = useProgress.getState().getProgress('novel-shadow-slave')
    expect(progressAfter).toBeDefined()
    expect(progressAfter?.chapterId).toBe('ch-05')
    expect(progressAfter?.blockId).toBe('b-12')
    expect(progressAfter?.percent).toBe(68)
    expect(progressAfter?.offsetRatio).toBe(0.42)

    expect(useProgress.getState().bookmarks).toHaveLength(1)
    expect(useProgress.getState().bookmarks[0].id).toBe(bmId)
    expect(useProgress.getState().bookmarks[0].snippet).toBe('Sunny looked into the abyss...')

    expect(useProgress.getState().isChapterRead('ch-01')).toBe(true)
    expect(useProgress.getState().isChapterRead('ch-02')).toBe(true)
    expect(useProgress.getState().isChapterRead('ch-03')).toBe(false)

    // Also verify distinct storage keys
    expect(PREFS_STORAGE_KEY).not.toBe(PROGRESS_STORAGE_KEY)
  })
})

describe('useEngagement & useUI Stores', () => {
  beforeEach(() => {
    useEngagement.getState().resetEngagement()
    useUI.getState().closePanel()
    useUI.getState().setChromeVisible(true)
  })

  it('handles engagement: likes, comments, reactions, reset', () => {
    const eng = useEngagement.getState()

    // Likes
    expect(eng.isLiked('c-1')).toBe(false)
    eng.toggleLike('c-1')
    expect(useEngagement.getState().isLiked('c-1')).toBe(true)
    useEngagement.getState().toggleLike('c-1')
    expect(useEngagement.getState().isLiked('c-1')).toBe(false)

    // Comments
    useEngagement.getState().addComment({
      id: 'custom-c1',
      blockId: 'b-1',
      user: 'Reader101',
      avatarSeed: 'seed',
      level: 1,
      text: 'Great chapter!',
      likes: 0,
      createdAt: 'just now',
      isSpoiler: false,
    })
    expect(useEngagement.getState().addedComments).toHaveLength(1)

    // Reactions
    useEngagement.getState().setReaction('block-12', 'fire')
    expect(useEngagement.getState().getReaction('block-12')).toBe('fire')

    // Reset engagement
    useEngagement.getState().resetEngagement()
    expect(useEngagement.getState().addedComments).toHaveLength(0)
    expect(useEngagement.getState().likedIds).toHaveLength(0)
    expect(useEngagement.getState().getReaction('block-12')).toBeUndefined()
  })

  it('handles non-persisted useUI state', () => {
    expect(useUI.getState().activePanel).toBeNull()
    expect(useUI.getState().chromeVisible).toBe(true)

    useUI.getState().openPanel('settings')
    expect(useUI.getState().activePanel).toBe('settings')

    useUI.getState().toggleChrome()
    expect(useUI.getState().chromeVisible).toBe(false)

    useUI.getState().closePanel()
    expect(useUI.getState().activePanel).toBeNull()
  })
})
