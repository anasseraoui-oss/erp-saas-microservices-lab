package com.eraoui.notification;

import lombok.*;

import java.time.Instant;
@Getter
@Setter
public class NotificationProductPayload extends NotificationPayload {
    private Long productId;
    private String productName;
    private String action;
    private Integer quantity; // Add this field

    public NotificationProductPayload() {

    }


    // Builder pattern methods
    public static NotificationProductPayload builder() {
        NotificationProductPayload payload = new NotificationProductPayload();
        payload.setPayloadType("product"); // ✅ SET THIS IN BUILDER
        return payload;
    }

    public NotificationProductPayload message(String message) {
        this.setMessage(message);
        return this;
    }

    public NotificationProductPayload type(NotificationType type) {
        this.setType(type);
        return this;
    }

    public NotificationProductPayload timestamp(Instant timestamp) {
        this.setTimestamp(timestamp);
        return this;
    }

    public NotificationProductPayload productId(Long productId) {
        this.productId = productId;
        return this;
    }

    public NotificationProductPayload productName(String productName) {
        this.productName = productName;
        return this;
    }

    public NotificationProductPayload quantity(Integer quantity) {
        this.quantity = quantity;
        return this;
    }

    public NotificationProductPayload priority(String priority) {
        this.setPriority(priority);
        return this;
    }
    public NotificationProductPayload subject(String subject) {
        this.setSubject(subject);
        return this;
    }
    public NotificationProductPayload action(String action) {
        this.action = action;
        return this;
    }
}