/**
 * @archivo PantallaFirmar.tsx
 * @proyecto Civil Trace
 * @descripcion "Firma tu aceptación" (Figma 2271:118) y "Firma tu rechazo" (2271:158): nombre
 *   completo y firma dibujada; el botón se activa cuando hay firma. Es una constancia de recepción,
 *   no una firma electrónica avanzada (constitución IV.5).
 * @autor Emilio Manuel Esquivel
 * @fecha 24/11/2026
 * @version 1.0.0
 * @requerimientos RF-14 Registrar aceptación de entrega, RF-15 Registrar observaciones del cliente,
 *   RF-60 Firmar aceptación de entrega
 * @historial 24/11/2026 - Emilio Manuel Esquivel - Creación (feature 004)
 */

// 1. Importaciones
import { useRef, useState, type FormEvent } from 'react';
import { Navigate, useLocation, useNavigate, useParams } from 'react-router';

import LienzoFirma, { type LienzoFirmaRef } from '@/componentes/LienzoFirma';
import { aceptarEntrega, ErrorPortal, registrarObservaciones } from '@/conexion/clientePortal';
import type { EstadoNavegacionFirma } from '@/pantallas/PantallaEntrega';
import { usePortal } from '@/pantallas/PantallaPortal';

// 3. Constantes del módulo
const LONGITUD_MINIMA_NOMBRE = 3;
const LEYENDA_CONSTANCIA =
  'Tu firma se guarda como imagen junto con la fecha y la hora. Es una constancia de recepción; no es una firma electrónica avanzada.';

// 4. Componente principal
export default function PantallaFirmar() {
  const { token, obra } = usePortal();
  const { idEntrega = '' } = useParams();
  const navegar = useNavigate();
  const datos = useLocation().state as EstadoNavegacionFirma | null;
  const lienzo = useRef<LienzoFirmaRef>(null);
  const [nombre, setNombre] = useState('');
  const [tieneFirma, setTieneFirma] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [estaEnviando, setEstaEnviando] = useState(false);

  // Sin código ni comentario (por ejemplo, al recargar la página) se vuelve a la entrega.
  if (!datos || (datos.modo === 'aceptar' ? !datos.codigo : !datos.observaciones)) {
    return <Navigate to={`/o/${token}/entregas/${idEntrega}`} replace />;
  }
  const esAceptar = datos.modo === 'aceptar';
  const puedeEnviar = tieneFirma && nombre.trim().length >= LONGITUD_MINIMA_NOMBRE && !estaEnviando;

  const manejarEnviar = async (evento: FormEvent) => {
    evento.preventDefault();
    const firmaPng = lienzo.current?.obtenerPng();
    if (!firmaPng) {
      setError('Dibuja tu firma para continuar');
      return;
    }
    setEstaEnviando(true);
    setError(null);
    try {
      if (esAceptar) {
        await aceptarEntrega(token, idEntrega, {
          codigo: datos.codigo ?? '',
          nombre: nombre.trim(),
          firmaPng,
        });
      } else {
        await registrarObservaciones(token, idEntrega, {
          observaciones: datos.observaciones ?? '',
          nombre: nombre.trim(),
          firmaPng,
        });
      }
      navegar(`/o/${token}/entregas/${idEntrega}`, {
        replace: true,
        state: { recienRespondida: true },
      });
    } catch (errorEnvio) {
      setError(
        errorEnvio instanceof ErrorPortal
          ? errorEnvio.message
          : 'No se pudo enviar. Inténtalo de nuevo.',
      );
      setEstaEnviando(false);
    }
  };

  return (
    <form onSubmit={(evento) => void manejarEnviar(evento)} style={{ display: 'contents' }}>
      <section>
        <h1 className="titulo">{esAceptar ? 'Firma tu aceptación' : 'Firma tu rechazo'}</h1>
        <p className="subtitulo">
          {esAceptar
            ? 'Último paso: dibuja tu firma para confirmar que recibiste el reporte.'
            : 'Tu comentario se enviará al supervisor junto con tu firma.'}
        </p>
      </section>

      <section className="tarjeta">
        <div className="fila">
          <span className="valor">Reporte de avances</span>
          <span className={esAceptar ? 'chip chip-exito' : 'chip chip-aviso'}>
            {esAceptar ? '✓ Código verificado' : 'Con observaciones'}
          </span>
        </div>
        {esAceptar ? (
          <div className="fila">
            <span className="etiqueta">Obra</span>
            <span className="valor">{obra.nombre}</span>
          </div>
        ) : (
          <>
            <span className="etiqueta">Tu comentario</span>
            <p className="texto-pequeno">{datos.observaciones}</p>
          </>
        )}
      </section>

      <label className="campo">
        <span className="etiqueta">Nombre completo</span>
        <input
          className="entrada"
          autoComplete="name"
          value={nombre}
          onChange={(evento) => setNombre(evento.target.value)}
          maxLength={120}
        />
      </label>

      <div className="campo">
        <div className="fila">
          <span className="etiqueta">Firma</span>
          <button type="button" className="enlace" onClick={() => lienzo.current?.borrar()}>
            Borrar
          </button>
        </div>
        <LienzoFirma
          ref={lienzo}
          onCambio={setTieneFirma}
          etiqueta={esAceptar ? 'Firma del cliente' : 'Dibuja tu firma aquí con el dedo'}
        />
        <p className="texto-pequeno">{LEYENDA_CONSTANCIA}</p>
      </div>

      {error ? (
        <p className="mensaje-error" role="alert">
          {error}
        </p>
      ) : null}

      <div className="botones">
        <button type="button" className="boton boton-contorno" onClick={() => navegar(-1)}>
          {esAceptar ? 'Cancelar' : 'Regresar'}
        </button>
        <button
          type="submit"
          className={esAceptar ? 'boton boton-primario' : 'boton boton-peligro'}
          disabled={!puedeEnviar}
        >
          {estaEnviando ? 'Enviando…' : esAceptar ? 'Firmar y aceptar' : 'Firmar y rechazar'}
        </button>
      </div>
      {!tieneFirma ? (
        <p className="texto-pequeno">El botón se activa cuando dibujas tu firma.</p>
      ) : null}
    </form>
  );
}
