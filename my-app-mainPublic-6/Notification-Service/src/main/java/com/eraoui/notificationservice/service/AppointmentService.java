package com.eraoui.notificationservice.service;

import com.eraoui.notification.NotificationType;
import com.eraoui.notificationservice.model.Notification;
import com.eraoui.notificationservice.repository.NotificationRepository;
import com.eraoui.notificationservice.webSocket.WebSocketNotificationService;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AppointmentService {
    @Autowired
    private NotificationRepository notificationRepository;
    @Autowired
    private NotificationService notificationService;
    @Autowired
    private WebSocketNotificationService webSocketNotificationService;

    /**
     * Scheduled task that runs every hour to check for upcoming appointments.
     * It fetches appointments scheduled for the next hour and sends notifications.
     * This is more resilient than a daily check, as it can catch up if the service was down.
     */
    @Scheduled(cron = "0 0 * * * *") // Runs at the beginning of every hour
    @Transactional(readOnly = true)
    public void checkForAppointment() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime nextHour = now.plusHours(1);
        log.info("Checking for appointments between {} and {}", now, nextHour);

        // Fetch only appointments scheduled within the next hour
        List<Notification> appointments = notificationRepository.findAppointmentsDueBetween(now, nextHour);

        if (appointments.isEmpty()) {
            log.info("No upcoming appointments found in the next hour.");
            return;
        }

        log.info("Found {} upcoming appointments to notify.", appointments.size());
        for (Notification notification : appointments) {
            notificationService.sendNotification(notification.getId());
            webSocketNotificationService.sendNotificationToClients(notification);
        }
    }
    @PostConstruct
    public void performInitialCheck() {
        checkForAppointment();
    }
}
