package com.spring.purchaseorderservice.dto;

import com.fasterxml.jackson.annotation.JsonBackReference;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LineReturnDto {
    private Long id;
    private Long lineId;
    private int quantity;
    private double price;
    private Long productId;
    private Date returnDate;
    private String returnReason;
    private Long purchasesOrderId;
    private Long purchasesInvoiceId;
    /*@JsonBackReference("invoice-return-lines")
    private PurchaseInvoiceDto purchaseInvoice;  // Changed to DTO

    @JsonBackReference("order-return-lines")
    private PurchaseOrderDto purchaseOrder;      // Changed to DTO*/
}