package com.tallerdae.cotizador.domain.exception;

/**
 * Excepción de dominio para violaciones de reglas de negocio en Cotizacion.
 */
public class CotizacionException extends RuntimeException {

    public CotizacionException(String mensaje) {
        super(mensaje);
    }
}
