package com.spring.securityservice.service;

import com.spring.securityservice.model.Permission;
import com.spring.securityservice.model.Role;
import com.spring.securityservice.model.User;
import com.spring.securityservice.repository.PermissionRepository;
import com.spring.securityservice.repository.RoleRepository;
import com.spring.securityservice.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class RoleService {
    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private UserRepository userRepository;


    public Role saveRole(Role role) {
        return roleRepository.save(role);
    }

    public List<Role> getRoles() {
        return roleRepository.findAll();
    }
    public List<Role> getRolesForUser(String username) {
        Optional<User> user = userRepository.findByEmail(username);
        if (user.isPresent()) {
            return new ArrayList<>(user.get().getRoles());
        } else {
            throw new RuntimeException("User not found: " + username);
        }
    }

    public void addRoleToUser(String username, String roleName) {
        Optional<User> user = userRepository.findByEmail(username);
        Optional<Role> role = roleRepository.findByName(roleName);
        if (user.isPresent() && role.isPresent()) {
            user.get().getRoles().add(role.get());
            userRepository.save(user.get());
        } else {
            throw new RuntimeException("User or role not found.");
        }
    }

    public void removeRoleFromUser(String username, String roleName) {
        Optional<User> user = userRepository.findByEmail(username);
        Optional<Role> role = roleRepository.findByName(roleName);
        if (user.isPresent() && role.isPresent()) {
            user.get().getRoles().remove(role.get());
            userRepository.save(user.get());
        } else {
            throw new RuntimeException("User or role not found.");
        }
    }
    public Role getRoleById(Long id) {
        return roleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Role not found"));
    }
    public Role addPermissionToRole(Long roleId, Permission permission) {
        Role role = getRoleById(roleId);
        role.getPermissions().add(permission);
        return roleRepository.save(role);
    }

    public Role removePermissionFromRole(Long roleId, Permission permission) {
        Role role = getRoleById(roleId);
        role.getPermissions().remove(permission);
        return roleRepository.save(role);
    }

    /**
     * Deletes a role after dissociating it from all users.
     * The @Transactional annotation ensures that all operations (finding users,
     * removing the role, and deleting the role) are part of a single, atomic transaction.
     * If any step fails, all previous steps are rolled back.
     *
     * @param id The ID of the role to delete.
     */
    @Transactional // **CRITICAL: This makes the whole method a single database transaction.**
    public void deleteRole(Long id) {
        // 1. Find the role to be deleted. Throws an exception if not found.
        Role roleToDelete = getRoleById(id);

        // 2. Find all users that currently have this role.
        List<User> usersWithRole = userRepository.findByRoles_Id(id);

        // 3. For each user, remove the association with the role.
        //    This will delete the entries from the `user_roles` join table.
        for (User user : usersWithRole) {
            user.getRoles().remove(roleToDelete);
            // We don't need to call userRepository.save(user) here because
            // @Transactional will handle the state changes at the end of the method.
        }

        // 4. Now that the role is no longer associated with any users,
        //    we can safely delete the role itself.
        //    Hibernate will also automatically handle deleting entries from `role_permissions`
        //    because of the relationship mapping (CascadeType or ownership).
        roleRepository.delete(roleToDelete);
    }

    @Autowired
    private PermissionRepository permissionRepository; // <-- Add this repository

    // ... (other methods)

    public Role updateRole(Long id, Role roleDetails) {
        Role existingRole = getRoleById(id);
        existingRole.setName(roleDetails.getName());

        if (roleDetails.getPermissions() != null) {
            // This is the CRITICAL part.
            // We get the IDs from the incoming request.
            Set<Long> permissionIds = roleDetails.getPermissions().stream()
                    .map(Permission::getId)
                    .collect(Collectors.toSet());

            // We fetch the full, managed Permission entities from the database using those IDs.
            Set<Permission> managedPermissions = new HashSet<>(permissionRepository.findAllById(permissionIds));

            // Now, we set the fully managed entities on our role object.
            existingRole.setPermissions(managedPermissions);
        } else {
            // If the frontend sends an empty or null permissions list, clear them.
            existingRole.getPermissions().clear();
        }

        return roleRepository.save(existingRole);
    }
}
