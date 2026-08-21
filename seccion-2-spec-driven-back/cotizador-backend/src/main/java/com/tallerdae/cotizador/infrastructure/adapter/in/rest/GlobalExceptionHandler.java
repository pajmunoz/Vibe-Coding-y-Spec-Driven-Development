package com.tallerdae.cotizador.infrastructure.adapter.in.rest;

import com.tallerdae.cotizador.domain.exception.CotizacionException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Manejador global de excepciones para los adaptadores REST.
 * Traduce excepciones de dominio y validación a respuestas HTTP apropiadas.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * REQ-03: Maneja violaciones de reglas de negocio del dominio (CotizacionException).
     * Retorna HTTP 400 con el mensaje de la excepción.
     */
    @ExceptionHandler(CotizacionException.class)
    public ResponseEntity<ErrorBody> handleCotizacionException(CotizacionException ex) {
        ErrorBody body = new ErrorBody(
                HttpStatus.BAD_REQUEST.value(),
                ex.getMessage(),
                null,
                LocalDateTime.now()
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    /**
     * REQ-03: Maneja errores de validación de Bean Validation (@Valid).
     * Retorna HTTP 400 con la lista de campos inválidos.
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorBody> handleValidationException(MethodArgumentNotValidException ex) {
        List<String> errores = ex.getBindingResult().getFieldErrors().stream()
                .map(FieldError::getDefaultMessage)
                .collect(Collectors.toList());

        String mensaje = "La solicitud contiene datos inválidos";
        ErrorBody body = new ErrorBody(
                HttpStatus.BAD_REQUEST.value(),
                mensaje,
                errores,
                LocalDateTime.now()
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    /**
     * Maneja cualquier excepción no controlada.
     * Retorna HTTP 500 con un mensaje genérico.
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorBody> handleGenericException(Exception ex) {
        ErrorBody body = new ErrorBody(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "Ocurrió un error interno en el servidor",
                null,
                LocalDateTime.now()
        );
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
    }

    /**
     * Estructura de respuesta de error estandarizada.
     */
    public record ErrorBody(
            int status,
            String mensaje,
            List<String> errores,
            LocalDateTime timestamp
    ) {}
}
