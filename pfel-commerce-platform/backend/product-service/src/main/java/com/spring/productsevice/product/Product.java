package com.spring.productsevice.product;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.RequiredArgsConstructor;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Entity
@Data
@AllArgsConstructor
@RequiredArgsConstructor
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    //private String description;//barcode
    private String barcode;
    private int quantity;
    @Column(name = "quantity_almost_depleted") // if your DB column has a different name
    private int QuantityAlmostDepleted;
    private double price;
    private double priceInit;
    private String image;
    private String category;
    private Date dateCreating;
    private Date dateLastModification;
    private Long userCreator;
    private Long userExecutor;
    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference // To prevent infinite loops during JSON serialization
    private List<ExpiredProduct> expirationRecords = new ArrayList<>();

}

