package gt.edu.umg.security.protection;

import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;

/**
 * Validación server-side del token de Cloudflare Turnstile.
 * Docs: https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
 *
 * El token que genera el widget en Angular se envía aquí a la API siteverify de
 * Cloudflare junto con la clave secreta. Si Cloudflare no confirma "success",
 * el login se rechaza ANTES de procesar las credenciales.
 * Ante cualquier error de red se falla de forma cerrada (fail-closed).
 */
@Service
public class TurnstileService {

    private static final Logger log = LoggerFactory.getLogger(TurnstileService.class);
    private static final String VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

    private final String secretKey;
    private final boolean enabled;
    private final RestClient restClient;

    public TurnstileService(
            @Value("${turnstile.secret-key}") String secretKey,
            @Value("${turnstile.enabled:true}") boolean enabled) {
        this.secretKey = secretKey;
        this.enabled = enabled;

        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(5_000);
        factory.setReadTimeout(5_000);
        this.restClient = RestClient.builder().requestFactory(factory).build();
    }

    public boolean verify(String token, String remoteIp) {
        if (!enabled) {
            return true;
        }
        if (token == null || token.isBlank() || token.length() > 2048) {
            return false;
        }
        try {
            MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
            form.add("secret", secretKey);
            form.add("response", token);
            if (remoteIp != null) {
                form.add("remoteip", remoteIp);
            }

            Map<?, ?> body = restClient.post()
                    .uri(VERIFY_URL)
                    .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                    .body(form)
                    .retrieve()
                    .body(Map.class);

            boolean success = body != null && Boolean.TRUE.equals(body.get("success"));
            if (!success) {
                log.warn("Turnstile rechazó el token: {}", body != null ? body.get("error-codes") : "sin respuesta");
            }
            return success;
        } catch (Exception ex) {
            log.error("Error al validar Turnstile con Cloudflare: {}", ex.getMessage());
            return false;
        }
    }
}
