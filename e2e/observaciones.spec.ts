/**
 * @archivo observaciones.spec.ts
 * @proyecto Civil Trace
 * @descripcion Prueba de punta a punta: el cliente rechaza una entrega con un comentario, su nombre
 *   y su firma, y la entrega queda "Con observaciones".
 * @autor Emilio Manuel Esquivel
 * @fecha 24/11/2026
 * @version 1.0.0
 * @requerimientos RF-15 Registrar observaciones del cliente
 * @historial 24/11/2026 - Emilio Manuel Esquivel - Creación (feature 004)
 */

// 1. Importaciones
import { expect, test } from '@playwright/test';

import { conectarApiSimulada, dibujarFirma, TOKEN } from './apiSimulada';

// 4. Pruebas
test('CP17-E11-E2E el cliente registra observaciones con su firma', async ({ page }) => {
  const api = await conectarApiSimulada(page);

  await page.goto(`/#/o/${TOKEN}/entregas/e1`);
  await page.getByRole('button', { name: 'Rechazar' }).click();
  const modal = page.getByRole('dialog');
  await modal.getByRole('button', { name: 'Rechazar y enviar' }).click();
  await expect(modal.getByRole('alert')).toHaveText('Escribe qué debe corregirse');
  await modal
    .getByLabel('Comentario para el supervisor')
    .fill('Las puertas del baño 2 no tienen chapa.');
  await modal.getByRole('button', { name: 'Rechazar y enviar' }).click();

  await expect(page.getByRole('heading', { name: 'Firma tu rechazo' })).toBeVisible();
  await page.getByLabel('Nombre completo').fill('María Fernanda López Ruiz');
  await dibujarFirma(page, 'Dibuja tu firma aquí con el dedo');
  await page.getByRole('button', { name: 'Firmar y rechazar' }).click();

  await expect(page.getByText('Con observaciones')).toBeVisible();
  await expect(page.getByText('Las puertas del baño 2 no tienen chapa.')).toBeVisible();
  expect(api.estado).toBe('CON_OBSERVACIONES');
  expect(api.cuerpoRespuesta).toMatchObject({
    observaciones: 'Las puertas del baño 2 no tienen chapa.',
    nombre: 'María Fernanda López Ruiz',
  });
  await expect(page.getByRole('button', { name: 'Descargar acta (PDF)' })).toHaveCount(0);
});
