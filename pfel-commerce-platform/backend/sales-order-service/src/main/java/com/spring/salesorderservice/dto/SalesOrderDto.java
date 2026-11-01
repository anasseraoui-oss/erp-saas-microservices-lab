package com.spring.salesorderservice.dto;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.spring.salesorderservice.model.LineReturn;
import com.spring.salesorderservice.model.OrderStatus;
import com.spring.salesorderservice.model.PaymentStatus;

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
public class SalesOrderDto {
    private Long id;
    private Long customer;
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
    private List<SalesLineDto> salesLines = new ArrayList<>();
    @ToString.Exclude
    @JsonManagedReference("order-return-lines")
    private List<LineReturnDto> lineReturns = new ArrayList<>();*/
    private List<LineReturnDto> lineReturns;
    private List<SalesLineDto> salesLines;
    private DeliveryDto delivery;

}
