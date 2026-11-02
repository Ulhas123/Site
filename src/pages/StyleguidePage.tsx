import { useState } from 'react'
import { ContrastTable } from '../components/styleguide/ContrastTable'
import { OverlayShowcase } from '../components/styleguide/OverlayShowcase'
import { ThemeCard } from '../components/styleguide/ThemeCard'
import { TypeSpecimens } from '../components/styleguide/TypeSpecimens'
import { THEMES, THEME_NAMES, type ThemeName } from '../theme/tokens'

export function StyleguidePage() {
  const [currentTheme, setCurrentTheme] = useState<ThemeName>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const urlTheme = params.get('theme') as ThemeName
      if (THEME_NAMES.includes(urlTheme)) return urlTheme
      return (document.documentElement.getAttribute('data-theme') as ThemeName) || 'dark'
    }
    return 'dark'
  })

  const handleSelectTheme = (name: ThemeName) => {
    setCurrentTheme(name)
    document.documentElement.setAttribute('data-theme', name)
    try {
      localStorage.setItem('theme', name)
    } catch {
      // Ignore storage errors in restricted envs
    }
  }

  return (
    <div className="min-h-screen bg-outer text-ink font-sans transition-colors duration-150 overflow-x-hidden">
      <header className="border-b border-line bg-page/90 backdrop-blur sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-ink">
                Webnovel Design Tokens
              </h1>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-accent/10 text-accent border border-accent/20">
                Dev Styleguide
              </span>
            </div>
            <p className="text-xs sm:text-sm text-muted">
              Design tokens, semantic color surfaces, WCAG contrast verification, and self-hosted fonts.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <span className="text-xs font-medium text-muted">Global Theme:</span>
            <div className="inline-flex rounded-lg border border-line bg-raised p-1 gap-1">
              {THEME_NAMES.map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => handleSelectTheme(name)}
                  className={`px-2 sm:px-2.5 py-1 text-xs font-semibold rounded-md capitalize transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-system focus-visible:outline-none ${
                    currentTheme === name
                      ? 'bg-page text-ink shadow-xs border border-line'
                      : 'text-muted hover:text-ink'
                  }`}
                  aria-pressed={currentTheme === name}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12 min-w-0 max-w-full">
        {/* Section 1: Themes side by side */}
        <section aria-labelledby="themes-heading" className="space-y-6">
          <div className="space-y-1">
            <h2 id="themes-heading" className="text-xl font-bold tracking-tight text-ink">
              Theme Palettes (Side by Side)
            </h2>
            <p className="text-sm text-muted">
              Rendered simultaneously with scoped <code>data-theme</code> attributes to test semantic surface tokens and <code>bg-accent/10</code>.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
            {THEME_NAMES.map((themeName) => (
              <ThemeCard
                key={themeName}
                themeName={themeName}
                palette={THEMES[themeName]}
                isActiveTheme={currentTheme === themeName}
                onSelectTheme={handleSelectTheme}
              />
            ))}
          </div>
        </section>

        {/* Section 2: WCAG Contrast Table */}
        <ContrastTable />

        {/* Section 3: Typography Specimens */}
        <TypeSpecimens />

        {/* Section 4: Reader Variables Demo */}
        <section aria-labelledby="reader-vars-heading" className="space-y-4">
          <div className="space-y-1">
            <h2 id="reader-vars-heading" className="text-xl font-bold tracking-tight text-ink">
              Reader CSS Variables on :root
            </h2>
            <p className="text-sm text-muted">
              Live reading block rendered using <code>--reader-font</code>, <code>--reader-size</code>, <code>--reader-leading</code>, <code>--reader-gap</code>, and <code>--reader-width</code>.
            </p>
          </div>

          <div className="p-4 sm:p-6 rounded-2xl border border-line bg-page flex justify-center min-w-0 max-w-full overflow-hidden">
            <article
              className="w-full max-w-full text-ink min-w-0"
              style={{
                fontFamily: 'var(--reader-font)',
                fontSize: 'var(--reader-size)',
                lineHeight: 'var(--reader-leading)',
                maxWidth: 'min(var(--reader-width), 100%)',
              }}
            >
              <h3 className="text-2xl font-bold mb-4 font-inter text-ink">
                Chapter 12: The Whisper of the Dao
              </h3>
              <p className="mb-[var(--reader-gap)]">
                The mist clung to the pine needles like spun crystal. High above the valley of forgotten scrolls, the morning bell resonated through the damp air, sending flocks of azure cranes into flight.
              </p>
              <p className="mb-[var(--reader-gap)]">
                Li Wei paused on the steep stone stairs. He adjusted the wooden sheath slung across his shoulder and took a long, steady breath. Three thousand steps remained before the summit gate would open.
              </p>
              <div className="p-3 rounded-lg border border-line bg-raised font-mono text-xs text-muted">
                Reader layout variables applied: width 42rem • size 1.125rem • leading 1.75 • gap 1.5rem
              </div>
            </article>
          </div>
        </section>

        {/* Section 5: State, Overlays & Gesture Architecture */}
        <OverlayShowcase />
      </main>
    </div>
  )
}
