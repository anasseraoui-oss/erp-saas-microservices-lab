package com.store.application.service;

import com.store.domain.entity.*;
import com.store.infrastructure.persistence.InvoiceRepository;
import com.store.infrastructure.persistence.PaymentRepository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * Invoice business logic - create invoices, calculate total, update stock.
 */
public class InvoiceService {

    private final InvoiceRepository invoiceRepo = new InvoiceRepository();
    private final PaymentRepository paymentRepo = new PaymentRepository();
    private final ProductService productService = new ProductService();
    private final CustomerService customerService = new CustomerService();

    public List<Invoice> getAllInvoices() {
        return invoiceRepo.findAll();
    }

    public List<Invoice> getInvoicesByType(InvoiceType type) {
        return invoiceRepo.findByType(type);
    }

    public Optional<Invoice> getById(Long id) {
        return invoiceRepo.findById(id);
    }

    /**
     * Create a sales invoice and reduce product stock.
     */
    public Invoice createInvoice(Long customerId, List<InvoiceLineDto> lines, PaymentStatus paymentStatus,
            InvoiceType type) {
        Invoice inv = new Invoice();
        inv.setCustomerId(customerId);
        inv.setDate(LocalDate.now());
        inv.setPaymentStatus(paymentStatus);
        inv.setType(type);

        BigDecimal total = BigDecimal.ZERO;
        for (InvoiceLineDto dto : lines) {
            Product p = productService.getById(dto.productId)
                    .orElseThrow(() -> new IllegalArgumentException("Product not found"));

            InvoiceLine line = new InvoiceLine();
            line.setProductId(dto.productId);
            line.setQuantity(dto.quantity);
            line.setPrice(dto.price);
            line.setCostPrice(p.getPriceInit()); // Capture cost price
            inv.addLine(line);
            total = total.add(line.getLineTotal());

            // Reduce stock only for actual invoices
            if (type == InvoiceType.SALES_INVOICE) {
                productService.reduceStock(dto.productId, dto.quantity);
            }
        }
        inv.setTotalAmount(total);

        Invoice saved = invoiceRepo.save(inv);

        // Update customer total orders
        if (customerId != null && customerId != 0) {
            customerService.updateTotalOrders(customerId, total);
        }

        // Create payment record
        Payment pmt = new Payment();
        pmt.setInvoiceId(saved.getId());
        pmt.setTotalAmount(total);
        pmt.setAmountPaid(
                (type == InvoiceType.SALES_INVOICE && paymentStatus == PaymentStatus.PAID) ? total : BigDecimal.ZERO);
        paymentRepo.save(pmt);

        return saved;
    }

    public void deleteInvoice(Long id) {
        invoiceRepo.findById(id).ifPresent(inv -> {
            // Restore stock only if it was an invoice (and thus stock was reduced)
            if (inv.getType() == InvoiceType.SALES_INVOICE) {
                for (InvoiceLine line : inv.getLines()) {
                    productService.increaseStock(line.getProductId(), line.getQuantity());
                }
            }
            invoiceRepo.delete(id);
        });
    }

    public void updatePaymentStatus(Long id, PaymentStatus status) {
        invoiceRepo.findById(id).ifPresent(inv -> {
            inv.setPaymentStatus(status);
            invoiceRepo.save(inv);
        });
    }

    public record InvoiceLineDto(long productId, int quantity, BigDecimal price) {
    }
}
