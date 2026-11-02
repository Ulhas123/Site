import { BookOpen, Code, Compass, Feather } from 'lucide-react'

export function TypeSpecimens() {
  return (
    <section aria-labelledby="typography-heading" className="space-y-6">
      <div>
        <h2 id="typography-heading" className="text-xl font-bold tracking-tight text-ink">
          Self-Hosted Variable Fonts (No Google CDN)
        </h2>
        <p className="text-sm text-muted">
          All font families are packaged via <code>@fontsource-variable/*</code> and bundled locally for zero external network dependency.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Lora Variable */}
        <div className="p-5 rounded-2xl border border-line bg-page space-y-3">
          <div className="flex items-center justify-between border-b border-line pb-2.5">
            <div className="flex items-center gap-2">
              <Feather className="w-4 h-4 text-accent" aria-hidden="true" />
              <h3 className="font-bold text-base text-ink">Lora Variable</h3>
            </div>
            <span className="text-xs font-mono text-muted">serif (weights: 400-700)</span>
          </div>
          <p className="font-lora text-lg text-ink leading-relaxed">
            “It is a truth universally acknowledged, that a solitary cultivator in possession of good fortune, must be in want of a legendary sword.”
          </p>
          <div className="font-lora text-sm space-y-1 text-muted border-t border-line/60 pt-2.5">
            <p className="italic">Italic: Cultivation knows neither day nor night, only intent.</p>
            <p className="font-bold text-ink">Bold: Chapter 1: The Dragon Pearl Reborn</p>
          </div>
        </div>

        {/* Merriweather Variable */}
        <div className="p-5 rounded-2xl border border-line bg-page space-y-3">
          <div className="flex items-center justify-between border-b border-line pb-2.5">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-accent" aria-hidden="true" />
              <h3 className="font-bold text-base text-ink">Merriweather Variable</h3>
            </div>
            <span className="text-xs font-mono text-muted">serif (weights: 300-900)</span>
          </div>
          <p className="font-merriweather text-lg text-ink leading-relaxed">
            The wind howled across the celestial peak. Below, the misty expanse hid countless ancient realms waiting to awaken.
          </p>
          <div className="font-merriweather text-sm space-y-1 text-muted border-t border-line/60 pt-2.5">
            <p className="italic">Italic: Even mountains bow before the turning of heavenly epochs.</p>
            <p className="font-bold text-ink">Bold 700: Realm of the Nine Heavens</p>
          </div>
        </div>

        {/* Inter Variable */}
        <div className="p-5 rounded-2xl border border-line bg-page space-y-3">
          <div className="flex items-center justify-between border-b border-line pb-2.5">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-system" aria-hidden="true" />
              <h3 className="font-bold text-base text-ink">Inter Variable</h3>
            </div>
            <span className="text-xs font-mono text-muted">sans-serif (UI, metadata)</span>
          </div>
          <div className="font-inter space-y-2">
            <p className="text-sm font-semibold text-ink">
              Table of Contents • Bookmark • Reading Settings • 84% Complete
            </p>
            <p className="text-xs text-muted">
              Displaying typography scale: 12px caption, 14px body-ui, 16px subheader, 24px title.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-raised text-ink border border-line">
                Progress: 42/50 Chapters
              </span>
              <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-raised text-muted border border-line">
                Last read: 2 hours ago
              </span>
            </div>
          </div>
        </div>

        {/* JetBrains Mono Variable */}
        <div className="p-5 rounded-2xl border border-line bg-page space-y-3">
          <div className="flex items-center justify-between border-b border-line pb-2.5">
            <div className="flex items-center gap-2">
              <Code className="w-4 h-4 text-system" aria-hidden="true" />
              <h3 className="font-bold text-base text-ink">JetBrains Mono Variable</h3>
            </div>
            <span className="text-xs font-mono text-muted">monospace (stats, code)</span>
          </div>
          <div className="font-mono text-xs p-3 rounded-xl bg-raised border border-line text-ink space-y-1 overflow-x-auto w-full max-w-full">
            <p className="text-muted">// Reader CSS variables on :root</p>
            <p><span className="text-accent">--reader-font</span>: 'Lora Variable', serif;</p>
            <p><span className="text-accent">--reader-size</span>: 1.125rem;</p>
            <p><span className="text-accent">--reader-leading</span>: 1.75;</p>
            <p><span className="text-accent">--reader-gap</span>: 1.5rem;</p>
            <p><span className="text-accent">--reader-width</span>: 42rem;</p>
          </div>
        </div>
      </div>
    </section>
  )
}
