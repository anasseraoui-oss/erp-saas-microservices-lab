package com.eraoui.notificationservice.webSocket;

import com.eraoui.notificationservice.model.Notification;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
@PreAuthorize("isAuthenticated()")
@Service
@RequiredArgsConstructor
@Slf4j
public class WebSocketNotificationService {

    private final SimpMessagingTemplate messagingTemplate;

    /**
     * يرسل إشعارًا إلى جميع العملاء المشتركين في وجهة /topic/notifications.
     * @param notification الكائن الذي تم حفظه في قاعدة البيانات.
     */
    public void sendNotificationToClients(Notification notification) {
        final String destination = "/topic/notifications";

        log.info("Sending notification via WebSocket to destination '{}': {}", destination, notification.getId());

        try {
            messagingTemplate.convertAndSend(destination, notification);
            log.info("Successfully sent notification {} via WebSocket.", notification.getId());
        } catch (Exception e) {
            log.error("Failed to send notification {} via WebSocket", notification.getId(), e);
        }
    }
}