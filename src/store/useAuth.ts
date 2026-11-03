import { create } from 'zustand';
import { getSafeStorage } from './storage';

const STORAGE_KEY = 'study_materials_auth';
const CORRECT_PASS = '357';

interface AuthState {
  isAuthenticated: boolean;
  unlock: (password: string) => boolean;
  lock: () => void;
}

export const useAuth = create<AuthState>((set) => ({
  isAuthenticated: (() => {
    try {
      const storage = getSafeStorage();
      return storage.getItem(STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  })(),

  unlock: (password: string) => {
    if (password.trim() === CORRECT_PASS) {
      try {
        const storage = getSafeStorage();
        storage.setItem(STORAGE_KEY, 'true');
      } catch {
        // Fallback for storage write failure
      }
      set({ isAuthenticated: true });
      return true;
    }
    return false;
  },

  lock: () => {
    try {
      const storage = getSafeStorage();
      storage.removeItem(STORAGE_KEY);
    } catch {
      // Fallback
    }
    set({ isAuthenticated: false });
  },
}));
