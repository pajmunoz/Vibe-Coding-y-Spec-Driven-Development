/**
 * tests/state.test.js
 * Pruebas unitarias para js/state.js
 * Cubre: Module Pattern, Observer ligero y regla REQ-UI-04
 */

import { describe, it, expect, beforeEach } from 'vitest';

// Re-importamos el módulo con un reseteo manual antes de cada test
// usando el helper de estado limpio que exponemos vía obtenerEstado()
let state;

beforeEach(async () => {
  // Vitest no resetea módulos entre tests por defecto con type:module;
  // usamos vi.resetModules() para obtener una instancia fresca cada vez.
  const { vi } = await import('vitest');
  vi.resetModules();
  state = await import('../js/state.js');
});

// ── Estado inicial ───────────────────────────────────────────────────────────

describe('Estado inicial', () => {
  it('arranca con catálogos vacíos', () => {
    const s = state.obtenerEstado();
    expect(s.tiposCalzado).toEqual([]);
    expect(s.tiposReparacion).toEqual([]);
  });

  it('arranca sin selección de calzado', () => {
    expect(state.obtenerEstado().calzadoSeleccionado).toBeNull();
  });

  it('arranca sin reparaciones seleccionadas', () => {
    expect(state.obtenerEstado().reparacionesSeleccionadas.size).toBe(0);
  });

  it('arranca con urgente en false', () => {
    expect(state.obtenerEstado().urgente).toBe(false);
  });

  it('arranca sin resultado de cotización', () => {
    expect(state.obtenerEstado().cotizacionResultado).toBeNull();
  });
});

// ── setCatalogo ──────────────────────────────────────────────────────────────

describe('setCatalogo()', () => {
  it('almacena los tipos de calzado y reparación', () => {
    state.setCatalogo({
      tiposCalzado: [{ id: 1, nombre: 'Tenis' }],
      tiposReparacion: [{ id: 10, nombre: 'Suela' }],
    });
    const s = state.obtenerEstado();
    expect(s.tiposCalzado).toHaveLength(1);
    expect(s.tiposCalzado[0].nombre).toBe('Tenis');
    expect(s.tiposReparacion[0].nombre).toBe('Suela');
  });

  it('acepta arrays vacíos sin lanzar error', () => {
    expect(() => state.setCatalogo({ tiposCalzado: [], tiposReparacion: [] })).not.toThrow();
  });
});

// ── seleccionarCalzado ───────────────────────────────────────────────────────

describe('seleccionarCalzado()', () => {
  it('guarda el id del calzado seleccionado', () => {
    state.seleccionarCalzado(3);
    expect(state.obtenerEstado().calzadoSeleccionado).toBe(3);
  });

  it('acepta null para deseleccionar', () => {
    state.seleccionarCalzado(3);
    state.seleccionarCalzado(null);
    expect(state.obtenerEstado().calzadoSeleccionado).toBeNull();
  });

  it('REQ-UI-04: borra el resultado previo al cambiar calzado', () => {
    state.setResultado({ subtotal: 100, recargo: 10, total: 110, tiempoEstimado: '2 días' });
    state.seleccionarCalzado(2);
    expect(state.obtenerEstado().cotizacionResultado).toBeNull();
  });
});

// ── toggleReparacion ─────────────────────────────────────────────────────────

describe('toggleReparacion()', () => {
  it('agrega una reparación al marcarla', () => {
    state.toggleReparacion(5, true);
    expect(state.obtenerEstado().reparacionesSeleccionadas.has(5)).toBe(true);
  });

  it('elimina una reparación al desmarcarla', () => {
    state.toggleReparacion(5, true);
    state.toggleReparacion(5, false);
    expect(state.obtenerEstado().reparacionesSeleccionadas.has(5)).toBe(false);
  });

  it('puede tener múltiples reparaciones seleccionadas', () => {
    state.toggleReparacion(1, true);
    state.toggleReparacion(2, true);
    state.toggleReparacion(3, true);
    expect(state.obtenerEstado().reparacionesSeleccionadas.size).toBe(3);
  });

  it('REQ-UI-04: borra el resultado previo al cambiar reparaciones', () => {
    state.setResultado({ subtotal: 50, recargo: 5, total: 55, tiempoEstimado: '1 día' });
    state.toggleReparacion(7, true);
    expect(state.obtenerEstado().cotizacionResultado).toBeNull();
  });
});

// ── setUrgente ───────────────────────────────────────────────────────────────

describe('setUrgente()', () => {
  it('activa el flag urgente', () => {
    state.setUrgente(true);
    expect(state.obtenerEstado().urgente).toBe(true);
  });

  it('desactiva el flag urgente', () => {
    state.setUrgente(true);
    state.setUrgente(false);
    expect(state.obtenerEstado().urgente).toBe(false);
  });

  it('REQ-UI-04: borra el resultado previo al cambiar urgente', () => {
    state.setResultado({ subtotal: 200, recargo: 40, total: 240, tiempoEstimado: '1 día' });
    state.setUrgente(true);
    expect(state.obtenerEstado().cotizacionResultado).toBeNull();
  });
});

// ── setResultado ─────────────────────────────────────────────────────────────

describe('setResultado()', () => {
  it('almacena el resultado de la cotización', () => {
    const resultado = { subtotal: 300, recargo: 60, total: 360, tiempoEstimado: '3 días' };
    state.setResultado(resultado);
    expect(state.obtenerEstado().cotizacionResultado).toEqual(resultado);
  });

  it('acepta null para limpiar el resultado', () => {
    state.setResultado({ subtotal: 100, recargo: 0, total: 100, tiempoEstimado: '1 día' });
    state.setResultado(null);
    expect(state.obtenerEstado().cotizacionResultado).toBeNull();
  });

  it('devuelve una copia inmutable del resultado (no la referencia original)', () => {
    const original = { subtotal: 100, recargo: 10, total: 110, tiempoEstimado: '2 días' };
    state.setResultado(original);
    original.total = 9999; // mutación externa
    expect(state.obtenerEstado().cotizacionResultado.total).toBe(110);
  });
});

// ── Observer: onCambio ───────────────────────────────────────────────────────

describe('onCambio() — Observer', () => {
  it('notifica al listener cuando cambia el calzado', () => {
    let llamadas = 0;
    state.onCambio(() => { llamadas++; });
    state.seleccionarCalzado(1);
    expect(llamadas).toBe(1);
  });

  it('notifica al listener cuando cambia una reparación', () => {
    let llamadas = 0;
    state.onCambio(() => { llamadas++; });
    state.toggleReparacion(2, true);
    expect(llamadas).toBe(1);
  });

  it('notifica al listener cuando cambia urgente', () => {
    let llamadas = 0;
    state.onCambio(() => { llamadas++; });
    state.setUrgente(true);
    expect(llamadas).toBe(1);
  });

  it('permite múltiples suscriptores', () => {
    let a = 0, b = 0;
    state.onCambio(() => { a++; });
    state.onCambio(() => { b++; });
    state.seleccionarCalzado(5);
    expect(a).toBe(1);
    expect(b).toBe(1);
  });

  it('el listener recibe una copia inmutable del estado', () => {
    let estadoRecibido = null;
    state.onCambio((s) => { estadoRecibido = s; });
    state.seleccionarCalzado(7);
    // Mutar el estado recibido no debe afectar al estado interno
    estadoRecibido.calzadoSeleccionado = 999;
    expect(state.obtenerEstado().calzadoSeleccionado).toBe(7);
  });
});

// ── obtenerEstado: inmutabilidad ─────────────────────────────────────────────

describe('obtenerEstado() — inmutabilidad', () => {
  it('devuelve una copia del array de tiposCalzado', () => {
    state.setCatalogo({ tiposCalzado: [{ id: 1, nombre: 'Bota' }], tiposReparacion: [] });
    const s = state.obtenerEstado();
    s.tiposCalzado.push({ id: 99, nombre: 'Intruso' });
    expect(state.obtenerEstado().tiposCalzado).toHaveLength(1);
  });

  it('devuelve una copia del Set de reparacionesSeleccionadas', () => {
    state.toggleReparacion(3, true);
    const s = state.obtenerEstado();
    s.reparacionesSeleccionadas.add(999);
    expect(state.obtenerEstado().reparacionesSeleccionadas.size).toBe(1);
  });
});
