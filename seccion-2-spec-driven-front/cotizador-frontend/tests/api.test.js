/**
 * tests/api.test.js
 * Pruebas unitarias para js/api.js
 * Cubre: Adapter Pattern, llamadas fetch y manejo de errores (REQ-UI-03, REQ-UI-E5)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  obtenerTiposCalzado,
  obtenerTiposReparacion,
  generarCotizacion,
} from '../js/api.js';

// ── Helper: mock de fetch ────────────────────────────────────────────────────

function mockFetchOk(data) {
  return vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve(data),
  });
}

function mockFetchError(status, statusText, body = null) {
  return vi.fn().mockResolvedValue({
    ok: false,
    status,
    statusText,
    json: () => (body ? Promise.resolve(body) : Promise.reject(new SyntaxError('No JSON'))),
  });
}

function mockFetchNetworkError(message = 'Network Error') {
  return vi.fn().mockRejectedValue(new TypeError(message));
}

beforeEach(() => {
  vi.stubGlobal('fetch', undefined);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

// ── obtenerTiposCalzado ──────────────────────────────────────────────────────

describe('obtenerTiposCalzado()', () => {
  it('llama a GET /api/catalogo/calzados', async () => {
    const fetchMock = mockFetchOk([{ id: 1, nombre: 'Tenis' }]);
    vi.stubGlobal('fetch', fetchMock);

    await obtenerTiposCalzado();

    expect(fetchMock).toHaveBeenCalledOnce();
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('/catalogo/calzados'));
  });

  it('devuelve el array de tipos de calzado', async () => {
    const datos = [{ id: 1, nombre: 'Tenis' }, { id: 2, nombre: 'Bota' }];
    vi.stubGlobal('fetch', mockFetchOk(datos));

    const resultado = await obtenerTiposCalzado();

    expect(resultado).toEqual(datos);
  });

  it('lanza Error con mensaje de la API en respuesta no-2xx (campo "mensaje")', async () => {
    vi.stubGlobal('fetch', mockFetchError(500, 'Internal Server Error', { mensaje: 'Error del servidor' }));

    await expect(obtenerTiposCalzado()).rejects.toThrow('Error del servidor');
  });

  it('REQ-UI-E5: lanza Error en fallo de red', async () => {
    vi.stubGlobal('fetch', mockFetchNetworkError('Failed to fetch'));

    await expect(obtenerTiposCalzado()).rejects.toThrow('Failed to fetch');
  });
});

// ── obtenerTiposReparacion ───────────────────────────────────────────────────

describe('obtenerTiposReparacion()', () => {
  it('llama a GET /api/catalogo/reparaciones', async () => {
    const fetchMock = mockFetchOk([{ id: 10, nombre: 'Suela' }]);
    vi.stubGlobal('fetch', fetchMock);

    await obtenerTiposReparacion();

    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('/catalogo/reparaciones'));
  });

  it('devuelve el array de tipos de reparación', async () => {
    const datos = [{ id: 10, nombre: 'Suela' }, { id: 11, nombre: 'Tacón' }];
    vi.stubGlobal('fetch', mockFetchOk(datos));

    const resultado = await obtenerTiposReparacion();

    expect(resultado).toEqual(datos);
  });

  it('lanza Error con mensaje de la API en campo "message" (alternativo)', async () => {
    vi.stubGlobal('fetch', mockFetchError(400, 'Bad Request', { message: 'Petición inválida' }));

    await expect(obtenerTiposReparacion()).rejects.toThrow('Petición inválida');
  });

  it('usa statusText como fallback si el cuerpo no es JSON', async () => {
    vi.stubGlobal('fetch', mockFetchError(503, 'Service Unavailable'));

    await expect(obtenerTiposReparacion()).rejects.toThrow('503');
  });
});

// ── generarCotizacion ────────────────────────────────────────────────────────

describe('generarCotizacion()', () => {
  const payloadEjemplo = {
    tipoCalzadoId: 1,
    reparaciones: [10, 11],
    urgente: false,
  };

  it('llama a POST /api/cotizaciones', async () => {
    const fetchMock = mockFetchOk({ subtotal: 100, recargo: 0, total: 100, tiempoEstimado: '2 días' });
    vi.stubGlobal('fetch', fetchMock);

    await generarCotizacion(payloadEjemplo);

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/cotizaciones'),
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('envía Content-Type: application/json', async () => {
    const fetchMock = mockFetchOk({});
    vi.stubGlobal('fetch', fetchMock);

    await generarCotizacion(payloadEjemplo);

    const [, opciones] = fetchMock.mock.calls[0];
    expect(opciones.headers['Content-Type']).toBe('application/json');
  });

  it('serializa el payload como JSON en el body', async () => {
    const fetchMock = mockFetchOk({});
    vi.stubGlobal('fetch', fetchMock);

    await generarCotizacion(payloadEjemplo);

    const [, opciones] = fetchMock.mock.calls[0];
    expect(JSON.parse(opciones.body)).toEqual(payloadEjemplo);
  });

  it('devuelve el resultado de la cotización', async () => {
    const respuesta = { subtotal: 200, recargo: 40, total: 240, tiempoEstimado: '1 día' };
    vi.stubGlobal('fetch', mockFetchOk(respuesta));

    const resultado = await generarCotizacion(payloadEjemplo);

    expect(resultado).toEqual(respuesta);
  });

  it('REQ-UI-03: lanza Error con mensaje exacto de la API en error 400', async () => {
    vi.stubGlobal('fetch', mockFetchError(400, 'Bad Request', {
      mensaje: 'Debe seleccionar al menos una reparación',
    }));

    await expect(generarCotizacion(payloadEjemplo))
      .rejects.toThrow('Debe seleccionar al menos una reparación');
  });

  it('REQ-UI-E5: lanza Error de red sin modificar el payload', async () => {
    vi.stubGlobal('fetch', mockFetchNetworkError('Failed to fetch'));

    await expect(generarCotizacion(payloadEjemplo)).rejects.toThrow('Failed to fetch');
  });

  it('incluye urgente:true en el payload cuando corresponde', async () => {
    const fetchMock = mockFetchOk({});
    vi.stubGlobal('fetch', fetchMock);

    await generarCotizacion({ ...payloadEjemplo, urgente: true });

    const [, opciones] = fetchMock.mock.calls[0];
    expect(JSON.parse(opciones.body).urgente).toBe(true);
  });
});
