package com.eraoui.notificationservice.service;

import com.eraoui.notificationservice.model.Notification;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class SmsService {

    private static final Logger logger = LoggerFactory.getLogger(SmsService.class);

    public boolean sendSms(Notification notification) {
        try {
            // Simulation d'envoi de SMS
            // Ici vous pourriez intégrer avec un service comme Twilio, AWS SNS, etc.
            logger.info("Envoi de SMS à: {} avec message: {}",
                notification.getMessage());

            // Simulation d'un délai d'envoi
            Thread.sleep(500);

            // Simulation de succès (95% de chances)
            return Math.random() > 0.05;

        } catch (Exception e) {
            logger.error("Erreur lors de l'envoi de SMS: {}", e.getMessage());
            return false;
        }
    }
}