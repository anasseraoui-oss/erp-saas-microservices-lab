package com.spring.securityservice.dto;

import com.spring.securityservice.model.Role;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.RequiredArgsConstructor;

import java.util.HashSet;
import java.util.Set;

@Data
@AllArgsConstructor
@RequiredArgsConstructor
public class RegisterUserDto {
    private Integer id;
    private String email;

    private String password;

    private String fullName;
    private Set<Role> roles = new HashSet<>();

    public RegisterUserDto(Object user) {
        this.email = (String) user;
        this.password = (String) user;
        this.fullName = (String) user;
        this.roles = (Set<Role>) user;
        this.id = user.hashCode();
    }


    public RegisterUserDto(String username, Set<Role> roles) {
        this.email = username;
        this.roles = roles;
    }
}