/**
 * @archivo flujoPortal.test.tsx
 * @proyecto Civil Trace
 * @descripcion Pruebas de las pantallas del portal con una API falsa: enlace inválido, entregas y
 *   avances, aceptar con código y firma, registrar observaciones y descargar el acta.
 * @autor Emilio Manuel Esquivel
 * @fecha 24/11/2026
 * @version 1.0.0
 * @requerimientos RF-14 Registrar aceptación de entrega, RF-15 Registrar observaciones del cliente,
 *   RF-60 Firmar aceptación de entrega, RF-65 Enviar enlace del portal al cliente, RF-66 Consultar
 *   avances en el portal del cliente, RF-67 Consultar entregas en el portal del cliente, RF-71
 *   Descargar documentos de una entrega en el portal
 * @historial 24/11/2026 - Emilio Manuel Esquivel - Creación (feature 004)
 */

// 1. Importaciones
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { beforeEach, describe, expect, it } from 'vitest';

import { RUTAS } from '@/App';

import { FIRMA_BASE64, simularApi, simularLienzo, simularUrlsDeArchivo } from './apoyo';

// 3. Constantes del módulo
const OBRA = {
  nombre: 'Hospital',
  cliente: 'Secretaría de Salud',
  direccion: 'Av. Reforma',
  fechaInicio: '2026-11-01',
  fechaFinal: '2027-06-30',
  empresa: { nombre: 'Todo Concreto', tieneLogo: false },
};

const ACTIVIDAD = {
  id: 'a1',
  nombre: 'Pisos y puertas',
  descripcion: 'Colocar loseta',
  estado: 'TERMINADA',
  fechaEntrega: '2026-11-05',
  fechaTerminada: '2026-11-05',
  fotos: [{ id: 'f1', comentario: 'Piso terminado', fechaRegistro: '2026-11-04T18:00:00.000Z' }],
};

const ENTREGA = {
  id: 'e1',
  estado: 'ENVIADA',
  fechaInicio: '2026-11-01',
  fechaFin: '2026-11-05',
  enviadaEn: '2026-11-05T18:00:00.000Z',
  actividades: 1,
  fotos: 1,
  respondidaEn: null,
};

const DETALLE = {
  ...ENTREGA,
  nombreCliente: null,
  observaciones: null,
  tieneActa: false,
  actividades: [ACTIVIDAD],
};

const NOMBRE = 'María Fernanda López Ruiz';

// 4. Funciones de apoyo
function abrir(ruta: string) {
  const enrutador = createMemoryRouter(RUTAS, { initialEntries: [ruta] });
  render(<RouterProvider router={enrutador} />);
  return enrutador;
}

function rutasBase(detalle: object = DETALLE) {
  return {
    'GET /obra': () => ({ cuerpo: OBRA }),
    'GET /entregas': () => ({ cuerpo: [ENTREGA] }),
    'GET /avances': () => ({ cuerpo: [ACTIVIDAD] }),
    'GET /entregas/e1': () => ({ cuerpo: detalle }),
    'GET /fotos/f1': () => ({ binario: new Blob(['foto'], { type: 'image/jpeg' }) }),
    'GET /entregas/e1/firma': () => ({ binario: new Blob(['firma'], { type: 'image/png' }) }),
  };
}

function dibujarFirma(etiqueta: string) {
  const lienzo = screen.getByRole('img', { name: etiqueta });
  fireEvent.pointerDown(lienzo, { clientX: 10, clientY: 10, pointerId: 1 });
  fireEvent.pointerMove(lienzo, { clientX: 60, clientY: 40, pointerId: 1 });
  fireEvent.pointerUp(lienzo, { pointerId: 1 });
}

// 5. Pruebas
beforeEach(() => {
  simularLienzo();
  simularUrlsDeArchivo();
});

describe('Portal del cliente', () => {
  it('CP16-PORTAL-E2-PORTAL un enlace inválido muestra el aviso sin datos', async () => {
    simularApi({
      'GET /obra': () => ({ estado: 404, cuerpo: { mensaje: 'Este enlace no es válido.' } }),
    });

    abrir('/o/malo');

    expect(await screen.findByText('Este enlace no es válido')).toBeInTheDocument();
    expect(screen.queryByText('Hospital')).not.toBeInTheDocument();
  });

  it('CP16-PORTAL-E5-PORTAL muestra entregas y avances con sus fotos', async () => {
    const peticiones = simularApi(rutasBase());
    const usuario = userEvent.setup();

    abrir('/o/tkn');

    expect(await screen.findByText('Reportes Hospital')).toBeInTheDocument();
    expect(await screen.findByText('Por revisar')).toBeInTheDocument();
    expect(screen.getAllByText('01/11/2026').length).toBeGreaterThan(0);
    await usuario.click(screen.getByRole('tab', { name: 'Avances' }));
    expect(screen.getByText('Pisos y puertas')).toBeInTheDocument();
    expect(await screen.findByRole('img', { name: 'Piso terminado' })).toHaveAttribute(
      'src',
      expect.stringMatching(/^blob:/),
    );
    expect(peticiones.every((peticion) => peticion.token === 'tkn')).toBe(true);
  });

  it('CP16-PORTAL-E6-PORTAL sin avances ni entregas lo indica', async () => {
    simularApi({
      ...rutasBase(),
      'GET /entregas': () => ({ cuerpo: [] }),
      'GET /avances': () => ({ cuerpo: [] }),
    });
    const usuario = userEvent.setup();

    abrir('/o/tkn');

    expect(await screen.findByText('Todavía no hay entregas.')).toBeInTheDocument();
    await usuario.click(screen.getByRole('tab', { name: 'Avances' }));
    expect(screen.getByText('Aún no hay avances registrados.')).toBeInTheDocument();
  });

  it('CP17-E1-PORTAL acepta con código, nombre y firma y muestra "Reporte aceptado"', async () => {
    let aceptada = false;
    const peticiones = simularApi({
      ...rutasBase(),
      'GET /entregas/e1': () => ({
        cuerpo: aceptada
          ? {
              ...DETALLE,
              estado: 'ACEPTADA',
              nombreCliente: NOMBRE,
              respondidaEn: '2026-11-12T17:42:00.000Z',
              tieneActa: true,
            }
          : DETALLE,
      }),
      'POST /entregas/e1/codigo': () => ({
        estado: 202,
        cuerpo: { correo: 'cl***@ejemplo.com', venceEn: '' },
      }),
      'POST /entregas/e1/codigo/comprobar': ({ cuerpo }) =>
        (cuerpo as { codigo: string }).codigo === '123456'
          ? { cuerpo: { valido: true } }
          : { estado: 400, cuerpo: { mensaje: 'Código incorrecto. Te quedan 4 intentos' } },
      'POST /entregas/e1/aceptar': () => {
        aceptada = true;
        return { cuerpo: {} };
      },
      'GET /entregas/e1/acta.pdf': () => ({
        binario: new Blob(['%PDF'], { type: 'application/pdf' }),
      }),
    });
    const usuario = userEvent.setup();

    abrir('/o/tkn/entregas/e1');
    await usuario.click(await screen.findByRole('button', { name: 'Aceptar' }));
    expect(await screen.findByText(/cl\*\*\*@ejemplo\.com/)).toBeInTheDocument();
    const modal = within(screen.getByRole('dialog'));
    await usuario.type(modal.getByLabelText('Código de 6 dígitos'), '000000');
    await usuario.click(modal.getByRole('button', { name: 'Aceptar' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Te quedan 4 intentos');
    await usuario.clear(modal.getByLabelText('Código de 6 dígitos'));
    await usuario.type(modal.getByLabelText('Código de 6 dígitos'), '123456');
    await usuario.click(modal.getByRole('button', { name: 'Aceptar' }));

    expect(await screen.findByText('Firma tu aceptación')).toBeInTheDocument();
    expect(screen.getByText('✓ Código verificado')).toBeInTheDocument();
    const firmar = screen.getByRole('button', { name: 'Firmar y aceptar' });
    expect(firmar).toBeDisabled();
    await usuario.type(screen.getByLabelText('Nombre completo'), NOMBRE);
    expect(firmar).toBeDisabled();
    dibujarFirma('Firma del cliente');
    expect(firmar).toBeEnabled();
    await usuario.click(firmar);

    expect(await screen.findByText('Reporte aceptado')).toBeInTheDocument();
    expect(screen.getByText(/El supervisor recibirá tu aceptación/)).toBeInTheDocument();
    expect(screen.getByText(NOMBRE)).toBeInTheDocument();
    expect(peticiones.find((peticion) => peticion.ruta === '/entregas/e1/aceptar')?.cuerpo).toEqual(
      {
        codigo: '123456',
        nombre: NOMBRE,
        firmaPng: FIRMA_BASE64,
      },
    );

    await usuario.click(screen.getByRole('button', { name: 'Descargar acta (PDF)' }));
    await waitFor(() =>
      expect(peticiones.some((peticion) => peticion.ruta === '/entregas/e1/acta.pdf')).toBe(true),
    );
  });

  it('CP17-E11-PORTAL registra observaciones con comentario, nombre y firma', async () => {
    const peticiones = simularApi({
      ...rutasBase(),
      'POST /entregas/e1/observaciones': () => ({ cuerpo: {} }),
    });
    const usuario = userEvent.setup();

    abrir('/o/tkn/entregas/e1');
    await usuario.click(await screen.findByRole('button', { name: 'Rechazar' }));
    await usuario.click(screen.getByRole('button', { name: 'Rechazar y enviar' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Escribe qué debe corregirse');
    await usuario.type(
      screen.getByLabelText('Comentario para el supervisor'),
      'Falta sellar el piso',
    );
    await usuario.click(screen.getByRole('button', { name: 'Rechazar y enviar' }));

    expect(await screen.findByText('Firma tu rechazo')).toBeInTheDocument();
    expect(screen.getByText('Falta sellar el piso')).toBeInTheDocument();
    await usuario.type(screen.getByLabelText('Nombre completo'), NOMBRE);
    dibujarFirma('Dibuja tu firma aquí con el dedo');
    await usuario.click(screen.getByRole('button', { name: 'Firmar y rechazar' }));

    await waitFor(() =>
      expect(
        peticiones.find((peticion) => peticion.ruta === '/entregas/e1/observaciones')?.cuerpo,
      ).toEqual({
        observaciones: 'Falta sellar el piso',
        nombre: NOMBRE,
        firmaPng: FIRMA_BASE64,
      }),
    );
  });

  it('CP17-E9-PORTAL una entrega con observaciones no ofrece aceptar ni el acta', async () => {
    simularApi(
      rutasBase({
        ...DETALLE,
        estado: 'CON_OBSERVACIONES',
        nombreCliente: NOMBRE,
        observaciones: 'Falta sellar el piso',
        respondidaEn: '2026-11-12T17:42:00.000Z',
      }),
    );

    abrir('/o/tkn/entregas/e1');

    expect(await screen.findByText('Falta sellar el piso')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Aceptar' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Descargar acta (PDF)' })).not.toBeInTheDocument();
    expect(screen.getByText('El acta se genera al aceptar la entrega.')).toBeInTheDocument();
  });

  it('CP17-A8-PORTAL al recargar la pantalla de firma sin datos regresa a la entrega', async () => {
    simularApi(rutasBase());

    const enrutador = abrir('/o/tkn/entregas/e1/firmar');

    await waitFor(() => expect(enrutador.state.location.pathname).toBe('/o/tkn/entregas/e1'));
  });

  it('CP16-PORTAL-A11-PORTAL el aviso de privacidad está disponible', async () => {
    simularApi(rutasBase());

    abrir('/privacidad');

    expect(await screen.findByText('Aviso de privacidad')).toBeInTheDocument();
    expect(screen.getByText(/no es una firma electrónica avanzada/)).toBeInTheDocument();
  });
});
