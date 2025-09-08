package com.eraoui.notification;


import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
public class NotificationOrderPayload extends NotificationPayload {
    private String orderId;
    private String orderType;
    private String customerId;
    private String orderStatus;
    private Double totalAmount;

    public NotificationOrderPayload(String message, NotificationType type, Instant timestamp, String subject,
                                    String orderId, String orderType) {
        super(message, type, timestamp,subject);
        this.orderId = orderId;
        this.orderType = orderType;
        this.setCategory("ORDER");
        this.setSource("order-service");
    }

    public static NotificationOrderPayload builder() {
        return new NotificationOrderPayload();
    }

    public NotificationOrderPayload message(String message) {
        this.setMessage(message);
        return this;
    }

    public NotificationOrderPayload type(NotificationType type) {
        this.setType(type);
        return this;
    }

    public NotificationOrderPayload orderId(String orderId) {
        this.orderId = orderId;
        return this;
    }

    public NotificationOrderPayload orderType(String orderType) {
        this.orderType = orderType;
        return this;
    }}
