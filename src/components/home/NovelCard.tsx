import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, CheckCircle2, User } from 'lucide-react';
import type { NovelSummary } from '../../data/novelsRegistry';
import { useProgress } from '../../store/useProgress';

interface NovelCardProps {
  novel: NovelSummary;
}

export const NovelCard: React.FC<NovelCardProps> = ({ novel }) => {
  const getProgress = useProgress((s) => s.getProgress);
  const progress = getProgress(novel.id);

  const hasProgress = Boolean(progress && progress.percent > 0);
  const targetChapter = progress?.chapterId || novel.firstChapterId || 'chapter-1';
  const readUrl = `/novel/${novel.id}/chapter/${targetChapter}`;
  const firstChapterUrl = `/novel/${novel.id}/chapter/${novel.firstChapterId || 'chapter-1'}`;

  // Format chapter display for badge / button
  const currentChapterLabel = progress?.chapterId
    ? progress.chapterId.replace(/^chapter-/, 'Ch. ')
    : null;

  return (
    <article
      aria-label={novel.title}
      className="group flex flex-col bg-page border border-line rounded-2xl overflow-hidden hover:border-accent/50 hover:bg-raised/20 transition-all duration-200 motion-reduce:transition-none shadow-xs"
    >
      {/* Cover and header banner */}
      <div className="relative aspect-[16/10] bg-raised/50 border-b border-line/70 flex items-center justify-center p-4 overflow-hidden">
        {/* Cover image preview */}
        <Link
          to={readUrl}
          tabIndex={-1}
          aria-hidden="true"
          className="relative h-full max-h-52 aspect-[2/3] rounded-lg shadow-md overflow-hidden border border-line group-hover:scale-105 transition-transform duration-300 motion-reduce:transition-none"
        >
          <img
            src={novel.cover}
            alt=""
            loading="lazy"
            className="w-full h-full object-cover"
          />
        </Link>

        {/* Chapters badge */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-page/90 backdrop-blur-xs border border-line text-[11px] font-semibold text-ink shadow-xs">
          <BookOpen className="w-3.5 h-3.5 text-accent" aria-hidden="true" />
          <span>{novel.totalChapters.toLocaleString()} ch</span>
        </div>

        {/* Progress badge if read */}
        {hasProgress && progress && (
          <div className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-accent/15 border border-accent/30 text-[11px] font-semibold text-accent shadow-xs">
            <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{progress.percent}%</span>
          </div>
        )}
      </div>

      {/* Novel details */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Title */}
          <h2 className="text-lg font-bold text-ink leading-snug group-hover:text-accent transition-colors motion-reduce:transition-none line-clamp-1">
            <Link
              to={readUrl}
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm"
            >
              {novel.title}
            </Link>
          </h2>

          {/* Author */}
          <div className="flex items-center gap-1.5 text-xs text-muted mt-1 mb-3">
            <User className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{novel.author}</span>
          </div>

          {/* Synopsis */}
          <p className="text-xs sm:text-sm text-muted/90 line-clamp-3 leading-relaxed">
            {novel.synopsis}
          </p>
        </div>

        {/* Footer Actions */}
        <div className="mt-5 pt-4 border-t border-line/60 flex items-center justify-between gap-2">
          {hasProgress ? (
            <div className="flex items-center gap-1 text-[11px] text-muted truncate">
              <span>Resume at</span>
              <span className="font-semibold text-ink">{currentChapterLabel}</span>
            </div>
          ) : (
            <span className="text-[11px] text-muted">Ready to read</span>
          )}

          <div className="flex items-center gap-2 shrink-0">
            {hasProgress && (
              <Link
                to={firstChapterUrl}
                aria-label={`Start ${novel.title} from Chapter 1`}
                className="px-2.5 py-1.5 rounded-lg border border-line bg-raised text-xs font-medium text-muted hover:text-ink hover:border-accent/40 transition-colors motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-system"
              >
                Ch. 1
              </Link>
            )}

            <Link
              to={readUrl}
              aria-label={`${hasProgress ? 'Continue reading' : 'Start reading'} ${novel.title}`}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-accent text-page font-semibold text-xs hover:opacity-90 transition-opacity motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-page"
            >
              <span>{hasProgress ? 'Continue' : 'Read Now'}</span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
};
