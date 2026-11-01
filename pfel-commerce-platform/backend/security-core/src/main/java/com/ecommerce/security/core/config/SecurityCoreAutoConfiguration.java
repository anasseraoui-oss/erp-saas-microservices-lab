package com.ecommerce.security.core.config;

import com.ecommerce.security.core.filter.JwtAuthenticationFilter;
import com.ecommerce.security.core.service.TokenValidator;
import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@AutoConfiguration
@EnableConfigurationProperties(JwtProperties.class)
@ComponentScan(basePackages = "com.ecommerce.security.core")
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityCoreAutoConfiguration {

    @Bean
    @ConditionalOnMissingBean
    public TokenValidator tokenValidator(JwtProperties jwtProperties) {
        return new TokenValidator(jwtProperties);
    }

    @Bean
    @ConditionalOnMissingBean
    public JwtAuthenticationFilter jwtAuthenticationFilter(
            TokenValidator tokenValidator,
            JwtProperties jwtProperties) {
        return new JwtAuthenticationFilter(tokenValidator, jwtProperties);
    }

    /**
     * Default SecurityFilterChain - secures all endpoints by default.
     */
    @Bean
    @ConditionalOnMissingBean(SecurityFilterChain.class)
    public SecurityFilterChain defaultSecurityFilterChain(
            HttpSecurity http,
            JwtAuthenticationFilter jwtAuthFilter) throws Exception {

        return http
                .csrf(AbstractHttpConfigurer::disable)

                    .authorizeHttpRequests(auth -> auth
                            .anyRequest().authenticated()
                    )
                    .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                    .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
                    .build();
        }
}