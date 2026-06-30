import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../../../api/auth.api';

/**
 * useRegister — Encapsulates the full registration flow.
 *
 * On success: navigates to /login with a state flag so the login
 * page can show a "Registration successful" confirmation banner.
 *
 * Error handling maps backend responses to user-friendly messages:
 *  - Pydantic validation errors (422) → list of field messages
 *  - Conflict errors (409)            → "already taken" messages
 *  - Network errors                   → generic fallback
 */

export function useRegister() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState('');
  const navigate = useNavigate();

  const register = async (formData) => {
    setIsLoading(true);
    setError('');

    try {
      await registerUser(formData);
      // Navigate to login and signal that registration just completed
      navigate('/login', { state: { registered: true } });

    } catch (err) {
      const status = err.response?.status;
      const detail = err.response?.data?.detail;

      if (status === 409) {
        // Unique constraint violations (username / email / phone already taken)
        setError(typeof detail === 'string' ? detail : 'An account with these details already exists.');

      } else if (status === 422 && Array.isArray(detail)) {
        // FastAPI / Pydantic validation errors — each item has { msg, loc }
        const messages = detail.map((e) => e.msg.replace(/^Value error, /, '')).join(' · ');
        setError(messages);

      } else if (typeof detail === 'string') {
        setError(detail);

      } else {
        setError('Unable to complete registration. Please check your details and try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return { register, isLoading, error };
}