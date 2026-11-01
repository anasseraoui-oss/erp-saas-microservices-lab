# Security Core Library

A shared security library for microservices-based applications using Spring Boot. This library provides JWT authentication, security filters, and common security utilities that can be easily integrated into any microservice.

## Features

- **JWT Authentication**: Complete JWT token generation, validation, and management
- **Security Filters**: Automatic JWT authentication filter for HTTP requests
- **Configuration Properties**: Flexible configuration for security settings
- **Auto-configuration**: Zero-configuration setup with Spring Boot auto-configuration
- **Utility Classes**: Helper methods for common security operations
- **DTOs**: Standardized request/response objects for authentication
- **Exception Handling**: Custom exceptions for security-related errors

## Project Structure

```
security-core/
├── src/
│   ├── main/
│   │   ├── java/com/ecommerce/security/core/
│   │   │   ├── SecurityCoreAutoConfiguration.java
│   │   │   ├── SecurityCoreConfiguration.java
│   │   │   ├── config/
│   │   │   │   ├── SecurityProperties.java
│   │   │   │   └── JwtProperties.java
│   │   │   ├── service/
│   │   │   │   ├── JwtService.java
│   │   │   │   ├── AuthenticationService.java
│   │   │   │   └── UserDetailsServiceImpl.java
│   │   │   ├── filter/
│   │   │   │   └── JwtAuthenticationFilter.java
│   │   │   ├── dto/
│   │   │   │   ├── AuthenticationRequest.java
│   │   │   │   └── AuthenticationResponse.java
│   │   │   ├── util/
│   │   │   │   └── SecurityUtils.java
│   │   │   └── exception/
│   │   │       ├── JwtAuthenticationException.java
│   │   │       └── SecurityException.java
│   │   └── resources/
│   │       └── META-INF/spring/
│   │           └── org.springframework.boot.autoconfigure.AutoConfiguration.imports
│   └── test/
│       └── java/com/ecommerce/security/core/
│           └── service/
│               └── JwtServiceTest.java
├── pom.xml
└── README.md
```

## Installation

### 1. Build the Library

```bash
cd security-core
mvn clean install
```

### 2. Add Dependency to Microservices

Add the following dependency to your microservice's `pom.xml`:

```xml
<dependency>
    <groupId>com.ecommerce</groupId>
    <artifactId>security-core</artifactId>
    <version>1.0.0</version>
</dependency>
```

## Configuration

### Basic Configuration

The library provides sensible defaults, but you can customize the configuration in your `application.yml`:

```yaml
security:
  jwt:
    enabled: true
    secret-key: "your-secret-key-here"
    expiration: 86400000  # 24 hours in milliseconds
    refresh-expiration: 604800000  # 7 days in milliseconds
    issuer: "your-application"
    audience: "your-users"
    header-name: "Authorization"
    token-prefix: "Bearer "
  
  public-endpoints:
    - "/actuator/**"
    - "/health/**"
    - "/swagger-ui/**"
    - "/v3/api-docs/**"
    - "/error"
    - "/api/auth/**"
  
  cors:
    allowed-origins: ["*"]
    allowed-methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    allowed-headers: ["*"]
    allow-credentials: false
    max-age: 3600
  
  rate-limit:
    enabled: false
    max-requests: 100
    time-window: 60
```

### Environment Variables

For production, use environment variables for sensitive configuration:

```yaml
security:
  jwt:
    secret-key: ${JWT_SECRET_KEY}
    expiration: ${JWT_EXPIRATION:86400000}
```

## Usage

### 1. Automatic Configuration

Once you add the dependency, the security configuration is automatically applied. The library will:

- Configure JWT authentication
- Set up security filters
- Configure CORS
- Set up public endpoints

### 2. Authentication Controller

Create an authentication controller in your microservice:

```java
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationService authenticationService;

    public AuthController(AuthenticationService authenticationService) {
        this.authenticationService = authenticationService;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthenticationResponse> login(@RequestBody AuthenticationRequest request) {
        AuthenticationResponse response = authenticationService.authenticate(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthenticationResponse> refresh(@RequestHeader("Authorization") String refreshToken) {
        String token = refreshToken.substring(7); // Remove "Bearer " prefix
        AuthenticationResponse response = authenticationService.refreshToken(token);
        return ResponseEntity.ok(response);
    }
}
```

### 3. Custom UserDetailsService

Override the default UserDetailsService in your microservice:

```java
@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        return org.springframework.security.core.userdetails.User.builder()
            .username(user.getUsername())
            .password(user.getPassword())
            .authorities(user.getRoles().stream()
                .map(role -> new SimpleGrantedAuthority("ROLE_" + role))
                .collect(Collectors.toList()))
            .build();
    }
}
```

### 4. Using Security Utils

Use the utility methods in your controllers:

```java
@RestController
@RequestMapping("/api/products")
public class ProductController {

    @GetMapping("/{id}")
    public ResponseEntity<Product> getProduct(@PathVariable Long id) {
        // Get current user
        Optional<String> username = SecurityUtils.getCurrentUsername();
        
        // Check roles
        if (SecurityUtils.hasRole("ADMIN")) {
            // Admin-specific logic
        }
        
        // Check if authenticated
        if (SecurityUtils.isAuthenticated()) {
            // Authenticated user logic
        }
        
        return ResponseEntity.ok(productService.getProduct(id));
    }
}
```

### 5. Method-Level Security

Use Spring Security annotations:

```java
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @PostMapping("/products")
    public ResponseEntity<Product> createProduct(@RequestBody Product product) {
        return ResponseEntity.ok(productService.createProduct(product));
    }
}
```

## API Reference

### JwtService

- `generateToken(UserDetails userDetails)`: Generate JWT token
- `generateRefreshToken(UserDetails userDetails)`: Generate refresh token
- `extractUsername(String token)`: Extract username from token
- `isTokenValid(String token, UserDetails userDetails)`: Validate token
- `extractUserId(String token)`: Extract user ID from token
- `extractRoles(String token)`: Extract roles from token

### AuthenticationService

- `authenticate(AuthenticationRequest request)`: Authenticate user and return tokens
- `refreshToken(String refreshToken)`: Refresh access token
- `validateToken(String token)`: Validate JWT token
- `extractUsername(String token)`: Extract username from token

### SecurityUtils

- `getCurrentUsername()`: Get current authenticated username
- `getCurrentUserDetails()`: Get current UserDetails
- `hasRole(String role)`: Check if user has specific role
- `hasAnyRole(String... roles)`: Check if user has any of the roles
- `isAuthenticated()`: Check if user is authenticated
- `isAnonymous()`: Check if user is anonymous

## Security Best Practices

1. **Secret Key Management**: Use environment variables for JWT secret keys
2. **Token Expiration**: Set reasonable expiration times for tokens
3. **HTTPS**: Always use HTTPS in production
4. **CORS Configuration**: Configure CORS properly for your domain
5. **Rate Limiting**: Enable rate limiting for authentication endpoints
6. **Logging**: Monitor authentication attempts and failures
7. **Token Storage**: Store tokens securely on the client side

## Testing

Run the tests to ensure everything works correctly:

```bash
mvn test
```

## Troubleshooting

### Common Issues

1. **Auto-configuration not working**: Ensure the dependency is properly added and the auto-configuration file exists
2. **JWT validation failing**: Check that the secret key is consistent across services
3. **CORS issues**: Verify CORS configuration matches your frontend domain
4. **UserDetailsService not found**: Override the default implementation in your microservice

### Logging

Enable debug logging for security components:

```yaml
logging:
  level:
    com.ecommerce.security.core: DEBUG
    org.springframework.security: DEBUG
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

This project is licensed under the MIT License. 