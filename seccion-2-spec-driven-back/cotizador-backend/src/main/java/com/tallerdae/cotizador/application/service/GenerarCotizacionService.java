package com.tallerdae.cotizador.application.service;

import com.tallerdae.cotizador.application.port.in.ConsultarCatalogoUseCase;
import com.tallerdae.cotizador.application.port.in.GenerarCotizacionUseCase;
import com.tallerdae.cotizador.application.port.out.CalzadoRepositoryPort;
import com.tallerdae.cotizador.application.port.out.CotizacionRepositoryPort;
import com.tallerdae.cotizador.application.port.out.TipoReparacionRepositoryPort;
import com.tallerdae.cotizador.domain.exception.CotizacionException;
import com.tallerdae.cotizador.domain.model.Calzado;
import com.tallerdae.cotizador.domain.model.Cotizacion;
import com.tallerdae.cotizador.domain.model.TipoReparacion;
import com.tallerdae.cotizador.domain.strategy.NormalPricingStrategy;
import com.tallerdae.cotizador.domain.strategy.UrgencyPricingStrategy;
import com.tallerdae.cotizador.domain.strategy.UrgentePricingStrategy;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Servicio de aplicación que orquesta la generación de cotizaciones y la consulta del catálogo.
 * Implementa los puertos de entrada {@link GenerarCotizacionUseCase} y {@link ConsultarCatalogoUseCase}.
 *
 * Las dependencias se inyectan por constructor (buena práctica para facilitar tests).
 */
@Service
public class GenerarCotizacionService implements GenerarCotizacionUseCase, ConsultarCatalogoUseCase {

    private final CalzadoRepositoryPort calzadoRepository;
    private final TipoReparacionRepositoryPort tipoReparacionRepository;
    private final CotizacionRepositoryPort cotizacionRepository;
    private final NormalPricingStrategy normalPricingStrategy;
    private final UrgentePricingStrategy urgentePricingStrategy;

    public GenerarCotizacionService(CalzadoRepositoryPort calzadoRepository,
                                    TipoReparacionRepositoryPort tipoReparacionRepository,
                                    CotizacionRepositoryPort cotizacionRepository,
                                    NormalPricingStrategy normalPricingStrategy,
                                    UrgentePricingStrategy urgentePricingStrategy) {
        this.calzadoRepository = calzadoRepository;
        this.tipoReparacionRepository = tipoReparacionRepository;
        this.cotizacionRepository = cotizacionRepository;
        this.normalPricingStrategy = normalPricingStrategy;
        this.urgentePricingStrategy = urgentePricingStrategy;
    }

    /**
     * Genera una cotización aplicando las reglas de negocio RN-01 a RN-05.
     *
     * @param command datos de entrada: calzadoId, reparacionIds, urgente
     * @return la cotización generada y persistida
     */
    @Override
    public Cotizacion generarCotizacion(GenerarCotizacionCommand command) {
        // Resolver calzado
        Calzado calzado = calzadoRepository.buscarPorId(command.calzadoId())
                .orElseThrow(() -> new CotizacionException(
                        "Calzado no encontrado con id: " + command.calzadoId()));

        // Validar que se enviaron ids de reparaciones (RN-04 también se valida en el agregado)
        if (command.reparacionIds() == null || command.reparacionIds().isEmpty()) {
            throw new CotizacionException("Debe seleccionar al menos una reparación para generar la cotización.");
        }

        // Resolver reparaciones
        List<TipoReparacion> reparaciones = tipoReparacionRepository.buscarPorIds(command.reparacionIds());
        if (reparaciones.size() != command.reparacionIds().size()) {
            throw new CotizacionException("Una o más reparaciones no fueron encontradas en el catálogo.");
        }

        // Seleccionar estrategia según urgencia
        UrgencyPricingStrategy strategy = command.urgente() ? urgentePricingStrategy : normalPricingStrategy;

        // Crear cotización mediante Factory Method (valida invariants de dominio)
        Cotizacion cotizacion = Cotizacion.crear(calzado, reparaciones, command.urgente(), strategy);

        // Persistir y retornar
        return cotizacionRepository.guardar(cotizacion);
    }

    /**
     * Retorna todos los calzados disponibles en el catálogo (HU-03).
     */
    @Override
    public List<Calzado> listarCalzados() {
        return calzadoRepository.listarTodos();
    }

    /**
     * Retorna todos los tipos de reparación disponibles en el catálogo (HU-03).
     */
    @Override
    public List<TipoReparacion> listarReparaciones() {
        return tipoReparacionRepository.listarTodos();
    }
}
