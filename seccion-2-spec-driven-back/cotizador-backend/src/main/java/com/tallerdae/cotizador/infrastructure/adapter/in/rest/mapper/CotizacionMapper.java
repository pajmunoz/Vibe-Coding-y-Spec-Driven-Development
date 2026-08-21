package com.tallerdae.cotizador.infrastructure.adapter.in.rest.mapper;

import com.tallerdae.cotizador.domain.model.Calzado;
import com.tallerdae.cotizador.domain.model.Cotizacion;
import com.tallerdae.cotizador.domain.model.TipoReparacion;
import com.tallerdae.cotizador.infrastructure.adapter.in.rest.dto.CalzadoResponse;
import com.tallerdae.cotizador.infrastructure.adapter.in.rest.dto.CotizacionResponse;
import com.tallerdae.cotizador.infrastructure.adapter.in.rest.dto.TipoReparacionResponse;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Mapper que convierte entidades de dominio a DTOs de respuesta REST.
 * Desacopla el contrato HTTP del modelo interno de dominio.
 */
@Component
public class CotizacionMapper {

    /**
     * Convierte una {@link Cotizacion} de dominio al DTO {@link CotizacionResponse}.
     */
    public CotizacionResponse toResponse(Cotizacion cotizacion) {
        CotizacionResponse response = new CotizacionResponse();

        response.setId(cotizacion.getId());
        response.setCalzadoId(cotizacion.getCalzado().getId());
        response.setCalzadoNombre(cotizacion.getCalzado().getNombre());
        response.setUrgente(cotizacion.isUrgente());
        response.setSubtotal(cotizacion.getSubtotal().getMonto());
        response.setRecargo(cotizacion.getRecargo().getMonto());
        response.setTotal(cotizacion.getTotal().getMonto());
        response.setTiempoEstimadoDias(cotizacion.getTiempoEstimadoDias());
        response.setMoneda(cotizacion.getTotal().getMoneda());
        response.setFechaCreacion(cotizacion.getFechaCreacion());

        List<CotizacionResponse.ReparacionResumen> reparaciones = cotizacion.getReparaciones().stream()
                .map(r -> new CotizacionResponse.ReparacionResumen(
                        r.getId(),
                        r.getNombre(),
                        r.getPrecioBase().getMonto()))
                .collect(Collectors.toList());
        response.setReparaciones(reparaciones);

        return response;
    }

    /**
     * Convierte un {@link Calzado} de dominio al DTO {@link CalzadoResponse}.
     */
    public CalzadoResponse toCalzadoResponse(Calzado calzado) {
        return new CalzadoResponse(
                calzado.getId(),
                calzado.getNombre(),
                calzado.getFactorComplejidad()
        );
    }

    /**
     * Convierte una lista de {@link Calzado} a lista de {@link CalzadoResponse}.
     */
    public List<CalzadoResponse> toCalzadoResponseList(List<Calzado> calzados) {
        return calzados.stream()
                .map(this::toCalzadoResponse)
                .collect(Collectors.toList());
    }

    /**
     * Convierte un {@link TipoReparacion} de dominio al DTO {@link TipoReparacionResponse}.
     */
    public TipoReparacionResponse toTipoReparacionResponse(TipoReparacion reparacion) {
        return new TipoReparacionResponse(
                reparacion.getId(),
                reparacion.getNombre(),
                reparacion.getPrecioBase().getMonto(),
                reparacion.getTiempoEstimadoDias(),
                reparacion.getPrecioBase().getMoneda()
        );
    }

    /**
     * Convierte una lista de {@link TipoReparacion} a lista de {@link TipoReparacionResponse}.
     */
    public List<TipoReparacionResponse> toTipoReparacionResponseList(List<TipoReparacion> reparaciones) {
        return reparaciones.stream()
                .map(this::toTipoReparacionResponse)
                .collect(Collectors.toList());
    }
}
