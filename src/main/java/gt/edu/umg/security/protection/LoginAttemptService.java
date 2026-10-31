package gt.edu.umg.security.protection;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/**
 * Control de intentos fallidos y bloqueo temporal de cuentas.
 *
 * - Cuenta los intentos fallidos CONSECUTIVOS por nombre de usuario.
 * - Al llegar al máximo (5 por defecto) bloquea la cuenta durante 15 minutos.
 * - Un login exitoso reinicia el contador.
 * - Las cuentas exentas (security.login.lock-exempt-users, por defecto admin y
 *   operador) nunca acumulan intentos ni se bloquean.
 * - Un administrador puede listar y desbloquear cuentas manualmente.
 *
 * Anti-enumeración: el contador se lleva por el username recibido, exista o no
 * en la base de datos. Así una cuenta inexistente se comporta exactamente igual
 * que una real (mismos mensajes, mismo bloqueo) y no se puede deducir si existe.
 */
@Service
public class LoginAttemptService {

    private final int maxAttempts;
    private final Duration lockDuration;
    private final Set<String> exemptUsers;
    private final Map<String, AttemptInfo> attempts = new ConcurrentHashMap<>();

    public LoginAttemptService(
            @Value("${security.login.max-failed-attempts:5}") int maxAttempts,
            @Value("${security.login.lock-minutes:15}") long lockMinutes,
            @Value("${security.login.lock-exempt-users:admin,operador}") String exemptUsers) {
        this.maxAttempts = maxAttempts;
        this.lockDuration = Duration.ofMinutes(lockMinutes);
        this.exemptUsers = Arrays.stream(exemptUsers.split(","))
                .map(this::normalize)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toUnmodifiableSet());
    }

    /** Segundos restantes de bloqueo, o 0 si la cuenta no está bloqueada. */
    public long getRemainingLockSeconds(String username) {
        String key = normalize(username);
        if (exemptUsers.contains(key)) {
            return 0;
        }
        AttemptInfo info = attempts.get(key);
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
                attempts.remove(key, info);
                return 0;
            }
            return remaining;
        }
    }

    public boolean isBlocked(String username) {
        return getRemainingLockSeconds(username) > 0;
    }

    public void loginFailed(String username) {
        String key = normalize(username);
        if (exemptUsers.contains(key)) {
            // Cuentas principales del sistema: nunca se penalizan
            return;
        }
        AttemptInfo info = attempts.computeIfAbsent(key, k -> new AttemptInfo());
        synchronized (info) {
            info.failures++;
            info.lastFailure = Instant.now();
            if (info.failures >= maxAttempts && info.lockedUntil == null) {
                info.lockedUntil = info.lastFailure.plus(lockDuration);
            }
        }
        purgeIfLarge();
    }

    public void loginSucceeded(String username) {
        attempts.remove(normalize(username));
    }

    /** Lista de cuentas actualmente bloqueadas (las expiradas se limpian). */
    public List<LockedAccount> getLockedAccounts() {
        Instant now = Instant.now();
        List<LockedAccount> result = new ArrayList<>();
        attempts.forEach((username, info) -> {
            synchronized (info) {
                if (info.lockedUntil == null) {
                    return;
                }
                if (!info.lockedUntil.isAfter(now)) {
                    attempts.remove(username, info);
                    return;
                }
                result.add(new LockedAccount(username, info.failures, info.lastFailure, info.lockedUntil,
                        Duration.between(now, info.lockedUntil).getSeconds()));
            }
        });
        result.sort(Comparator.comparing(LockedAccount::lockedUntil).reversed());
        return result;
    }

    /** Desbloqueo manual. Devuelve true si la cuenta estaba registrada en el control de intentos. */
    public boolean unlock(String username) {
        return attempts.remove(normalize(username)) != null;
    }

    public boolean isExempt(String username) {
        return exemptUsers.contains(normalize(username));
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

    public record LockedAccount(String username, int failedAttempts, Instant lastFailure,
                                Instant lockedUntil, long remainingSeconds) {
    }

    private static final class AttemptInfo {
        private int failures;
        private Instant lastFailure;
        private Instant lockedUntil;
    }
}
