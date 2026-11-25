/**
 * @archivo playwright.config.ts
 * @proyecto Civil Trace
 * @descripcion Pruebas de punta a punta del portal (constitución III.3): el portal real en Vite
 *   contra una API simulada con page.route, en el ancho de celular del Figma (412 px).
 * @autor Emilio Manuel Esquivel
 * @fecha 24/11/2026
 * @version 1.0.0
 * @requerimientos Constitución III (pruebas primero)
 * @historial 24/11/2026 - Emilio Manuel Esquivel - Creación (feature 004)
 */

// 1. Importaciones
import { defineConfig, devices } from '@playwright/test';

// 3. Constantes del módulo
const PUERTO = 4173;
const URL_API_PRUEBA = 'https://api.prueba';

// 4. Configuración principal
export default defineConfig({
  testDir: 'e2e',
  fullyParallel: false,
  workers: 1,
  reporter: [['list']],
  use: {
    baseURL: `http://localhost:${PUERTO}`,
    viewport: { width: 412, height: 917 },
    hasTouch: true,
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'celular',
      use: { ...devices['Desktop Chrome'], viewport: { width: 412, height: 917 } },
    },
  ],
  webServer: {
    command: `npx vite --port ${PUERTO} --strictPort`,
    url: `http://localhost:${PUERTO}`,
    reuseExistingServer: false,
    env: { VITE_URL_API: URL_API_PRUEBA },
  },
});
