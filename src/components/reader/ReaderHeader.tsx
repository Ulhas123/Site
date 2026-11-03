import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bookmark, Library, Maximize, Minimize } from 'lucide-react';
import { useProgress } from '../../store/useProgress';
import { useUI } from '../../store/useUI';

interface ReaderHeaderProps {
  novelId: string;
  novelTitle: string;
  novelCover: string;
  chapterId: string;
  chapterTitle: string;
  isVisible: boolean;
  onBack?: () => void;
  onOpenLibrary?: () => void;
}

export const ReaderHeader: React.FC<ReaderHeaderProps> = ({
  novelId,
  novelTitle,
  novelCover,
  chapterId,
  chapterTitle,
  isVisible,
  onBack,
  onOpenLibrary,
}) => {
  const navigate = useNavigate();
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [fullscreenSupported] = useState<boolean>(() => {
    if (typeof document !== 'undefined') {
      return Boolean(
        document.fullscreenEnabled ||
          (document as unknown as { webkitFullscreenEnabled?: boolean }).webkitFullscreenEnabled
      );
    }
    return false;
  });

  const bookmarks = useProgress((s) => s.bookmarks);
  const addBookmark = useProgress((s) => s.addBookmark);
  const removeBookmark = useProgress((s) => s.removeBookmark);

  // Check if current chapter has a bookmark
  const existingBookmark = bookmarks.find(
    (b) => b.novelId === novelId && b.chapterId === chapterId
  );
  const isBookmarked = Boolean(existingBookmark);

  const handleToggleBookmark = () => {
    if (existingBookmark) {
      removeBookmark(existingBookmark.id);
    } else {
      addBookmark({
        novelId,
        chapterId,
        snippet: chapterTitle,
      });
    }
  };

  // Listen to fullscreen changes
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const handleFullscreenChange = () => {
        setIsFullscreen(Boolean(document.fullscreenElement));
      };

      document.addEventListener('fullscreenchange', handleFullscreenChange);
      return () => {
        document.removeEventListener('fullscreenchange', handleFullscreenChange);
      };
    }
  }, []);

  const handleToggleFullscreen = async () => {
    if (typeof document === 'undefined') return;
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {
      // Gracefully handle rejection (e.g. user denied or iframe restrictions)
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/styleguide');
    }
  };

  const handleLibrary = () => {
    if (onOpenLibrary) {
      onOpenLibrary();
    } else {
      useUI.getState().openPanel('library');
    }
  };

  return (
    <header
      role="banner"
      className={`fixed top-0 left-0 right-0 h-14 z-40 bg-page/85 backdrop-blur-md border-b border-line text-ink transition-transform duration-200 ease-in-out motion-reduce:transition-none will-change-transform ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div className="h-full max-w-7xl mx-auto px-3 sm:px-4 flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Back button & Cover thumbnail */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          <button
            type="button"
            onClick={handleBack}
            aria-label="Back"
            className="p-2 -ml-1 text-muted hover:text-ink rounded-lg hover:bg-raised transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-system focus-visible:outline-none shrink-0"
          >
            <ArrowLeft className="w-5 h-5" aria-hidden="true" />
          </button>

          {novelCover && (
            <img
              src={novelCover}
              alt={novelTitle}
              className="w-7 h-9 rounded object-cover border border-line shrink-0 select-none hidden xs:block"
            />
          )}

          {/* Novel & Chapter Titles */}
          <div className="min-w-0 flex-1">
            <p className="text-[11px] sm:text-xs text-muted truncate font-medium leading-tight">
              {novelTitle}
            </p>
            <h1 className="text-xs sm:text-sm font-semibold text-ink truncate leading-tight">
              {chapterTitle}
            </h1>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Bookmark */}
          <button
            type="button"
            onClick={handleToggleBookmark}
            aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark this chapter'}
            aria-pressed={isBookmarked}
            className={`p-2 rounded-lg transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-system focus-visible:outline-none ${
              isBookmarked
                ? 'text-accent bg-accent/10 hover:bg-accent/20'
                : 'text-muted hover:text-ink hover:bg-raised'
            }`}
          >
            <Bookmark
              className={`w-4 h-4 sm:w-5 sm:h-5 ${isBookmarked ? 'fill-accent' : ''}`}
              aria-hidden="true"
            />
          </button>

          {/* Fullscreen (feature-checked) */}
          {fullscreenSupported && (
            <button
              type="button"
              onClick={handleToggleFullscreen}
              aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
              className="p-2 text-muted hover:text-ink rounded-lg hover:bg-raised transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-system focus-visible:outline-none"
            >
              {isFullscreen ? (
                <Minimize className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
              ) : (
                <Maximize className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
              )}
            </button>
          )}

          {/* Library / Index */}
          <button
            type="button"
            onClick={handleLibrary}
            aria-label="Library"
            className="p-2 text-muted hover:text-ink rounded-lg hover:bg-raised transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-system focus-visible:outline-none"
          >
            <Library className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </header>
  );
};
