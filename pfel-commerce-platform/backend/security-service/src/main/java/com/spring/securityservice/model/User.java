package com.spring.securityservice.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.springframework.security.config.annotation.web.PortMapperDsl;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.*;
import java.util.stream.Collectors;

@Entity
@Data
@RequiredArgsConstructor
@AllArgsConstructor
    public class User implements UserDetails {
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;

        @Column(nullable = false)
        private String fullName;

        @Column(unique = true, length = 100, nullable = false)
        private String email;

        @Column(nullable = false)
        private String password;

        @CreationTimestamp
        @Column(updatable = false, name = "created_at")
        private Date createdAt;

        @UpdateTimestamp
        @Column(name = "updated_at")
        private Date updatedAt;
    @ManyToMany(fetch = FetchType.EAGER)  // EAGER to load roles immediately with user
    @JoinTable(
            name = "user_roles",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    private Set<Role> roles = new HashSet<>();

    public User(Integer id, String username, String roles) {
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        Set<GrantedAuthority> authorities = new HashSet<>();
        if (this.roles != null) {
            for (Role role : this.roles) {
                if (role.getName() != null && !role.getName().trim().isEmpty()) {
                   authorities.add(new SimpleGrantedAuthority(role.getName().toUpperCase()));
                }
                if (role.getPermissions() != null) {
                    authorities.addAll(
                            role.getPermissions().stream()
                                    .filter(permission -> permission.getName() != null && !permission.getName().trim().isEmpty())
                                    .map(permission -> new SimpleGrantedAuthority(permission.getName().toUpperCase()))
                                    .collect(Collectors.toSet())
                    );
                }
            }
        }
        return authorities;
    }

       @Override
        public String getUsername() {
            return email;
        }

        @Override
        public boolean isAccountNonExpired() {
            return true;
        }

        @Override
        public boolean isAccountNonLocked() {
            return true;
        }

        @Override
        public boolean isCredentialsNonExpired() {
            return true;
        }

        @Override
        public boolean isEnabled() {
            return true;
        }

    public void addRole(Role role) {
        this.roles.add(role);
    }
}