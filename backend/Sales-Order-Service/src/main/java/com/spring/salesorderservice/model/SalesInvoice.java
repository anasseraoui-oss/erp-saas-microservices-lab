package com.spring.salesorderservice.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.ToString;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Entity
@Data
@AllArgsConstructor
@RequiredArgsConstructor
public class SalesInvoice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private double totalAmount;
    private Long customerId;
    private Date date;
    private Long orderId;
    private Long userCreator;
    private Long userExecutor;
    private PaymentStatus paymentStatus;
    @OneToMany(mappedBy = "salesInvoice", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    @JsonManagedReference("invoice-lines")
    private List<SalesLine> salesLines = new ArrayList<>();
    @OneToMany(mappedBy = "salesInvoice", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    @JsonManagedReference("invoice-return-lines")
    private List<LineReturn> lineReturns = new ArrayList<>();

}
