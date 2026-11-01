package com.store.domain.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.math.BigDecimal;

/**
 * Invoice line - links a product with quantity and price for an invoice.
 */
@Entity
@Table(name = "invoice_lines")
@Data
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = "invoice")
@EqualsAndHashCode(exclude = "invoice")
public class InvoiceLine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "product_id", nullable = false)
    private Long productId;

    @Column(nullable = false)
    private int quantity;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(name = "cost_price", precision = 10, scale = 2)
    private BigDecimal costPrice;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invoice_id", nullable = false)
    private Invoice invoice;

    /**
     * Line total = quantity * price
     */
    public BigDecimal getLineTotal() {
        return price.multiply(BigDecimal.valueOf(quantity));
    }
}
