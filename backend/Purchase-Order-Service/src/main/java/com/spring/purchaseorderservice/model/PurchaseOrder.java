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
public class PurchaseOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long supplierId;
    private double totalAmount;
    private Date date;
    private Long userCreator;
    private Long userExecutor;
    @Enumerated(EnumType.STRING)
    private PaymentStatus paymentStatus;
    private double paidAmount;
    private double soldAmount;
    @ManyToOne
    @JoinColumn(name = "delivery_id")
    private Delivery delivery;
    @Enumerated(EnumType.STRING)
    private OrderStatus orderStatus;
    @OneToMany(mappedBy = "purchaseOrder", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    @JsonManagedReference("order-lines")
    private List<PurchaseLine> purchaseLines = new ArrayList<>();
    @OneToMany(mappedBy = "purchaseOrder", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    @JsonManagedReference("order-return-lines")
    private List<LineReturn> lineReturns = new ArrayList<>();
}
