package com.spring.securityservice.service;

import com.spring.securityservice.model.Permission;
import com.spring.securityservice.model.Role;
import com.spring.securityservice.model.User;
import com.spring.securityservice.repository.PermissionRepository;
import com.spring.securityservice.repository.RoleRepository;
import com.spring.securityservice.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PermissionService {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private RoleRepository roleRepository;
    @Autowired
    private PermissionRepository permissionRepository;


    public List<Permission> getAllPermissions() {
        return permissionRepository.findAll();
    }

    public Permission getPermissionById(Long id) {
        return permissionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Permission not found"));
    }

    public Permission createPermission(Permission permission) {
        return permissionRepository.save(permission);
    }

    public Permission updatePermission(Long id, Permission updatedPermission) {
        Permission permission = getPermissionById(id);
        permission.setName(updatedPermission.getName());
        permission.setDescription(updatedPermission.getDescription());
        return permissionRepository.save(permission);
    }

    public void deletePermission(Long id) {
        permissionRepository.deleteById(id);
    }
    public User assignRoleToUser(Integer userId, Integer roleId) {
        User user = userRepository.findById(Long.valueOf(userId))
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Role role = roleRepository.findById(Long.valueOf(roleId))
                .orElseThrow(() -> new ResourceNotFoundException("Role not found"));
        user.getRoles().add(role);
        userRepository.save(user);
        return user;
    }
    public User removeRoleFromUser(Integer userId, Integer roleId) {
        User user =  userRepository.findById(Long.valueOf(userId))
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Role role = roleRepository.findById(Long.valueOf(roleId))
                .orElseThrow(() -> new ResourceNotFoundException("Role not found"));
        user.getRoles().remove(role);
        userRepository.save(user);
        return user;
    }
}