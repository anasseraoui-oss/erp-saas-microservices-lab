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
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Component;

import java.util.Collections;

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
    Authentication previousAuth = SecurityContextHolder.getContext().getAuthentication();
    try {
        // Create a system-level authentication context for this background thread
        setupSystemAuthentication(topic);
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
        } finally {
            // restore previous authentication (may be null)
            SecurityContextHolder.getContext().setAuthentication(previousAuth);
            log.debug("Restored previous SecurityContext authentication after processing topic={}", topic);
        }
    }

    
    /**
     * Sets up a temporary, system-level authentication in the SecurityContext.
     * This is necessary for background processes (like Kafka consumers) that need to
     * interact with methods secured by Spring Security.
     */
    private void setupSystemAuthentication(String topic) {
        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                "system@notification-service", null, Collections.singletonList(new SimpleGrantedAuthority("ROLE_SYSTEM")));
        // include some details to help auditing/troubleshooting
        auth.setDetails("kafka-consumer:topic=" + topic);
        SecurityContextHolder.getContext().setAuthentication(auth);
        log.debug("Installed system authentication for Kafka consumer (topic={})", topic);
    }
}