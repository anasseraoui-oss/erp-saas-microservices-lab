package com.spring.salesorderservice.dto;

import lombok.Data;

@Data // To generate getters, setters, etc.
public class SalesLineResponseDto {
    // Basic fields from the entity
    private Long id;
    private int quantity;
    private double price;
    private Long productId;
    // The IDs you want to display
    private Long salesOrderId;
    private Long salesInvoiceId;
}