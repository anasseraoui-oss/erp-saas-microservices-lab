package com.store.application.service;

import com.store.domain.entity.*;
import com.store.infrastructure.persistence.InvoiceRepository;
import com.store.infrastructure.persistence.PaymentRepository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

/**
 * Payment business logic - register payments and update invoice status.
 */
public class PaymentService {

    private final PaymentRepository paymentRepo = new PaymentRepository();
    private final InvoiceRepository invoiceRepo = new InvoiceRepository();

    /**
     * Register a payment for an invoice. Updates amount paid and recomputes status.
     */
    public void registerPayment(Long invoiceId, BigDecimal amount, String method) {
        Invoice inv = invoiceRepo.findById(invoiceId).orElseThrow(() -> new IllegalArgumentException("Invoice not found"));

        Payment pmt = paymentRepo.findByInvoiceId(invoiceId).orElseGet(() -> {
            Payment p = new Payment();
            p.setInvoiceId(invoiceId);
            p.setTotalAmount(inv.getTotalAmount());
            p.setAmountPaid(BigDecimal.ZERO);
            return paymentRepo.save(p);
        });

        PaymentRecord rec = new PaymentRecord();
        rec.setDate(LocalDate.now());
        rec.setAmountPaid(amount);
        rec.setPaymentMethod(method != null ? method : "CASH");
        rec.setPayment(pmt);
        pmt.getRecords().add(rec);

        pmt.setAmountPaid(pmt.getAmountPaid().add(amount));
        PaymentStatus newStatus = pmt.getComputedStatus();

        paymentRepo.update(pmt);
        inv.setPaymentStatus(newStatus);
        invoiceRepo.save(inv);
    }

    public Optional<Payment> getPaymentByInvoiceId(Long invoiceId) {
        return paymentRepo.findByInvoiceId(invoiceId);
    }
}
