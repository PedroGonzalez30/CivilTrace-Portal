/**
 * @archivo PantallaPrivacidad.tsx
 * @proyecto Civil Trace
 * @descripcion Aviso de privacidad simplificado del portal del cliente (constitución IV.7, LFPDPPP).
 *   El texto definitivo lo debe revisar el equipo antes de producción.
 * @autor Emilio Manuel Esquivel
 * @fecha 24/11/2026
 * @version 1.0.0
 * @requerimientos Constitución IV.7 (datos personales)
 * @historial 24/11/2026 - Emilio Manuel Esquivel - Creación (feature 004)
 */

// 1. Importaciones
import { useNavigate } from 'react-router';

// 4. Componente principal
export default function PantallaPrivacidad() {
  const navegar = useNavigate();
  return (
    <main className="pagina">
      <button type="button" className="enlace" onClick={() => navegar(-1)}>
        ← Regresar
      </button>
      <h1 className="titulo">Aviso de privacidad</h1>
      <section className="tarjeta">
        <p className="subtitulo">
          La empresa constructora que te envió este enlace es responsable de tus datos personales.
          En este portal solo se registran tu nombre, tu firma dibujada, la fecha y la hora en que
          aceptas una entrega o registras observaciones, y tu correo, que la empresa ya tenía
          registrado para la obra.
        </p>
        <p className="subtitulo">
          Estos datos se usan únicamente como constancia de recepción de los trabajos de la obra y
          se guardan en servidores privados. No se comparten con terceros. Para acceder, rectificar,
          cancelar u oponerte a su uso (derechos ARCO), comunícate con la empresa que realiza tu
          obra.
        </p>
        <p className="texto-pequeno">
          La firma de este portal es una constancia de recepción; no es una firma electrónica
          avanzada.
        </p>
      </section>
    </main>
  );
}
