import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertCircle, BookOpen, BookX, Lock, RefreshCw, Search, Unlock, X } from 'lucide-react';
import { HomeHeader } from '../components/home/HomeHeader';
import { NovelCard } from '../components/home/NovelCard';
import { PasswordModal } from '../components/home/PasswordModal';
import { RecentReadBanner } from '../components/home/RecentReadBanner';
import { getLibraryNovels } from '../data/api';
import type { NovelSummary } from '../data/novelsRegistry';
import { useApplyPrefs } from '../hooks';
import { useAuth } from '../store/useAuth';

export const HomePage: React.FC = () => {
  useApplyPrefs();

  const [novels, setNovels] = useState<NovelSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'novels' | 'study'>('novels');
  const [isPassModalOpen, setIsPassModalOpen] = useState<boolean>(false);

  const isAuthenticated = useAuth((s) => s.isAuthenticated);
  const lockAuth = useAuth((s) => s.lock);

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

  const novelsCount = useMemo(() => novels.filter((n) => n.category !== 'study').length, [novels]);
  const studyCount = useMemo(() => novels.filter((n) => n.category === 'study').length, [novels]);

  const filteredNovels = useMemo(() => {
    const list = novels.filter((n) => (activeTab === 'study' ? n.category === 'study' : n.category !== 'study'));
    const q = searchQuery.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.author.toLowerCase().includes(q) ||
        n.synopsis.toLowerCase().includes(q)
    );
  }, [novels, searchQuery, activeTab]);

  return (
    <div className="min-h-screen bg-outer text-ink flex flex-col selection:bg-accent/25 selection:text-ink">
      <HomeHeader totalNovels={novels.length} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
            {activeTab === 'study' ? 'Engineering & Science Textbooks' : 'Explore Webnovels'}
          </h1>
          <p className="text-sm sm:text-base text-muted mt-1 max-w-2xl">
            {activeTab === 'study'
              ? 'Academic compendiums, diagrams, equations, and code listings with continuous scrolling.'
              : 'Browse uploaded novels with tailored typography, reading modes, and saved progress.'}
          </p>

          {/* Tab Selector */}
          <div className="mt-6 flex items-center gap-2 border-b border-line pb-3">
            <button
              type="button"
              onClick={() => setActiveTab('novels')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                activeTab === 'novels' ? 'bg-accent text-white shadow-xs' : 'text-muted hover:text-ink hover:bg-raised'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Webnovels ({novelsCount})</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (!isAuthenticated) {
                  setIsPassModalOpen(true);
                } else {
                  setActiveTab('study');
                }
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                activeTab === 'study' ? 'bg-accent text-white shadow-xs' : 'text-muted hover:text-ink hover:bg-raised'
              }`}
            >
              {isAuthenticated ? <Unlock className="w-4 h-4 text-emerald-400" /> : <Lock className="w-4 h-4 text-amber-500" />}
              <span>Study Materials ({studyCount})</span>
            </button>

            {isAuthenticated && activeTab === 'study' && (
              <button
                type="button"
                onClick={() => {
                  lockAuth();
                  setActiveTab('novels');
                }}
                className="ml-auto text-xs text-muted hover:text-red-400 flex items-center gap-1 cursor-pointer p-1"
                title="Lock study materials"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Lock</span>
              </button>
            )}
          </div>

          {/* Search bar */}
          <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" aria-hidden="true" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search in ${activeTab === 'study' ? 'textbooks' : 'novels'}...`}
                aria-label="Search collection"
                className="w-full bg-page border border-line rounded-xl pl-10 pr-9 py-2 text-sm text-ink placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-muted hover:text-ink cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            {!loading && <span className="text-xs text-muted">Showing {filteredNovels.length} items</span>}
          </div>
        </div>

        {!loading && novels.length > 0 && <RecentReadBanner novels={novels} />}

        {/* Loading skeleton */}
        {loading && (
          <div role="status" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-page border border-line rounded-2xl p-4 space-y-4 animate-pulse">
                <div className="w-full aspect-[16/10] bg-raised rounded-xl" />
                <div className="h-5 bg-raised rounded w-3/4" />
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div role="alert" className="p-8 rounded-2xl bg-page border border-line text-center max-w-md mx-auto my-12">
            <AlertCircle className="w-10 h-10 text-accent mx-auto mb-3" aria-hidden="true" />
            <h2 className="text-base font-semibold text-ink mb-1">Failed to Load Library</h2>
            <button
              type="button"
              onClick={loadNovels}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-accent text-page font-medium text-sm hover:opacity-90"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* Empty search results */}
        {!loading && !error && filteredNovels.length === 0 && (
          <div className="p-12 rounded-2xl bg-page border border-line text-center max-w-md mx-auto my-12">
            <BookX className="w-10 h-10 text-muted mx-auto mb-3" aria-hidden="true" />
            <h2 className="text-base font-semibold text-ink mb-1">No Items Found</h2>
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="px-4 py-2 rounded-xl border border-line bg-raised text-sm font-medium text-ink"
            >
              Clear Search
            </button>
          </div>
        )}

        {/* Grid */}
        {!loading && !error && filteredNovels.length > 0 && (
          <div role="feed" aria-label="Book collection" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNovels.map((novel) => (
              <NovelCard key={novel.id} novel={novel} />
            ))}
          </div>
        )}
      </main>

      <PasswordModal
        isOpen={isPassModalOpen}
        onClose={() => setIsPassModalOpen(false)}
        onSuccess={() => setActiveTab('study')}
      />

      <footer className="border-t border-line bg-page/40 mt-auto py-6">
        <div className="max-w-7xl mx-auto px-4 flex justify-between text-xs text-muted">
          <p>Web Reader &bull; Clean Typography &amp; Multi-Theme Reader</p>
          <a href="#top" className="hover:text-ink">Back to Top</a>
        </div>
      </footer>
    </div>
  );
};
