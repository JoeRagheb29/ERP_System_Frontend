import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * useAuthStore — Global authentication & permissions state.
 *
 * Architecture decisions:
 *
 * 1. Zustand over Redux: For this scope, Zustand provides the same
 *    guarantees with 80% less boilerplate and no Provider wrapper.
 *
 * 2. `persist` middleware: Saves only the JWT token to localStorage.
 *    User profile and permissions are NOT persisted — they are always
 *    re-fetched from the server on page load (via `initializeAuth`).
 *    This prevents stale permission data from living in the browser.
 *
 * 3. `initializeAuth`: Called once on app load. If a token exists in
 *    storage, it fetches fresh user + permission data from the API.
 *    If the token is expired, the 401 interceptor in api/client.js
 *    calls `logout()` automatically.
 */

export const useAuthStore = create(
  persist(
    (set, get) => ({
      // ── State ─────────────────────────────────────────────────────────────
      token: null,
      user: null,
      permissions: null,   // Full UserPermissionsMatrixResponse from /rbac/mypermissions
      isAuthenticated: false,
      isInitializing: true, // True during the boot-time auth check

      // ── Actions ───────────────────────────────────────────────────────────

      /**
       * Called after a successful login response from the backend.
       * Stores the token and immediately fetches user + permissions.
       */
      loginSuccess: (token, user, permissions) => set({
        token: token,
        user: user, 
        permissions: permissions,
        isAuthenticated: true,
        isInitializing: false,
      }),

      /**
       * Re-hydrates session from a persisted token on page reload.
       * Imported and called in main.jsx or App.jsx before rendering routes.
       */
      initializeAuth: async () => {
        const { token } = get();

        if (!token) {
          set({ isInitializing: false });
          return;
        }

        try {
          // Lazy import to avoid circular deps at module load time
          const { getCurrentUser, getMyPermissions } = await import('../api/auth.api');
          const [user, permissions] = await Promise.all([
            getCurrentUser(),
            getMyPermissions(),
          ]);
          set({ user, permissions, isAuthenticated: true, isInitializing: false });
        } catch {
          // Token is invalid or expired — clean up
          get().logout();
        }
      },

      /** Clears all auth state. Called on logout or on a 401 response. */
      logout: () => set({
        token: null,
        user: null,
        permissions: null,
        isAuthenticated: false,
        isInitializing: false,
      }),
    }),

    {
      name: 'erp-auth-storage',
      // IMPORTANT: Only persist the token — never persist permissions or user
      // data, as they must always be re-validated with the server.
      partialize: (state) => ({ token: state.token }),
    }
  )
);