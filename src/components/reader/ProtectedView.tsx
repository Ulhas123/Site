import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { PasswordModal } from '../home/PasswordModal';

interface ProtectedViewProps {
  title?: string;
}

export const ProtectedView: React.FC<ProtectedViewProps> = ({
  title = 'Protected Study Material',
}) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-page text-ink flex flex-col items-center justify-center p-6 text-center selection:bg-accent/25">
      <div className="max-w-md w-full bg-raised border border-line rounded-2xl p-6 sm:p-8 space-y-4 shadow-xl">
        <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-500">
          <Lock className="w-7 h-7" aria-hidden="true" />
        </div>
        <h1 className="text-xl font-bold text-ink">{title}</h1>
        <p className="text-xs sm:text-sm text-muted">
          This textbook is password protected. Enter passcode 357 to unlock continuous reading and PDF downloads.
        </p>
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex-1 py-2.5 px-4 rounded-xl border border-line text-xs sm:text-sm font-semibold hover:bg-page transition-colors cursor-pointer"
          >
            Back to Library
          </button>
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="flex-1 py-2.5 px-4 bg-accent text-white rounded-xl text-xs sm:text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer"
          >
            Enter Passcode
          </button>
        </div>
      </div>
      <PasswordModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </div>
  );
};
