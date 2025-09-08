package com.eraoui.notification;

import lombok.*;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
public class NotificationPaymentPayload extends  NotificationPayload{
    private Long orderId; // Changed to String to match your usage
    private String orderType;
    private String supplierClientId; // Changed to String

    public NotificationPaymentPayload(String message, NotificationType type, Instant timestamp, String subject,
                                      Long orderId, String supplierClientId, String orderType) {
        super(message, type, timestamp,subject);
        this.orderId = orderId;
        this.supplierClientId = supplierClientId;
        this.orderType = orderType;
        this.setCategory("PAYMENT");
        this.setSource("payment-service");
    }

    // Constructor for basic info
    public NotificationPaymentPayload(Long orderId, String supplierClientId, String orderType) {
        this.orderId = orderId;
        this.supplierClientId = supplierClientId;
        this.orderType = orderType;
        this.setCategory("PAYMENT");
    }

    // Builder pattern method
    public static NotificationPaymentPayload builder() {
        return new NotificationPaymentPayload();
    }
    public NotificationPaymentPayload subject(String subject) {
        this.setSubject(subject);
        return this;
    }
    public NotificationPaymentPayload message(String message) {
        this.setMessage(message);
        return this;
    }

    public NotificationPaymentPayload type(NotificationType type) {
        this.setType(type);
        return this;
    }

    public NotificationPaymentPayload timestamp(Instant timestamp) {
        this.setTimestamp(timestamp);
        return this;
    }

    public NotificationPaymentPayload orderId(Long orderId) {
        this.orderId = orderId;
        return this;
    }

    public NotificationPaymentPayload supplierClientId(String supplierClientId) {
        this.supplierClientId = supplierClientId;
        return this;
    }

    public NotificationPaymentPayload orderType(String orderType) {
        this.orderType = orderType;
        return this;
    }

    public NotificationPaymentPayload priority(String priority) {
        this.setPriority(priority);
        return this;
    }

}
