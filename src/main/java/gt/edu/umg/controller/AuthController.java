package gt.edu.umg.controller;

import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import gt.edu.umg.core.entities.Dtos.Request.LoginRequestDto;
import gt.edu.umg.core.entities.Dtos.Response.LoginResponseDto;
import gt.edu.umg.security.protection.ClientIpResolver;
import gt.edu.umg.security.protection.LoginAttemptService;
import gt.edu.umg.security.protection.TurnstileService;
import gt.edu.umg.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Autenticación", description = "Endpoints para inicio de sesión y obtención de JWT firmado con RSA")
public class AuthController {

    /** Mensaje único para cualquier fallo de credenciales (no revela si el usuario existe). */
    private static final String GENERIC_AUTH_ERROR = "Usuario o contraseña incorrectos.";

    private final AuthService authService;
    private final TurnstileService turnstileService;
    private final LoginAttemptService loginAttemptService;

    public AuthController(AuthService authService,
                          TurnstileService turnstileService,
                          LoginAttemptService loginAttemptService) {
        this.authService = authService;
        this.turnstileService = turnstileService;
        this.loginAttemptService = loginAttemptService;
    }

    /**
     * Flujo de seguridad del login (en este orden):
     * 1. Rate limiting por IP (LoginRateLimitFilter) -> 429 si supera 10 req/min.
     * 2. Validación de Cloudflare Turnstile en el servidor -> 400 si es inválido.
     * 3. Verificación de bloqueo temporal de la cuenta -> 429 si está bloqueada.
     * 4. Validación de credenciales -> 401 genérico si fallan (se cuenta el intento).
     */
    @PostMapping("/login")
    @Operation(summary = "Iniciar sesión y obtener Token JWT RSA",
            description = "Requiere un token válido de Cloudflare Turnstile. Limitado a 10 solicitudes por minuto por IP. "
                    + "Tras 5 intentos fallidos consecutivos la cuenta se bloquea 15 minutos.")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequestDto loginRequest, HttpServletRequest request) {
        String clientIp = ClientIpResolver.resolve(request);

        // 2. CAPTCHA: se valida ANTES de tocar las credenciales
        if (!turnstileService.verify(loginRequest.getTurnstileToken(), clientIp)) {
            return error(HttpStatus.BAD_REQUEST, "CAPTCHA_INVALID",
                    "La verificación de seguridad (CAPTCHA) no es válida o expiró. Inténtalo de nuevo.", null);
        }

        String username = loginRequest.getUsername();

        // 3. Bloqueo temporal: no se evalúa la contraseña mientras dure el bloqueo
        long remaining = loginAttemptService.getRemainingLockSeconds(username);
        if (remaining > 0) {
            return lockedResponse(remaining);
        }

        // 4. Credenciales
        try {
            LoginResponseDto response = authService.login(loginRequest);
            loginAttemptService.loginSucceeded(username);
            return ResponseEntity.ok(response);
        } catch (AuthenticationException ex) {
            // Usuario inexistente, contraseña incorrecta o cuenta deshabilitada: misma respuesta
            loginAttemptService.loginFailed(username);
            return error(HttpStatus.UNAUTHORIZED, "INVALID_CREDENTIALS", GENERIC_AUTH_ERROR, null);
        }
    }

    @GetMapping("/me")
    @Operation(summary = "Obtener información del usuario autenticado", description = "Retorna el nombre de usuario autenticado en el sistema a través del token JWT.")
    public ResponseEntity<?> getProfile() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body("No autenticado");
        }
        return ResponseEntity.ok(authentication.getPrincipal());
    }

    private ResponseEntity<Map<String, Object>> lockedResponse(long remainingSeconds) {
        long minutes = Math.max(1, (remainingSeconds + 59) / 60);
        return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                .header("Retry-After", String.valueOf(remainingSeconds))
                .body(body("ACCOUNT_TEMPORARILY_LOCKED",
                        "Demasiados intentos fallidos. Por seguridad, el acceso está bloqueado temporalmente. "
                                + "Intenta nuevamente en " + minutes + " minuto(s).",
                        remainingSeconds));
    }

    private ResponseEntity<Map<String, Object>> error(HttpStatus status, String code, String message, Long retryAfter) {
        return ResponseEntity.status(status).body(body(code, message, retryAfter));
    }

    private Map<String, Object> body(String code, String message, Long retryAfter) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("error", code);
        body.put("message", message);
        if (retryAfter != null) {
            body.put("retryAfterSeconds", retryAfter);
        }
        return body;
    }
}
