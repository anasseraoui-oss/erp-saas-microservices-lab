package com.spring.salesorderservice.model;

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
public class SalesOrder {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private double totalAmount;
    private Long customer;
    private Date date;
    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "invoice_id", referencedColumnName = "id")
    private SalesInvoice invoice;
    @Enumerated(EnumType.STRING)
    private PaymentStatus paymentStatus;
    @Enumerated(EnumType.STRING)
    private OrderStatus orderStatus;
    private double soldAmount;
    private double paidAmount;
    private Long userCreator;
    private Long userExecutor;
    @ManyToOne(cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinColumn(name = "delivery_id")
    private Delivery delivery;
    @OneToMany(mappedBy = "salesOrder",cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    @JsonManagedReference("order-lines")
    private List<SalesLine> salesLines = new ArrayList<>();
    @OneToMany(mappedBy = "salesOrder",cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    @JsonManagedReference("order-return-lines")
    private List<LineReturn> lineReturns = new ArrayList<>();
}
