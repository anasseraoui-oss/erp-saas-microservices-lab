package com.spring.purchaseorderservice.dto;



import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.spring.purchaseorderservice.model.OrderStatus;
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
public class PurchaseOrderDto {
    private Long id;
    private Long supplier;
    private double totalAmount;
    private Date date;
    private PaymentStatus paymentStatus;
    private double soldAmount;
    private double paidAmount;
    private Long userExecutor;
    private Long userCreator;
    private OrderStatus orderStatus;
   /* @ToString.Exclude
    @JsonManagedReference("order-lines")
    private List<PurchaseLineDto> purchaseLines = new ArrayList<>();
    @ToString.Exclude
    @JsonManagedReference("order-return-lines")
    private List<LineReturnDto> lineReturns = new ArrayList<>();*/
   private List<PurchaseLineDto> purchaseLines;
    private List<LineReturnDto> lineReturns;
    private DeliveryDto delivery;
}
