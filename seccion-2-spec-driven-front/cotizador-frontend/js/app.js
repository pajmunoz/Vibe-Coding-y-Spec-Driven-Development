/**
 * js/app.js
 * Coordinador DOM + Eventos
 *
 * Responsabilidades:
 *  - Inicializar la app cargando el catálogo desde la API.
 *  - Registrar event listeners sobre los controles del formulario.
 *  - Implementar construirRequestCotizacion(estado) — Factory Simple.
 *  - Renderizar la UI de forma reactiva suscribiéndose a state.onCambio().
 */

import {
  onCambio,
  obtenerEstado,
  setCatalogo,
  seleccionarCalzado,
  toggleReparacion,
  setUrgente,
  setResultado,
} from './state.js';

import {
  obtenerTiposCalzado,
  obtenerTiposReparacion,
  generarCotizacion,
} from './api.js';

// ── Referencias al DOM ───────────────────────────────────────────────────────

const indicadorCargaCatalogo = document.getElementById('indicador-carga-catalogo');
const selectorTipoCalzado    = document.getElementById('selector-tipo-calzado');
const fieldsetReparaciones   = document.getElementById('fieldset-reparaciones');
const listaReparaciones      = document.getElementById('lista-reparaciones');
const checkboxUrgente        = document.getElementById('checkbox-urgente');
const mensajeError           = document.getElementById('mensaje-error');
const botonCotizar           = document.getElementById('boton-cotizar');
const textBotonCotizar       = document.getElementById('texto-boton-cotizar');
const spinnerCotizar         = document.getElementById('spinner-cotizar');
const panelResultado         = document.getElementById('panel-resultado');
const resultadoSubtotal      = document.getElementById('resultado-subtotal');
const resultadoRecargo       = document.getElementById('resultado-recargo');
const resultadoTotal         = document.getElementById('resultado-total');
const resultadoTiempoEstimado = document.getElementById('resultado-tiempo-estimado');

// ── Flag interno para el estado "cotizando" ──────────────────────────────────

let _cotizando = false;

// ── Factory Simple ───────────────────────────────────────────────────────────

/**
 * Construye el body del POST /api/cotizaciones a partir del estado actual.
 * Patrón: Factory Simple — un único lugar donde se arma el objeto de request.
 *
 * @param {{ calzadoSeleccionado: number|string|null,
 *            reparacionesSeleccionadas: Set,
 *            urgente: boolean }} estado
 * @returns {{ tipoCalzadoId: number|string, reparaciones: Array, urgente: boolean }}
 */
function construirRequestCotizacion(estado) {
  return {
    tipoCalzadoId: estado.calzadoSeleccionado,
    reparaciones: [...estado.reparacionesSeleccionadas],
    urgente: estado.urgente,
  };
}

// ── Helpers de renderizado ───────────────────────────────────────────────────

/** Muestra u oculta el indicador de carga del catálogo. */
function _setCargandoCatalogo(cargando) {
  indicadorCargaCatalogo.classList.toggle('oculto', !cargando);
}

/** Habilita o deshabilita todos los controles del formulario. */
function _setControlesHabilitados(habilitado) {
  selectorTipoCalzado.disabled = !habilitado;
  fieldsetReparaciones.disabled = !habilitado;
  checkboxUrgente.disabled = !habilitado;
}

/**
 * Actualiza el estado visual del botón Cotizar.
 * REQ-UI-01: deshabilitado si no hay calzado O no hay reparaciones.
 * REQ-UI-02: deshabilitado mientras _cotizando === true.
 */
function _actualizarBotonCotizar(estado) {
  const seleccionValida =
    estado.calzadoSeleccionado !== null &&
    estado.calzadoSeleccionado !== '' &&
    estado.reparacionesSeleccionadas.size > 0;

  const habilitado = seleccionValida && !_cotizando;
  botonCotizar.disabled = !habilitado;
  botonCotizar.setAttribute('aria-disabled', String(!habilitado));
}

/** Activa / desactiva el modo "cotizando" en el botón. */
function _setCotizando(activo) {
  _cotizando = activo;
  spinnerCotizar.classList.toggle('oculto', !activo);
  textBotonCotizar.textContent = activo ? 'Cotizando…' : 'Cotizar';
  // Re-evalúa el estado del botón con el estado actual
  _actualizarBotonCotizar(obtenerEstado());
}

/** Muestra un mensaje de error en línea. */
function _mostrarError(mensaje) {
  mensajeError.textContent = mensaje;
  mensajeError.classList.remove('oculto');
}

/** Oculta el mensaje de error. */
function _ocultarError() {
  mensajeError.textContent = '';
  mensajeError.classList.add('oculto');
}

/**
 * Renderiza el panel de resultado o lo oculta.
 * REQ-UI-E4: muestra cuando hay resultado.
 * REQ-UI-04: se oculta cuando cotizacionResultado es null (setter del state lo limpia al cambiar selección).
 */
function _renderizarResultado(cotizacionResultado) {
  if (!cotizacionResultado) {
    panelResultado.classList.add('oculto');
    return;
  }

  const fmt = (val) =>
    typeof val === 'number'
      ? val.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })
      : val;

  resultadoSubtotal.textContent       = fmt(cotizacionResultado.subtotal);
  resultadoRecargo.textContent        = fmt(cotizacionResultado.recargo);
  resultadoTotal.textContent          = fmt(cotizacionResultado.total);
  resultadoTiempoEstimado.textContent = cotizacionResultado.tiempoEstimado ?? '—';

  panelResultado.classList.remove('oculto');
}

/**
 * Renderiza las opciones del selector de tipo de calzado.
 * @param {Array<{id, nombre}>} tipos
 */
function _renderizarTiposCalzado(tipos) {
  // Conserva la opción placeholder
  selectorTipoCalzado.innerHTML =
    '<option value="">-- Selecciona un tipo --</option>';
  tipos.forEach(({ id, nombre }) => {
    const option = document.createElement('option');
    option.value = id;
    option.textContent = nombre;
    selectorTipoCalzado.appendChild(option);
  });
}

/**
 * Renderiza los checkboxes de tipos de reparación.
 * @param {Array<{id, nombre}>} tipos
 * @param {Set} seleccionadas
 */
function _renderizarTiposReparacion(tipos, seleccionadas) {
  listaReparaciones.innerHTML = '';
  tipos.forEach(({ id, nombre }) => {
    const label = document.createElement('label');

    const checkbox = document.createElement('input');
    checkbox.type    = 'checkbox';
    checkbox.value   = id;
    checkbox.checked = seleccionadas.has(id);
    checkbox.addEventListener('change', (e) => {
      toggleReparacion(id, e.target.checked);
    });

    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(` ${nombre}`));
    listaReparaciones.appendChild(label);
  });
}

// ── Callback del Observer (renderizado reactivo) ─────────────────────────────

/**
 * Se ejecuta cada vez que el estado cambia.
 * Sincroniza toda la UI con el estado actual.
 * @param {Object} estado
 */
function _onEstadoCambia(estado) {
  _actualizarBotonCotizar(estado);
  _renderizarResultado(estado.cotizacionResultado);
}

// ── Carga inicial del catálogo ───────────────────────────────────────────────

/**
 * Carga en paralelo los dos catálogos desde la API (REQ-UI-E1 y REQ-UI-E2).
 */
async function _cargarCatalogo() {
  _setCargandoCatalogo(true);
  _setControlesHabilitados(false);
  _ocultarError();

  try {
    const [tiposCalzado, tiposReparacion] = await Promise.all([
      obtenerTiposCalzado(),
      obtenerTiposReparacion(),
    ]);

    // Poblar catálogos en el DOM
    _renderizarTiposCalzado(tiposCalzado);
    _renderizarTiposReparacion(tiposReparacion, new Set());

    // Actualizar state (dispara _onEstadoCambia)
    setCatalogo({ tiposCalzado, tiposReparacion });

    // REQ-UI-E2: habilitar controles
    _setControlesHabilitados(true);
  } catch (error) {
    // Muestra el error e incluye un enlace de reintento para no dejar la UI bloqueada sin salida
    mensajeError.innerHTML = '';
    const texto = document.createTextNode(`No se pudo cargar el catálogo: ${error.message}. `);
    const enlaceReintentar = document.createElement('a');
    enlaceReintentar.href = '#';
    enlaceReintentar.textContent = 'Reintentar';
    enlaceReintentar.addEventListener('click', (e) => {
      e.preventDefault();
      _cargarCatalogo();
    });
    mensajeError.appendChild(texto);
    mensajeError.appendChild(enlaceReintentar);
    mensajeError.classList.remove('oculto');
  } finally {
    _setCargandoCatalogo(false);
  }
}

// ── Event listeners ──────────────────────────────────────────────────────────

/** Cambio en el selector de tipo de calzado */
selectorTipoCalzado.addEventListener('change', (e) => {
  _ocultarError();
  seleccionarCalzado(e.target.value || null);
});

/** Cambio en el checkbox de servicio urgente */
checkboxUrgente.addEventListener('change', (e) => {
  _ocultarError();
  setUrgente(e.target.checked);
});

/** Clic en el botón Cotizar */
botonCotizar.addEventListener('click', async () => {
  // REQ-UI-02: ignorar clics mientras se está cotizando
  if (_cotizando) return;

  _ocultarError();
  _setCotizando(true);

  try {
    const estado  = obtenerEstado();
    const payload = construirRequestCotizacion(estado);
    const resultado = await generarCotizacion(payload);

    // REQ-UI-E4: mostrar resultado
    setResultado(resultado);
  } catch (error) {
    // REQ-UI-E5 / REQ-UI-03: mostrar mensaje exacto de la API sin limpiar selección
    _mostrarError(error.message);
  } finally {
    _setCotizando(false);
  }
});

// ── Inicialización ───────────────────────────────────────────────────────────

// Suscribir el renderizador reactivo al Observer del estado
onCambio(_onEstadoCambia);

// Arrancar la carga del catálogo
_cargarCatalogo();
