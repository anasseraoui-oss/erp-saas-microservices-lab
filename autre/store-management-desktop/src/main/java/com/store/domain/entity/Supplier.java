package com.store.domain.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * Supplier entity - Represents a person or company the store buys from.
 */
@Entity
@Table(name = "suppliers")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Supplier {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String email;

    private String phone;

    private String address;

    @Column(name = "total_purchases_amount", precision = 12, scale = 2)
    private BigDecimal totalPurchasesAmount = BigDecimal.ZERO;
}
