package com.spring.purchaseorderservice.dto;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.spring.purchaseorderservice.model.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.ToString;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Data
@AllArgsConstructor
@RequiredArgsConstructor
public class PurchaseInvoiceDto {
    private Long id;
    private Long supplier;
    private double totalAmount;
    private Date date;
    private Long userExecutor;
    private Long userCreator;
    private PaymentStatus paymentStatus;
    /*@ToString.Exclude
    @JsonManagedReference("invoice-lines")
    private List<PurchaseLineDto> purchaseLines;
    @ToString.Exclude
    @JsonManagedReference("invoice-return-lines")
    private List<LineReturnDto> lineReturns = new ArrayList<>();*/
    private List<PurchaseLineDto> purchaseLines;
    private List<LineReturnDto> lineReturns;
}

