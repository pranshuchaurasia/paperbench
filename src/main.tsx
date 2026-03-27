// ================================================================
// FILE: src/main.tsx
// PURPOSE: Application entry point.
// DEPENDENCIES: react, tanstack router, src/routeTree.gen, globals.css
// ================================================================

import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from '@tanstack/react-router';
import { router } from './routeTree.gen';
import './styles/globals.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
