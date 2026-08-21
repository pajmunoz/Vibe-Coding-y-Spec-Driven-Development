package com.tallerdae.cotizador.infrastructure.adapter.in.rest;

import com.tallerdae.cotizador.application.port.in.ConsultarCatalogoUseCase;
import com.tallerdae.cotizador.application.port.in.GenerarCotizacionUseCase;
import com.tallerdae.cotizador.application.port.in.GenerarCotizacionUseCase.GenerarCotizacionCommand;
import com.tallerdae.cotizador.domain.model.Cotizacion;
import com.tallerdae.cotizador.infrastructure.adapter.in.rest.dto.CalzadoResponse;
import com.tallerdae.cotizador.infrastructure.adapter.in.rest.dto.CotizacionRequest;
import com.tallerdae.cotizador.infrastructure.adapter.in.rest.dto.CotizacionResponse;
import com.tallerdae.cotizador.infrastructure.adapter.in.rest.dto.TipoReparacionResponse;
import com.tallerdae.cotizador.infrastructure.adapter.in.rest.mapper.CotizacionMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Adaptador de entrada REST para el cotizador de reparación de calzado.
 * Delega la lógica a los puertos de entrada (casos de uso) y traduce
 * los resultados a DTOs mediante el mapper.
 */
@RestController
@RequestMapping("/api")
@Tag(name = "Cotizaciones", description = "Endpoints para generar cotizaciones y consultar el catálogo")
public class CotizacionController {

    private final GenerarCotizacionUseCase generarCotizacionUseCase;
    private final ConsultarCatalogoUseCase consultarCatalogoUseCase;
    private final CotizacionMapper cotizacionMapper;

    public CotizacionController(GenerarCotizacionUseCase generarCotizacionUseCase,
                                 ConsultarCatalogoUseCase consultarCatalogoUseCase,
                                 CotizacionMapper cotizacionMapper) {
        this.generarCotizacionUseCase = generarCotizacionUseCase;
        this.consultarCatalogoUseCase = consultarCatalogoUseCase;
        this.cotizacionMapper = cotizacionMapper;
    }

    /**
     * HU-01 / HU-02: Genera una cotización estándar o urgente.
     * REQ-01, REQ-02, REQ-03.
     */
    @Operation(
        summary = "Generar cotización",
        description = "Genera una cotización de reparación de calzado. Si el campo 'urgente' es true, " +
                      "aplica un recargo del 30% y reduce el tiempo de entrega a la mitad (RN-02, RN-03)."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Cotización generada exitosamente",
            content = @Content(schema = @Schema(implementation = CotizacionResponse.class))),
        @ApiResponse(responseCode = "400", description = "Datos de entrada inválidos o sin reparaciones seleccionadas",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @PostMapping("/cotizaciones")
    public ResponseEntity<CotizacionResponse> generarCotizacion(
            @Valid @RequestBody CotizacionRequest request) {

        GenerarCotizacionCommand command = new GenerarCotizacionCommand(
                request.getCalzadoId(),
                request.getReparacionIds(),
                request.isUrgente()
        );

        Cotizacion cotizacion = generarCotizacionUseCase.generarCotizacion(command);
        CotizacionResponse response = cotizacionMapper.toResponse(cotizacion);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * HU-03: Lista todos los tipos de calzado disponibles en el catálogo.
     */
    @Operation(
        summary = "Listar calzados",
        description = "Retorna el catálogo completo de tipos de calzado disponibles para cotizar."
    )
    @ApiResponse(responseCode = "200", description = "Lista de calzados obtenida exitosamente")
    @GetMapping("/catalogo/calzados")
    public ResponseEntity<List<CalzadoResponse>> listarCalzados() {
        List<CalzadoResponse> calzados = cotizacionMapper
                .toCalzadoResponseList(consultarCatalogoUseCase.listarCalzados());
        return ResponseEntity.ok(calzados);
    }

    /**
     * HU-03: Lista todos los tipos de reparación disponibles en el catálogo.
     */
    @Operation(
        summary = "Listar reparaciones",
        description = "Retorna el catálogo completo de tipos de reparación disponibles para cotizar."
    )
    @ApiResponse(responseCode = "200", description = "Lista de reparaciones obtenida exitosamente")
    @GetMapping("/catalogo/reparaciones")
    public ResponseEntity<List<TipoReparacionResponse>> listarReparaciones() {
        List<TipoReparacionResponse> reparaciones = cotizacionMapper
                .toTipoReparacionResponseList(consultarCatalogoUseCase.listarReparaciones());
        return ResponseEntity.ok(reparaciones);
    }

    /**
     * DTO interno para representar errores en la documentación OpenAPI.
     */
    @Schema(description = "Respuesta de error")
    public record ErrorResponse(String mensaje) {}
}
