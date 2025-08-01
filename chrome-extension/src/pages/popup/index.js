import React from 'react';
import { createRoot } from 'react-dom/client';
import Popup from './Popup';

// Create root and render the Popup component
const container = document.getElementById('root');
const root = createRoot(container);
root.render(<Popup />); 