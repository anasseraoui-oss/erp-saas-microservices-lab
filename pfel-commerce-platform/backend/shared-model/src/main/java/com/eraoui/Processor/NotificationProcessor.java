package com.eraoui.Processor;

import com.eraoui.notification.NotificationPayload;
import com.eraoui.notification.NotificationRequest;

public interface NotificationProcessor {

    /**
     * Process the notification payload and convert it to a NotificationRequest
     */
    NotificationRequest processPayload(NotificationPayload payload);

    /**
     * Check if this processor supports the given topic
     */
    boolean supports(String topic);

    /**
     * Get the specific topic this processor handles (for map-based lookup)
     */
    default String getSupportedTopic() {
        return null; // Override in specific implementations
    }
}