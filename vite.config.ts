/**
 * @archivo vite.config.ts
 * @proyecto Civil Trace
 * @descripcion Configuración de Vite y de Vitest del portal web del cliente.
 * @autor Emilio Manuel Esquivel
 * @fecha 24/11/2026
 * @version 1.0.0
 * @requerimientos Constitución III (pruebas primero)
 * @historial 24/11/2026 - Emilio Manuel Esquivel - Creación (feature 004)
 */

// 1. Importaciones
import { fileURLToPath } from 'node:url';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

// 3. Constantes del módulo
const UMBRAL_COBERTURA_LINEAS = 60;

// 4. Configuración principal
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  server: { port: 5173 },
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['pruebas/**/*.test.{ts,tsx}'],
    setupFiles: ['pruebas/configuracion.ts'],
    env: { VITE_URL_API: 'https://api.prueba' },
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/main.tsx', 'src/**/*.d.ts'],
      thresholds: { lines: UMBRAL_COBERTURA_LINEAS },
    },
  },
});
