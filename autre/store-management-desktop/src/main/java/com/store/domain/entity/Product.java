package com.store.domain.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Product entity - represents a sellable item in the store.
 * Derived from Spring Boot Product-Service model.
 */
@Entity
@Table(name = "products")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String barcode;

    @Column(nullable = false)
    private int quantity;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(name = "price_init", precision = 10, scale = 2)
    private BigDecimal priceInit;

    private String category;

    @Column(name = "expiry_date")
    private LocalDate expiryDate;

    @Column(name = "min_stock_level")
    private Integer minStockLevel = 5;

    @Column(name = "date_creating")
    private LocalDateTime dateCreating;

    @Column(name = "date_last_modification")
    private LocalDateTime dateLastModification;

    @PrePersist
    protected void onCreate() {
        dateCreating = LocalDateTime.now();
        dateLastModification = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        dateLastModification = LocalDateTime.now();
    }

    public boolean isLowStock() {
        return quantity <= (minStockLevel != null ? minStockLevel : 5);
    }

    public boolean isExpired() {
        return expiryDate != null && expiryDate.isBefore(LocalDate.now());
    }
}
