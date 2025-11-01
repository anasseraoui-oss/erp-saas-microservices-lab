package com.spring.securityservice.config;

import com.spring.securityservice.jwt.JwtAuthenticationFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfiguration {

    @Autowired
    private AuthenticationProvider authenticationProvider;

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    @Order(1)
    public SecurityFilterChain oauth2SecurityFilterChain(HttpSecurity http) throws Exception {
        http
                .securityMatcher("/login/**", "/oauth2/**", "/api/me", "/api/drive/**") // Add any other paths that use @OAuth2AuthorizedClient.
                .csrf(csrf -> csrf.disable()) // Disable CSRF for these paths
                .authorizeHttpRequests(authorize -> authorize
                        .requestMatchers("/login/**", "/oauth2/**").permitAll()
                        .requestMatchers("/api/me", "/api/drive/**").authenticated()
                        .anyRequest().authenticated()
                )
                .oauth2Login(oauth2 -> oauth2
                        .defaultSuccessUrl("/login/success")
                        .failureUrl("/login/failure")
                );
        return http.build();
    }

    @Bean
    @Order(2)
    public SecurityFilterChain apiSecurityFilterChain(HttpSecurity http) throws Exception {
        http
                .securityMatcher("/**") // Apply to all other paths
                .csrf(csrf -> csrf.disable())
                // NO CORS configuration - Gateway handles it
                .authorizeHttpRequests(authorizeRequests -> authorizeRequests
                        // Fix: Use Spring's HttpMethod, not Jakarta's
                        .requestMatchers("OPTIONS", "/**").permitAll()
                        // Auth endpoints
                        .requestMatchers("/auth/signup", "/auth/login").permitAll()
                        .requestMatchers("/auth/logout").authenticated()


                        // WebSocket endpoints - VERY SPECIFIC PATTERNS
                        .requestMatchers("/ws/**").permitAll()
                        .requestMatchers("/ws/online/**").permitAll()
                        .requestMatchers("/ws/online/info").permitAll()
                        .requestMatchers("/ws/online/info/**").permitAll()
                        .requestMatchers("/ws/online/websocket").permitAll()
                        .requestMatchers("/ws/online/websocket/**").permitAll()

                        // SockJS specific patterns - more comprehensive
                        .requestMatchers("/ws/online/*/websocket").permitAll()
                        .requestMatchers("/ws/online/*/xhr_streaming").permitAll()
                        .requestMatchers("/ws/online/*/xhr_send").permitAll()
                        .requestMatchers("/ws/online/*/xhr").permitAll()
                        .requestMatchers("/ws/online/*/jsonp").permitAll()
                        .requestMatchers("/ws/online/*/jsonp_send").permitAll()
                        .requestMatchers("/ws/online/*/htmlfile").permitAll()
                        .requestMatchers("/ws/online/*/eventsource").permitAll()

                        // Generic SockJS patterns
                        .requestMatchers("/ws/*/info").permitAll()
                        .requestMatchers("/ws/*/websocket").permitAll()
                        .requestMatchers("/ws/*/xhr_streaming").permitAll()
                        .requestMatchers("/ws/*/xhr_send").permitAll()
                        .requestMatchers("/ws/*/xhr").permitAll()
                        .requestMatchers("/ws/*/jsonp").permitAll()
                        .requestMatchers("/ws/*/jsonp_send").permitAll()
                        .requestMatchers("/ws/*/htmlfile").permitAll()
                        .requestMatchers("/ws/*/eventsource").permitAll()

                        // STOMP topic and app endpoints
                        .requestMatchers("/topic/**").permitAll()
                        .requestMatchers("/app/**").permitAll()

                        // Admin endpoints
                        .requestMatchers("/users/**").hasRole("ADMIN")

                        .anyRequest().authenticated()
                )
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authenticationProvider(authenticationProvider)
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}