/**
 * @archivo clientePortal.ts
 * @proyecto Civil Trace
 * @descripcion Llamadas a las rutas públicas /portal de la API con el token del enlace de la obra
 *   (encabezado X-Token-Portal). Convierte los errores en mensajes en español.
 * @autor Emilio Manuel Esquivel
 * @fecha 24/11/2026
 * @version 1.0.0
 * @requerimientos RF-65 Enviar enlace del portal al cliente, RF-66 Consultar avances en el portal
 *   del cliente, RF-67 Consultar entregas en el portal del cliente, RF-14 Registrar aceptación de
 *   entrega, RF-15 Registrar observaciones del cliente, RF-71 Descargar documentos de una entrega
 *   en el portal
 * @historial 24/11/2026 - Emilio Manuel Esquivel - Creación (feature 004)
 */

// 1. Importaciones
import type {
  ActividadPortal,
  CodigoSolicitado,
  DetalleEntrega,
  ObraPortal,
  ResumenEntrega,
} from '@/tipos/portal';

// 2. Tipos e interfaces
interface OpcionesPeticion {
  metodo?: 'GET' | 'POST';
  cuerpo?: unknown;
}

export interface DatosAceptacion {
  codigo: string;
  nombre: string;
  firmaPng: string;
}

export interface DatosObservaciones {
  observaciones: string;
  nombre: string;
  firmaPng: string;
}

// 3. Constantes del módulo
const URL_API = (import.meta.env.VITE_URL_API ?? '').trim().replace(/\/+$/, '');
const ENCABEZADO_TOKEN = 'X-Token-Portal';
const TIEMPO_ESPERA_MS = 20_000;
const MENSAJE_SIN_CONEXION =
  'No se pudo conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.';
const MENSAJE_INESPERADO = 'Ocurrió un error inesperado. Inténtalo de nuevo.';
const MENSAJE_SIN_CONFIGURAR = 'El portal no tiene configurada la dirección del servidor.';

// 4. Funciones
/** Error de la API con su código de estado y su clave `motivo` (por ejemplo CODIGO_VENCIDO). */
export class ErrorPortal extends Error {
  readonly estado: number | null;
  readonly motivo: string | null;

  constructor(mensaje: string, estado: number | null, motivo: string | null = null) {
    super(mensaje);
    this.name = 'ErrorPortal';
    this.estado = estado;
    this.motivo = motivo;
  }
}

function leerCampo(datos: unknown, campo: 'mensaje' | 'motivo'): string | null {
  if (typeof datos === 'object' && datos !== null && campo in datos) {
    const valor = (datos as Record<string, unknown>)[campo];
    return typeof valor === 'string' ? valor : null;
  }
  return null;
}

async function pedir(
  token: string,
  ruta: string,
  opciones: OpcionesPeticion = {},
): Promise<Response> {
  if (!URL_API) {
    throw new ErrorPortal(MENSAJE_SIN_CONFIGURAR, null);
  }
  const controlador = new AbortController();
  const temporizador = setTimeout(() => controlador.abort(), TIEMPO_ESPERA_MS);
  let respuesta: Response;
  try {
    respuesta = await fetch(`${URL_API}/portal${ruta}`, {
      method: opciones.metodo ?? 'GET',
      headers: {
        [ENCABEZADO_TOKEN]: token,
        ...(opciones.cuerpo === undefined ? {} : { 'Content-Type': 'application/json' }),
      },
      body: opciones.cuerpo === undefined ? undefined : JSON.stringify(opciones.cuerpo),
      signal: controlador.signal,
      // El token viaja en un encabezado; no hay cookies que mandar.
      credentials: 'omit',
    });
  } catch {
    throw new ErrorPortal(MENSAJE_SIN_CONEXION, null);
  } finally {
    clearTimeout(temporizador);
  }

  if (!respuesta.ok) {
    const datos: unknown = await respuesta.json().catch(() => null);
    throw new ErrorPortal(
      leerCampo(datos, 'mensaje') ?? MENSAJE_INESPERADO,
      respuesta.status,
      leerCampo(datos, 'motivo'),
    );
  }
  return respuesta;
}

async function pedirJson<T>(token: string, ruta: string, opciones?: OpcionesPeticion): Promise<T> {
  const respuesta = await pedir(token, ruta, opciones);
  return (await respuesta.json()) as T;
}

/** @returns Los datos de la obra del enlace (RF-65). */
export function obtenerObra(token: string): Promise<ObraPortal> {
  return pedirJson(token, '/obra');
}

/** @returns Actividades con sus fotos aprobadas (RF-66). */
export function obtenerAvances(token: string): Promise<ActividadPortal[]> {
  return pedirJson(token, '/avances');
}

/** @returns Las entregas de la obra, la más reciente primero (RF-67). */
export function obtenerEntregas(token: string): Promise<ResumenEntrega[]> {
  return pedirJson(token, '/entregas');
}

/** @returns El detalle de una entrega con la copia fija de actividades y fotos. */
export function obtenerEntrega(token: string, idEntrega: string): Promise<DetalleEntrega> {
  return pedirJson(token, `/entregas/${idEntrega}`);
}

/** Manda al correo de la obra el código para aceptar (RF-14). */
export function solicitarCodigo(token: string, idEntrega: string): Promise<CodigoSolicitado> {
  return pedirJson(token, `/entregas/${idEntrega}/codigo`, { metodo: 'POST' });
}

/** Comprueba el código sin gastarlo, para pasar a la firma. */
export async function comprobarCodigo(
  token: string,
  idEntrega: string,
  codigo: string,
): Promise<void> {
  await pedir(token, `/entregas/${idEntrega}/codigo/comprobar`, {
    metodo: 'POST',
    cuerpo: { codigo },
  });
}

/** Acepta la entrega con código, nombre y firma (RF-14, RF-60). */
export function aceptarEntrega(
  token: string,
  idEntrega: string,
  datos: DatosAceptacion,
): Promise<DetalleEntrega> {
  return pedirJson(token, `/entregas/${idEntrega}/aceptar`, { metodo: 'POST', cuerpo: datos });
}

/** Registra las observaciones del cliente con nombre y firma (RF-15). */
export function registrarObservaciones(
  token: string,
  idEntrega: string,
  datos: DatosObservaciones,
): Promise<DetalleEntrega> {
  return pedirJson(token, `/entregas/${idEntrega}/observaciones`, {
    metodo: 'POST',
    cuerpo: datos,
  });
}

/**
 * Descarga un archivo protegido (foto, firma o PDF) como Blob. Una etiqueta <img> o un enlace no
 * pueden mandar el encabezado del token, por eso se pide con fetch (research R-09).
 *
 * @param token - Token del enlace.
 * @param ruta - Ruta dentro de /portal, por ejemplo `/fotos/abc`.
 */
export async function obtenerArchivo(token: string, ruta: string): Promise<Blob> {
  const respuesta = await pedir(token, ruta);
  return respuesta.blob();
}
