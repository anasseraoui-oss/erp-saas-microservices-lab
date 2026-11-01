package com.spring.securityservice.controller;

import com.spring.securityservice.dto.RegisterUserDto;
import com.spring.securityservice.model.Role;
import com.spring.securityservice.model.User;
import com.spring.securityservice.service.PermissionService;
import com.spring.securityservice.service.RoleService;
import com.spring.securityservice.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@PreAuthorize("hasAuthority('ADMIN') or hasRole('ADMIN')")
@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {
    @Autowired
    private RoleService roleService;
    @Autowired
    private UserService userService;
    @Autowired
    private PermissionService permissionService;

    //@PreAuthorize("hasAuthority('ADMIN')") // Ensure only admins can access this endpoint
    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        try {
            List<User> users = userService.allUsers();
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            // Log error for debugging
            System.err.println("Error fetching users: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @GetMapping("/me")
    public ResponseEntity<User> authenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        User currentUser = (User) authentication.getPrincipal();

        return ResponseEntity.ok(currentUser);
    }

    @PostMapping("/admin/create-user")
    public ResponseEntity<User> createUser(@RequestBody RegisterUserDto request) {
            // Create a new User object from the DTO
            User userToCreate = new User();
            userToCreate.setFullName(request.getFullName());
            userToCreate.setEmail(request.getEmail());
            userToCreate.setPassword(request.getPassword());

            // The DTO should contain the roles with at least their IDs
            Set<Role> roles = request.getRoles();

            // Call the new, robust service method
            User createdUser = userService.createUserWithRoles(userToCreate, roles);

            return ResponseEntity.ok(createdUser);
        }

    @GetMapping("/admin/roles")
    public ResponseEntity<List<Role>> getRoles() {
        return ResponseEntity.ok(roleService.getRoles());
    }

    @PostMapping("/admin/role")
    public ResponseEntity<Role> saveRole(@RequestBody Role role) {
        return ResponseEntity.ok(roleService.saveRole(role));
    }

    // Endpoint to update roles for an existing user
    // FIX: Use Long for consistency
    // =================================================================
    //  **THIS IS THE MISSING METHOD - ADD THIS TO YOUR CONTROLLER**
    // =================================================================
    /**
     * Handles PUT requests to update an existing user.
     * It maps to the URL "/users/update-user/{id}".
     *
     * @param id       The ID of the user to update, captured from the URL path.
     * @param userData The updated user data from the request body.
     * @return The updated User object.
     */
    @PutMapping("/update-user/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody User userData) {
        try {
            User updatedUser = userService.updateUser(id, userData);
            return ResponseEntity.ok(updatedUser);
        } catch (RuntimeException e) {
            // Handle cases where the user is not found
            return ResponseEntity.notFound().build();
        }
    }

    // ... (other update methods)

    // FIX: Use Long for consistency
    @DeleteMapping("/delete-user/{userId}")
    public ResponseEntity<?> deleteUserById(@PathVariable Long userId) {
        userService.deleteUser(Math.toIntExact(userId));
        return ResponseEntity.ok().build();
    }

    // NEW: Endpoint for frontend to delete by username easily
   /*@DeleteMapping("/delete-user/by-username/{username}")
    public ResponseEntity<?> deleteUserByUsername(@PathVariable String username) {
        userService.deleteUserByUsername(username); // You need to implement this in your service layer
        return ResponseEntity.ok().build();
    }*/

    // FIX: Use Long and remove Math.toIntExact
    @GetMapping("/user/{userId}")
    public ResponseEntity<Optional<User>> getUserById(@PathVariable Long userId) {
        return ResponseEntity.ok(userService.getUserById(Math.toIntExact(userId)));
    }

    @GetMapping("/user/username/{username}")
    public ResponseEntity<Optional<User>> getUserByUsername(@PathVariable String username) {
        return ResponseEntity.ok(userService.getUserByUsername(username));
    }

    // FIX: Use Long for user and role IDs
    @PostMapping("/{userId}/roles/{roleId}")
    public User assignRoleToUser(@PathVariable Long userId, @PathVariable Long roleId) {
        return permissionService.assignRoleToUser(Math.toIntExact(userId), Math.toIntExact(roleId));
    }

    // FIX: Use Long for user and role IDs
    @DeleteMapping("/{userId}/roles/{roleId}")
    public User removeRoleFromUser(@PathVariable Long userId, @PathVariable Long roleId) {
        return permissionService.removeRoleFromUser(Math.toIntExact(userId), Math.toIntExact(roleId));
    }
    @GetMapping("/search")
    public List<RegisterUserDto> searchAccounts(@RequestParam("q") String query) {
        return userService.searchAccounts(query);
    }
}
/*@PreAuthorize("hasAuthority('ADMIN')")
@CrossOrigin(origins = {"http://localhost:3004" ,"http://localhost:3006" ,"http://localhost:3007" ,"http://localhost:3008", "http://localhost:3003","http://localhost:3000","http://localhost:3005"})
@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {        - id: r6
          uri: lb://Security-Service
          predicates:
            - Path=/users/**
  server:
    tomcat:
      relaxed-query-chars: "|{}[]"
const API_URL = 'http://localhost:9055/users';

const getAccounts = async () => {
    try {
        const response = await axiosInstance.get(API_URL);
        return response.data;
    } catch (error) {
        // @ts-ignore
        console.error("Error fetching users:", error.response ? error.response.data : error.message);
    }
};*/