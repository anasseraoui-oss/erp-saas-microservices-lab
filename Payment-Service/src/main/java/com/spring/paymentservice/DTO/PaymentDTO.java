package com.spring.paymentservice.DTO;


import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.spring.paymentservice.model.DataPaidDate;
import jakarta.persistence.CascadeType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.hibernate.validator.constraints.UniqueElements;

import java.util.ArrayList;
import java.util.List;

@Data
@RequiredArgsConstructor
@AllArgsConstructor
public class PaymentDTO {
    private Long orderId;
    private String orderType;
    private double amountPaid;
    private double totalAmount;
    private Long supplierClientId; // The @UniqueElements annotation is usually for collections, it might not be applicable here.
    private Long userExecutor;
    private Long userCreator;
    // --- THIS IS THE FIX ---
    // Change the type from a single object to a List of objects.
    private List<DataPaidDate> paidDates;
}

