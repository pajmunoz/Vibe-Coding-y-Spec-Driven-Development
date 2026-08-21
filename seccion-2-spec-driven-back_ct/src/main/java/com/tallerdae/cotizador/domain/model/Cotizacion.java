package com.tallerdae.cotizador.domain.model;

import com.tallerdae.cotizador.domain.exception.CotizacionException;
import com.tallerdae.cotizador.domain.strategy.UrgencyPricingStrategy;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

/**
 * Agregado raíz que representa una cotización de reparación de calzado.
 *
 * La creación se realiza exclusivamente a través del Factory Method {@link #crear},
 * garantizando que el agregado nunca exista en un estado inválido.
 */
public class Cotizacion {

    private final String id;
    private final Calzado calzado;
    private final List<TipoReparacion> reparaciones;
    private final boolean urgente;
    private final Dinero subtotal;
    private final Dinero recargo;
    private final Dinero total;
    private final int tiempoEstimadoDias;
    private final LocalDateTime fechaCreacion;

    // Constructor privado: sólo accesible desde el Factory Method
    private Cotizacion(String id,
                       Calzado calzado,
                       List<TipoReparacion> reparaciones,
                       boolean urgente,
                       Dinero subtotal,
                       Dinero recargo,
                       Dinero total,
                       int tiempoEstimadoDias,
                       LocalDateTime fechaCreacion) {
        this.id = id;
        this.calzado = calzado;
        this.reparaciones = Collections.unmodifiableList(reparaciones);
        this.urgente = urgente;
        this.subtotal = subtotal;
        this.recargo = recargo;
        this.total = total;
        this.tiempoEstimadoDias = tiempoEstimadoDias;
        this.fechaCreacion = fechaCreacion;
    }

    /**
     * Factory Method que valida invariants y calcula todos los campos derivados.
     *
     * @param calzado     tipo de calzado seleccionado
     * @param reparaciones lista de reparaciones seleccionadas (mínimo 1 — RN-04)
     * @param urgente     indica si el servicio es urgente
     * @param strategy    estrategia de precios según el nivel de urgencia
     * @return nueva instancia de {@link Cotizacion} con todos los campos calculados
     * @throws CotizacionException si no se seleccionó al menos una reparación (RN-04)
     */
    public static Cotizacion crear(Calzado calzado,
                                   List<TipoReparacion> reparaciones,
                                   boolean urgente,
                                   UrgencyPricingStrategy strategy) {

        // RN-04: debe contener al menos una reparación
        if (reparaciones == null || reparaciones.isEmpty()) {
            throw new CotizacionException("Debe seleccionar al menos una reparación para generar la cotización.");
        }

        // RN-01: subtotal = Σ (precioBase × factorComplejidad)
        String moneda = reparaciones.get(0).getPrecioBase().getMoneda();
        Dinero subtotal = Dinero.cero(moneda);
        for (TipoReparacion reparacion : reparaciones) {
            Dinero costoReparacion = reparacion.getPrecioBase().multiplicar(calzado.getFactorComplejidad());
            subtotal = subtotal.sumar(costoReparacion);
        }

        // RN-02: recargo y total según estrategia
        Dinero recargo = strategy.calcularRecargo(subtotal);
        Dinero total = subtotal.sumar(recargo);

        // RN-03: tiempo = max de tiempos de reparaciones, ajustado por estrategia
        int tiempoBase = reparaciones.stream()
                .mapToInt(TipoReparacion::getTiempoEstimadoDias)
                .max()
                .orElse(1);
        int tiempoFinal = strategy.calcularTiempoEntrega(tiempoBase);

        // RN-05: id UUID y fechaCreacion
        String id = UUID.randomUUID().toString();
        LocalDateTime fechaCreacion = LocalDateTime.now();

        return new Cotizacion(id, calzado, reparaciones, urgente,
                subtotal, recargo, total, tiempoFinal, fechaCreacion);
    }

    // --- Getters ---

    public String getId() {
        return id;
    }

    public Calzado getCalzado() {
        return calzado;
    }

    public List<TipoReparacion> getReparaciones() {
        return reparaciones;
    }

    public boolean isUrgente() {
        return urgente;
    }

    public Dinero getSubtotal() {
        return subtotal;
    }

    public Dinero getRecargo() {
        return recargo;
    }

    public Dinero getTotal() {
        return total;
    }

    public int getTiempoEstimadoDias() {
        return tiempoEstimadoDias;
    }

    public LocalDateTime getFechaCreacion() {
        return fechaCreacion;
    }
}
