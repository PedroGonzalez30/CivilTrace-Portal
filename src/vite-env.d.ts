/**
 * @archivo vite-env.d.ts
 * @proyecto Civil Trace
 * @descripcion Tipos de las variables de entorno que Vite expone al portal.
 * @autor Emilio Manuel Esquivel
 * @fecha 24/11/2026
 * @version 1.0.0
 * @historial 24/11/2026 - Emilio Manuel Esquivel - Creación (feature 004)
 */

/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_URL_API?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
