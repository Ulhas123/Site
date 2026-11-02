import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

interface ChapterErrorProps {
  chapterId: string;
  chapterNumber?: number;
  errorMessage?: string;
  onRetry: () => void;
}

export const ChapterError: React.FC<ChapterErrorProps> = ({
  chapterNumber,
  errorMessage,
  onRetry,
}) => {
  return (
    <div
      role="alert"
      className="my-8 p-6 sm:p-8 rounded-xl border border-line bg-raised/90 text-center max-w-md mx-auto space-y-4 shadow-sm"
    >
      <div className="w-12 h-12 rounded-full bg-accent/10 border border-accent/20 text-accent flex items-center justify-center mx-auto">
        <AlertCircle className="w-6 h-6" aria-hidden="true" />
      </div>

      <div className="space-y-1">
        <h3 className="text-base sm:text-lg font-bold text-ink">
          {chapterNumber ? `Failed to load Chapter ${chapterNumber}` : 'Failed to load chapter'}
        </h3>
        <p className="text-xs sm:text-sm text-muted">
          {errorMessage || 'A network error occurred while retrieving this chapter.'}
        </p>
      </div>

      <button
        type="button"
        onClick={onRetry}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-page text-ink border border-line hover:border-accent hover:text-accent shadow-xs cursor-pointer transition-colors focus-visible:ring-2 focus-visible:ring-system focus-visible:outline-none"
      >
        <RotateCcw className="w-4 h-4" aria-hidden="true" />
        <span>Try Again</span>
      </button>
    </div>
  );
};
