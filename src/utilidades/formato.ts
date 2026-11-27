/**
 * @archivo formato.ts
 * @proyecto Civil Trace
 * @descripcion Formato de fechas para el portal y descarga de archivos del navegador.
 * @autor Emilio Manuel Esquivel
 * @fecha 24/11/2026
 * @version 1.1.0
 * @requerimientos RF-66 Consultar avances en el portal del cliente, RF-71 Descargar documentos de
 *   una entrega en el portal
 * @historial 24/11/2026 - Emilio Manuel Esquivel - Creación (feature 004)
 *   25/11/2026 - Emilio Manuel Esquivel - Texto y enlace al mapa de la ubicación de una foto
 *   (feature 007)
 */

// 1. Importaciones
import type { FotoPortal } from '@/tipos/portal';

// 3. Constantes del módulo
const FORMATO_FECHA_HORA = new Intl.DateTimeFormat('es-MX', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});

const DECIMALES_COORDENADA = 6;

// 4. Funciones
/**
 * @returns Las coordenadas de la foto, "Sin ubicación GPS · Referencia: …" o "Ubicación no
 *   registrada" para las fotos anteriores al feature 007.
 */
export function describirUbicacion(foto: FotoPortal): string {
  if (foto.ubicacion) {
    const { latitud, longitud } = foto.ubicacion;
    return `${latitud.toFixed(DECIMALES_COORDENADA)}, ${longitud.toFixed(DECIMALES_COORDENADA)}`;
  }
  if (foto.referenciaUbicacion) {
    return `Sin ubicación GPS · Referencia: ${foto.referenciaUbicacion}`;
  }
  return 'Ubicación no registrada';
}

/**
 * @returns Enlace al punto en Google Maps, o null si la foto no tiene coordenadas.
 */
export function enlaceMapa(foto: FotoPortal): string | null {
  return foto.ubicacion
    ? `https://www.google.com/maps/search/?api=1&query=${foto.ubicacion.latitud},${foto.ubicacion.longitud}`
    : null;
}

/**
 * @param fecha - Fecha `AAAA-MM-DD` de la API.
 * @returns `DD/MM/AAAA`, como en el Figma.
 */
export function formatearFecha(fecha: string): string {
  const [anio, mes, dia] = fecha.slice(0, 10).split('-');
  return anio && mes && dia ? `${dia}/${mes}/${anio}` : fecha;
}

/**
 * @param instante - Instante ISO 8601 de la API.
 * @returns `DD/MM/AAAA · HH:MM` en la hora del navegador del cliente.
 */
export function formatearFechaHora(instante: string): string {
  const fecha = new Date(instante);
  if (Number.isNaN(fecha.getTime())) {
    return instante;
  }
  const partes = Object.fromEntries(
    FORMATO_FECHA_HORA.formatToParts(fecha).map((parte) => [parte.type, parte.value]),
  );
  return `${partes['day']}/${partes['month']}/${partes['year']} · ${partes['hour']}:${partes['minute']}`;
}

/**
 * Guarda un Blob como archivo con el nombre indicado.
 *
 * @param archivo - Contenido descargado de la API.
 * @param nombre - Nombre del archivo, por ejemplo `Acta.pdf`.
 */
export function guardarArchivo(archivo: Blob, nombre: string): void {
  const url = URL.createObjectURL(archivo);
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = nombre;
  document.body.appendChild(enlace);
  enlace.click();
  enlace.remove();
  // Se libera después para que el navegador alcance a iniciar la descarga.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
