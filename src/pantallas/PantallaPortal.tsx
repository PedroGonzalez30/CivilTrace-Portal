/**
 * @archivo PantallaPortal.tsx
 * @proyecto Civil Trace
 * @descripcion Marco del portal de una obra: lee el token del enlace (#/o/<token>), carga la obra y
 *   la comparte con las pantallas hijas. Si el enlace no es válido muestra el aviso.
 * @autor Emilio Manuel Esquivel
 * @fecha 24/11/2026
 * @version 1.0.0
 * @requerimientos RF-65 Enviar enlace del portal al cliente
 * @historial 24/11/2026 - Emilio Manuel Esquivel - Creación (feature 004)
 */

// 1. Importaciones
import { useEffect, useState } from 'react';
import { Link, Outlet, useOutletContext, useParams } from 'react-router';

import { ErrorPortal, obtenerObra } from '@/conexion/clientePortal';
import type { ObraPortal } from '@/tipos/portal';

// 2. Tipos e interfaces
export interface ContextoPortal {
  token: string;
  obra: ObraPortal;
}

type Estado =
  | { tipo: 'cargando' }
  | { tipo: 'listo'; obra: ObraPortal }
  | { tipo: 'invalido' }
  | { tipo: 'error'; mensaje: string };

// 3. Constantes del módulo
const CODIGO_NO_ENCONTRADO = 404;

// 4. Componente principal
export default function PantallaPortal() {
  const { token = '' } = useParams();
  const [estado, setEstado] = useState<Estado>({ tipo: 'cargando' });
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    let vigente = true;
    obtenerObra(token)
      .then((obra) => vigente && setEstado({ tipo: 'listo', obra }))
      .catch((error: unknown) => {
        if (!vigente) {
          return;
        }
        if (error instanceof ErrorPortal && error.estado === CODIGO_NO_ENCONTRADO) {
          setEstado({ tipo: 'invalido' });
        } else {
          setEstado({
            tipo: 'error',
            mensaje: error instanceof ErrorPortal ? error.message : 'No se pudo abrir el portal.',
          });
        }
      });
    return () => {
      vigente = false;
    };
  }, [token, intento]);

  return (
    <>
      <main className="pagina">
        <header className="cabecera-portal">
          <span className="marca-portal">Civil Trace</span>
          {estado.tipo === 'listo' ? (
            <span className="texto-pequeno">{estado.obra.empresa.nombre}</span>
          ) : null}
        </header>
        {estado.tipo === 'cargando' ? (
          <p className="centro texto-pequeno">Cargando tu obra…</p>
        ) : estado.tipo === 'invalido' ? (
          <section className="tarjeta centro">
            <h1 className="titulo-modal">Este enlace no es válido</h1>
            <p className="subtitulo">
              Revisa que abriste el enlace completo del último correo de Civil Trace o pide uno
              nuevo a tu supervisor.
            </p>
          </section>
        ) : estado.tipo === 'error' ? (
          <section className="tarjeta centro">
            <p className="mensaje-error" role="alert">
              {estado.mensaje}
            </p>
            <button
              type="button"
              className="boton boton-contorno"
              onClick={() => {
                setEstado({ tipo: 'cargando' });
                setIntento((valor) => valor + 1);
              }}
            >
              Reintentar
            </button>
          </section>
        ) : (
          <Outlet context={{ token, obra: estado.obra } satisfies ContextoPortal} />
        )}
      </main>
      <footer className="pie">
        Civil Trace · <Link to="/privacidad">Aviso de privacidad</Link>
      </footer>
    </>
  );
}

/** @returns El token y la obra del enlace, para las pantallas dentro del portal. */
export function usePortal(): ContextoPortal {
  return useOutletContext<ContextoPortal>();
}
