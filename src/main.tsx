if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual';
}

import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { PrivacyPolicy } from './Privacy.tsx';
import './index.css';

function Root() {
  const path = window.location.pathname;
  if (path === '/privacy' || path.endsWith('/privacy')) {
    return <PrivacyPolicy />;
  }
  return <App />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
