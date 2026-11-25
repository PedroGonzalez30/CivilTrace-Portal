/**
 * @archivo aceptar.spec.ts
 * @proyecto Civil Trace
 * @descripcion Prueba de punta a punta: el cliente abre su enlace, entra a la entrega, escribe el
 *   código, firma y acepta; ve "Reporte aceptado" y descarga el acta.
 * @autor Emilio Manuel Esquivel
 * @fecha 24/11/2026
 * @version 1.0.0
 * @requerimientos RF-14 Registrar aceptación de entrega, RF-60 Firmar aceptación de entrega,
 *   RF-71 Descargar documentos de una entrega en el portal
 * @historial 24/11/2026 - Emilio Manuel Esquivel - Creación (feature 004)
 */

// 1. Importaciones
import { expect, test } from '@playwright/test';

import { CODIGO, conectarApiSimulada, dibujarFirma, TOKEN } from './apiSimulada';

// 4. Pruebas
test('CP17-E1-E2E el cliente acepta una entrega con código y firma', async ({ page }) => {
  const api = await conectarApiSimulada(page);

  await page.goto(`/#/o/${TOKEN}`);
  await expect(page.getByRole('heading', { name: 'Reportes Hospital' })).toBeVisible();
  await page.getByRole('button', { name: /Avances: 1 actividades/ }).click();

  await page.getByRole('button', { name: 'Aceptar', exact: true }).click();
  const modal = page.getByRole('dialog');
  await modal.getByLabel('Código de 6 dígitos').fill('000000');
  await modal.getByRole('button', { name: 'Aceptar' }).click();
  await expect(modal.getByRole('alert')).toContainText('Te quedan 4 intentos');
  await modal.getByLabel('Código de 6 dígitos').fill(CODIGO);
  await modal.getByRole('button', { name: 'Aceptar' }).click();

  await expect(page.getByRole('heading', { name: 'Firma tu aceptación' })).toBeVisible();
  const firmar = page.getByRole('button', { name: 'Firmar y aceptar' });
  await expect(firmar).toBeDisabled();
  await page.getByLabel('Nombre completo').fill('María Fernanda López Ruiz');
  await dibujarFirma(page, 'Firma del cliente');
  await expect(firmar).toBeEnabled();
  await firmar.click();

  await expect(page.getByRole('heading', { name: 'Reporte aceptado' })).toBeVisible();
  expect(api.cuerpoRespuesta).toMatchObject({
    codigo: CODIGO,
    nombre: 'María Fernanda López Ruiz',
  });
  const firma = Buffer.from(String(api.cuerpoRespuesta?.['firmaPng']), 'base64');
  expect(firma.subarray(1, 4).toString()).toBe('PNG');

  const descarga = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Descargar acta (PDF)' }).click();
  expect((await descarga).suggestedFilename()).toBe('Acta Hospital.pdf');
});

test('CP16-PORTAL-E2-E2E un enlace alterado no muestra la obra', async ({ page }) => {
  await conectarApiSimulada(page);

  await page.goto('/#/o/enlace-alterado');

  await expect(page.getByRole('heading', { name: 'Este enlace no es válido' })).toBeVisible();
  await expect(page.getByText('Hospital')).toHaveCount(0);
});
