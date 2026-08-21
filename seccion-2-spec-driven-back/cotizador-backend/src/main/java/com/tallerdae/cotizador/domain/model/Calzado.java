package com.tallerdae.cotizador.domain.model;

import java.math.BigDecimal;
import java.util.Objects;

/**
 * Entidad de dominio que representa un tipo de calzado.
 * El factorComplejidad se utiliza en RN-01 para calcular el subtotal de la cotización.
 */
public class Calzado {

    private final String id;
    private final String nombre;
    private final BigDecimal factorComplejidad;

    public Calzado(String id, String nombre, BigDecimal factorComplejidad) {
        Objects.requireNonNull(id, "El id del calzado no puede ser nulo");
        Objects.requireNonNull(nombre, "El nombre del calzado no puede ser nulo");
        Objects.requireNonNull(factorComplejidad, "El factorComplejidad no puede ser nulo");
        if (factorComplejidad.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("El factorComplejidad debe ser mayor a cero");
        }
        this.id = id;
        this.nombre = nombre;
        this.factorComplejidad = factorComplejidad;
    }

    public String getId() {
        return id;
    }

    public String getNombre() {
        return nombre;
    }

    public BigDecimal getFactorComplejidad() {
        return factorComplejidad;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Calzado calzado)) return false;
        return id.equals(calzado.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    @Override
    public String toString() {
        return "Calzado{id='" + id + "', nombre='" + nombre + "', factorComplejidad=" + factorComplejidad + '}';
    }
}
