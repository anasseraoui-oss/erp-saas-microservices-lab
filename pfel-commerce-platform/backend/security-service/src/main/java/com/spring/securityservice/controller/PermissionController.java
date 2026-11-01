package com.spring.securityservice.controller;
import com.spring.securityservice.model.Permission;
import com.spring.securityservice.service.PermissionService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
@RestController
@RequestMapping("/api/permissions")
public class PermissionController {

    private final PermissionService permissionService;

    public PermissionController(PermissionService permissionService) {
        this.permissionService = permissionService;
    }

    @GetMapping
    public List<Permission> getAllPermissions() {
        return permissionService.getAllPermissions();
    }

    @PostMapping
    public Permission createPermission(@RequestBody Permission permission) {
        return permissionService.createPermission(permission);
    }

    @PutMapping("/{id}")
    public Permission updatePermission(@PathVariable Long id, @RequestBody Permission permission) {
        return permissionService.updatePermission(id, permission);
    }

    @DeleteMapping("/{id}")
    public void deletePermission(@PathVariable Long id) {
        permissionService.deletePermission(id);
    }
}
