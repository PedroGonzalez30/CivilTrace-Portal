/**
 * @archivo ModalCodigo.tsx
 * @proyecto Civil Trace
 * @descripcion "Introduce el código de seguridad" (Figma 246:1269): el cliente escribe el código
 *   de 6 dígitos que llegó a su correo; se comprueba antes de pasar a la firma.
 * @autor Emilio Manuel Esquivel
 * @fecha 24/11/2026
 * @version 1.0.0
 * @requerimientos RF-14 Registrar aceptación de entrega
 * @historial 24/11/2026 - Emilio Manuel Esquivel - Creación (feature 004)
 */

// 1. Importaciones
import { useState, type FormEvent } from 'react';

import { comprobarCodigo, ErrorPortal, solicitarCodigo } from '@/conexion/clientePortal';

// 2. Tipos e interfaces
interface ModalCodigoProps {
  token: string;
  idEntrega: string;
  correo: string;
  onVerificado: (codigo: string) => void;
  onCerrar: () => void;
}

// 3. Constantes del módulo
const LONGITUD_CODIGO = 6;

// 4. Componente principal
export default function ModalCodigo({
  token,
  idEntrega,
  correo,
  onVerificado,
  onCerrar,
}: ModalCodigoProps) {
  const [codigo, setCodigo] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [estaEnviando, setEstaEnviando] = useState(false);

  const manejarEnviar = async (evento: FormEvent) => {
    evento.preventDefault();
    setEstaEnviando(true);
    setError(null);
    try {
      await comprobarCodigo(token, idEntrega, codigo);
      onVerificado(codigo);
    } catch (errorCodigo) {
      setError(
        errorCodigo instanceof ErrorPortal
          ? errorCodigo.message
          : 'No se pudo comprobar el código.',
      );
    } finally {
      setEstaEnviando(false);
    }
  };

  const manejarReenviar = async () => {
    setError(null);
    try {
      const nuevo = await solicitarCodigo(token, idEntrega);
      setAviso(`Te enviamos un código nuevo a ${nuevo.correo}.`);
    } catch (errorReenvio) {
      setError(
        errorReenvio instanceof ErrorPortal ? errorReenvio.message : 'No se pudo enviar el código.',
      );
    }
  };

  return (
    <div className="superposicion" role="dialog" aria-modal="true" aria-labelledby="titulo-codigo">
      <form className="modal" onSubmit={(evento) => void manejarEnviar(evento)}>
        <div className="fila">
          <h2 id="titulo-codigo" className="titulo-modal">
            Introduce el código de seguridad
          </h2>
          <button type="button" className="cerrar" onClick={onCerrar} aria-label="Cerrar">
            ✕
          </button>
        </div>
        <p className="subtitulo">
          Enviamos un código a tu correo ({correo}). Revisa tu bandeja de entrada o spam.
        </p>
        <input
          className="entrada"
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder="Código de 6 dígitos"
          aria-label="Código de 6 dígitos"
          maxLength={LONGITUD_CODIGO}
          value={codigo}
          onChange={(evento) => setCodigo(evento.target.value.replace(/\D/g, ''))}
          autoFocus
        />
        {error ? (
          <p className="mensaje-error" role="alert">
            {error}
          </p>
        ) : null}
        {aviso ? <p className="texto-pequeno">{aviso}</p> : null}
        <button
          type="submit"
          className="boton boton-primario"
          disabled={codigo.length !== LONGITUD_CODIGO || estaEnviando}
        >
          {estaEnviando ? 'Comprobando…' : 'Aceptar'}
        </button>
        <button type="button" className="enlace" onClick={() => void manejarReenviar()}>
          Enviar un código nuevo
        </button>
      </form>
    </div>
  );
}
