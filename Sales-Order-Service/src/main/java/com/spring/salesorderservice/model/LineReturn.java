package com.spring.salesorderservice.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.RequiredArgsConstructor;

import java.util.Date;

@Entity
@Data
@AllArgsConstructor
@RequiredArgsConstructor
public class LineReturn {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long lineId;
    private int quantity;
    private double price;
    private Long productId;
    private Date returnDate;
    private String returnReason;
    @ManyToOne
    @JoinColumn(name = "sales_invoice_id")
    @JsonBackReference("invoice-return-lines")
    private SalesInvoice salesInvoice;

    @ManyToOne
    @JoinColumn(name = "sales_order_id")
    @JsonBackReference("order-return-lines")
    private SalesOrder salesOrder;
}
