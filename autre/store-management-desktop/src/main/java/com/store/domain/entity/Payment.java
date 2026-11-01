package com.store.domain.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * Payment entity - tracks payments for an invoice.
 * Links to invoice via orderType + orderId (invoice id).
 */
@Entity
@Table(name = "payments", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"invoice_id"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "invoice_id", nullable = false, unique = true)
    private Long invoiceId;

    @Column(name = "amount_paid", nullable = false, precision = 12, scale = 2)
    private BigDecimal amountPaid = BigDecimal.ZERO;

    @Column(name = "total_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal totalAmount;

    @OneToMany(mappedBy = "payment", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PaymentRecord> records = new ArrayList<>();

    /**
     * Compute payment status from amounts.
     */
    public PaymentStatus getComputedStatus() {
        if (amountPaid.compareTo(BigDecimal.ZERO) == 0) return PaymentStatus.UNPAID;
        if (amountPaid.compareTo(totalAmount) >= 0) return PaymentStatus.PAID;
        return PaymentStatus.PARTPAID;
    }
}
