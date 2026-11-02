import { AlertTriangle, CheckCircle2 } from 'lucide-react'
import { evaluateContrast, type ContrastResult } from '../../theme/contrast'
import { THEMES, THEME_NAMES, type ThemeName } from '../../theme/tokens'

interface ThemeContrastGroup {
  themeName: ThemeName
  results: ContrastResult[]
}

export function ContrastTable() {
  const groups: ThemeContrastGroup[] = THEME_NAMES.map((themeName) => {
    const palette = THEMES[themeName]
    const results: ContrastResult[] = [
      evaluateContrast('ink / page', 'ink', palette.ink, 'page', palette.page),
      evaluateContrast('muted / page', 'muted', palette.muted, 'page', palette.page),
      evaluateContrast('accent-text / page', 'accent-text', palette.accentText, 'page', palette.page),
    ]
    return { themeName, results }
  })

  const failingResults = groups.flatMap((group) =>
    group.results
      .filter((r) => !r.passesAA)
      .map((r) => ({
        themeName: group.themeName,
        ...r,
      })),
  )

  return (
    <section aria-labelledby="contrast-heading" className="space-y-6 min-w-0 max-w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h2 id="contrast-heading" className="text-xl font-bold tracking-tight text-ink">
            WCAG 2.1 AA Contrast Compliance (&ge; 4.5:1)
          </h2>
          <p className="text-sm text-muted">
            Evaluated on normal text against the theme's page background token.
          </p>
        </div>
        {failingResults.length === 0 ? (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
            <span>All pairs meet 4.5:1 AA</span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <AlertTriangle className="w-4 h-4" aria-hidden="true" />
            <span>{failingResults.length} pair below 4.5:1 threshold</span>
          </div>
        )}
      </div>

      {failingResults.length > 0 && (
        <div
          role="alert"
          className="p-4 rounded-lg border border-amber-500/30 bg-amber-500/10 text-ink space-y-2"
        >
          <div className="flex items-center gap-2 font-semibold text-amber-500">
            <AlertTriangle className="w-5 h-5 shrink-0" aria-hidden="true" />
            <span>Flagged Under-Threshold Pairs (&lt; 4.5:1)</span>
          </div>
          <ul className="list-disc list-inside text-sm text-muted space-y-1">
            {failingResults.map((fail) => (
              <li key={`${fail.themeName}-${fail.pairName}`}>
                <strong className="text-ink capitalize">{fail.themeName}</strong> — {fail.pairName} (
                <code>{fail.fgHex}</code> on <code>{fail.bgHex}</code>):{' '}
                <span className="font-bold text-amber-500">{fail.ratio}:1</span> (WCAG AA requirement: 4.50:1)
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="w-full max-w-full overflow-x-auto rounded-lg border border-line bg-page">
        <table className="w-full min-w-[640px] text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-line bg-raised text-muted text-xs uppercase tracking-wider">
              <th scope="col" className="px-4 py-3 font-semibold">Theme</th>
              <th scope="col" className="px-4 py-3 font-semibold">Token Pair</th>
              <th scope="col" className="px-4 py-3 font-semibold">Foreground</th>
              <th scope="col" className="px-4 py-3 font-semibold">Background</th>
              <th scope="col" className="px-4 py-3 font-semibold">Ratio</th>
              <th scope="col" className="px-4 py-3 font-semibold">WCAG Level</th>
              <th scope="col" className="px-4 py-3 font-semibold">Sample</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {groups.flatMap((group) =>
              group.results.map((r, idx) => {
                const isPassing = r.passesAA
                return (
                  <tr
                    key={`${group.themeName}-${r.pairName}`}
                    className={`transition-colors ${
                      !isPassing ? 'bg-amber-500/5' : 'hover:bg-raised/50'
                    }`}
                  >
                    {idx === 0 && (
                      <th
                        rowSpan={group.results.length}
                        scope="rowGroup"
                        className="px-4 py-3 font-semibold text-ink capitalize align-top border-r border-line"
                      >
                        {group.themeName}
                      </th>
                    )}
                    <td className="px-4 py-3 font-medium text-ink">{r.pairName}</td>
                    <td className="px-4 py-3 text-xs font-mono">
                      <span className="inline-flex items-center gap-1.5">
                        <span
                          className="w-3.5 h-3.5 rounded-sm border border-line shrink-0"
                          style={{ backgroundColor: r.fgHex }}
                          aria-hidden="true"
                        />
                        <span>{r.fgHex}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs font-mono">
                      <span className="inline-flex items-center gap-1.5">
                        <span
                          className="w-3.5 h-3.5 rounded-sm border border-line shrink-0"
                          style={{ backgroundColor: r.bgHex }}
                          aria-hidden="true"
                        />
                        <span>{r.bgHex}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 font-bold font-mono text-ink">
                      {r.ratio}:1
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                          isPassing
                            ? r.level === 'AAA'
                              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                              : 'bg-blue-500/15 text-blue-600 dark:text-blue-400'
                            : 'bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold'
                        }`}
                      >
                        {isPassing ? `PASS (${r.level})` : 'FAIL (< 4.5:1)'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="px-2.5 py-1 rounded text-xs font-medium border border-line"
                        style={{ backgroundColor: r.bgHex, color: r.fgHex }}
                      >
                        Sample Aa 123
                      </span>
                    </td>
                  </tr>
                )
              }),
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
