package gt.edu.umg.security.protection;

import java.time.Duration;
import java.time.Instant;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/**
 * Control de intentos fallidos y bloqueo temporal de cuentas.
 *
 * - Cuenta los intentos fallidos CONSECUTIVOS por nombre de usuario.
 * - Al llegar al máximo (5 por defecto) bloquea la cuenta durante 15 minutos.
 * - Un login exitoso reinicia el contador.
 *
 * Anti-enumeración: el contador se lleva por el username recibido, exista o no
 * en la base de datos. Así una cuenta inexistente se comporta exactamente igual
 * que una real (mismos mensajes, mismo bloqueo) y no se puede deducir si existe.
 */
@Service
public class LoginAttemptService {

    private final int maxAttempts;
    private final Duration lockDuration;
    private final Map<String, AttemptInfo> attempts = new ConcurrentHashMap<>();

    public LoginAttemptService(
            @Value("${security.login.max-failed-attempts:5}") int maxAttempts,
            @Value("${security.login.lock-minutes:15}") long lockMinutes) {
        this.maxAttempts = maxAttempts;
        this.lockDuration = Duration.ofMinutes(lockMinutes);
    }

    /** Segundos restantes de bloqueo, o 0 si la cuenta no está bloqueada. */
    public long getRemainingLockSeconds(String username) {
        AttemptInfo info = attempts.get(normalize(username));
        if (info == null) {
            return 0;
        }
        synchronized (info) {
            if (info.lockedUntil == null) {
                return 0;
            }
            long remaining = Duration.between(Instant.now(), info.lockedUntil).getSeconds();
            if (remaining <= 0) {
                // El bloqueo expiró: se reinicia el contador
                info.lockedUntil = null;
                info.failures = 0;
                return 0;
            }
            return remaining;
        }
    }

    public boolean isBlocked(String username) {
        return getRemainingLockSeconds(username) > 0;
    }

    public void loginFailed(String username) {
        AttemptInfo info = attempts.computeIfAbsent(normalize(username), k -> new AttemptInfo());
        synchronized (info) {
            info.failures++;
            if (info.failures >= maxAttempts) {
                info.lockedUntil = Instant.now().plus(lockDuration);
            }
        }
        purgeIfLarge();
    }

    public void loginSucceeded(String username) {
        attempts.remove(normalize(username));
    }

    public long getLockMinutes() {
        return lockDuration.toMinutes();
    }

    private String normalize(String username) {
        return username == null ? "" : username.trim().toLowerCase(Locale.ROOT);
    }

    private void purgeIfLarge() {
        if (attempts.size() < 10_000) {
            return;
        }
        Instant now = Instant.now();
        attempts.entrySet().removeIf(e -> {
            synchronized (e.getValue()) {
                return e.getValue().lockedUntil != null && e.getValue().lockedUntil.isBefore(now);
            }
        });
    }

    private static final class AttemptInfo {
        private int failures;
        private Instant lockedUntil;
    }
}
