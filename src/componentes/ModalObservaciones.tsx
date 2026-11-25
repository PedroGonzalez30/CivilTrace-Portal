/**
 * @archivo ModalObservaciones.tsx
 * @proyecto Civil Trace
 * @descripcion "Agrega un comentario para el supervisor" (Figma 246:1605): el cliente escribe qué
 *   debe corregirse antes de firmar el rechazo.
 * @autor Emilio Manuel Esquivel
 * @fecha 24/11/2026
 * @version 1.0.0
 * @requerimientos RF-15 Registrar observaciones del cliente
 * @historial 24/11/2026 - Emilio Manuel Esquivel - Creación (feature 004)
 */

// 1. Importaciones
import { useState, type FormEvent } from 'react';

// 2. Tipos e interfaces
interface ModalObservacionesProps {
  onContinuar: (observaciones: string) => void;
  onCerrar: () => void;
}

// 3. Constantes del módulo
const LONGITUD_MAXIMA = 2000;

// 4. Componente principal
export default function ModalObservaciones({ onContinuar, onCerrar }: ModalObservacionesProps) {
  const [texto, setTexto] = useState('');
  const [error, setError] = useState<string | null>(null);

  const manejarEnviar = (evento: FormEvent) => {
    evento.preventDefault();
    if (texto.trim().length === 0) {
      setError('Escribe qué debe corregirse');
      return;
    }
    onContinuar(texto.trim());
  };

  return (
    <div
      className="superposicion"
      role="dialog"
      aria-modal="true"
      aria-labelledby="titulo-observaciones"
    >
      <form className="modal" onSubmit={manejarEnviar}>
        <div className="fila">
          <h2 id="titulo-observaciones" className="titulo-modal">
            Agrega un comentario para el supervisor
          </h2>
          <button type="button" className="cerrar" onClick={onCerrar} aria-label="Cerrar">
            ✕
          </button>
        </div>
        <p className="subtitulo">
          Explica qué debe corregirse. El reporte se marcará como rechazado.
        </p>
        <textarea
          className="entrada"
          placeholder="Escribe tu comentario…"
          aria-label="Comentario para el supervisor"
          maxLength={LONGITUD_MAXIMA}
          value={texto}
          onChange={(evento) => {
            setTexto(evento.target.value);
            setError(null);
          }}
          autoFocus
        />
        {error ? (
          <p className="mensaje-error" role="alert">
            {error}
          </p>
        ) : null}
        <button type="submit" className="boton boton-primario">
          Rechazar y enviar
        </button>
      </form>
    </div>
  );
}
