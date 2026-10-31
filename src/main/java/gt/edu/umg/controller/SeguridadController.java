package gt.edu.umg.controller;

import java.time.Instant;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import gt.edu.umg.dao.UsuarioRepository;
import gt.edu.umg.security.protection.LoginAttemptService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

/**
 * Gestión de bloqueos de inicio de sesión. Exclusivo para ADMINISTRADOR.
 * Al ser un endpoint autenticado y solo para administradores, aquí sí se puede
 * indicar si el username bloqueado pertenece a un usuario registrado.
 */
@RestController
@RequestMapping("/api/v1/seguridad/bloqueos")
@Tag(name = "Seguridad", description = "Consulta y desbloqueo manual de cuentas bloqueadas por intentos fallidos")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasRole('ADMINISTRADOR')")
public class SeguridadController {

    private final LoginAttemptService loginAttemptService;
    private final UsuarioRepository usuarioRepository;

    public SeguridadController(LoginAttemptService loginAttemptService, UsuarioRepository usuarioRepository) {
        this.loginAttemptService = loginAttemptService;
        this.usuarioRepository = usuarioRepository;
    }

    @GetMapping
    @Operation(summary = "Listar cuentas bloqueadas temporalmente")
    public ResponseEntity<List<BloqueoDto>> listarBloqueos() {
        List<BloqueoDto> bloqueos = loginAttemptService.getLockedAccounts().stream()
                .map(l -> new BloqueoDto(
                        l.username(),
                        usuarioRepository.existsByUsername(l.username()),
                        l.failedAttempts(),
                        l.lastFailure(),
                        l.lockedUntil(),
                        l.remainingSeconds()))
                .toList();
        return ResponseEntity.ok(bloqueos);
    }

    @DeleteMapping("/{username}")
    @Operation(summary = "Desbloquear manualmente una cuenta")
    public ResponseEntity<Map<String, Object>> desbloquear(@PathVariable String username) {
        boolean removed = loginAttemptService.unlock(username);
        if (!removed) {
            return ResponseEntity.status(404).body(Map.of(
                    "error", "NOT_LOCKED",
                    "message", "La cuenta '" + username + "' no tiene bloqueos activos."));
        }
        return ResponseEntity.ok(Map.of(
                "message", "Cuenta '" + username + "' desbloqueada correctamente.",
                "username", username));
    }

    public record BloqueoDto(String username, boolean usuarioRegistrado, int intentosFallidos,
                             Instant ultimoIntento, Instant bloqueadoHasta, long segundosRestantes) {
    }
}
