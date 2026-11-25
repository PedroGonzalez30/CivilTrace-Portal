/**
 * @archivo PantallaObra.tsx
 * @proyecto Civil Trace
 * @descripcion Inicio del portal de una obra con dos pestañas: Entregas (Figma
 *   CLIENTE_Abrir enlace de reportes, 246:1178) y Avances (actividades con fotos aprobadas, P-14).
 * @autor Emilio Manuel Esquivel
 * @fecha 24/11/2026
 * @version 1.0.0
 * @requerimientos RF-66 Consultar avances en el portal del cliente, RF-67 Consultar entregas en el
 *   portal del cliente
 * @historial 24/11/2026 - Emilio Manuel Esquivel - Creación (feature 004)
 */

// 1. Importaciones
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

import ChipEstado from '@/componentes/ChipEstado';
import TarjetaActividad from '@/componentes/TarjetaActividad';
import { ErrorPortal, obtenerAvances, obtenerEntregas } from '@/conexion/clientePortal';
import { usePortal } from '@/pantallas/PantallaPortal';
import type { ActividadPortal, ResumenEntrega } from '@/tipos/portal';
import { formatearFecha } from '@/utilidades/formato';

// 2. Tipos e interfaces
type Pestana = 'entregas' | 'avances';

interface Datos {
  entregas: ResumenEntrega[];
  avances: ActividadPortal[];
}

// 4. Componente principal
export default function PantallaObra() {
  const { token, obra } = usePortal();
  const navegar = useNavigate();
  const [pestana, setPestana] = useState<Pestana>('entregas');
  const [datos, setDatos] = useState<Datos | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let vigente = true;
    Promise.all([obtenerEntregas(token), obtenerAvances(token)])
      .then(([entregas, avances]) => vigente && setDatos({ entregas, avances }))
      .catch((errorCarga: unknown) => {
        if (vigente) {
          setError(
            errorCarga instanceof ErrorPortal ? errorCarga.message : 'No se pudo cargar la obra.',
          );
        }
      });
    return () => {
      vigente = false;
    };
  }, [token]);

  const ultimaEntrega = datos?.entregas[0];

  return (
    <>
      <section>
        <h1 className="titulo">Reportes {obra.nombre}</h1>
        <p className="subtitulo">
          Estos son los reportes de las actividades de tu obra. Da clic en uno para ver sus avances.
        </p>
      </section>

      <div className="pestanas" role="tablist" aria-label="Secciones del portal">
        {(['entregas', 'avances'] as const).map((opcion) => (
          <button
            key={opcion}
            type="button"
            role="tab"
            className="pestana"
            aria-selected={pestana === opcion}
            onClick={() => setPestana(opcion)}
          >
            {opcion === 'entregas' ? 'Entregas' : 'Avances'}
          </button>
        ))}
      </div>

      {error ? (
        <p className="mensaje-error" role="alert">
          {error}
        </p>
      ) : !datos ? (
        <p className="centro texto-pequeno">Cargando…</p>
      ) : pestana === 'entregas' ? (
        datos.entregas.length === 0 ? (
          <p className="centro texto-pequeno">Todavía no hay entregas.</p>
        ) : (
          <>
            {ultimaEntrega ? (
              <p className="valor">
                Reporte más reciente{' '}
                <span style={{ color: 'var(--color-marca)' }}>
                  {formatearFecha(ultimaEntrega.fechaInicio)} -{' '}
                  {formatearFecha(ultimaEntrega.fechaFin)}
                </span>
              </p>
            ) : null}
            {datos.entregas.map((entrega) => (
              <button
                key={entrega.id}
                type="button"
                className="tarjeta tarjeta-boton"
                onClick={() => navegar(`entregas/${entrega.id}`)}
              >
                <div className="fila">
                  <span className="texto-pequeno">{obra.nombre}</span>
                  <ChipEstado estado={entrega.estado} />
                </div>
                <span className="valor" style={{ fontSize: 16 }}>
                  Avances: {entrega.actividades} actividades, {entrega.fotos} fotografías
                </span>
                <div className="botones">
                  <span>
                    <span className="etiqueta">Fecha inicio</span>
                    <br />
                    <span className="valor">{formatearFecha(entrega.fechaInicio)}</span>
                  </span>
                  <span>
                    <span className="etiqueta">Fecha final</span>
                    <br />
                    <span className="valor">{formatearFecha(entrega.fechaFin)}</span>
                  </span>
                </div>
              </button>
            ))}
          </>
        )
      ) : datos.avances.every((actividad) => actividad.fotos.length === 0) ? (
        <p className="centro texto-pequeno">Aún no hay avances registrados.</p>
      ) : (
        datos.avances.map((actividad) => (
          <TarjetaActividad key={actividad.id} token={token} actividad={actividad} />
        ))
      )}
    </>
  );
}
