import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

if (typeof window !== 'undefined') {
  try {
    localStorage.setItem('hacky_app_version', 'v2_' + Date.now());
  } catch {}
}

createRoot(document.getElementById('root')!).render(<App />);
