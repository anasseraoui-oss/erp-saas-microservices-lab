package com.eraoui.notification;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
public class NotificationUserPayload extends NotificationPayload {
    private String userId;
    private String userEmail;
    private String userName;
    private String userRole;

    public NotificationUserPayload(String message, NotificationType type, Instant timestamp, String subject,
                                   String userId, String userEmail) {
        super(message, type, timestamp,subject);
        this.userId = userId;
        this.userEmail = userEmail;
        this.setCategory("USER");
        this.setSource("user-service");
    }

    public static NotificationUserPayload builder() {
        return new NotificationUserPayload();
    }

    public NotificationUserPayload message(String message) {
        this.setMessage(message);
        return this;
    }

    public NotificationUserPayload type(NotificationType type) {
        this.setType(type);
        return this;
    }

    public NotificationUserPayload userId(String userId) {
        this.userId = userId;
        return this;
    }

    public NotificationUserPayload userEmail(String userEmail) {
        this.userEmail = userEmail;
        return this;
    }
}