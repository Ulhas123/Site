import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookMarked, Sparkles } from 'lucide-react';
import type { NovelSummary } from '../../data/novelsRegistry';
import { useProgress } from '../../store/useProgress';

interface RecentReadBannerProps {
  novels: NovelSummary[];
}

export const RecentReadBanner: React.FC<RecentReadBannerProps> = ({ novels }) => {
  const progressByNovel = useProgress((s) => s.progressByNovel);

  // Find the novel with the most recent progress
  const recentEntry = Object.entries(progressByNovel).reduce<
    { novelId: string; updatedAt: number } | null
  >((latest, [novelId, prog]) => {
    if (!prog || !prog.updatedAt) return latest;
    if (!latest || prog.updatedAt > latest.updatedAt) {
      return { novelId, updatedAt: prog.updatedAt };
    }
    return latest;
  }, null);

  if (!recentEntry) return null;

  const currentNovel = novels.find((n) => n.id === recentEntry.novelId);
  const currentProgress = progressByNovel[recentEntry.novelId];
  if (!currentNovel || !currentProgress) return null;

  const targetChapter = currentProgress.chapterId || currentNovel.firstChapterId || 'chapter-1';
  const targetChapterLabel = targetChapter.replace(/^chapter-/, 'Chapter ');
  const readUrl = `/novel/${currentNovel.id}/chapter/${targetChapter}`;

  return (
    <aside
      aria-label="Continue reading last book"
      className="mb-8 p-4 sm:p-5 rounded-2xl bg-raised border border-accent/30 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
    >
      <div className="flex items-center gap-3.5 min-w-0">
        <div className="w-12 h-16 rounded-lg overflow-hidden border border-line bg-page shrink-0 shadow-xs">
          <img
            src={currentNovel.cover}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-accent mb-0.5">
            <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
            <span>PICK UP WHERE YOU LEFT OFF</span>
          </div>
          <h3 className="text-sm sm:text-base font-bold text-ink truncate">
            {currentNovel.title}
          </h3>
          <p className="text-xs text-muted flex items-center gap-2 mt-0.5">
            <span>{targetChapterLabel}</span>
            <span>•</span>
            <span className="font-medium text-accent">{currentProgress.percent}% completed</span>
          </p>
        </div>
      </div>

      <Link
        to={readUrl}
        aria-label={`Resume reading ${currentNovel.title} at ${targetChapterLabel}`}
        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-accent text-page font-semibold text-sm hover:opacity-90 transition-opacity motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-page shrink-0"
      >
        <BookMarked className="w-4 h-4" aria-hidden="true" />
        <span>Resume Reading</span>
        <ArrowRight className="w-4 h-4" aria-hidden="true" />
      </Link>
    </aside>
  );
};
