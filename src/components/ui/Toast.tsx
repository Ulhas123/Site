import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export interface ToastProps {
  message: string | null;
  onDismiss: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({ message, onDismiss, duration = 5000 }) => {
  useEffect(() => {
    if (!message) return;

    const timer = setTimeout(() => {
      onDismiss();
    }, duration);

    return () => clearTimeout(timer);
  }, [message, duration, onDismiss]);

  if (!message) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-16 left-1/2 -translate-x-1/2 z-50 max-w-sm w-auto px-4 py-2.5 rounded-xl border border-line bg-raised/95 backdrop-blur-md shadow-xl text-ink text-xs sm:text-sm font-medium flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-200 motion-reduce:animate-none"
    >
      <span className="flex-1">{message}</span>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss notification"
        className="text-muted hover:text-ink rounded p-0.5 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-system"
      >
        <X className="w-4 h-4" aria-hidden="true" />
      </button>
    </div>
  );
};
