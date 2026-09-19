package gt.edu.umg.security.jwt;

import java.util.Date;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Component;

import gt.edu.umg.security.rsa.RsaKeyProvider;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;

/**
 * Proveedor de tokens JWT usando firma asimétrica RSA.
 * Firma tokens dinámicamente con la Llave Privada RSA.
 * Valida tokens usando la Llave Pública RSA.
 */
@Component
public class JwtTokenProvider {

    private static final Logger logger = LoggerFactory.getLogger(JwtTokenProvider.class);

    private final RsaKeyProvider rsaKeyProvider;

    @Value("${jwt.expiration-ms:28800000}")
    private long jwtExpirationMs;

    @Value("${jwt.issuer:HospitalManagementSystem}")
    private String jwtIssuer;

    public JwtTokenProvider(RsaKeyProvider rsaKeyProvider) {
        this.rsaKeyProvider = rsaKeyProvider;
    }

    /**
     * Emite un token JWT firmado con la Llave Privada RSA.
     */
    public String generateToken(Authentication authentication, List<String> roles, List<String> permisos) {
        String username = authentication.getName();
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpirationMs);

        return Jwts.builder()
                .subject(username)
                .issuer(jwtIssuer)
                .claim("roles", roles)
                .claim("permisos", permisos)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(rsaKeyProvider.getPrivateKey()) // Firma con llave PRIVADA RSA
                .compact();
    }

    /**
     * Valida el token JWT usando la Llave Pública RSA.
     */
    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                    .verifyWith(rsaKeyProvider.getPublicKey()) // Valida con llave PÚBLICA RSA
                    .build()
                    .parseSignedClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            logger.error("Token JWT inválido o expirado: {}", e.getMessage());
        }
        return false;
    }

    /**
     * Extrae el nombre de usuario (subject) del token JWT.
     */
    public String getUsernameFromToken(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(rsaKeyProvider.getPublicKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();

        return claims.getSubject();
    }

    /**
     * Extrae los claims del token.
     */
    public Claims getClaimsFromToken(String token) {
        return Jwts.parser()
                .verifyWith(rsaKeyProvider.getPublicKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
