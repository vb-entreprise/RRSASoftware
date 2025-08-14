import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

document.title = 'RRSAINDIA - Animal Hospital Management System';

createRoot(document.getElementById('root')!).render(
  <App />
);