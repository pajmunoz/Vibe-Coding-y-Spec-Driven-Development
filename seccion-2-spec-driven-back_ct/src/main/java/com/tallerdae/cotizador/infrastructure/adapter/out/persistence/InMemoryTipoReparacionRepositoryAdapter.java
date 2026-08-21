package com.tallerdae.cotizador.infrastructure.adapter.out.persistence;

import com.tallerdae.cotizador.application.port.out.TipoReparacionRepositoryPort;
import com.tallerdae.cotizador.domain.model.Dinero;
import com.tallerdae.cotizador.domain.model.TipoReparacion;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

/**
 * Adaptador de persistencia en memoria para el catálogo de tipos de reparación.
 * Pre-carga un conjunto de reparaciones representativas al inicializarse.
 */
@Component
public class InMemoryTipoReparacionRepositoryAdapter implements TipoReparacionRepositoryPort {

    private static final String MONEDA = "PEN";

    private final Map<String, TipoReparacion> almacen = new ConcurrentHashMap<>();

    public InMemoryTipoReparacionRepositoryAdapter() {
        cargarDatosIniciales();
    }

    private void cargarDatosIniciales() {
        List.of(
            new TipoReparacion("REP-001", "Cambio de suela",      Dinero.de(25.00, MONEDA), 3),
            new TipoReparacion("REP-002", "Costura de capellada", Dinero.de(15.00, MONEDA), 2),
            new TipoReparacion("REP-003", "Limpieza profunda",    Dinero.de(10.00, MONEDA), 1),
            new TipoReparacion("REP-004", "Cambio de taco",       Dinero.de(12.00, MONEDA), 2),
            new TipoReparacion("REP-005", "Pegado de puntera",    Dinero.de(20.00, MONEDA), 4),
            new TipoReparacion("REP-006", "Tinte y acabado",      Dinero.de(18.00, MONEDA), 3)
        ).forEach(r -> almacen.put(r.getId(), r));
    }

    @Override
    public Optional<TipoReparacion> buscarPorId(String id) {
        return Optional.ofNullable(almacen.get(id));
    }

    @Override
    public List<TipoReparacion> buscarPorIds(List<String> ids) {
        return ids.stream()
                .map(almacen::get)
                .filter(r -> r != null)
                .collect(Collectors.toList());
    }

    @Override
    public List<TipoReparacion> listarTodos() {
        return new ArrayList<>(almacen.values());
    }
}
