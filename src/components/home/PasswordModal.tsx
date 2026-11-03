import React, { useState } from 'react';
import { KeyRound, Lock, ShieldAlert } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { useAuth } from '../../store/useAuth';

interface PasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  title?: string;
  description?: string;
}

export const PasswordModal: React.FC<PasswordModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  title = 'Password Protected Study Material',
  description = 'Please enter the access code to view protected engineering and science textbooks.',
}) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const unlock = useAuth((s) => s.unlock);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (unlock(password)) {
      setError(false);
      setPassword('');
      onClose();
      onSuccess?.();
    } else {
      setError(true);
    }
  };

  const handleClose = () => {
    setError(false);
    setPassword('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={title}
      description={description}
      maxWidthClass="max-w-md"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div className="flex items-center gap-3 p-3 bg-system/10 border border-system/30 rounded-xl text-xs sm:text-sm text-ink/90">
          <Lock className="w-5 h-5 text-accent shrink-0" aria-hidden="true" />
          <p>This textbook section requires verification to access study documents and PDF downloads.</p>
        </div>

        <div>
          <label htmlFor="study-passcode" className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">
            Access Passcode
          </label>
          <div className="relative">
            <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" aria-hidden="true" />
            <input
              id="study-passcode"
              type="password"
              autoFocus
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError(false);
              }}
              placeholder="Enter passcode..."
              className="w-full bg-page border border-line rounded-xl pl-10 pr-4 py-2.5 text-sm text-ink placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-colors"
            />
          </div>
          {error && (
            <p className="flex items-center gap-1.5 text-xs text-red-500 font-medium mt-1.5" role="alert">
              <ShieldAlert className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              Incorrect passcode. Please try again.
            </p>
          )}
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-xs sm:text-sm font-medium rounded-xl text-muted hover:text-ink hover:bg-raised transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-system cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-accent text-white hover:opacity-95 transition-opacity shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 cursor-pointer"
          >
            Unlock Materials
          </button>
        </div>
      </form>
    </Modal>
  );
};
