package com.eraoui.kafka;

import com.eraoui.notification.NotificationPayload;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.stereotype.Component;

import java.util.concurrent.CompletableFuture;

@Component
public class NotificationProducer {
    private static final Logger log = LoggerFactory.getLogger(NotificationProducer.class);

    // ✅ CHANGE: Use NotificationPayload instead of Object
    private final KafkaTemplate<String, NotificationPayload> kafkaTemplate;

    public NotificationProducer(KafkaTemplate<String, NotificationPayload> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }
    public void sendNotification(String topicName, NotificationPayload payload) {
        try {
            log.info("Sending notification to topic '{}': {}", topicName, payload.getMessage());

            String key = generateKey(payload);
            kafkaTemplate.send(topicName, key, payload);

            log.debug("Notification sent successfully to topic '{}'", topicName);

        } catch (Exception e) {
            log.error("Failed to send notification to Kafka topic '{}': {}", topicName, e.getMessage(), e);
            throw new RuntimeException("Failed to send notification", e);
        }
    }
    public void sendNotificationAsync(String topicName, NotificationPayload payload) {
        try {
            log.info("Sending async notification to topic '{}': {}", topicName, payload.getMessage());

            String key = generateKey(payload);
            CompletableFuture<SendResult<String, NotificationPayload>> future = kafkaTemplate.send(topicName, key, payload);

            future.whenComplete((result, ex) -> {
                if (ex != null) {
                    log.error("Failed to send async notification to topic '{}': {}", topicName, ex.getMessage(), ex);
                } else {
                    log.debug("Async notification sent successfully to topic '{}' at offset: {}",
                            topicName, result.getRecordMetadata().offset());
                }
            });

        } catch (Exception e) {
            log.error("Failed to send async notification to Kafka topic '{}': {}", topicName, e.getMessage(), e);
        }
    }
    private String generateKey(NotificationPayload payload) {
        // Check specific payload types
        if (payload instanceof com.eraoui.notification.NotificationPaymentPayload) {
            com.eraoui.notification.NotificationPaymentPayload paymentPayload =
                    (com.eraoui.notification.NotificationPaymentPayload) payload;
            return "payment_" + paymentPayload.getOrderId();
        }
        else if (payload instanceof com.eraoui.notification.NotificationProductPayload) {
            com.eraoui.notification.NotificationProductPayload productPayload =
                    (com.eraoui.notification.NotificationProductPayload) payload;
            return "product_" + productPayload.getProductId();
        }
        else if (payload instanceof com.eraoui.notification.NotificationOrderPayload) {
            com.eraoui.notification.NotificationOrderPayload orderPayload =
                    (com.eraoui.notification.NotificationOrderPayload) payload;
            return "order_" + orderPayload.getOrderId();
        }
        else if (payload instanceof com.eraoui.notification.NotificationUserPayload) {
            com.eraoui.notification.NotificationUserPayload userPayload =
                    (com.eraoui.notification.NotificationUserPayload) payload;
            return "user_" + userPayload.getUserId();
        }
        // Default fallback
        return String.valueOf(payload.getMessage().hashCode());
    }
}
