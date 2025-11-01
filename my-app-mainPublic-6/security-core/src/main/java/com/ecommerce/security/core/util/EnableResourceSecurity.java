package com.ecommerce.security.core.util;


// File: com/ecommerce/security/core/annotation/EnableResourceSecurity.java


import com.ecommerce.security.core.config.SecurityCoreAutoConfiguration;
import org.springframework.context.annotation.Import;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Enables resource server security configuration.
 * This annotation should be used on the main application class
 * to enable the security library features.
 */
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Import(SecurityCoreAutoConfiguration.class)
public @interface EnableResourceSecurity {
}
