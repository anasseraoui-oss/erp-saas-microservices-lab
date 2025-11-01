package com.spring.supplierclientservice;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.RequiredArgsConstructor;

import java.util.Date;

@Entity
@Data
@AllArgsConstructor
@RequiredArgsConstructor
public class SupplierClient  {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column( unique = true)
    private String name;
    private String email;
    private String phoneNumber;
    private double totalSales;
    private double totalePurchase;
    private double borrowingPriceSales;
    private double borrowingPricePurchase;
    private Long userCreator;
    private Long userExecutor;
    private Date createdAt;
    private Date updatedAt;
    private String description;
    private String category;
    private String location;
}