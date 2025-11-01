package com.spring.salesorderservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DeliveryDto {
    private Long id;
    private Date deliveryDate;
    private String location;
    private String psbllocation;
    private String description;
    private double deliveryPrice;
}
