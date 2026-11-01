// PaymentController.java (Corrected)
package com.spring.paymentservice.controller;

import com.spring.paymentservice.config.FeignSupplierClient;
import com.spring.paymentservice.model.DataPaidDate;
import com.spring.paymentservice.model.Payment;
import com.spring.paymentservice.service.DataPaidDateService;
import com.spring.paymentservice.service.PaymentService;
import com.spring.paymentservice.service.PaymentStatusCheckService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.List;

@PreAuthorize("isAuthenticated()")
@RestController
@RequestMapping("/payment")
public class PaymentController {
    @Autowired
    private PaymentService paymentService;
    @Autowired
    private PaymentStatusCheckService paymentStatusCheckService;
    @Autowired
    private DataPaidDateService dataPaidDateService;
    @Autowired
    private FeignSupplierClient supplierClient;
    // The POST endpoint for addPayment is REMOVED.
    // This is now the single endpoint for adding/updating a payment.
    @PutMapping("/update/{orderType}/{orderId}")
    public ResponseEntity<Payment> updatePaymentOrder(
            @PathVariable("orderType") String orderType,
            @PathVariable("orderId") Long orderId,
            @RequestParam double amount,
            @RequestParam String status,
            @RequestParam String paymentScheduleStatus,
            @RequestParam String methodePayment,
            @RequestParam double totalAmount,
            @RequestParam Long userId,
            @RequestParam Long supplierClientId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) Date dueDate) {
        Payment updatedPayment = paymentService.updatePayOrder(orderType, orderId, amount, status, methodePayment, paymentScheduleStatus, supplierClientId, userId, totalAmount, dueDate);
        return ResponseEntity.ok(updatedPayment);
    }

    // --- GETTER ENDPOINTS REMAIN THE SAME ---
    @GetMapping("/{orderType}/{id}")
    public ResponseEntity<Payment> getPaymentById(@PathVariable("orderType") String orderType, @PathVariable("id") Long id) {
        Payment payment = paymentService.getPaymentId(orderType, Math.toIntExact(id));
        if(payment == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(payment);
    }
    @PreAuthorize("hasAuthority('VIEW_PAYMENT_HISTORY') or hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<List<Payment>> getAllPayments() {
        List<Payment> payments = paymentService.getAllPayments();
        return ResponseEntity.ok(payments);
    }

    // This feign endpoint seems to have a bug. It calls UpdatePayOrder with 0 for amount, status, and supplierClientId.
    // Ensure this is the intended behavior.
    @PostMapping("/update/ofFeign/{orderType}/{OrderId}")
    public void updatePayment(@PathVariable("orderType") String OrderType, @PathVariable Long OrderId, @RequestParam double amount, @RequestParam String status, @RequestParam double totalAmount, @RequestParam Long supplierClientId ){
        Payment payment = paymentService.getPaymentByOrderId(OrderType, OrderId);
        if (payment != null && status != null){
            // Calling with 0 for amount and supplierClientId. This might be incorrect.
            paymentService.updatePayOrder(OrderType, OrderId, amount, status,"","", supplierClientId, 0L, totalAmount, null);
        }
    }

    @DeleteMapping("/delete/partial-payment/{dataPaidDateId}")
    public ResponseEntity<Void> deletePartialPayment(
            @PathVariable Long dataPaidDateId,
            @RequestParam Long supplierClientId,
            @RequestParam String orderType) {

        // 1. Get the partial payment amount
        DataPaidDate dataPaidDate = dataPaidDateService.getById(dataPaidDateId);
        if (dataPaidDate == null) {
            return ResponseEntity.notFound().build();
        }
        double amount = dataPaidDate.getAmountPaid();
        Payment payment = dataPaidDate.getPayment();
        paymentService.recalculateAndUpdatePaymentTotals(payment.getId());

        // 2. Call SupplierClient to update borrowing with a positive amount for debugging
        supplierClient.updateBorrowingByDeleteDataPaidDate(supplierClientId, amount, orderType);

        // 3. Delete the partial payment record
        dataPaidDateService.deleteById(dataPaidDateId);

        return ResponseEntity.ok().build();
    }

    @GetMapping("/trigger-checks")
    public void triggerChecks() {
        paymentStatusCheckService.performInitialCheck();
    }
}