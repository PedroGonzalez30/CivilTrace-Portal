/**
 * @archivo TarjetaActividad.tsx
 * @proyecto Civil Trace
 * @descripcion Actividad de la obra con su estado, fecha programada y fotos aprobadas con su
 *   fecha, hora y ubicación. Se usa en Avances y en el detalle de una entrega.
 * @autor Emilio Manuel Esquivel
 * @fecha 24/11/2026
 * @version 1.1.0
 * @requerimientos RF-66 Consultar avances en el portal del cliente
 * @historial 24/11/2026 - Emilio Manuel Esquivel - Creación (feature 004)
 *   25/11/2026 - Emilio Manuel Esquivel - Ubicación de cada foto con enlace al mapa (feature 007)
 */

// 1. Importaciones
import ChipEstado from '@/componentes/ChipEstado';
import ImagenProtegida from '@/componentes/ImagenProtegida';
import type { ActividadPortal } from '@/tipos/portal';
import {
  describirUbicacion,
  enlaceMapa,
  formatearFecha,
  formatearFechaHora,
} from '@/utilidades/formato';

// 2. Tipos e interfaces
interface TarjetaActividadProps {
  token: string;
  actividad: ActividadPortal;
}

// 4. Componente principal
export default function TarjetaActividad({ token, actividad }: TarjetaActividadProps) {
  return (
    <article className="tarjeta" aria-label={actividad.nombre}>
      <div className="fila">
        <h3 className="valor" style={{ fontSize: 16 }}>
          {actividad.nombre}
        </h3>
        <ChipEstado estado={actividad.estado} />
      </div>
      {actividad.descripcion ? <p className="texto-pequeno">{actividad.descripcion}</p> : null}
      <p className="texto-pequeno">Fecha programada: {formatearFecha(actividad.fechaEntrega)}</p>
      {actividad.fotos.length > 0 ? (
        <div className="galeria">
          {actividad.fotos.map((foto) => {
            const mapa = enlaceMapa(foto);
            return (
              <figure key={foto.id} style={{ margin: 0 }}>
                <ImagenProtegida
                  token={token}
                  ruta={`/fotos/${foto.id}`}
                  descripcion={foto.comentario || `Fotografía de ${actividad.nombre}`}
                />
                <figcaption className="texto-pequeno">
                  {formatearFechaHora(foto.fechaRegistro)}
                  {foto.comentario ? ` · ${foto.comentario}` : ''}
                  <br />
                  <span>Ubicación: {describirUbicacion(foto)}</span>
                  {mapa ? (
                    <>
                      {' · '}
                      <a href={mapa} target="_blank" rel="noopener noreferrer">
                        Ver en el mapa
                      </a>
                    </>
                  ) : null}
                </figcaption>
              </figure>
            );
          })}
        </div>
      ) : (
        <p className="texto-pequeno">Sin fotografías aprobadas todavía.</p>
      )}
    </article>
  );
}
