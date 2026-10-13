import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { MaskEditor } from './MaskEditor';
import '../../src/styles.css';
import './editor.css';
createRoot(document.getElementById('root')!).render(<StrictMode><MaskEditor /></StrictMode>);
