/**
 * @archivo clientePortal.test.ts
 * @proyecto Civil Trace
 * @descripcion Pruebas de la conexión del portal con la API: token en el encabezado, errores en
 *   español y falta de conexión.
 * @autor Emilio Manuel Esquivel
 * @fecha 24/11/2026
 * @version 1.0.0
 * @requerimientos RF-65 Enviar enlace del portal al cliente
 * @historial 24/11/2026 - Emilio Manuel Esquivel - Creación (feature 004)
 */

// 1. Importaciones
import { describe, expect, it, vi } from 'vitest';

import { aceptarEntrega, ErrorPortal, obtenerArchivo, obtenerObra } from '@/conexion/clientePortal';

import { simularApi } from './apoyo';

// 4. Pruebas
describe('clientePortal', () => {
  it('CP16-PORTAL-A9 manda el token en X-Token-Portal y no usa cookies', async () => {
    const peticiones = simularApi({ 'GET /obra': () => ({ cuerpo: { nombre: 'Hospital' } }) });

    await expect(obtenerObra('tkn')).resolves.toMatchObject({ nombre: 'Hospital' });

    expect(peticiones[0]).toMatchObject({ metodo: 'GET', ruta: '/obra', token: 'tkn' });
    const opciones = vi.mocked(fetch).mock.calls[0]?.[1];
    expect(opciones?.credentials).toBe('omit');
    expect(String(vi.mocked(fetch).mock.calls[0]?.[0])).toBe('https://api.prueba/portal/obra');
  });

  it('CP17-A7 convierte los errores de la API en ErrorPortal con su motivo', async () => {
    simularApi({
      'POST /entregas/e1/aceptar': () => ({
        estado: 400,
        cuerpo: { mensaje: 'Código incorrecto. Te quedan 4 intentos', motivo: 'CODIGO_INCORRECTO' },
      }),
    });

    const error = await aceptarEntrega('tkn', 'e1', {
      codigo: '1',
      nombre: 'Ana',
      firmaPng: 'x',
    }).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ErrorPortal);
    expect(error).toMatchObject({
      message: 'Código incorrecto. Te quedan 4 intentos',
      estado: 400,
      motivo: 'CODIGO_INCORRECTO',
    });
  });

  it('CP16-PORTAL-A10 sin conexión o con respuesta sin JSON muestra un mensaje claro', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
    await expect(obtenerObra('tkn')).rejects.toThrow('No se pudo conectar con el servidor');

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('caída', { status: 500 })));
    await expect(obtenerObra('tkn')).rejects.toThrow('Ocurrió un error inesperado');
  });

  it('CP17-E8-PORTAL descarga archivos protegidos como Blob', async () => {
    simularApi({
      'GET /entregas/e1/acta.pdf': () => ({
        binario: new Blob(['%PDF-1.7'], { type: 'application/pdf' }),
      }),
    });

    const archivo = await obtenerArchivo('tkn', '/entregas/e1/acta.pdf');

    expect(await archivo.text()).toBe('%PDF-1.7');
  });
});
