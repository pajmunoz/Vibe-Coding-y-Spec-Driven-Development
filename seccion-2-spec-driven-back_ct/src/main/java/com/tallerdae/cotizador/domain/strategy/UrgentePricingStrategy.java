package com.tallerdae.cotizador.domain.strategy;

import com.tallerdae.cotizador.domain.model.Dinero;

/**
 * Estrategia de precio para cotizaciones URGENTES.
 *
 * RN-02: Recargo del 30% sobre el subtotal.
 * RN-03: Tiempo = ceil(tiempoBase / 2), mínimo 1 día.
 */
public class UrgentePricingStrategy implements UrgencyPricingStrategy {

    private static final int RECARGO_URGENCIA_PORCENTAJE = 30;

    @Override
    public Dinero calcularRecargo(Dinero subtotal) {
        // RN-02: recargo = 30% del subtotal
        return subtotal.aplicarPorcentaje(RECARGO_URGENCIA_PORCENTAJE);
    }

    @Override
    public int calcularTiempoEntrega(int tiempoBase) {
        // RN-03: ceil(tiempoBase / 2), mínimo 1 día
        int tiempoUrgente = (int) Math.ceil(tiempoBase / 2.0);
        return Math.max(tiempoUrgente, 1);
    }
}
