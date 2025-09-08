package com.ecommerce.security.core.util;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Optional;

/**
 * Utility class for common security operations.
 */
public final class SecurityUtils {

    private SecurityUtils() {
        // Utility class - prevent instantiation
    }

    /**
     * Gets the current authenticated user's username.
     *
     * @return Optional containing the username if authenticated, empty otherwise
     */
    public static Optional<String> getCurrentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication != null && authentication.isAuthenticated()) {
            Object principal = authentication.getPrincipal();
            
            if (principal instanceof UserDetails) {
                return Optional.of(((UserDetails) principal).getUsername());
            } else if (principal instanceof String) {
                return Optional.of((String) principal);
            }
        }
        
        return Optional.empty();
    }

    /**
     * Gets the current authenticated user details.
     *
     * @return Optional containing UserDetails if authenticated, empty otherwise
     */
    public static Optional<UserDetails> getCurrentUserDetails() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication != null && authentication.isAuthenticated() && 
            authentication.getPrincipal() instanceof UserDetails) {
            return Optional.of((UserDetails) authentication.getPrincipal());
        }
        
        return Optional.empty();
    }

    /**
     * Checks if the current user has a specific role.
     *
     * @param role the role to check
     * @return true if the user has the role, false otherwise
     */
    public static boolean hasRole(String role) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication != null && authentication.isAuthenticated()) {
            return authentication.getAuthorities().stream()
                    .anyMatch(authority -> authority.getAuthority().equals("ROLE_" + role) || 
                                         authority.getAuthority().equals(role));
        }
        
        return false;
    }

    /**
     * Checks if the current user has any of the specified roles.
     *
     * @param roles the roles to check
     * @return true if the user has any of the roles, false otherwise
     */
    public static boolean hasAnyRole(String... roles) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication != null && authentication.isAuthenticated()) {
            return authentication.getAuthorities().stream()
                    .anyMatch(authority -> {
                        String authorityRole = authority.getAuthority();
                        for (String role : roles) {
                            if (authorityRole.equals("ROLE_" + role) || authorityRole.equals(role)) {
                                return true;
                            }
                        }
                        return false;
                    });
        }
        
        return false;
    }

    /**
     * Checks if the current user is authenticated.
     *
     * @return true if authenticated, false otherwise
     */
    public static boolean isAuthenticated() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null && authentication.isAuthenticated();
    }

    /**
     * Gets the current authentication object.
     *
     * @return Optional containing Authentication if available, empty otherwise
     */
    public static Optional<Authentication> getCurrentAuthentication() {
        return Optional.ofNullable(SecurityContextHolder.getContext().getAuthentication());
    }

    /**
     * Checks if the current user is anonymous.
     *
     * @return true if anonymous, false otherwise
     */
    public static boolean isAnonymous() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null && "anonymousUser".equals(authentication.getPrincipal());
    }
} 