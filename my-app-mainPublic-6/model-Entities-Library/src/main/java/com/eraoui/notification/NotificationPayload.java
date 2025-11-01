// 1. Base NotificationPayload - محسن
package com.eraoui.notification;

import com.fasterxml.jackson.annotation.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, property = "payloadType")
@JsonSubTypes({
        @JsonSubTypes.Type(value = NotificationPaymentPayload.class, name = "payment"),
        @JsonSubTypes.Type(value = NotificationProductPayload.class, name = "product"),
        @JsonSubTypes.Type(value = NotificationOrderPayload.class, name = "order"),
        @JsonSubTypes.Type(value = NotificationUserPayload.class, name = "user")
})
public class NotificationPayload {
    private String subject;
    private String message;
    private NotificationType type;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSXXX", timezone = "UTC")
    private Instant timestamp;

    // Generic fields
    private String priority = "MEDIUM"; // HIGH, MEDIUM, LOW
    private String category; // PAYMENT, PRODUCT, ORDER, USER
    private String source; // اسم الخدمة التي أرسلت الـ notification
    private String version = "1.0";
   // private String recipientId;
    // ✅ ADD THIS: Explicit payloadType field
    @JsonProperty("payloadType")
    private String payloadType;
    public NotificationPayload(String message, NotificationType type, Instant timestamp, String subject) {
        this.subject = subject;
        this.message = message;
        this.type = type;
        this.timestamp = timestamp;
    }
}
