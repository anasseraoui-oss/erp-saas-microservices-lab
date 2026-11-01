package com.store.domain.entity;

/**
 * Payment status for invoices.
 * PAID = full amount paid, PARTPAID = partial, UNPAID = nothing paid.
 */
public enum PaymentStatus {
    PAID,
    PARTPAID,
    UNPAID
}
