package com.tallerdae.cotizador.application.port.in;

import com.tallerdae.cotizador.domain.model.Calzado;
import com.tallerdae.cotizador.domain.model.TipoReparacion;

import java.util.List;

/**
 * Puerto de entrada (driving port) para la consulta del catálogo disponible.
 * Soporta HU-03: consultar tipos de calzado y reparaciones antes de cotizar.
 */
public interface ConsultarCatalogoUseCase {

    /**
     * Retorna todos los tipos de calzado disponibles.
     */
    List<Calzado> listarCalzados();

    /**
     * Retorna todos los tipos de reparación disponibles.
     */
    List<TipoReparacion> listarReparaciones();
}
