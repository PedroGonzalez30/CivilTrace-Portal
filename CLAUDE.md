# CivilTrace-Portal — instrucciones para Claude Code

Portal web del cliente de Civil Trace (feature 004). El cliente entra sin cuenta con el enlace
permanente de su obra que recibe por correo (`#/o/<token>`), consulta avances y entregas, y acepta
una entrega con código de un solo uso + nombre + firma, o registra observaciones con firma.

La especificación, el plan, el contrato de la API y las tareas viven en el repo de la API:
`CivilTrace-API/specs/004-portal-cliente/`. La constitución y las decisiones (`docs/decisiones.md`)
también están allá; síguelas.

## Stack (T-02)

React 19 + Vite + TypeScript estricto, React Router en modo hash, CSS propio con los colores y la
fuente Poppins del Figma (`src/estilos/tema.css`). Sin librería de componentes.

## Estructura

```
src/
  App.tsx            Rutas (RUTAS); main.tsx las monta con createHashRouter
  conexion/          clientePortal.ts: fetch a /portal con X-Token-Portal
  pantallas/         PantallaPortal (marco + contexto), Obra, Entrega, Firmar, Privacidad
  componentes/       LienzoFirma, ModalCodigo, ModalObservaciones, TarjetaActividad, ...
  tipos/, utilidades/, estilos/
pruebas/             Vitest + Testing Library (API falsa en pruebas/apoyo.ts)
e2e/                 Playwright a 412 px contra una API simulada con page.route
```

## Comandos

```bash
npm install
cp .env.example .env.local      # VITE_URL_API=http://localhost:3000 (API local)
npm run dev                     # http://localhost:5173/#/o/<token>
npm run typecheck && npm run lint && npm test
npx playwright install chromium && npm run test:e2e
npm run build                   # dist/ para Azure Static Web Apps
```

## Reglas

- Encabezado ECCT en cada archivo nuevo, identificadores en español, mensajes en español.
- El token solo va en el fragmento (#) y en el encabezado `X-Token-Portal`; nunca en la ruta del
  servidor, en cookies ni en registros.
- Las fotos, la firma y los PDF se piden con `obtenerArchivo` (fetch + Blob), nunca con una URL
  directa.
- Los textos dicen "aceptación" o "constancia de recepción"; nunca "firma electrónica".
- Pruebas con la clave del plan de pruebas en el nombre (`CP17-E1-PORTAL ...`); 60 % de cobertura.
