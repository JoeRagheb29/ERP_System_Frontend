import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

/**
 * Application entry point.
 *
 * StrictMode is intentionally left on — it double-invokes lifecycle
 * functions in development to surface side-effect bugs early. It has
 * zero cost in the production build.
 */
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
