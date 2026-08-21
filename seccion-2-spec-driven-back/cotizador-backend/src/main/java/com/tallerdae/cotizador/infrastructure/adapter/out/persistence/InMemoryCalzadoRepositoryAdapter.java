package com.tallerdae.cotizador.infrastructure.adapter.out.persistence;

import com.tallerdae.cotizador.application.port.out.CalzadoRepositoryPort;
import com.tallerdae.cotizador.domain.model.Calzado;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Adaptador de persistencia en memoria para el catálogo de calzados.
 * Pre-carga un conjunto de calzados representativos al inicializarse.
 */
@Component
public class InMemoryCalzadoRepositoryAdapter implements CalzadoRepositoryPort {

    private final Map<String, Calzado> almacen = new ConcurrentHashMap<>();

    public InMemoryCalzadoRepositoryAdapter() {
        cargarDatosIniciales();
    }

    private void cargarDatosIniciales() {
        List.of(
            new Calzado("CAL-001", "Zapatilla deportiva",  new BigDecimal("1.0")),
            new Calzado("CAL-002", "Zapato de vestir",     new BigDecimal("1.2")),
            new Calzado("CAL-003", "Bota de trabajo",      new BigDecimal("1.5")),
            new Calzado("CAL-004", "Sandalia",             new BigDecimal("0.8")),
            new Calzado("CAL-005", "Bota de cuero",        new BigDecimal("1.8"))
        ).forEach(c -> almacen.put(c.getId(), c));
    }

    @Override
    public Optional<Calzado> buscarPorId(String id) {
        return Optional.ofNullable(almacen.get(id));
    }

    @Override
    public List<Calzado> listarTodos() {
        return new ArrayList<>(almacen.values());
    }
}
