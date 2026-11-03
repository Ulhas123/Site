import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertCircle, BookX, RefreshCw, Search, X } from 'lucide-react';
import { HomeHeader } from '../components/home/HomeHeader';
import { NovelCard } from '../components/home/NovelCard';
import { RecentReadBanner } from '../components/home/RecentReadBanner';
import { getLibraryNovels } from '../data/api';
import type { NovelSummary } from '../data/novelsRegistry';
import { useApplyPrefs } from '../hooks';

export const HomePage: React.FC = () => {
  useApplyPrefs();

  const [novels, setNovels] = useState<NovelSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const loadNovels = useCallback(() => {
    setLoading(true);
    setError(null);
    getLibraryNovels()
      .then((data) => {
        setNovels(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load novels. Please try again.');
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    let mounted = true;
    getLibraryNovels()
      .then((data) => {
        if (mounted) {
          setNovels(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (mounted) {
          setError('Failed to load novels. Please try again.');
          setLoading(false);
        }
      });
    return () => {
      mounted = false;
    };
  }, []);

  const filteredNovels = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return novels;
    return novels.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.author.toLowerCase().includes(q) ||
        n.synopsis.toLowerCase().includes(q)
    );
  }, [novels, searchQuery]);

  return (
    <div className="min-h-screen bg-outer text-ink flex flex-col selection:bg-accent/25 selection:text-ink">
      <HomeHeader totalNovels={novels.length} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Hero Section */}
        <div className="mb-8 sm:mb-10">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
            Explore Novels
          </h1>
          <p className="text-sm sm:text-base text-muted mt-1 max-w-2xl">
            Browse all uploaded webnovels. Enjoy tailored reading with custom typography, dark and
            sepia color schemes, and saved progress.
          </p>

          {/* Search bar */}
          <div className="mt-6 flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search
                className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none"
                aria-hidden="true"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search uploaded novels, authors..."
                aria-label="Search uploaded novels"
                className="w-full bg-page border border-line rounded-xl pl-10 pr-9 py-2.5 text-sm text-ink placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search query"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-muted hover:text-ink rounded-md cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  <X className="w-4 h-4" aria-hidden="true" />
                </button>
              )}
            </div>

            {!loading && novels.length > 0 && (
              <span className="text-xs text-muted">
                Showing {filteredNovels.length} of {novels.length}{' '}
                {novels.length === 1 ? 'novel' : 'novels'}
              </span>
            )}
          </div>
        </div>

        {/* Continue reading banner if available */}
        {!loading && novels.length > 0 && <RecentReadBanner novels={novels} />}

        {/* Loading skeleton */}
        {loading && (
          <div
            role="status"
            aria-label="Loading novels"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-page border border-line rounded-2xl overflow-hidden p-4 space-y-4 animate-pulse"
              >
                <div className="w-full aspect-[16/10] bg-raised rounded-xl" />
                <div className="h-5 bg-raised rounded w-3/4" />
                <div className="h-4 bg-raised rounded w-1/3" />
                <div className="space-y-2">
                  <div className="h-3 bg-raised rounded w-full" />
                  <div className="h-3 bg-raised rounded w-5/6" />
                </div>
                <div className="pt-4 border-t border-line flex justify-between">
                  <div className="h-8 bg-raised rounded w-20" />
                  <div className="h-8 bg-raised rounded w-24" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div
            role="alert"
            className="p-8 rounded-2xl bg-page border border-line text-center max-w-md mx-auto my-12"
          >
            <AlertCircle className="w-10 h-10 text-accent mx-auto mb-3" aria-hidden="true" />
            <h2 className="text-base font-semibold text-ink mb-1">Failed to Load Library</h2>
            <p className="text-sm text-muted mb-4">{error}</p>
            <button
              type="button"
              onClick={loadNovels}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-accent text-page font-medium text-sm hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <RefreshCw className="w-4 h-4" aria-hidden="true" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* Empty search results */}
        {!loading && !error && filteredNovels.length === 0 && (
          <div className="p-12 rounded-2xl bg-page border border-line text-center max-w-md mx-auto my-12">
            <BookX className="w-10 h-10 text-muted mx-auto mb-3" aria-hidden="true" />
            <h2 className="text-base font-semibold text-ink mb-1">No Novels Found</h2>
            <p className="text-sm text-muted mb-4">
              We couldn&apos;t find any novels matching &ldquo;{searchQuery}&rdquo;.
            </p>
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="px-4 py-2 rounded-xl border border-line bg-raised text-sm font-medium text-ink hover:border-accent/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              Clear Search Filter
            </button>
          </div>
        )}

        {/* Novels Grid */}
        {!loading && !error && filteredNovels.length > 0 && (
          <div
            role="feed"
            aria-label="Uploaded novels list"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredNovels.map((novel) => (
              <NovelCard key={novel.id} novel={novel} />
            ))}
          </div>
        )}
      </main>

      {/* Minimal Footer */}
      <footer className="border-t border-line bg-page/40 mt-auto py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted">
          <p>Webnovel Reader &bull; Clean Typography &amp; Multi-Theme Reader</p>
          <div className="flex items-center gap-4">
            <a
              href="#top"
              className="hover:text-ink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded"
            >
              Back to Top
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};
