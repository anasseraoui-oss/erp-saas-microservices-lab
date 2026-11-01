package com.eraoui.notificationservice.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;

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

    @Bean
    @Order(2) // Execute after WebSocket security
    public SecurityFilterChain apiSecurityFilterChain(HttpSecurity http) throws Exception {
        http
                .securityMatcher("/api/**", "/test/**") // Apply to API paths
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(authorize -> authorize
                        // Public endpoints
                        .requestMatchers("/test/**").permitAll()
                        
                        // API endpoints - require authentication (or adjust as needed)
                        .requestMatchers("/api/notifications/**").authenticated()
                        
                        .anyRequest().authenticated()
                )
                .sessionManagement(session -> 
                    session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                );

        return http.build();
    }
}
