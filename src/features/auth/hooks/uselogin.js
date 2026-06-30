import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser, getCurrentUser, getMyPermissions } from '../../../api/auth.api';
import { useAuthStore } from '../../../store/auth.store';

/**
 * useLogin — Encapsulates the full login flow.
 *
 * Why a custom hook instead of inline logic in LoginPage?
 *   The login flow involves 3 sequential API calls, error mapping,
 *   store updates, and navigation — that's business logic, not UI.
 *   Extracting it here keeps LoginPage a pure presentational component
 *   and makes the flow independently testable.
 *
 * Flow:
 *   1. POST /auth/login        → get JWT token
 *   2. GET  /users/me          → get user profile
 *   3. GET  /rbac/mypermissions → get permission matrix
 *   4. Store all three in Zustand, navigate to dashboard
 */
export function useLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const loginSuccess = useAuthStore((s) => s.loginSuccess);
  const navigate = useNavigate();

  const login = async (username, password) => {
    setIsLoading(true);
    setError('');

    try {
      // Step 1: Authenticate and get the token
      const { access_token } = await loginUser(username, password);

      // Temporarily attach the token to the store so the next requests
      // (getCurrentUser, getMyPermissions) can use the auth interceptor.
      // We use getState().loginSuccess at the end to commit everything atomically.
      useAuthStore.setState({ token: access_token });

      // Steps 2 & 3: Fetch profile + permissions in parallel
      const [user, permissions] = await Promise.all([
        getCurrentUser(),
        getMyPermissions(),
      ]);

      // Commit everything atomically — one state update, one re-render
      loginSuccess(access_token, user, permissions);
      navigate('/', { replace: true });

    } catch (err) {
      const status = err.response?.status;
      const detail = err.response?.data?.detail;

      if (status === 401) {
        setError('Incorrect username or password.');
      } else if (status === 403) {
        setError('Your account has been deactivated. Contact your administrator.');
      } else if (detail) {
        setError(detail);
      } else {
        setError('Unable to connect to the server. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return { login, isLoading, error };
}