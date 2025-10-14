package com.spring.securityservice.controller;

import com.spring.securityservice.model.Permission;
import com.spring.securityservice.model.Role;
import com.spring.securityservice.service.RoleService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
public class RoleController {
    @Autowired
    private RoleService roleService;

    @GetMapping("/user/username/{username}/roles")
    public List<Role> getRolesForUser(@PathVariable String username) {
        return roleService.getRolesForUser(username);
    }

    @PostMapping("/user/username/{username}/roles")
    public void addRoleToUser(@PathVariable String username, @RequestBody String roleName) {
        roleService.addRoleToUser(username, roleName);
    }

    @DeleteMapping("/user/username/{username}/roles/{roleName}")
    public void removeRoleFromUser(@PathVariable String username, @PathVariable String roleName) {
        roleService.removeRoleFromUser(username, roleName);
    }

    @PostMapping("/{roleId}/permissions")
    public Role addPermissionToRole(@PathVariable Long roleId, @RequestBody Permission permission) {
        return roleService.addPermissionToRole(roleId, permission);
    }

    @DeleteMapping("/{roleId}/permissions")
    public Role removePermissionFromRole(@PathVariable Long roleId, @RequestBody Permission permission) {
        return roleService.removePermissionFromRole(roleId, permission);
    }
    @DeleteMapping("/{roleId}")
    public void deleteRole(@PathVariable Long roleId) {
        roleService.deleteRole(roleId);
    }
    @PutMapping("/{id}")
    public Role updateRole(@PathVariable Long id, @RequestBody Role role) {
        return roleService.updateRole(id,role);
    }

}
