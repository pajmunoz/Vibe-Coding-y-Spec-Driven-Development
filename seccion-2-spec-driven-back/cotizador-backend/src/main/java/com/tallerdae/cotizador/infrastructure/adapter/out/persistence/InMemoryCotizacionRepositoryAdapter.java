package com.tallerdae.cotizador.infrastructure.adapter.out.persistence;

import com.tallerdae.cotizador.application.port.out.CotizacionRepositoryPort;
import com.tallerdae.cotizador.domain.model.Cotizacion;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Adaptador de persistencia en memoria para cotizaciones.
 * Las cotizaciones se almacenan en un mapa concurrente durante el ciclo de vida de la aplicación.
 * No hay persistencia real: los datos se pierden al reiniciar.
 */
@Component
public class InMemoryCotizacionRepositoryAdapter implements CotizacionRepositoryPort {

    private final Map<String, Cotizacion> almacen = new ConcurrentHashMap<>();

    @Override
    public Cotizacion guardar(Cotizacion cotizacion) {
        almacen.put(cotizacion.getId(), cotizacion);
        return cotizacion;
    }

    @Override
    public Optional<Cotizacion> buscarPorId(String id) {
        return Optional.ofNullable(almacen.get(id));
    }
}
