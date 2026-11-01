// File: com/ecommerce/security/core/filter/JwtAuthenticationFilter.java (Corrected Version)

package com.ecommerce.security.core.filter;

import com.ecommerce.security.core.config.JwtProperties;
import com.ecommerce.security.core.service.TokenValidator;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

/**
 * JWT Authentication Filter that validates JWT tokens and sets up Spring Security context.
 * This filter runs once per request and validates the JWT token from the Authorization header.
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    private final TokenValidator tokenValidator;
    private final JwtProperties jwtProperties;

    public JwtAuthenticationFilter(TokenValidator tokenValidator, JwtProperties jwtProperties) {
        this.tokenValidator = tokenValidator;
        this.jwtProperties = jwtProperties;
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {

        try {
            String jwt = extractJwtFromRequest(request);

            if (StringUtils.hasText(jwt) && SecurityContextHolder.getContext().getAuthentication() == null) {
                authenticateUser(jwt, request);
            }
        } catch (Exception e) {
            logger.warn("JWT authentication failed for request {}: {}",
                    request.getRequestURI(), e.getMessage());
            SecurityContextHolder.clearContext();
            // Don't throw exception here - let Spring Security handle unauthenticated requests
        }

        filterChain.doFilter(request, response);
    }

    /**
     * Extracts JWT token from the Authorization header.
     */
    private String extractJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader(jwtProperties.getHeaderName());

        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith(jwtProperties.getTokenPrefix())) {
            return bearerToken.substring(jwtProperties.getTokenPrefix().length());
        }

        return null;
    }

    /**
     * Authenticates the user based on JWT token and sets up security context.
     */
    private void authenticateUser(String jwt, HttpServletRequest request) {
        Claims claims = tokenValidator.validateAndExtractAllClaims(jwt);
        String username = tokenValidator.extractUsername(claims);

        if (StringUtils.hasText(username)) {
            List<SimpleGrantedAuthority> authorities = extractAuthorities(claims);

            UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                    username, null, authorities);
            authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

            SecurityContextHolder.getContext().setAuthentication(authToken);

            logger.debug("Successfully authenticated user: {} with authorities: {}",
                    username, authorities);
        }
    }

    /**
     * Extracts authorities from JWT claims.
     */
    @SuppressWarnings("unchecked")
    private List<SimpleGrantedAuthority> extractAuthorities(Claims claims) {
        try {
            List<String> authoritiesList = claims.get("authorities", List.class);

            if (authoritiesList == null || authoritiesList.isEmpty()) {
                logger.debug("No authorities found in JWT token");
                return Collections.emptyList();
            }

            return authoritiesList.stream()
                    .filter(StringUtils::hasText)
                    .map(SimpleGrantedAuthority::new)
                    .collect(Collectors.toList());

        } catch (Exception e) {
            logger.warn("Failed to extract authorities from JWT token: {}", e.getMessage());
            return Collections.emptyList();
        }
    }

    /**
     * Skip filter for certain paths if needed.
     */
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();

        // Skip filter for public endpoints that don't need authentication
        return path.startsWith("/actuator/health") ||
                path.startsWith("/error") ||
                path.startsWith("/favicon.ico");
    }
}
