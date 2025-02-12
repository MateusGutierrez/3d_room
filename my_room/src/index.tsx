import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import App from './App';
import { Loader } from '@react-three/drei';

createRoot(document.getElementById('root') as HTMLDivElement).render(
  <StrictMode>
    <App />
    <Loader />
  </StrictMode>
);
