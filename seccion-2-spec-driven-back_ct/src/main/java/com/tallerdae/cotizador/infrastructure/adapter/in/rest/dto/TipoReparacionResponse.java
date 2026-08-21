package com.tallerdae.cotizador.infrastructure.adapter.in.rest.dto;

import java.math.BigDecimal;

/**
 * DTO de salida para un tipo de reparación del catálogo.
 */
public class TipoReparacionResponse {

    private String id;
    private String nombre;
    private BigDecimal precioBase;
    private int tiempoEstimadoDias;
    private String moneda;

    public TipoReparacionResponse() {}

    public TipoReparacionResponse(String id, String nombre, BigDecimal precioBase,
                                   int tiempoEstimadoDias, String moneda) {
        this.id = id;
        this.nombre = nombre;
        this.precioBase = precioBase;
        this.tiempoEstimadoDias = tiempoEstimadoDias;
        this.moneda = moneda;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public BigDecimal getPrecioBase() { return precioBase; }
    public void setPrecioBase(BigDecimal precioBase) { this.precioBase = precioBase; }

    public int getTiempoEstimadoDias() { return tiempoEstimadoDias; }
    public void setTiempoEstimadoDias(int tiempoEstimadoDias) { this.tiempoEstimadoDias = tiempoEstimadoDias; }

    public String getMoneda() { return moneda; }
    public void setMoneda(String moneda) { this.moneda = moneda; }
}
