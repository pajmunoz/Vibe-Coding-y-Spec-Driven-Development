/**
 * js/api.js
 * Patrón: Adapter
 *
 * Traduce el contrato HTTP del backend (OpenAPI) a funciones JS simples.
 * Si la URL base o los endpoints cambian, sólo se modifica este archivo.
 */

// Ruta relativa: Nginx hace proxy de /api al backend, evitando CORS.
const API_BASE_URL = '/api';

// ── Helpers internos ────────────────────────────────────────────────────────

/**
 * Procesa la respuesta fetch: lanza un error con el mensaje de la API
 * si el status no es 2xx, o devuelve el JSON parseado.
 *
 * @param {Response} response
 * @returns {Promise<any>}
 * @throws {Error} con `message` extraído del cuerpo JSON de la API (campo "mensaje" o "message"),
 *                 o con el statusText cuando no hay cuerpo parseable.
 */
async function _manejarRespuesta(response) {
  if (response.ok) {
    return response.json();
  }

  // Intenta leer el cuerpo de error como JSON para obtener el mensaje exacto (REQ-UI-03)
  let mensajeError = `Error ${response.status}: ${response.statusText}`;
  try {
    const cuerpo = await response.json();
    mensajeError = cuerpo.mensaje ?? cuerpo.message ?? mensajeError;
  } catch {
    // El cuerpo no es JSON válido; se usa el mensaje por defecto
  }

  throw new Error(mensajeError);
}

// ── Métodos públicos (Adapter) ───────────────────────────────────────────────

/**
 * Obtiene el catálogo de tipos de calzado.
 * GET /api/catalogo/calzados
 *
 * @returns {Promise<Array<{id: number|string, nombre: string}>>}
 */
export async function obtenerTiposCalzado() {
  const response = await fetch(`${API_BASE_URL}/catalogo/calzados`);
  return _manejarRespuesta(response);
}

/**
 * Obtiene el catálogo de tipos de reparación.
 * GET /api/catalogo/reparaciones
 *
 * @returns {Promise<Array<{id: number|string, nombre: string, precio: number}>>}
 */
export async function obtenerTiposReparacion() {
  const response = await fetch(`${API_BASE_URL}/catalogo/reparaciones`);
  return _manejarRespuesta(response);
}

/**
 * Envía el payload de cotización y devuelve el resultado calculado.
 * POST /api/cotizaciones
 *
 * @param {{ tipoCalzadoId: number|string, reparaciones: Array<number|string>, urgente: boolean }} payload
 * @returns {Promise<{subtotal: number, recargo: number, total: number, tiempoEstimado: string}>}
 */
export async function generarCotizacion(payload) {
  const response = await fetch(`${API_BASE_URL}/cotizaciones`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  return _manejarRespuesta(response);
}
