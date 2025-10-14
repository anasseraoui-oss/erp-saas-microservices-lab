// Payment.java (Final Recommended Version)
package com.spring.paymentservice.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.RequiredArgsConstructor;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Entity
@Data
@RequiredArgsConstructor
@AllArgsConstructor
// THIS ANNOTATION IS THE DATABASE-LEVEL PROTECTION
@Table(name = "payment",
        uniqueConstraints = { @UniqueConstraint(columnNames = {"orderId", "orderType"}) })
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // These two columns will now be enforced as a unique pair
    private Long orderId;
    private String orderType;
    private Date dueDate;
    private double amountPaid;
    private double totalAmount;
    private Long supplierClientId;

    private Long userCreator;
    private Long userExecutor;

    @OneToMany(mappedBy = "payment", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JsonManagedReference
    private List<DataPaidDate> paidDates = new ArrayList<>();
}