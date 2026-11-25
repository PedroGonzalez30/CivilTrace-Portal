/**
 * @archivo ChipEstado.tsx
 * @proyecto Civil Trace
 * @descripcion Etiqueta de color con el estado de una entrega o de una actividad.
 * @autor Emilio Manuel Esquivel
 * @fecha 24/11/2026
 * @version 1.0.0
 * @requerimientos RF-66 Consultar avances en el portal del cliente, RF-67 Consultar entregas en el
 *   portal del cliente
 * @historial 24/11/2026 - Emilio Manuel Esquivel - Creación (feature 004)
 */

// 1. Importaciones
import type { EstadoActividad, EstadoEntrega } from '@/tipos/portal';

// 2. Tipos e interfaces
interface ChipEstadoProps {
  estado: EstadoEntrega | EstadoActividad;
}

// 3. Constantes del módulo
const CHIPS: Record<EstadoEntrega | EstadoActividad, { texto: string; clase: string }> = {
  ENVIADA: { texto: 'Por revisar', clase: 'chip chip-marca' },
  ACEPTADA: { texto: 'Aceptado', clase: 'chip chip-exito' },
  CON_OBSERVACIONES: { texto: 'Con observaciones', clase: 'chip chip-aviso' },
  ACTIVA: { texto: 'En curso', clase: 'chip' },
  TERMINADA: { texto: 'Verificada', clase: 'chip chip-exito' },
};

// 4. Componente principal
export default function ChipEstado({ estado }: ChipEstadoProps) {
  const { texto, clase } = CHIPS[estado];
  return <span className={clase}>{texto}</span>;
}
