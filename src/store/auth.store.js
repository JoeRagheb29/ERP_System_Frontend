import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getCurrentUser, getMyPermissions } from '../api/auth.api';

const initialState = {
  token: null,
  user: null,
  permissions: null,
  isAuthenticated: false,
  isInitializing: true,
};

export const useAuthStore = create(
  persist(
    (set, get) => ({
      ...initialState,

      loginSuccess: (token, user, permissions) =>
        set({
          token,
          user,
          permissions,
          isAuthenticated: true,
          isInitializing: false,
        }),

      logout: () =>
        set({
          ...initialState,
          isInitializing: false,
        }),

      initializeAuth: async () => {
        const token = get().token;

        if (!token) {
          set({
            ...initialState,
            isInitializing: false,
          });
          return;
        }

        set({ isInitializing: true });

        try {
          const [user, permissions] = await Promise.all([
            getCurrentUser(),
            getMyPermissions(),
          ]);

          set({
            token,
            user,
            permissions,
            isAuthenticated: true,
            isInitializing: false,
          });
        } catch (error) {
          set({
            ...initialState,
            isInitializing: false,
          });
          throw error;
        }
      },
    }),
    {
      name: 'erp-auth-store',
      partialize: (state) => ({ token: state.token }),
    }
  )
);