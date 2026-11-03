import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Check, ExternalLink, Search } from 'lucide-react';
import { getLibraryNovels } from '../../data/api';
import type { NovelSummary } from '../../data/novelsRegistry';
import { useProgress } from '../../store/useProgress';
import { Drawer } from '../ui/Drawer';

export interface LibraryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentNovelId?: string;
}

export const LibraryDrawer: React.FC<LibraryDrawerProps> = ({
  isOpen,
  onClose,
  currentNovelId = 'shattered-reach',
}) => {
  const navigate = useNavigate();
  const [novels, setNovels] = useState<NovelSummary[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const getProgress = useProgress((s) => s.getProgress);

  useEffect(() => {
    let mounted = true;
    getLibraryNovels()
      .then((data) => {
        if (mounted) setNovels(data);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, [isOpen]);

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

  const handleSelectNovel = (novel: NovelSummary) => {
    onClose();
    const progress = getProgress(novel.id);
    const targetChapter = progress?.chapterId || novel.firstChapterId || 'chapter-1';
    navigate(`/novel/${novel.id}/chapter/${targetChapter}`);
  };

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="Library & Scraped Novels">
      <div className="flex flex-col h-full space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search novels, authors..."
            aria-label="Search library novels"
            className="w-full bg-raised border border-line rounded-lg pl-9 pr-3 py-2 text-sm text-ink placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          />
        </div>

        {/* Novels List */}
        <div
          role="feed"
          aria-label="Available novels"
          className="flex-1 overflow-y-auto space-y-3 pr-1 focus-visible:outline-none"
        >
          {filteredNovels.map((novel) => {
            const isCurrent = novel.id === currentNovelId;
            const progress = getProgress(novel.id);

            return (
              <article
                key={novel.id}
                aria-current={isCurrent ? 'page' : undefined}
                className={`group relative flex gap-3 p-3 rounded-xl border transition-colors ${
                  isCurrent
                    ? 'border-accent/40 bg-accent/5'
                    : 'border-line bg-page hover:bg-raised'
                }`}
              >
                {/* Cover Preview */}
                <div className="relative w-16 h-24 rounded-md overflow-hidden bg-raised shrink-0 border border-line/60">
                  <img
                    src={novel.cover}
                    alt={`${novel.title} cover`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  {isCurrent && (
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 bg-accent/20 flex items-center justify-center backdrop-blur-[1px]"
                    >
                      <Check className="w-5 h-5 text-accent stroke-[3]" />
                    </div>
                  )}
                </div>

                {/* Meta details */}
                <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="text-sm font-semibold text-ink truncate leading-tight">
                        {novel.title}
                      </h3>
                      {isCurrent && (
                        <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-accent/15 text-accent">
                          Reading
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted truncate mt-0.5">
                      {novel.author}
                    </p>
                    <p className="text-xs text-muted/80 line-clamp-2 mt-1.5 leading-snug">
                      {novel.synopsis}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-line/40">
                    <span className="text-[11px] font-medium text-muted flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
                      {novel.totalChapters.toLocaleString()} chapters
                      {progress && (
                        <span className="text-accent font-semibold ml-1">
                          • {progress.percent}%
                        </span>
                      )}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleSelectNovel(novel)}
                      aria-label={`${isCurrent ? 'Continue reading' : 'Read'} ${novel.title}`}
                      className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-md bg-accent text-page hover:opacity-90 transition-opacity cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    >
                      <span>{isCurrent ? 'Continue' : 'Read'}</span>
                      <ExternalLink className="w-3 h-3" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}

          {filteredNovels.length === 0 && (
            <div className="text-center py-8 text-sm text-muted">
              No novels found matching &ldquo;{searchQuery}&rdquo;.
            </div>
          )}
        </div>

        {/* Home Navigation */}
        <div className="pt-2 border-t border-line/60 flex items-center justify-between">
          <span className="text-[11px] text-muted">{novels.length} novels available</span>
          <button
            type="button"
            onClick={() => {
              onClose();
              navigate('/');
            }}
            className="text-xs text-muted hover:text-ink flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded px-2 py-1 transition-colors"
          >
            <span>All Novels on Home</span>
            <ExternalLink className="w-3 h-3" aria-hidden="true" />
          </button>
        </div>
      </div>
    </Drawer>
  );
};
