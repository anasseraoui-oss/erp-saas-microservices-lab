package com.spring.securityservice.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.util.Date;

@Entity
@Data
@RequiredArgsConstructor
@AllArgsConstructor
public class ActivityLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private String userFullName;

    @Column(nullable = false)
    private String activityType;

    private String description;

    @CreationTimestamp
    @Column(updatable = false, name = "created_at")
    private Date timestamp;

    @Lob
    private String details;
}
