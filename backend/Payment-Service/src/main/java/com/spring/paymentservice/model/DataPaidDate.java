package com.spring.paymentservice.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DataPaidDate {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Date date;
    private double amountPaid;
    @Enumerated(EnumType.STRING)
    private Status status;
    @Enumerated(EnumType.STRING)
    private Methode methodePayment;
    @Enumerated(EnumType.STRING)
    private PaymentScheduleStatus paymentScheduleStatus;
    private Long userExecutor;
    private Long userCreator;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payment_id", nullable = false)
    @JsonBackReference
    private Payment payment;

    // ADD THIS METHOD
    @JsonProperty("paymentId")
    public Long getPaymentId() {
        return (this.payment != null) ? this.payment.getId() : null;
    }
}