package com.spring.salesorderservice.model;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum PaymentStatus {
    PAID,
    PARTPAID,
    UNPAID;

    @JsonCreator
    public static PaymentStatus fromString(String value) {
        for (PaymentStatus status : PaymentStatus.values()) {
            if (status.name().equalsIgnoreCase(value)) {
                return status;
            }
        }
        throw new IllegalArgumentException("Invalid PaymentStatus: " + value);
    }
}
