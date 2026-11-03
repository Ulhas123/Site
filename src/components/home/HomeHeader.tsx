import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Moon, Palette, Sun, Sunrise } from 'lucide-react';
import { usePrefs } from '../../store/usePrefs';
import type { ThemeName } from '../../theme/tokens';

interface HomeHeaderProps {
  totalNovels: number;
}

const THEME_OPTIONS: Array<{ id: ThemeName; label: string; icon: React.ReactNode }> = [
  { id: 'dark', label: 'Dark', icon: <Moon className="w-3.5 h-3.5" aria-hidden="true" /> },
  { id: 'sepia', label: 'Sepia', icon: <Sunrise className="w-3.5 h-3.5" aria-hidden="true" /> },
  { id: 'midnight', label: 'Midnight', icon: <Palette className="w-3.5 h-3.5" aria-hidden="true" /> },
  { id: 'light', label: 'Light', icon: <Sun className="w-3.5 h-3.5" aria-hidden="true" /> },
];

export const HomeHeader: React.FC<HomeHeaderProps> = ({ totalNovels }) => {
  const theme = usePrefs((s) => s.theme);
  const setTheme = usePrefs((s) => s.setTheme);

  return (
    <header className="sticky top-0 z-30 bg-page/90 backdrop-blur-md border-b border-line">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand & Badge */}
        <Link
          to="/"
          className="flex items-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-lg p-1 -ml-1"
          aria-label="Webnovel Reader Home"
        >
          <div className="w-9 h-9 rounded-xl bg-accent/10 border border-accent/25 flex items-center justify-center text-accent group-hover:scale-105 transition-transform motion-reduce:transition-none">
            <BookOpen className="w-5 h-5" aria-hidden="true" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-bold text-ink text-base tracking-tight leading-tight">
                Webnovel Reader
              </span>
              {totalNovels > 0 && (
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-raised border border-line text-muted">
                  {totalNovels} {totalNovels === 1 ? 'Novel' : 'Novels'}
                </span>
              )}
            </div>
            <span className="text-[11px] text-muted leading-none hidden sm:inline">
              Your Library & Scraped Books
            </span>
          </div>
        </Link>

        {/* Theme switcher */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div
            role="group"
            aria-label="Color theme selection"
            className="flex items-center bg-raised p-1 rounded-xl border border-line"
          >
            {THEME_OPTIONS.map((opt) => {
              const isActive = theme === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setTheme(opt.id)}
                  aria-pressed={isActive}
                  aria-label={`${opt.label} theme`}
                  title={`${opt.label} theme`}
                  className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition-colors motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                    isActive
                      ? 'bg-accent text-page shadow-xs'
                      : 'text-muted hover:text-ink hover:bg-page/50'
                  }`}
                >
                  {opt.icon}
                  <span className="hidden md:inline">{opt.label}</span>
                </button>
              );
            })}
          </div>

          <Link
            to="/styleguide"
            aria-label="Design System Styleguide"
            className="hidden sm:inline-flex items-center text-xs font-medium px-2.5 py-1.5 rounded-lg border border-line bg-raised text-muted hover:text-ink hover:border-accent/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-system motion-reduce:transition-none"
          >
            Styleguide
          </Link>
        </div>
      </div>
    </header>
  );
};
