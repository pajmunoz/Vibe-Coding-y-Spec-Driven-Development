package com.tallerdae.cotizador.infrastructure.adapter.in.rest.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

/**
 * DTO de entrada para la generación de una cotización.
 * Aísla el contrato HTTP del modelo de dominio.
 */
public class CotizacionRequest {

    @NotBlank(message = "El identificador del calzado es obligatorio")
    private String calzadoId;

    @NotEmpty(message = "Debe seleccionar al menos una reparación")
    private List<@NotBlank(message = "El identificador de reparación no puede estar vacío") String> reparacionIds;

    private boolean urgente;

    public CotizacionRequest() {}

    public CotizacionRequest(String calzadoId, List<String> reparacionIds, boolean urgente) {
        this.calzadoId = calzadoId;
        this.reparacionIds = reparacionIds;
        this.urgente = urgente;
    }

    public String getCalzadoId() {
        return calzadoId;
    }

    public void setCalzadoId(String calzadoId) {
        this.calzadoId = calzadoId;
    }

    public List<String> getReparacionIds() {
        return reparacionIds;
    }

    public void setReparacionIds(List<String> reparacionIds) {
        this.reparacionIds = reparacionIds;
    }

    public boolean isUrgente() {
        return urgente;
    }

    public void setUrgente(boolean urgente) {
        this.urgente = urgente;
    }
}
