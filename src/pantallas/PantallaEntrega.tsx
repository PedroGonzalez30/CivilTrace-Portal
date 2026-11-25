/**
 * @archivo PantallaEntrega.tsx
 * @proyecto Civil Trace
 * @descripcion Detalle de una entrega: actividades y fotos enviadas, y según su estado, los botones
 *   Aceptar y Rechazar (Figma 246:1269, 246:1605) o la respuesta del cliente con su firma y el acta
 *   (CLIENTE_ReporteAceptado, 2271:192).
 * @autor Emilio Manuel Esquivel
 * @fecha 24/11/2026
 * @version 1.0.0
 * @requerimientos RF-14 Registrar aceptación de entrega, RF-15 Registrar observaciones del cliente,
 *   RF-67 Consultar entregas en el portal del cliente, RF-71 Descargar documentos de una entrega en
 *   el portal
 * @historial 24/11/2026 - Emilio Manuel Esquivel - Creación (feature 004)
 */

// 1. Importaciones
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router';

import ChipEstado from '@/componentes/ChipEstado';
import ImagenProtegida from '@/componentes/ImagenProtegida';
import ModalCodigo from '@/componentes/ModalCodigo';
import ModalObservaciones from '@/componentes/ModalObservaciones';
import TarjetaActividad from '@/componentes/TarjetaActividad';
import {
  ErrorPortal,
  obtenerArchivo,
  obtenerEntrega,
  solicitarCodigo,
} from '@/conexion/clientePortal';
import { usePortal } from '@/pantallas/PantallaPortal';
import type { DetalleEntrega } from '@/tipos/portal';
import { formatearFecha, formatearFechaHora, guardarArchivo } from '@/utilidades/formato';

// 2. Tipos e interfaces
export interface EstadoNavegacionFirma {
  modo: 'aceptar' | 'rechazar';
  codigo?: string;
  observaciones?: string;
}

// 4. Componente principal
export default function PantallaEntrega() {
  const { token, obra } = usePortal();
  const { idEntrega = '' } = useParams();
  const navegar = useNavigate();
  const ubicacion = useLocation();
  const recienRespondida = (ubicacion.state as { recienRespondida?: boolean } | null)
    ?.recienRespondida;
  const [entrega, setEntrega] = useState<DetalleEntrega | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [correoCodigo, setCorreoCodigo] = useState<string | null>(null);
  const [verObservaciones, setVerObservaciones] = useState(false);
  const [estaOcupado, setEstaOcupado] = useState(false);

  useEffect(() => {
    let vigente = true;
    obtenerEntrega(token, idEntrega)
      .then((detalle) => vigente && setEntrega(detalle))
      .catch((errorCarga: unknown) => {
        if (vigente) {
          setError(
            errorCarga instanceof ErrorPortal
              ? errorCarga.message
              : 'No se pudo cargar la entrega.',
          );
        }
      });
    return () => {
      vigente = false;
    };
  }, [token, idEntrega]);

  const mostrarError = (errorAccion: unknown, mensaje: string) =>
    setError(errorAccion instanceof ErrorPortal ? errorAccion.message : mensaje);

  const manejarAceptar = async () => {
    setEstaOcupado(true);
    setError(null);
    try {
      const solicitud = await solicitarCodigo(token, idEntrega);
      setCorreoCodigo(solicitud.correo);
    } catch (errorCodigo) {
      // Si ya se pidió un código hace menos de un minuto, ese sigue sirviendo.
      if (errorCodigo instanceof ErrorPortal && errorCodigo.estado === 429) {
        setCorreoCodigo('el correo registrado');
      } else {
        mostrarError(errorCodigo, 'No se pudo enviar el código.');
      }
    } finally {
      setEstaOcupado(false);
    }
  };

  const manejarDescargar = async (documento: 'reporte' | 'acta') => {
    setEstaOcupado(true);
    try {
      const archivo = await obtenerArchivo(token, `/entregas/${idEntrega}/${documento}.pdf`);
      guardarArchivo(archivo, `${documento === 'acta' ? 'Acta' : 'Reporte'} ${obra.nombre}.pdf`);
    } catch (errorDescarga) {
      mostrarError(errorDescarga, 'No se pudo descargar el documento.');
    } finally {
      setEstaOcupado(false);
    }
  };

  const irAFirmar = (estado: EstadoNavegacionFirma) =>
    navegar('firmar', { state: estado satisfies EstadoNavegacionFirma });

  if (!entrega) {
    return error ? (
      <p className="mensaje-error" role="alert">
        {error}
      </p>
    ) : (
      <p className="centro texto-pequeno">Cargando…</p>
    );
  }

  const estaAceptada = entrega.estado === 'ACEPTADA';
  return (
    <>
      <Link to={`/o/${token}`} className="enlace">
        ← Volver a mis reportes
      </Link>
      <section>
        <h1 className="titulo">{estaAceptada ? 'Reporte aceptado' : 'Reporte de avances'}</h1>
        <p className="subtitulo">
          {recienRespondida && estaAceptada
            ? 'Gracias. El supervisor recibirá tu aceptación y el acta quedará en el expediente de la obra.'
            : `${obra.nombre} · ${formatearFecha(entrega.fechaInicio)} – ${formatearFecha(entrega.fechaFin)}`}
        </p>
      </section>

      {entrega.estado !== 'ENVIADA' ? (
        <section className="tarjeta">
          <div className="fila">
            <span className="valor">{estaAceptada ? 'Aceptado por' : 'Observaciones de'}</span>
            <ChipEstado estado={entrega.estado} />
          </div>
          <p className="valor">{entrega.nombreCliente}</p>
          {entrega.respondidaEn ? (
            <p className="texto-pequeno">
              Fecha y hora: {formatearFechaHora(entrega.respondidaEn)}
            </p>
          ) : null}
          {entrega.observaciones ? <p className="texto-pequeno">{entrega.observaciones}</p> : null}
          <span className="etiqueta">Firma</span>
          <ImagenProtegida
            token={token}
            ruta={`/entregas/${entrega.id}/firma`}
            descripcion={`Firma de ${entrega.nombreCliente ?? 'el cliente'}`}
            clase="firma-imagen"
          />
        </section>
      ) : null}

      {error ? (
        <p className="mensaje-error" role="alert">
          {error}
        </p>
      ) : null}

      {entrega.estado === 'ENVIADA' ? (
        <div className="botones">
          <button
            type="button"
            className="boton boton-contorno"
            disabled={estaOcupado}
            onClick={() => setVerObservaciones(true)}
          >
            Rechazar
          </button>
          <button
            type="button"
            className="boton boton-primario"
            disabled={estaOcupado}
            onClick={() => void manejarAceptar()}
          >
            Aceptar
          </button>
        </div>
      ) : null}

      <div className="columna">
        <button
          type="button"
          className="boton boton-contorno"
          disabled={estaOcupado}
          onClick={() => void manejarDescargar('reporte')}
        >
          Descargar reporte
        </button>
        {estaAceptada ? (
          <button
            type="button"
            className="boton boton-primario"
            disabled={estaOcupado}
            onClick={() => void manejarDescargar('acta')}
          >
            Descargar acta (PDF)
          </button>
        ) : (
          <p className="texto-pequeno">El acta se genera al aceptar la entrega.</p>
        )}
      </div>

      <h2 className="titulo-modal">Actividades</h2>
      {entrega.actividades.map((actividad) => (
        <TarjetaActividad key={actividad.id} token={token} actividad={actividad} />
      ))}

      {correoCodigo ? (
        <ModalCodigo
          token={token}
          idEntrega={idEntrega}
          correo={correoCodigo}
          onCerrar={() => setCorreoCodigo(null)}
          onVerificado={(codigo) => irAFirmar({ modo: 'aceptar', codigo })}
        />
      ) : null}
      {verObservaciones ? (
        <ModalObservaciones
          onCerrar={() => setVerObservaciones(false)}
          onContinuar={(observaciones) => irAFirmar({ modo: 'rechazar', observaciones })}
        />
      ) : null}
    </>
  );
}
