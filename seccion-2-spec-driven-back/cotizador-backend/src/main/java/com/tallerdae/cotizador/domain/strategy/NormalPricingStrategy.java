package com.tallerdae.cotizador.domain.strategy;

import com.tallerdae.cotizador.domain.model.Dinero;

/**
 * Estrategia de precio para cotizaciones NORMALES (sin urgencia).
 * No aplica recargo y el tiempo de entrega no se modifica.
 */
public class NormalPricingStrategy implements UrgencyPricingStrategy {

    @Override
    public Dinero calcularRecargo(Dinero subtotal) {
        // Sin recargo: retorna cero en la misma moneda
        return Dinero.cero(subtotal.getMoneda());
    }

    @Override
    public int calcularTiempoEntrega(int tiempoBase) {
        // Tiempo sin modificación
        return tiempoBase;
    }
}
