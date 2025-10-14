package com.spring.salesorderservice.dto;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.spring.salesorderservice.model.LineReturn;
import com.spring.salesorderservice.model.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Data;


import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import lombok.NoArgsConstructor;
import lombok.ToString;


@Data
@AllArgsConstructor
@NoArgsConstructor // Add the no-argument constructor
public class SalesInvoiceDto {
    private Long id;
    private Long customer;
    private double totalAmount;
    private Date date;
    private Long userExecutor;
    private Long userCreator;
    private PaymentStatus paymentStatus;
    /*@ToString.Exclude
    @JsonManagedReference("invoice-lines")
    private List<SalesLineDto> salesLines;
    @ToString.Exclude
    @JsonManagedReference("invoice-return-lines")
    private List<LineReturnDto> lineReturns = new ArrayList<>();*/
    private List<SalesLineDto> salesLines;
    private List<LineReturnDto> lineReturns;
    // REMOVE the custom setter method. It is not needed and confuses the logic.
}