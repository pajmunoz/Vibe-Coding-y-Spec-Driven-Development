package com.tallerdae.cotizador.domain.model;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Objects;

/**
 * Value Object que representa una cantidad monetaria.
 * Inmutable por diseño: cada operación retorna una nueva instancia.
 */
public final class Dinero {

    private final BigDecimal monto;
    private final String moneda;

    public Dinero(BigDecimal monto, String moneda) {
        Objects.requireNonNull(monto, "El monto no puede ser nulo");
        Objects.requireNonNull(moneda, "La moneda no puede ser nula");
        if (monto.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("El monto no puede ser negativo");
        }
        this.monto = monto.setScale(2, RoundingMode.HALF_UP);
        this.moneda = moneda;
    }

    public static Dinero de(double monto, String moneda) {
        return new Dinero(BigDecimal.valueOf(monto), moneda);
    }

    public static Dinero cero(String moneda) {
        return new Dinero(BigDecimal.ZERO, moneda);
    }

    /**
     * Suma este Dinero con otro de la misma moneda.
     */
    public Dinero sumar(Dinero otro) {
        validarMismaMoneda(otro);
        return new Dinero(this.monto.add(otro.monto), this.moneda);
    }

    /**
     * Aplica un porcentaje sobre el monto y retorna el resultado.
     * Ejemplo: aplicarPorcentaje(30) sobre 100.00 retorna 30.00.
     */
    public Dinero aplicarPorcentaje(int porcentaje) {
        BigDecimal factor = BigDecimal.valueOf(porcentaje).divide(BigDecimal.valueOf(100), 10, RoundingMode.HALF_UP);
        return new Dinero(this.monto.multiply(factor), this.moneda);
    }

    /**
     * Multiplica el monto por un factor decimal (ej: factorComplejidad).
     */
    public Dinero multiplicar(BigDecimal factor) {
        return new Dinero(this.monto.multiply(factor), this.moneda);
    }

    private void validarMismaMoneda(Dinero otro) {
        if (!this.moneda.equals(otro.moneda)) {
            throw new IllegalArgumentException(
                    "No se pueden operar monedas distintas: " + this.moneda + " y " + otro.moneda);
        }
    }

    public BigDecimal getMonto() {
        return monto;
    }

    public String getMoneda() {
        return moneda;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Dinero dinero)) return false;
        return monto.compareTo(dinero.monto) == 0 && moneda.equals(dinero.moneda);
    }

    @Override
    public int hashCode() {
        return Objects.hash(monto.stripTrailingZeros(), moneda);
    }

    @Override
    public String toString() {
        return monto.toPlainString() + " " + moneda;
    }
}
