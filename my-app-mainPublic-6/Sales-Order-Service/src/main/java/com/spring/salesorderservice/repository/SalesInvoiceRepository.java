package com.spring.salesorderservice.repository;

import com.spring.salesorderservice.model.PaymentStatus;
import com.spring.salesorderservice.model.SalesInvoice;
import com.spring.salesorderservice.model.SalesLine;
import com.spring.salesorderservice.model.SalesOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@Repository
public interface SalesInvoiceRepository extends JpaRepository<SalesInvoice, Long>, JpaSpecificationExecutor<SalesInvoice> {
    @Query("SELECT s FROM SalesInvoice s WHERE s.totalAmount >= :amount OR s.paymentStatus = :paymentStatus OR s.date = :date OR s.customerId = :customerId")
    List<SalesInvoice> searchSalesInvoice(@Param("amount") Double amount, @Param("paymentStatus") PaymentStatus paymentStatus, @Param("date") Date date, @Param("customerId") Long customerId);
    SalesInvoice findByDate(Date date);
    Optional<SalesInvoice> findByTotalAmount(Double totalAmount);
    SalesInvoice findByPaymentStatus(PaymentStatus paymentStatus);
    SalesInvoice findBySalesLinesContaining(SalesLine salesLine);
}
