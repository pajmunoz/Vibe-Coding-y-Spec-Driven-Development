package com.tallerdae.cotizador.infrastructure.config;

import com.tallerdae.cotizador.domain.strategy.NormalPricingStrategy;
import com.tallerdae.cotizador.domain.strategy.UrgentePricingStrategy;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuración de beans de la aplicación.
 * Registra las estrategias de precios para que Spring las inyecte por tipo.
 */
@Configuration
public class CotizadorConfig {

    @Bean
    public NormalPricingStrategy normalPricingStrategy() {
        return new NormalPricingStrategy();
    }

    @Bean
    public UrgentePricingStrategy urgentePricingStrategy() {
        return new UrgentePricingStrategy();
    }
}
