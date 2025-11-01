// File: com/ecommerce/security/core/service/TokenValidator.java

package com.ecommerce.security.core.service;

import com.ecommerce.security.core.config.JwtProperties;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.function.Function;

/**
 * Service for validating JWT tokens and extracting claims.
 */
@Service
public class TokenValidator {

    private static final Logger logger = LoggerFactory.getLogger(TokenValidator.class);
    private final SecretKey secretKey;
    private final JwtProperties jwtProperties;

    public TokenValidator(JwtProperties jwtProperties) {
        this.jwtProperties = jwtProperties;

        // Validate that secret is provided
        String secret = jwtProperties.getSecret();
        if (!StringUtils.hasText(secret)) {
            throw new IllegalArgumentException("JWT secret cannot be null or empty. Please configure 'security.jwt.secret' or 'security.jwt.secret-key' in your application properties.");
        }

        // Ensure secret is at least 256 bits (32 bytes) for HMAC SHA-256
        if (secret.length() < 32) {
            logger.warn("JWT secret is shorter than recommended 32 characters. Consider using a longer secret for better security.");
        }


        this.secretKey = Keys.hmacShaKeyFor(Decoders.BASE64.decode(secret));
        logger.info("TokenValidator initialized successfully with secret of length: {}", secret.length());
    }

    /**
     * Validates the JWT token and extracts all claims.
     */
    public Claims validateAndExtractAllClaims(String token) {
        try {
            return Jwts.parser()
                    .verifyWith(secretKey)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (Exception e) {
            logger.error("Failed to validate JWT token: {}", e.getMessage());
            throw new RuntimeException("Invalid JWT token", e);
        }
    }

    /**
     * Extracts username from JWT token.
     */
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    /**
     * Extracts username from already parsed claims.
     */
    public String extractUsername(Claims claims) {
        return claims.getSubject();
    }

    /**
     * Extracts expiration date from JWT token.
     */
    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    /**
     * Extracts a specific claim from JWT token.
     */
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = validateAndExtractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    /**
     * Checks if the token is expired.
     */
    public boolean isTokenExpired(String token) {
        try {
            return extractExpiration(token).before(new Date());
        } catch (Exception e) {
            logger.warn("Failed to check token expiration: {}", e.getMessage());
            return true; // Consider expired if we can't determine
        }
    }

    /**
     * Validates if token is valid and not expired.
     */
    public boolean isTokenValid(String token, String username) {
        try {
            final String extractedUsername = extractUsername(token);
            return extractedUsername.equals(username) && !isTokenExpired(token);
        } catch (Exception e) {
            logger.warn("Token validation failed: {}", e.getMessage());
            return false;
        }
    }
}