package com.tallerdae.cotizador.application.port.out;

import com.tallerdae.cotizador.domain.model.Cotizacion;

import java.util.Optional;

/**
 * Puerto de salida (driven port) para la persistencia de cotizaciones.
 * Desacopla el dominio de la implementación concreta del repositorio.
 */
public interface CotizacionRepositoryPort {

    /**
     * Persiste una cotización y la retorna.
     *
     * @param cotizacion la cotización a guardar
     * @return la cotización guardada
     */
    Cotizacion guardar(Cotizacion cotizacion);

    /**
     * Busca una cotización por su identificador único.
     *
     * @param id identificador UUID de la cotización
     * @return la cotización si existe, vacío en caso contrario
     */
    Optional<Cotizacion> buscarPorId(String id);
}
