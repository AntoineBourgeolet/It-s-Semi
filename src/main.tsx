import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { PrivacyPolicy } from './Privacy.tsx';
import './index.css';

function Root() {
  if (window.location.pathname === '/privacy') {
    return <PrivacyPolicy />;
  }
  return <App />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
