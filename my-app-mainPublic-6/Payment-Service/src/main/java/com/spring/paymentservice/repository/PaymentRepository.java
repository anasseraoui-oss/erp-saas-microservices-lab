package com.spring.paymentservice.repository;

import com.spring.paymentservice.model.Payment;
import feign.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findPaymentByOrderTypeAndOrderId(String orderType, Long orderId);
    Optional<List<Payment>> findPaymentsByDueDateBetween(Date startOfDay, Date endOfDay);
    @Query("SELECT p FROM Payment p WHERE p.dueDate < :currentDate AND p.amountPaid != p.totalAmount")
    List<Payment> findOverduePayments(@Param("currentDate") Date currentDate);}
