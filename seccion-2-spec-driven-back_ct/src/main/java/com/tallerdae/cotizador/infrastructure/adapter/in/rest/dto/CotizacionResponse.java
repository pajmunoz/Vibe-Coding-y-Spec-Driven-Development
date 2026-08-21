package com.tallerdae.cotizador.infrastructure.adapter.in.rest.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO de salida con el resultado de una cotización generada.
 */
public class CotizacionResponse {

    private String id;
    private String calzadoId;
    private String calzadoNombre;
    private List<ReparacionResumen> reparaciones;
    private boolean urgente;
    private BigDecimal subtotal;
    private BigDecimal recargo;
    private BigDecimal total;
    private int tiempoEstimadoDias;
    private String moneda;
    private LocalDateTime fechaCreacion;

    public CotizacionResponse() {}

    // --- Getters y Setters ---

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getCalzadoId() { return calzadoId; }
    public void setCalzadoId(String calzadoId) { this.calzadoId = calzadoId; }

    public String getCalzadoNombre() { return calzadoNombre; }
    public void setCalzadoNombre(String calzadoNombre) { this.calzadoNombre = calzadoNombre; }

    public List<ReparacionResumen> getReparaciones() { return reparaciones; }
    public void setReparaciones(List<ReparacionResumen> reparaciones) { this.reparaciones = reparaciones; }

    public boolean isUrgente() { return urgente; }
    public void setUrgente(boolean urgente) { this.urgente = urgente; }

    public BigDecimal getSubtotal() { return subtotal; }
    public void setSubtotal(BigDecimal subtotal) { this.subtotal = subtotal; }

    public BigDecimal getRecargo() { return recargo; }
    public void setRecargo(BigDecimal recargo) { this.recargo = recargo; }

    public BigDecimal getTotal() { return total; }
    public void setTotal(BigDecimal total) { this.total = total; }

    public int getTiempoEstimadoDias() { return tiempoEstimadoDias; }
    public void setTiempoEstimadoDias(int tiempoEstimadoDias) { this.tiempoEstimadoDias = tiempoEstimadoDias; }

    public String getMoneda() { return moneda; }
    public void setMoneda(String moneda) { this.moneda = moneda; }

    public LocalDateTime getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(LocalDateTime fechaCreacion) { this.fechaCreacion = fechaCreacion; }

    /**
     * Resumen de una reparación incluida en la cotización.
     */
    public static class ReparacionResumen {
        private String id;
        private String nombre;
        private BigDecimal precioBase;

        public ReparacionResumen() {}

        public ReparacionResumen(String id, String nombre, BigDecimal precioBase) {
            this.id = id;
            this.nombre = nombre;
            this.precioBase = precioBase;
        }

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }

        public String getNombre() { return nombre; }
        public void setNombre(String nombre) { this.nombre = nombre; }

        public BigDecimal getPrecioBase() { return precioBase; }
        public void setPrecioBase(BigDecimal precioBase) { this.precioBase = precioBase; }
    }
}
