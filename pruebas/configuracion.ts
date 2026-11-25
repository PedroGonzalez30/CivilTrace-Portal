/**
 * @archivo configuracion.ts
 * @proyecto Civil Trace
 * @descripcion Preparación común de las pruebas: matchers de Testing Library y limpieza.
 * @autor Emilio Manuel Esquivel
 * @fecha 24/11/2026
 * @version 1.0.0
 * @historial 24/11/2026 - Emilio Manuel Esquivel - Creación (feature 004)
 */

// 1. Importaciones
import '@testing-library/jest-dom/vitest';

import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// 4. Preparación
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});
