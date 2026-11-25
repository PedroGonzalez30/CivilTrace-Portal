/**
 * @archivo apoyo.ts
 * @proyecto Civil Trace
 * @descripcion Dobles para las pruebas del portal: una API falsa sobre fetch y un lienzo (canvas)
 *   falso, porque jsdom no dibuja.
 * @autor Emilio Manuel Esquivel
 * @fecha 24/11/2026
 * @version 1.0.0
 * @historial 24/11/2026 - Emilio Manuel Esquivel - Creación (feature 004)
 */

// 1. Importaciones
import { vi } from 'vitest';

// 2. Tipos e interfaces
export interface PeticionRegistrada {
  metodo: string;
  ruta: string;
  token: string | null;
  cuerpo: unknown;
}

type Manejador = (peticion: PeticionRegistrada) => {
  estado?: number;
  cuerpo?: unknown;
  binario?: Blob;
};

// 3. Constantes del módulo
export const FIRMA_BASE64 = 'iVBORw0KGgoAAAANSUhEUgAAAAE';

// 4. Funciones
/**
 * Reemplaza fetch por una API falsa. Cada clave es `MÉTODO /ruta` (sin el prefijo /portal).
 *
 * @returns Las peticiones recibidas, para revisarlas en la prueba.
 */
export function simularApi(rutas: Record<string, Manejador>): PeticionRegistrada[] {
  const peticiones: PeticionRegistrada[] = [];
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string, opciones: RequestInit = {}) => {
      const ruta = new URL(url).pathname.replace(/^\/portal/, '');
      const encabezados = (opciones.headers ?? {}) as Record<string, string>;
      const peticion: PeticionRegistrada = {
        metodo: opciones.method ?? 'GET',
        ruta,
        token: encabezados['X-Token-Portal'] ?? null,
        cuerpo: typeof opciones.body === 'string' ? JSON.parse(opciones.body) : undefined,
      };
      peticiones.push(peticion);
      const manejador = rutas[`${peticion.metodo} ${ruta}`];
      const resultado = manejador
        ? manejador(peticion)
        : { estado: 404, cuerpo: { mensaje: 'No existe' } };
      // El Blob de jsdom no es el de Node: se pasa como texto con su tipo.
      if (resultado.binario) {
        return new Response(await resultado.binario.text(), {
          status: resultado.estado ?? 200,
          headers: { 'Content-Type': resultado.binario.type },
        });
      }
      return new Response(JSON.stringify(resultado.cuerpo ?? {}), {
        status: resultado.estado ?? 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }),
  );
  return peticiones;
}

/** Hace que el canvas de jsdom acepte trazos y devuelva una firma PNG fija. */
export function simularLienzo(): void {
  const contexto = {
    scale: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    clearRect: vi.fn(),
  };
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
    contexto as unknown as CanvasRenderingContext2D,
  );
  vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockReturnValue(
    `data:image/png;base64,${FIRMA_BASE64}`,
  );
}

/** jsdom no crea URLs de Blob; se simulan para fotos y descargas. */
export function simularUrlsDeArchivo(): { creadas: Blob[] } {
  const creadas: Blob[] = [];
  vi.stubGlobal(
    'URL',
    Object.assign(URL, {
      createObjectURL: vi.fn((archivo: Blob) => {
        creadas.push(archivo);
        return `blob:prueba/${creadas.length}`;
      }),
      revokeObjectURL: vi.fn(),
    }),
  );
  return { creadas };
}
