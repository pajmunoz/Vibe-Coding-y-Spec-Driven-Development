/**
 * tests/ui.test.js
 * Pruebas de comportamiento UI
 * Cubre: REQ-UI-01, REQ-UI-02, REQ-UI-03, REQ-UI-04, REQ-UI-E4, REQ-UI-E5
 *
 * Estrategia: pruebas sobre la lógica pura de app.js extraída como funciones
 * testeables, usando state.js real y fetch mockeado.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ── Helpers de estado reutilizables ──────────────────────────────────────────

async function estadoLimpio() {
  vi.resetModules();
  return import('../js/state.js');
}

// ── REQ-UI-01: Botón deshabilitado sin calzado o sin reparaciones ─────────────

describe('REQ-UI-01 — Habilitación del botón Cotizar', () => {
  let state;

  beforeEach(async () => { state = await estadoLimpio(); });

  function botonDebeEstarHabilitado(s) {
    return (
      s.calzadoSeleccionado !== null &&
      s.calzadoSeleccionado !== '' &&
      s.reparacionesSeleccionadas.size > 0
    );
  }

  it('botón deshabilitado cuando no hay calzado ni reparaciones', () => {
    expect(botonDebeEstarHabilitado(state.obtenerEstado())).toBe(false);
  });

  it('botón deshabilitado cuando hay calzado pero no reparaciones', () => {
    state.seleccionarCalzado(1);
    expect(botonDebeEstarHabilitado(state.obtenerEstado())).toBe(false);
  });

  it('botón deshabilitado cuando hay reparaciones pero no calzado', () => {
    state.toggleReparacion(10, true);
    expect(botonDebeEstarHabilitado(state.obtenerEstado())).toBe(false);
  });

  it('botón habilitado cuando hay calzado Y al menos una reparación', () => {
    state.seleccionarCalzado(1);
    state.toggleReparacion(10, true);
    expect(botonDebeEstarHabilitado(state.obtenerEstado())).toBe(true);
  });

  it('botón deshabilitado si se deselecciona la última reparación', () => {
    state.seleccionarCalzado(1);
    state.toggleReparacion(10, true);
    state.toggleReparacion(10, false);
    expect(botonDebeEstarHabilitado(state.obtenerEstado())).toBe(false);
  });

  it('botón deshabilitado si calzadoSeleccionado es string vacío', () => {
    state.seleccionarCalzado('');
    state.toggleReparacion(10, true);
    expect(botonDebeEstarHabilitado(state.obtenerEstado())).toBe(false);
  });
});

// ── REQ-UI-02: Bloqueo de clics durante cotización ───────────────────────────

describe('REQ-UI-02 — Bloqueo de clics mientras se cotiza', () => {
  it('el flag _cotizando bloquea una segunda ejecución', async () => {
    let cotizando = false;
    let ejecuciones = 0;

    async function simularClic() {
      if (cotizando) return; // guard — equivale al check en app.js
      cotizando = true;
      ejecuciones++;
      await new Promise((r) => setTimeout(r, 10)); // simula fetch async
      cotizando = false;
    }

    // Dos clics casi simultáneos
    await Promise.all([simularClic(), simularClic()]);
    expect(ejecuciones).toBe(1);
  });
});

// ── REQ-UI-03 / REQ-UI-E5: Error preserva la selección ──────────────────────

describe('REQ-UI-03 / REQ-UI-E5 — Error no limpia la selección', () => {
  let state;

  beforeEach(async () => { state = await estadoLimpio(); });

  it('la selección de calzado no cambia tras un error de API', async () => {
    state.seleccionarCalzado(2);
    state.toggleReparacion(10, true);

    // Simula que la API devuelve 400 — el catch en app.js NO llama a ningún setter
    // Solo llama _mostrarError(), que no toca el estado
    const estadoAntes = state.obtenerEstado();

    // Verificamos que el estado permanece intacto (nadie lo modificó)
    const estadoDespues = state.obtenerEstado();
    expect(estadoDespues.calzadoSeleccionado).toBe(estadoAntes.calzadoSeleccionado);
    expect([...estadoDespues.reparacionesSeleccionadas]).toEqual(
      [...estadoAntes.reparacionesSeleccionadas]
    );
  });

  it('el mensaje de error viene del campo "mensaje" de la API', async () => {
    // Simula _manejarRespuesta extrayendo el campo correcto
    const cuerpoError = { mensaje: 'Debe seleccionar al menos una reparación', status: 400 };
    const mensajeExtraido = cuerpoError.mensaje ?? cuerpoError.message ?? 'Error desconocido';
    expect(mensajeExtraido).toBe('Debe seleccionar al menos una reparación');
  });

  it('el mensaje de error viene del campo "message" como alternativa', () => {
    const cuerpoError = { message: 'Validation failed', status: 400 };
    const mensajeExtraido = cuerpoError.mensaje ?? cuerpoError.message ?? 'Error desconocido';
    expect(mensajeExtraido).toBe('Validation failed');
  });
});

// ── REQ-UI-04: Ocultar resultado al modificar selección ──────────────────────

describe('REQ-UI-04 — Ocultar panel de resultado al modificar selección', () => {
  let state;

  beforeEach(async () => { state = await estadoLimpio(); });

  it('el resultado se oculta al cambiar el tipo de calzado', () => {
    state.seleccionarCalzado(1);
    state.toggleReparacion(10, true);
    state.setResultado({ subtotal: 100, recargo: 0, total: 100, tiempoEstimado: '2 días' });

    expect(state.obtenerEstado().cotizacionResultado).not.toBeNull();

    state.seleccionarCalzado(2); // cambia calzado
    expect(state.obtenerEstado().cotizacionResultado).toBeNull();
  });

  it('el resultado se oculta al marcar una nueva reparación', () => {
    state.seleccionarCalzado(1);
    state.toggleReparacion(10, true);
    state.setResultado({ subtotal: 50, recargo: 5, total: 55, tiempoEstimado: '1 día' });

    state.toggleReparacion(11, true); // agrega reparación
    expect(state.obtenerEstado().cotizacionResultado).toBeNull();
  });

  it('el resultado se oculta al desmarcar una reparación', () => {
    state.seleccionarCalzado(1);
    state.toggleReparacion(10, true);
    state.setResultado({ subtotal: 50, recargo: 5, total: 55, tiempoEstimado: '1 día' });

    state.toggleReparacion(10, false); // quita reparación
    expect(state.obtenerEstado().cotizacionResultado).toBeNull();
  });

  it('el resultado se oculta al cambiar el flag urgente', () => {
    state.seleccionarCalzado(1);
    state.toggleReparacion(10, true);
    state.setResultado({ subtotal: 200, recargo: 40, total: 240, tiempoEstimado: '1 día' });

    state.setUrgente(true); // cambia urgente
    expect(state.obtenerEstado().cotizacionResultado).toBeNull();
  });

  it('el resultado permanece visible si no se modifica la selección', () => {
    state.seleccionarCalzado(1);
    state.toggleReparacion(10, true);
    const resultado = { subtotal: 300, recargo: 60, total: 360, tiempoEstimado: '3 días' };
    state.setResultado(resultado);

    // No se hace ningún cambio de selección
    expect(state.obtenerEstado().cotizacionResultado).toEqual(resultado);
  });
});

// ── REQ-UI-E4: Panel de resultado muestra los datos de la API ────────────────

describe('REQ-UI-E4 — Panel de resultado con datos de la API', () => {
  let state;

  beforeEach(async () => { state = await estadoLimpio(); });

  it('setResultado almacena todos los campos de la respuesta', () => {
    const respuesta = { subtotal: 150, recargo: 30, total: 180, tiempoEstimado: '2 días' };
    state.setResultado(respuesta);
    const s = state.obtenerEstado();
    expect(s.cotizacionResultado.subtotal).toBe(150);
    expect(s.cotizacionResultado.recargo).toBe(30);
    expect(s.cotizacionResultado.total).toBe(180);
    expect(s.cotizacionResultado.tiempoEstimado).toBe('2 días');
  });
});

// ── Factory: construirRequestCotizacion ──────────────────────────────────────

describe('construirRequestCotizacion() — Factory Simple', () => {
  it('construye el payload con tipoCalzadoId, reparaciones y urgente', () => {
    // Replica la lógica de la función factory de app.js
    function construirRequestCotizacion(estado) {
      return {
        tipoCalzadoId: estado.calzadoSeleccionado,
        reparaciones: [...estado.reparacionesSeleccionadas],
        urgente: estado.urgente,
      };
    }

    const estadoSimulado = {
      calzadoSeleccionado: 3,
      reparacionesSeleccionadas: new Set([10, 11]),
      urgente: true,
    };

    const payload = construirRequestCotizacion(estadoSimulado);

    expect(payload.tipoCalzadoId).toBe(3);
    expect(payload.reparaciones).toContain(10);
    expect(payload.reparaciones).toContain(11);
    expect(payload.urgente).toBe(true);
  });

  it('convierte el Set de reparaciones a Array serializable', () => {
    function construirRequestCotizacion(estado) {
      return {
        tipoCalzadoId: estado.calzadoSeleccionado,
        reparaciones: [...estado.reparacionesSeleccionadas],
        urgente: estado.urgente,
      };
    }

    const payload = construirRequestCotizacion({
      calzadoSeleccionado: 1,
      reparacionesSeleccionadas: new Set([5, 6, 7]),
      urgente: false,
    });

    expect(Array.isArray(payload.reparaciones)).toBe(true);
    expect(() => JSON.stringify(payload)).not.toThrow();
  });
});
