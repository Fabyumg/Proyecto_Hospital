package gt.edu.umg.security.protection;

import java.io.IOException;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * Rate Limiting por IP sobre el endpoint de autenticación.
 * Ventana deslizante: máximo N solicitudes (por defecto 10) por cada 60 segundos.
 * Al exceder el límite responde HTTP 429 Too Many Requests con cabecera Retry-After.
 *
 * Se registra dentro de la cadena de Spring Security (después del CorsFilter)
 * para que la respuesta 429 incluya las cabeceras CORS y el navegador pueda leerla.
 */
@Component
public class LoginRateLimitFilter extends OncePerRequestFilter {

    private static final String LOGIN_PATH = "/api/auth/login";
    private static final long WINDOW_MS = 60_000L;

    private final int maxRequests;
    private final Map<String, Deque<Long>> requestsByIp = new ConcurrentHashMap<>();

    public LoginRateLimitFilter(@Value("${security.rate-limit.login.max-requests-per-minute:10}") int maxRequests) {
        this.maxRequests = maxRequests;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        // Solo POST /api/auth/login; las preflight OPTIONS no consumen cupo
        return !(HttpMethod.POST.matches(request.getMethod())
                && LOGIN_PATH.equals(request.getRequestURI()));
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {

        String ip = ClientIpResolver.resolve(request);
        long now = System.currentTimeMillis();
        long retryAfterSeconds = 0;
        boolean allowed;

        Deque<Long> timestamps = requestsByIp.computeIfAbsent(ip, k -> new ArrayDeque<>());
        synchronized (timestamps) {
            while (!timestamps.isEmpty() && now - timestamps.peekFirst() >= WINDOW_MS) {
                timestamps.pollFirst();
            }
            allowed = timestamps.size() < maxRequests;
            if (allowed) {
                timestamps.addLast(now);
            } else {
                retryAfterSeconds = Math.max(1, (WINDOW_MS - (now - timestamps.peekFirst())) / 1000);
            }
        }

        if (!allowed) {
            response.setStatus(429);
            response.setHeader("Retry-After", String.valueOf(retryAfterSeconds));
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().write("{\"error\":\"TOO_MANY_REQUESTS\",\"message\":"
                    + "\"Demasiadas solicitudes. Intenta nuevamente en " + retryAfterSeconds + " segundos.\","
                    + "\"retryAfterSeconds\":" + retryAfterSeconds + "}");
            return;
        }

        purgeIfLarge(now);
        chain.doFilter(request, response);
    }

    /** Evita crecimiento ilimitado de memoria eliminando IPs sin actividad reciente. */
    private void purgeIfLarge(long now) {
        if (requestsByIp.size() < 10_000) {
            return;
        }
        requestsByIp.entrySet().removeIf(e -> {
            synchronized (e.getValue()) {
                Long last = e.getValue().peekLast();
                return last == null || now - last >= WINDOW_MS;
            }
        });
    }
}
