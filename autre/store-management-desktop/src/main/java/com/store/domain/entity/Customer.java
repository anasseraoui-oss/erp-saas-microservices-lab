package com.store.domain.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Customer entity - simplified for MVP.
 */
@Entity
@Table(name = "customers")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Customer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String email;

    private String phone;

    @Column(name = "total_orders_amount", precision = 12, scale = 2)
    private java.math.BigDecimal totalOrdersAmount = java.math.BigDecimal.ZERO;
}
