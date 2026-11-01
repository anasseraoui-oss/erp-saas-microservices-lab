package com.store.domain.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "purchase_invoices")
@Data
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = "lines")
@EqualsAndHashCode(exclude = "lines")
public class PurchaseInvoice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "supplier_id")
    private Long supplierId;

    @Column(name = "total_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal totalAmount = BigDecimal.ZERO;

    @Column(nullable = false)
    private LocalDate date;

    @Enumerated(EnumType.STRING)
    @Column(name = "invoice_type", nullable = false, columnDefinition = "varchar(255) default 'PURCHASE_INVOICE'")
    private InvoiceType type = InvoiceType.PURCHASE_INVOICE;

    @OneToMany(mappedBy = "purchaseInvoice", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PurchaseInvoiceLine> lines = new ArrayList<>();

    public void addLine(PurchaseInvoiceLine line) {
        lines.add(line);
        line.setPurchaseInvoice(this);
    }
}
