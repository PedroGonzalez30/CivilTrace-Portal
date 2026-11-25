/**
 * @archivo main.tsx
 * @proyecto Civil Trace
 * @descripcion Punto de entrada del portal web del cliente.
 * @autor Emilio Manuel Esquivel
 * @fecha 24/11/2026
 * @version 1.0.0
 * @historial 24/11/2026 - Emilio Manuel Esquivel - Creación (feature 004)
 */

// 1. Importaciones
import '@fontsource/poppins/400.css';
import '@fontsource/poppins/500.css';
import '@fontsource/poppins/600.css';
import '@fontsource/poppins/700.css';
import '@/estilos/tema.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createHashRouter, RouterProvider } from 'react-router';

import { RUTAS } from '@/App';

// 4. Arranque
const raiz = document.getElementById('raiz');
if (raiz) {
  createRoot(raiz).render(
    <StrictMode>
      <RouterProvider router={createHashRouter(RUTAS)} />
    </StrictMode>,
  );
}
