import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export enum TierType {
  FREE = 'FREE',
  PRO = 'PRO',
  ENTERPRISE = 'ENTERPRISE',
}

interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  plan?: 'free' | 'pro' | 'enterprise';
  tokens?: number;
  userQuota?: {
    quota: number;
    resetTime: Date;
    tierType: TierType;
    refillQuota: number;
    usedQuota: number;
    quotaTotal: number;
    tierMessage: {
      startTime: Date;
      tier: TierType;
      resetTime: Date;
    };
  };
}

interface UserState {
  user: User | null;
  token: string | null;
  isLoginModalOpen: boolean;
  isLoading: boolean;
  rememberMe: boolean;
  
  // Actions
  setUser: (user: User) => void;
  clearUser: () => void;
  setToken: (token: string) => void;
  clearToken: () => void;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  setLoading: (loading: boolean) => void;
  setRememberMe: (remember: boolean) => void;
  fetchUser: () => Promise<void>;
  login: (user: User, token: string) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoginModalOpen: false,
      isLoading: false,
      rememberMe: false,

      setUser: (user: User) => {
        set({ user });
      },

      clearUser: () => {
        set({ user: null, token: null });
        localStorage.removeItem('token');
      },

      setToken: (token: string) => {
        set({ token });
        localStorage.setItem('token', token);
      },

      clearToken: () => {
        set({ token: null });
        localStorage.removeItem('token');
      },

      openLoginModal: () => {
        set({ isLoginModalOpen: true });
      },

      closeLoginModal: () => {
        set({ isLoginModalOpen: false });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      setRememberMe: (remember: boolean) => {
        set({ rememberMe: remember });
      },

      fetchUser: async () => {
        const { token } = get();
        if (!token) return;

        try {
          set({ isLoading: true });
          
          // Mock API call - replace with actual API
          const response = await fetch('/api/user/profile', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const userData = await response.json();
            set({ user: userData });
          } else {
            // Token might be invalid
            get().clearUser();
          }
        } catch (error) {
          console.error('Failed to fetch user:', error);
          get().clearUser();
        } finally {
          set({ isLoading: false });
        }
      },

      login: (user: User, token: string) => {
        set({ user, token });
        localStorage.setItem('token', token);
      },

      logout: () => {
        set({ user: null, token: null });
        localStorage.removeItem('token');
      },

      isAuthenticated: () => {
        const { user, token } = get();
        return Boolean(user && token);
      },
    }),
    {
      name: 'user-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        rememberMe: state.rememberMe,
      }),
    }
  )
);

export default useUserStore;
