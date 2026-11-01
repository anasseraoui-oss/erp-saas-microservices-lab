package com.eraoui.notificationservice.service;

import com.eraoui.notificationservice.model.Notification;
import com.eraoui.notification.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class PushNotificationService {

    private static final Logger logger = LoggerFactory.getLogger(PushNotificationService.class);

    public boolean sendPushNotification(Notification notification , NotificationType type) {
        try {
            // Simulation d'un délai d'envoi
            Thread.sleep(300);

            // Simulation de succès (85% de chances)
            return Math.random() > 0.15;

        } catch (Exception e) {
            logger.error("Erreur lors de l'envoi de notification push: {}", e.getMessage());
            return false;
        }
    }
}
