/**
 * js/state.js
 * Patrón: Module Pattern (ES Modules) + Observer Ligero
 *
 * Mantiene el estado de la aplicación en memoria y notifica
 * a los suscriptores registrados mediante onCambio() cada vez
 * que el estado muta.
 */

// ── Estado interno (privado al módulo) ──────────────────────────────────────

/** @type {Array<{id: number|string, nombre: string}>} */
let tiposCalzado = [];

/** @type {Array<{id: number|string, nombre: string, precio: number}>} */
let tiposReparacion = [];

/** @type {number|string|null} ID del tipo de calzado seleccionado */
let calzadoSeleccionado = null;

/** @type {Set<number|string>} IDs de las reparaciones marcadas */
let reparacionesSeleccionadas = new Set();

/** @type {boolean} */
let urgente = false;

/**
 * @type {{subtotal: number, recargo: number, total: number, tiempoEstimado: string}|null}
 */
let cotizacionResultado = null;

/** @type {Array<Function>} Lista de listeners del Observer */
const _listeners = [];

// ── Observer ────────────────────────────────────────────────────────────────

/**
 * Notifica a todos los suscriptores con una copia inmutable del estado actual.
 */
function _notificar() {
  const estadoActual = obtenerEstado();
  _listeners.forEach((fn) => fn(estadoActual));
}

/**
 * Suscribe una función que será llamada cada vez que el estado cambie.
 * @param {function(Object): void} listener
 */
export function onCambio(listener) {
  if (typeof listener === 'function') {
    _listeners.push(listener);
  }
}

// ── Getters ─────────────────────────────────────────────────────────────────

/**
 * Devuelve una copia inmutable del estado completo.
 * @returns {Object}
 */
export function obtenerEstado() {
  return {
    tiposCalzado: [...tiposCalzado],
    tiposReparacion: [...tiposReparacion],
    calzadoSeleccionado,
    reparacionesSeleccionadas: new Set(reparacionesSeleccionadas),
    urgente,
    cotizacionResultado: cotizacionResultado
      ? { ...cotizacionResultado }
      : null,
  };
}

// ── Setters ─────────────────────────────────────────────────────────────────

/**
 * Carga el catálogo inicial obtenido desde la API.
 * @param {{ tiposCalzado: Array, tiposReparacion: Array }} catalogo
 */
export function setCatalogo({ tiposCalzado: tc, tiposReparacion: tr }) {
  tiposCalzado = Array.isArray(tc) ? tc : [];
  tiposReparacion = Array.isArray(tr) ? tr : [];
  _notificar();
}

/**
 * Establece el tipo de calzado seleccionado y descarta el resultado previo.
 * @param {number|string|null} id
 */
export function seleccionarCalzado(id) {
  calzadoSeleccionado = id ?? null;
  cotizacionResultado = null; // REQ-UI-04
  _notificar();
}

/**
 * Agrega o quita una reparación del conjunto seleccionado y descarta el resultado previo.
 * @param {number|string} id
 * @param {boolean} marcado
 */
export function toggleReparacion(id, marcado) {
  if (marcado) {
    reparacionesSeleccionadas.add(id);
  } else {
    reparacionesSeleccionadas.delete(id);
  }
  cotizacionResultado = null; // REQ-UI-04
  _notificar();
}

/**
 * Actualiza el flag de servicio urgente y descarta el resultado previo.
 * @param {boolean} valor
 */
export function setUrgente(valor) {
  urgente = Boolean(valor);
  cotizacionResultado = null; // REQ-UI-04
  _notificar();
}

/**
 * Almacena el resultado devuelto por POST /api/cotizaciones.
 * @param {{subtotal: number, recargo: number, total: number, tiempoEstimado: string}} resultado
 */
export function setResultado(resultado) {
  cotizacionResultado = resultado ? { ...resultado } : null;
  _notificar();
}
