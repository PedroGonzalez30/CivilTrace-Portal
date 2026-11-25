/**
 * @archivo portal.ts
 * @proyecto Civil Trace
 * @descripcion Tipos de las respuestas de las rutas /portal de la API (contrato
 *   CivilTrace-API/specs/004-portal-cliente/contracts/portal-api.md).
 * @autor Emilio Manuel Esquivel
 * @fecha 24/11/2026
 * @version 1.1.0
 * @requerimientos RF-65 Enviar enlace del portal al cliente, RF-66 Consultar avances en el portal
 *   del cliente, RF-67 Consultar entregas en el portal del cliente
 * @historial 24/11/2026 - Emilio Manuel Esquivel - Creación (feature 004)
 *   25/11/2026 - Emilio Manuel Esquivel - Ubicación de cada foto (feature 007)
 */

// 2. Tipos e interfaces
export type EstadoActividad = 'ACTIVA' | 'TERMINADA';
export type EstadoEntrega = 'ENVIADA' | 'ACEPTADA' | 'CON_OBSERVACIONES';

export interface ObraPortal {
  nombre: string;
  cliente: string | null;
  direccion: string;
  fechaInicio: string;
  fechaFinal: string;
  empresa: { nombre: string; tieneLogo: boolean };
}

// Feature 007 (RF-66): coordenadas del teléfono al tomar la foto.
export interface UbicacionFoto {
  latitud: number;
  longitud: number;
  precisionMetros: number | null;
}

export interface FotoPortal {
  id: string;
  comentario: string;
  fechaRegistro: string;
  // Sin señal GPS, null y la referencia escrita; las fotos anteriores no tienen ninguna.
  ubicacion?: UbicacionFoto | null;
  referenciaUbicacion?: string | null;
}

export interface ActividadPortal {
  id: string;
  nombre: string;
  descripcion: string;
  estado: EstadoActividad;
  fechaEntrega: string;
  fechaTerminada: string | null;
  fotos: FotoPortal[];
}

export interface ResumenEntrega {
  id: string;
  estado: EstadoEntrega;
  fechaInicio: string;
  fechaFin: string;
  enviadaEn: string;
  actividades: number;
  fotos: number;
  respondidaEn: string | null;
}

export interface DetalleEntrega {
  id: string;
  estado: EstadoEntrega;
  fechaInicio: string;
  fechaFin: string;
  enviadaEn: string;
  nombreCliente: string | null;
  observaciones: string | null;
  respondidaEn: string | null;
  tieneActa: boolean;
  actividades: ActividadPortal[];
}

export interface CodigoSolicitado {
  correo: string;
  venceEn: string;
}
