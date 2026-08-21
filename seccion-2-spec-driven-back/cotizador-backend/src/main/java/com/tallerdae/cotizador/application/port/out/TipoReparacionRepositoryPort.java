package com.tallerdae.cotizador.application.port.out;

import com.tallerdae.cotizador.domain.model.TipoReparacion;

import java.util.List;
import java.util.Optional;

/**
 * Puerto de salida (driven port) para el acceso al catálogo de tipos de reparación.
 */
public interface TipoReparacionRepositoryPort {

    /**
     * Busca un tipo de reparación por su identificador.
     *
     * @param id identificador del tipo de reparación
     * @return el tipo de reparación si existe, vacío en caso contrario
     */
    Optional<TipoReparacion> buscarPorId(String id);

    /**
     * Busca múltiples tipos de reparación por sus identificadores.
     *
     * @param ids lista de identificadores a buscar
     * @return lista de reparaciones encontradas (puede ser menor que ids si alguno no existe)
     */
    List<TipoReparacion> buscarPorIds(List<String> ids);

    /**
     * Retorna todos los tipos de reparación disponibles en el catálogo.
     */
    List<TipoReparacion> listarTodos();
}
