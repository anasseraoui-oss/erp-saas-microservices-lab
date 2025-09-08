package com.eraoui.Processor;

import com.eraoui.notification.NotificationPayload;
import com.eraoui.notification.NotificationRequest;
import com.eraoui.notification.NotificationSandType;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class DefaultNotificationProcessor implements NotificationProcessor {

    @Override
    public NotificationRequest processPayload(NotificationPayload payload) {
        log.debug("Processing payload with default processor");

        return NotificationRequest.builder()
                .subject(payload.getSubject())
                .message(payload.getMessage())
                .notificationType(payload.getType())
                .type(NotificationSandType.EMAIL)
                .priority(payload.getPriority())
                .build();
    }

    @Override
    public boolean supports(String topic) {
        // Default processor supports all topics as fallback
        return true;
    }

    @Override
    public String getSupportedTopic() {
        return "default";
    }
}