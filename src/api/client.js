import axios from 'axios';
import { useAuthStore } from '../store/auth.store';

/**
 * apiClient — Shared Axios instance for all ERP API calls.
 *
 * Interceptors handle two cross-cutting concerns so every
 * individual API function stays clean:
 *
 * REQUEST: Attaches the Bearer token from the auth store.
 *   We read from the store's state directly (not a React hook)
 *   so this works outside of React components too.
 *
 * RESPONSE: On a 401, triggers a global logout and redirects to
 *   /login. This means expired tokens are handled once, centrally,
 *   rather than with try/catch in every feature.
 */

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15_000,
});

// ── Request: inject Bearer token ──────────────────────────────────────────────
apiClient.interceptors.request.use(
  (config) => {
    // getState() is safe to call outside React — Zustand is not hook-only
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Let axios/browser set the correct Content-Type for FormData requests.
    // Without this, the instance default "application/json" sticks and
    // multipart uploads (import, photo, attachments) fail with 422.
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response: global error handling ──────────────────────────────────────────
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or revoked — force re-login
      useAuthStore.getState().logout();
      window.location.replace('/login');
    }
    return Promise.reject(error);
  }
);

export default apiClient;