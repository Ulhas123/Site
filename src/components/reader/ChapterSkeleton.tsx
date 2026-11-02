import React from 'react';

interface ChapterSkeletonProps {
  chapterNumber?: number;
}

export const ChapterSkeleton: React.FC<ChapterSkeletonProps> = ({ chapterNumber }) => {
  return (
    <div
      aria-busy="true"
      aria-label={chapterNumber ? `Loading Chapter ${chapterNumber}` : 'Loading Chapter'}
      className="space-y-6 py-8 animate-pulse"
    >
      {/* Chapter header skeleton */}
      <div className="space-y-3 pb-6 border-b border-line">
        <div className="h-4 w-28 bg-raised rounded-md" />
        <div className="h-7 w-3/4 max-w-md bg-raised rounded-lg" />
        <div className="h-3.5 w-48 bg-raised/80 rounded-md" />
      </div>

      {/* Paragraph blocks */}
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="h-4 w-full bg-raised rounded" />
          <div className="h-4 w-[96%] bg-raised rounded" />
          <div className="h-4 w-[88%] bg-raised rounded" />
        </div>

        <div className="space-y-2">
          <div className="h-4 w-[98%] bg-raised rounded" />
          <div className="h-4 w-[94%] bg-raised rounded" />
          <div className="h-4 w-[72%] bg-raised rounded" />
        </div>

        {/* System block skeleton */}
        <div className="p-4 border border-system/30 bg-system/5 rounded-lg space-y-2 my-4">
          <div className="h-4 w-40 bg-system/20 rounded" />
          <div className="h-3 w-5/6 bg-system/15 rounded" />
          <div className="h-3 w-4/6 bg-system/15 rounded" />
        </div>

        <div className="space-y-2">
          <div className="h-4 w-full bg-raised rounded" />
          <div className="h-4 w-[91%] bg-raised rounded" />
          <div className="h-4 w-[60%] bg-raised rounded" />
        </div>
      </div>
    </div>
  );
};
