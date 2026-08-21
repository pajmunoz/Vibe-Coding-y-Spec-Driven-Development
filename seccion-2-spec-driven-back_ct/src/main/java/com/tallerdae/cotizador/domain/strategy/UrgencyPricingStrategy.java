package com.tallerdae.cotizador.domain.strategy;

import com.tallerdae.cotizador.domain.model.Dinero;

/**
 * Strategy para el cálculo de recargo y tiempo de entrega según el nivel de urgencia.
 * Permite agregar nuevos niveles de urgencia sin modificar el código existente (OCP).
 */
public interface UrgencyPricingStrategy {

    /**
     * Calcula el recargo aplicable sobre el subtotal.
     *
     * @param subtotal el subtotal calculado antes del recargo
     * @return el monto del recargo (puede ser cero para urgencia NORMAL)
     */
    Dinero calcularRecargo(Dinero subtotal);

    /**
     * Calcula el tiempo de entrega final en días a partir del tiempo base.
     *
     * @param tiempoBase tiempo máximo entre las reparaciones seleccionadas (RN-03)
     * @return tiempo de entrega ajustado según la urgencia
     */
    int calcularTiempoEntrega(int tiempoBase);
}
