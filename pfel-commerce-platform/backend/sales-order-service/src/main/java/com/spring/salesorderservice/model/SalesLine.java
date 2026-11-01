package com.spring.salesorderservice.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.ToString;

@Entity
@Data
@AllArgsConstructor
@RequiredArgsConstructor
public class SalesLine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private int quantity;
    private double price;
    private Long productId;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sales_invoice_id")
    @JsonBackReference("invoice-lines")
    private SalesInvoice salesInvoice;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sales_order_id")
    @JsonBackReference("order-lines")
    private SalesOrder salesOrder;

}
