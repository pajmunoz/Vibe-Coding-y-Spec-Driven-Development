package com.tallerdae.cotizador.domain.model;

import java.util.Objects;

/**
 * Entidad de dominio que representa un tipo de reparación disponible.
 * precioBase se usa en RN-01 y tiempoEstimadoDias en RN-03.
 */
public class TipoReparacion {

    private final String id;
    private final String nombre;
    private final Dinero precioBase;
    private final int tiempoEstimadoDias;

    public TipoReparacion(String id, String nombre, Dinero precioBase, int tiempoEstimadoDias) {
        Objects.requireNonNull(id, "El id de la reparación no puede ser nulo");
        Objects.requireNonNull(nombre, "El nombre de la reparación no puede ser nulo");
        Objects.requireNonNull(precioBase, "El precioBase no puede ser nulo");
        if (tiempoEstimadoDias <= 0) {
            throw new IllegalArgumentException("El tiempoEstimadoDias debe ser mayor a cero");
        }
        this.id = id;
        this.nombre = nombre;
        this.precioBase = precioBase;
        this.tiempoEstimadoDias = tiempoEstimadoDias;
    }

    public String getId() {
        return id;
    }

    public String getNombre() {
        return nombre;
    }

    public Dinero getPrecioBase() {
        return precioBase;
    }

    public int getTiempoEstimadoDias() {
        return tiempoEstimadoDias;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof TipoReparacion that)) return false;
        return id.equals(that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    @Override
    public String toString() {
        return "TipoReparacion{id='" + id + "', nombre='" + nombre +
               "', precioBase=" + precioBase + ", tiempoEstimadoDias=" + tiempoEstimadoDias + '}';
    }
}
