package gt.edu.umg.security.rsa;

import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.NoSuchAlgorithmException;
import java.security.PrivateKey;
import java.security.PublicKey;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;

/**
 * Proveedor y gestor de llaves RSA (Privada y Pública).
 * Genera dinámicamente un par de llaves RSA de 2048 bits para firmar y verificar JWT.
 */
@Component
public class RsaKeyProvider {

    private static final Logger logger = LoggerFactory.getLogger(RsaKeyProvider.class);

    private RSAPrivateKey privateKey;
    private RSAPublicKey publicKey;

    @PostConstruct
    public void initKeys() {
        try {
            logger.info("Inicializando par de llaves RSA de 2048 bits para firma de JWT...");
            KeyPairGenerator keyPairGenerator = KeyPairGenerator.getInstance("RSA");
            keyPairGenerator.initialize(2048);
            KeyPair keyPair = keyPairGenerator.generateKeyPair();

            this.privateKey = (RSAPrivateKey) keyPair.getPrivate();
            this.publicKey = (RSAPublicKey) keyPair.getPublic();

            logger.info("Llaves RSA (Privada y Pública) generadas correctamente en memoria.");
        } catch (NoSuchAlgorithmException e) {
            logger.error("Error crítico: Algoritmo RSA no soportado en el sistema", e);
            throw new RuntimeException("Error al generar llaves RSA", e);
        }
    }

    public PrivateKey getPrivateKey() {
        return privateKey;
    }

    public PublicKey getPublicKey() {
        return publicKey;
    }
}
