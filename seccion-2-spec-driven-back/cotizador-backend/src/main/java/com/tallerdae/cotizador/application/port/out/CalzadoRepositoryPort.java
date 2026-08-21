package com.tallerdae.cotizador.application.port.out;

import com.tallerdae.cotizador.domain.model.Calzado;

import java.util.List;
import java.util.Optional;

/**
 * Puerto de salida (driven port) para el acceso al catálogo de calzados.
 */
public interface CalzadoRepositoryPort {

    /**
     * Busca un calzado por su identificador.
     *
     * @param id identificador del calzado
     * @return el calzado si existe, vacío en caso contrario
     */
    Optional<Calzado> buscarPorId(String id);

    /**
     * Retorna todos los calzados disponibles en el catálogo.
     */
    List<Calzado> listarTodos();
}
