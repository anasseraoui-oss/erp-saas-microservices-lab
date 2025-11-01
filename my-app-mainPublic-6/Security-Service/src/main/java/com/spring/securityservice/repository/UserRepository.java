package com.spring.securityservice.repository;

import com.spring.securityservice.model.Role;
import com.spring.securityservice.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    List<User> findByRoles_Id(Long roleId);
    @Query("SELECT DISTINCT u FROM User u " +
            "LEFT JOIN u.roles r " + // Utilisez LEFT JOIN pour inclure les users sans rôle
            "WHERE " +
            "   LOWER(u.email) LIKE LOWER(CONCAT('%', :query, '%')) " +
            "   OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :query, '%')) " + // <= CORRECTION ICI
            "   OR CAST(u.id AS string) LIKE CONCAT('%', :query, '%') " +
            "   OR LOWER(r.name) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<User> searchUsers(@Param("query") String query);
}