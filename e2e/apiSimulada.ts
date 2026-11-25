/**
 * @archivo apiSimulada.ts
 * @proyecto Civil Trace
 * @descripcion API falsa para las pruebas de Playwright: responde las rutas /portal con datos de
 *   una obra y guarda lo que el portal manda al aceptar u observar.
 * @autor Emilio Manuel Esquivel
 * @fecha 24/11/2026
 * @version 1.0.0
 * @historial 24/11/2026 - Emilio Manuel Esquivel - Creación (feature 004)
 */

// 1. Importaciones
import type { Page } from '@playwright/test';

// 2. Tipos e interfaces
export interface EstadoApi {
  estado: 'ENVIADA' | 'ACEPTADA' | 'CON_OBSERVACIONES';
  cuerpoRespuesta: Record<string, unknown> | null;
}

// 3. Constantes del módulo
export const TOKEN = 'token-prueba-0123456789abcdefghijklmnopqrstuvwx';
export const CODIGO = '123456';
const PNG_1X1 = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
  'base64',
);
const ACTIVIDAD = {
  id: 'a1',
  nombre: 'Pisos y puertas',
  descripcion: 'Colocar loseta en el pasillo',
  estado: 'TERMINADA',
  fechaEntrega: '2026-11-05',
  fechaTerminada: '2026-11-05',
  fotos: [{ id: 'f1', comentario: 'Piso terminado', fechaRegistro: '2026-11-04T18:00:00.000Z' }],
};

// 4. Funciones
/**
 * Conecta la API falsa a la página.
 *
 * @returns El estado, que cambia cuando el portal acepta u observa.
 */
export async function conectarApiSimulada(pagina: Page): Promise<EstadoApi> {
  const api: EstadoApi = { estado: 'ENVIADA', cuerpoRespuesta: null };
  const detalle = () => ({
    id: 'e1',
    estado: api.estado,
    fechaInicio: '2026-11-01',
    fechaFin: '2026-11-05',
    enviadaEn: '2026-11-05T18:00:00.000Z',
    nombreCliente: api.cuerpoRespuesta?.['nombre'] ?? null,
    observaciones: api.cuerpoRespuesta?.['observaciones'] ?? null,
    respondidaEn: api.estado === 'ENVIADA' ? null : '2026-11-12T17:42:00.000Z',
    tieneActa: api.estado === 'ACEPTADA',
    actividades: [ACTIVIDAD],
  });

  await pagina.route('https://api.prueba/portal/**', async (ruta) => {
    const peticion = ruta.request();
    if (peticion.headers()['x-token-portal'] !== TOKEN) {
      return ruta.fulfill({ status: 404, json: { mensaje: 'Este enlace no es válido.' } });
    }
    const camino = new URL(peticion.url()).pathname.replace('/portal', '');
    const clave = `${peticion.method()} ${camino}`;
    switch (clave) {
      case 'GET /obra':
        return ruta.fulfill({
          json: {
            nombre: 'Hospital',
            cliente: 'Secretaría de Salud',
            direccion: 'Av. Reforma',
            fechaInicio: '2026-11-01',
            fechaFinal: '2027-06-30',
            empresa: { nombre: 'Todo Concreto', tieneLogo: false },
          },
        });
      case 'GET /entregas':
        return ruta.fulfill({
          json: [{ ...detalle(), actividades: 1, fotos: 1 }],
        });
      case 'GET /avances':
        return ruta.fulfill({ json: [ACTIVIDAD] });
      case 'GET /entregas/e1':
        return ruta.fulfill({ json: detalle() });
      case 'GET /fotos/f1':
      case 'GET /entregas/e1/firma':
        return ruta.fulfill({ body: PNG_1X1, contentType: 'image/png' });
      case 'POST /entregas/e1/codigo':
        return ruta.fulfill({ status: 202, json: { correo: 'cl***@ejemplo.com', venceEn: '' } });
      case 'POST /entregas/e1/codigo/comprobar':
        return peticion.postDataJSON().codigo === CODIGO
          ? ruta.fulfill({ json: { valido: true } })
          : ruta.fulfill({
              status: 400,
              json: {
                mensaje: 'Código incorrecto. Te quedan 4 intentos',
                motivo: 'CODIGO_INCORRECTO',
              },
            });
      case 'POST /entregas/e1/aceptar':
        api.estado = 'ACEPTADA';
        api.cuerpoRespuesta = peticion.postDataJSON();
        return ruta.fulfill({ json: detalle() });
      case 'POST /entregas/e1/observaciones':
        api.estado = 'CON_OBSERVACIONES';
        api.cuerpoRespuesta = peticion.postDataJSON();
        return ruta.fulfill({ json: detalle() });
      case 'GET /entregas/e1/acta.pdf':
        return ruta.fulfill({ body: '%PDF-1.7 acta', contentType: 'application/pdf' });
      default:
        return ruta.fulfill({ status: 404, json: { mensaje: 'No existe' } });
    }
  });
  return api;
}

/** Dibuja un trazo dentro del recuadro de firma. */
export async function dibujarFirma(pagina: Page, etiqueta: string): Promise<void> {
  const caja = await pagina.getByRole('img', { name: etiqueta }).boundingBox();
  if (!caja) {
    throw new Error('No se encontró el recuadro de firma');
  }
  await pagina.mouse.move(caja.x + 30, caja.y + 40);
  await pagina.mouse.down();
  await pagina.mouse.move(caja.x + 120, caja.y + 90, { steps: 8 });
  await pagina.mouse.move(caja.x + 200, caja.y + 50, { steps: 8 });
  await pagina.mouse.up();
}
