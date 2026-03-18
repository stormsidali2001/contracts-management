import { create } from 'zustand';
import { DisplayUser } from '@/features/auth/models/DisplayUser.interface';
import authService from '@/features/auth/services/auth.service';

interface AuthStore {
  user: DisplayUser | null;
  jwt: string | null;
  isAuthenticated: boolean;
  setCredentials: (user: DisplayUser, jwt: string) => void;
  clearCredentials: () => void;
  setImageUrl: (imageUrl: string) => void;
  refresh: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  jwt: null,
  isAuthenticated: false,

  setCredentials: (user, jwt) => set({ user, jwt, isAuthenticated: true }),

  clearCredentials: () => set({ user: null, jwt: null, isAuthenticated: false }),

  setImageUrl: (imageUrl) =>
    set((state) => ({
      user: state.user ? { ...state.user, imageUrl } : state.user,
    })),

  refresh: async () => {
    const data = await authService.refresh();
    set({ user: data.user ?? null, jwt: data.jwt, isAuthenticated: true });
  },
}));
