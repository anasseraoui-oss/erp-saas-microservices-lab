package com.spring.securityservice.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor; // من الأفضل استخدام NoArgsConstructor مع @Data

import java.util.HashSet;
import java.util.Set;
import java.util.Objects;

@Entity
@Data
@NoArgsConstructor // إضافة هذا أفضل من @RequiredArgsConstructor عند استخدام @Data
public class Role {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // تم تغيير النوع إلى Long وهو الممارسة الأفضل

    @Column(nullable = false, unique = true)
    private String name;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "role_permissions",
            joinColumns = @JoinColumn(name = "role_id"),
            inverseJoinColumns = @JoinColumn(name = "permission_id")
    )
    private Set<Permission> permissions = new HashSet<>();

    // Constructor مخصص فقط للاسم
    public Role(String name) {
        this.name = name;
    }

    // دالة مساعدة لإضافة صلاحية
    public void addPermission(Permission permission) {
        this.permissions.add(permission);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Role role = (Role) o;
        return Objects.equals(name, role.name); // قارن باستخدام الاسم لأنه فريد
    }

    @Override
    public int hashCode() {
        return Objects.hash(name); // استخدم نفس الحقل في hashCode
    }
}