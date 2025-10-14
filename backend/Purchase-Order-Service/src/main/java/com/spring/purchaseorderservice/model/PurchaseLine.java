package com.spring.purchaseorderservice.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.RequiredArgsConstructor;

@Entity
@Data
@AllArgsConstructor
@RequiredArgsConstructor
public class PurchaseLine {

        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;
        private int quantity;
        private double price;
        private Long productId;
        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "purchase_order_id")
        @JsonBackReference("order-lines")
        private PurchaseOrder purchaseOrder;
        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "purchase_invoice_id")
        @JsonBackReference("invoice-lines")
        private PurchaseInvoice purchaseInvoice;
}
