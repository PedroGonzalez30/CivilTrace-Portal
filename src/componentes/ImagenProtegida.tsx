/**
 * @archivo ImagenProtegida.tsx
 * @proyecto Civil Trace
 * @descripcion Muestra una imagen privada de la API (foto de avance o firma) pidiéndola con el
 *   token del enlace; una etiqueta <img> sola no puede mandar el encabezado.
 * @autor Emilio Manuel Esquivel
 * @fecha 24/11/2026
 * @version 1.0.0
 * @requerimientos RF-66 Consultar avances en el portal del cliente
 * @historial 24/11/2026 - Emilio Manuel Esquivel - Creación (feature 004)
 */

// 1. Importaciones
import { useEffect, useState } from 'react';

import { obtenerArchivo } from '@/conexion/clientePortal';

// 2. Tipos e interfaces
interface ImagenProtegidaProps {
  token: string;
  ruta: string;
  descripcion: string;
  clase?: string;
}

// 4. Componente principal
export default function ImagenProtegida({
  token,
  ruta,
  descripcion,
  clase = 'foto',
}: ImagenProtegidaProps) {
  const [url, setUrl] = useState<string | null>(null);
  const [fallo, setFallo] = useState(false);

  useEffect(() => {
    let vigente = true;
    let creada: string | null = null;
    obtenerArchivo(token, ruta)
      .then((archivo) => {
        if (vigente) {
          creada = URL.createObjectURL(archivo);
          setUrl(creada);
        }
      })
      .catch(() => {
        if (vigente) {
          setFallo(true);
        }
      });
    return () => {
      vigente = false;
      if (creada) {
        URL.revokeObjectURL(creada);
      }
    };
  }, [token, ruta]);

  if (url) {
    return <img className={clase} src={url} alt={descripcion} loading="lazy" />;
  }
  return (
    <div className={`${clase} foto-vacia`} role="img" aria-label={descripcion}>
      {fallo ? 'Imagen no disponible' : 'Cargando…'}
    </div>
  );
}
