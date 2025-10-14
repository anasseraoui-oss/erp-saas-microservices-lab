package com.spring.purchaseorderservice.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.RequiredArgsConstructor;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
@Entity
@Data
@AllArgsConstructor
@RequiredArgsConstructor
public class PurchaseInvoice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long supplierId;
    private double totalAmount;
    private Date date;
    private PaymentStatus paymentStatus;
    private Long orderId;
    private Long userCreator;
    private Long userExecutor;
    @OneToMany(mappedBy = "purchaseInvoice", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    @JsonManagedReference("invoice-lines")
    private List<PurchaseLine> purchaseLines = new ArrayList<>();
    @OneToMany(mappedBy = "purchaseInvoice", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    @JsonManagedReference("invoice-return-lines")
    private List<LineReturn> lineReturns = new ArrayList<>();

}

