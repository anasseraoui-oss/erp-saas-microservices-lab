package com.eraoui.notificationservice.config;

import com.ecommerce.security.core.filter.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class NotificationSecurityConfig {
    @Bean
    @Order(1) // Execute before default security configuration from security-core
    public SecurityFilterChain webSocketSecurityFilterChain(HttpSecurity http) throws Exception {
        http
                .securityMatcher("/ws/**") // Apply only to WebSocket paths
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(authorize -> authorize
                        // Permit all WebSocket endpoints
                        .requestMatchers("/ws/**").permitAll()
                        .requestMatchers("/ws/notifications/**").permitAll()
                        .requestMatchers("/ws/notifications/info").permitAll()
                        .requestMatchers("/ws/notifications/websocket").permitAll()

                        // SockJS specific patterns
                        .requestMatchers("/ws/notifications/*/websocket").permitAll()
                        .requestMatchers("/ws/notifications/*/xhr_streaming").permitAll()
                        .requestMatchers("/ws/notifications/*/xhr_send").permitAll()
                        .requestMatchers("/ws/notifications/*/xhr").permitAll()
                        .requestMatchers("/ws/notifications/*/jsonp").permitAll()
                        .requestMatchers("/ws/notifications/*/jsonp_send").permitAll()
                        .requestMatchers("/ws/notifications/*/htmlfile").permitAll()
                        .requestMatchers("/ws/notifications/*/eventsource").permitAll()

                        .anyRequest().permitAll()
                )
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                );



        return http.build();
    }

}