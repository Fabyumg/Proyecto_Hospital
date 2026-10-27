package gt.edu.umg.security.protection;

import jakarta.servlet.http.HttpServletRequest;

/**
 * Obtiene la IP real del cliente cuando la aplicación corre detrás de proxies
 * (Render usa Cloudflare). Se prioriza CF-Connecting-IP porque Cloudflare lo
 * sobrescribe siempre y el cliente no puede falsificarlo.
 */
public final class ClientIpResolver {

    private ClientIpResolver() {
    }

    public static String resolve(HttpServletRequest request) {
        String cf = request.getHeader("CF-Connecting-IP");
        if (cf != null && !cf.isBlank()) {
            return cf.trim();
        }
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
