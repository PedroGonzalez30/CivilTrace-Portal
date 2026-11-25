/**
 * @archivo App.tsx
 * @proyecto Civil Trace
 * @descripcion Rutas del portal. Se usa el modo hash (#/o/<token>) para que el token nunca llegue
 *   al servidor de archivos ni al encabezado Referer (research R-03).
 * @autor Emilio Manuel Esquivel
 * @fecha 24/11/2026
 * @version 1.0.0
 * @requerimientos RF-65 Enviar enlace del portal al cliente, RF-66 Consultar avances en el portal
 *   del cliente, RF-67 Consultar entregas en el portal del cliente
 * @historial 24/11/2026 - Emilio Manuel Esquivel - Creación (feature 004)
 */

// 1. Importaciones
import type { RouteObject } from 'react-router';

import PantallaEntrega from '@/pantallas/PantallaEntrega';
import PantallaFirmar from '@/pantallas/PantallaFirmar';
import PantallaObra from '@/pantallas/PantallaObra';
import PantallaPortal from '@/pantallas/PantallaPortal';
import PantallaPrivacidad from '@/pantallas/PantallaPrivacidad';

// 4. Componente principal
function PantallaSinEnlace() {
  return (
    <main className="pagina">
      <span className="marca-portal">Civil Trace</span>
      <section className="tarjeta centro">
        <h1 className="titulo-modal">Portal del cliente</h1>
        <p className="subtitulo">
          Abre el enlace que recibiste por correo para ver los avances y las entregas de tu obra.
        </p>
      </section>
    </main>
  );
}

/** Rutas del portal; se usan con createHashRouter y en las pruebas con createMemoryRouter. */
export const RUTAS: RouteObject[] = [
  {
    path: '/o/:token',
    element: <PantallaPortal />,
    children: [
      { index: true, element: <PantallaObra /> },
      { path: 'entregas/:idEntrega', element: <PantallaEntrega /> },
      { path: 'entregas/:idEntrega/firmar', element: <PantallaFirmar /> },
    ],
  },
  { path: '/privacidad', element: <PantallaPrivacidad /> },
  { path: '*', element: <PantallaSinEnlace /> },
];
