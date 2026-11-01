// In: security-core library
// File: com/ecommerce/security/core/ResourceServerSecurityAutoConfiguration.java

package com.ecommerce.security.core;

import com.ecommerce.security.core.config.JwtProperties;
import com.ecommerce.security.core.filter.JwtAuthenticationFilter;
import com.ecommerce.security.core.service.TokenValidator;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean; // Correct import
import org.springframework.boot.autoconfigure.security.SecurityProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties({JwtProperties.class, SecurityProperties.class})
public class ResourceServerSecurityAutoConfiguration {

    @Bean
    @ConditionalOnMissingBean
    public TokenValidator tokenValidator(JwtProperties jwtProperties) {
        return new TokenValidator(jwtProperties);
    }

    @Bean
    @ConditionalOnMissingBean // <-- CORRECTED
    public JwtAuthenticationFilter jwtAuthenticationFilter(TokenValidator tokenValidator , JwtProperties jwtProperties) {
        return new JwtAuthenticationFilter(tokenValidator,jwtProperties);
    }
}