// File: com/ecommerce/security/core/config/JwtProperties.java

package com.ecommerce.security.core.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;

/**
 * Configuration properties for JWT settings.
 * Maps properties with prefix "security.jwt" from application.yml/properties.
 */
@Component
@Primary  // This makes it the primary bean when multiple exist
@ConfigurationProperties(prefix = "security.jwt")  // Changed from "jwt" to "security.jwt"
public class JwtProperties {

    private String secret;
    private String secretKey;  // Added this field to match your @Value annotation
    private long expiration = 86400000; // 24 hours in milliseconds
    private String headerName = "Authorization";
    private String tokenPrefix = "Bearer ";
    private String issuer = "ecommerce-app";

    // Constructors
    public JwtProperties() {}

    public JwtProperties(String secret, long expiration, String headerName, String tokenPrefix, String issuer) {
        this.secret = secret;
        this.expiration = expiration;
        this.headerName = headerName;
        this.tokenPrefix = tokenPrefix;
        this.issuer = issuer;
    }

    // Getters and Setters
    public String getSecret() {
        return secret != null ? secret : secretKey;  // Fallback to secretKey if secret is null
    }

    public void setSecret(String secret) {
        this.secret = secret;
    }

    public String getSecretKey() {
        return secretKey;
    }

    public void setSecretKey(String secretKey) {
        this.secretKey = secretKey;
    }

    public long getExpiration() {
        return expiration;
    }

    public void setExpiration(long expiration) {
        this.expiration = expiration;
    }

    public String getHeaderName() {
        return headerName;
    }

    public void setHeaderName(String headerName) {
        this.headerName = headerName;
    }

    public String getTokenPrefix() {
        return tokenPrefix;
    }

    public void setTokenPrefix(String tokenPrefix) {
        this.tokenPrefix = tokenPrefix;
    }

    public String getIssuer() {
        return issuer;
    }

    public void setIssuer(String issuer) {
        this.issuer = issuer;
    }

    @Override
    public String toString() {
        return "JwtProperties{" +
                "secret='[PROTECTED]'" +
                ", expiration=" + expiration +
                ", headerName='" + headerName + '\'' +
                ", tokenPrefix='" + tokenPrefix + '\'' +
                ", issuer='" + issuer + '\'' +
                '}';
    }
}