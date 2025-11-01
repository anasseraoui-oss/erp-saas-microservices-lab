package com.spring.paymentservice.DTO;

import com.spring.paymentservice.model.Methode;
import com.spring.paymentservice.model.PaymentScheduleStatus;
import com.spring.paymentservice.model.Status;
import lombok.Data;
import java.util.Date;

@Data
public class DataPaidDateDto {
    private Date date;
    private double amountPaid;
    private Status status;
    private Methode methodePayment;
    private PaymentScheduleStatus paymentScheduleStatus;
    private Long userExecutor;
    private Long userCreator;
    private Long paymentId; // Payment
}