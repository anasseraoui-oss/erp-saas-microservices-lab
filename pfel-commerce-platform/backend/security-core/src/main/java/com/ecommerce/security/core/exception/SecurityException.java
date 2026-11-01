package com.ecommerce.security.core.exception;

/**
 * General security exception for security-related errors.
 */
public class SecurityException extends RuntimeException {

    public SecurityException(String message) {
        super(message);
    }

    public SecurityException(String message, Throwable cause) {
        super(message, cause);
    }
} 