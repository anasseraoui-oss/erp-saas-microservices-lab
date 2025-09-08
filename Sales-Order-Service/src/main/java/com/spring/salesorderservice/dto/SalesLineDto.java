package com.spring.salesorderservice.dto;

import com.fasterxml.jackson.annotation.JsonBackReference;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Data
@AllArgsConstructor // This is fine to keep for other uses
@NoArgsConstructor  // <-- THIS IS THE KEY! Provides a default constructor for Jackson.
public class SalesLineDto {
    private Long id;
    private int quantity;
    private double price;
    private Long productId;
    /* @JsonBackReference("invoice-lines")
    private SalesInvoiceDto salesInvoice;
    @JsonBackReference("order-lines")
    private SalesOrderDto salesOrder;*/
    private Long salesInvoiceId;
    private Long salesOrderId;
}