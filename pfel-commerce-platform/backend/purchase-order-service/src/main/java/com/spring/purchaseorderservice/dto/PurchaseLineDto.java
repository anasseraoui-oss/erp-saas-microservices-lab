package com.spring.purchaseorderservice.dto;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.spring.purchaseorderservice.model.PurchaseOrder;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.ToString;

import java.util.Date;

@Data
@AllArgsConstructor
@RequiredArgsConstructor
public class PurchaseLineDto {
    private Long id;
    private int quantity;
    private double price;
    private Long productId;
    /*@ToString.Exclude
    // This field will be ignored during deserialization from JSON and handled later.
    @JsonBackReference("invoice-lines")
    private PurchaseInvoiceDto purchaseInvoiceDto;
    @JsonBackReference("order-lines")
    private PurchaseOrderDto purchaseOrderDto;*/
    private Long purchasesOrderId;
    private Long purchasesInvoiceId;
}
