package com.tallerdae.cotizador.application.port.in;

import com.tallerdae.cotizador.domain.model.Cotizacion;

import java.util.List;

/**
 * Puerto de entrada (driving port) para el caso de uso de generación de cotizaciones.
 * Define el contrato que la capa de infraestructura (controlador REST) debe invocar.
 */
public interface GenerarCotizacionUseCase {

    /**
     * Genera una nueva cotización a partir del comando recibido.
     *
     * @param command datos necesarios para crear la cotización
     * @return la cotización generada con todos sus cálculos aplicados
     */
    Cotizacion generarCotizacion(GenerarCotizacionCommand command);

    /**
     * Comando inmutable que encapsula los datos de entrada para el caso de uso.
     */
    record GenerarCotizacionCommand(
            String calzadoId,
            List<String> reparacionIds,
            boolean urgente
    ) {}
}
