/**
 * @archivo LienzoFirma.tsx
 * @proyecto Civil Trace
 * @descripcion Recuadro donde el cliente dibuja su firma con el dedo, un lápiz o el ratón
 *   (Pointer Events). Avisa si hay trazo y entrega la firma como PNG en base64 (research R-05).
 * @autor Emilio Manuel Esquivel
 * @fecha 24/11/2026
 * @version 1.0.0
 * @requerimientos RF-60 Firmar aceptación de entrega
 * @historial 24/11/2026 - Emilio Manuel Esquivel - Creación (feature 004)
 */

// 1. Importaciones
import { useEffect, useImperativeHandle, useRef, type PointerEvent, type Ref } from 'react';

// 2. Tipos e interfaces
export interface LienzoFirmaRef {
  /** @returns La firma como PNG en base64 (sin el prefijo data:), o null si está vacía. */
  obtenerPng: () => string | null;
  borrar: () => void;
}

interface LienzoFirmaProps {
  ref?: Ref<LienzoFirmaRef>;
  onCambio: (tieneTrazo: boolean) => void;
  etiqueta: string;
}

// 3. Constantes del módulo
const GROSOR_TRAZO = 2.5;
const COLOR_TRAZO = '#0f172a';
const PREFIJO_PNG = 'data:image/png;base64,';

// 4. Componente principal
export default function LienzoFirma({ ref, onCambio, etiqueta }: LienzoFirmaProps) {
  const lienzo = useRef<HTMLCanvasElement>(null);
  const dibujando = useRef(false);
  const tieneTrazo = useRef(false);

  // El lienzo se escala con la densidad de la pantalla para que la firma no salga borrosa.
  useEffect(() => {
    const elemento = lienzo.current;
    const contexto = elemento?.getContext('2d');
    if (!elemento || !contexto) {
      return;
    }
    const escala = window.devicePixelRatio || 1;
    elemento.width = elemento.clientWidth * escala;
    elemento.height = elemento.clientHeight * escala;
    contexto.scale(escala, escala);
    contexto.lineWidth = GROSOR_TRAZO;
    contexto.lineCap = 'round';
    contexto.lineJoin = 'round';
    contexto.strokeStyle = COLOR_TRAZO;
  }, []);

  const obtenerPunto = (evento: PointerEvent<HTMLCanvasElement>) => {
    const caja = evento.currentTarget.getBoundingClientRect();
    return { x: evento.clientX - caja.left, y: evento.clientY - caja.top };
  };

  const manejarInicio = (evento: PointerEvent<HTMLCanvasElement>) => {
    const contexto = lienzo.current?.getContext('2d');
    if (!contexto) {
      return;
    }
    evento.currentTarget.setPointerCapture?.(evento.pointerId);
    dibujando.current = true;
    const { x, y } = obtenerPunto(evento);
    contexto.beginPath();
    contexto.moveTo(x, y);
  };

  const manejarMovimiento = (evento: PointerEvent<HTMLCanvasElement>) => {
    const contexto = lienzo.current?.getContext('2d');
    if (!dibujando.current || !contexto) {
      return;
    }
    const { x, y } = obtenerPunto(evento);
    contexto.lineTo(x, y);
    contexto.stroke();
    if (!tieneTrazo.current) {
      tieneTrazo.current = true;
      onCambio(true);
    }
  };

  const manejarFin = () => {
    dibujando.current = false;
  };

  useImperativeHandle(ref, () => ({
    obtenerPng: () => {
      if (!tieneTrazo.current || !lienzo.current) {
        return null;
      }
      return lienzo.current.toDataURL('image/png').replace(PREFIJO_PNG, '');
    },
    borrar: () => {
      const elemento = lienzo.current;
      elemento?.getContext('2d')?.clearRect(0, 0, elemento.width, elemento.height);
      tieneTrazo.current = false;
      onCambio(false);
    },
  }));

  return (
    <canvas
      ref={lienzo}
      className="lienzo-firma"
      aria-label={etiqueta}
      role="img"
      onPointerDown={manejarInicio}
      onPointerMove={manejarMovimiento}
      onPointerUp={manejarFin}
      onPointerLeave={manejarFin}
      onPointerCancel={manejarFin}
    />
  );
}
