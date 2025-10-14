// Enhanced NotificationConsumer with improved configuration and processor pattern
package com.eraoui.notificationservice.kafkaConfig;

import com.eraoui.Processor.NotificationProcessor;
import com.eraoui.Processor.NotificationProcessorFactory;
import com.eraoui.notification.*;
import com.eraoui.notificationservice.model.Notification;
import com.eraoui.notification.NotificationRequest;
import com.eraoui.notificationservice.service.NotificationService;
import com.eraoui.notificationservice.webSocket.WebSocketNotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationConsumer {
    private final NotificationService notificationService;
    private final WebSocketNotificationService webSocketNotificationService;
    private final NotificationProcessorFactory processorFactory;
    //@Transactional
    @KafkaListener(topics = {
            "product-notifications",
            "payment-due-date-topic",
            "order-notifications",
            "user-notifications"
    }, groupId = "${spring.kafka.consumer.group-id}")
    public void consumeNotification(@Payload NotificationPayload payload,
                                    @Header(KafkaHeaders.RECEIVED_TOPIC) String topic) {
        log.info("Received notification from topic '{}': {}", topic, payload.getMessage());

        try {
            // Use the processor factory to get the appropriate processor
            NotificationProcessor processor = processorFactory.getProcessor(topic);
            NotificationRequest request = processor.processPayload(payload);

            // Process the notification
            Notification savedNotification = notificationService.createNotification(request);
            webSocketNotificationService.sendNotificationToClients(savedNotification);
            notificationService.sendImmediateNotification(savedNotification);

            log.info("Successfully processed notification from topic '{}' for recipient '{}'",
                    topic, request);

        } catch (Exception e) {
            log.error("Error processing notification from topic '{}': {}", topic, e.getMessage(), e);
        }
    }

}