package com.tallerdae.cotizador.infrastructure.adapter.in.rest.dto;

import java.math.BigDecimal;

/**
 * DTO de salida para un tipo de calzado del catálogo.
 */
public class CalzadoResponse {

    private String id;
    private String nombre;
    private BigDecimal factorComplejidad;

    public CalzadoResponse() {}

    public CalzadoResponse(String id, String nombre, BigDecimal factorComplejidad) {
        this.id = id;
        this.nombre = nombre;
        this.factorComplejidad = factorComplejidad;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public BigDecimal getFactorComplejidad() { return factorComplejidad; }
    public void setFactorComplejidad(BigDecimal factorComplejidad) { this.factorComplejidad = factorComplejidad; }
}
