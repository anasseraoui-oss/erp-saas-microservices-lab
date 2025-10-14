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
    @Scheduled(cron = "0 0 8 * * *") // Runs at 8:00 AM every day
    @Transactional(readOnly = true)
    public void checkForAppointment() {
        List<Notification> appointments = notificationRepository.findByIsAppointmentTrue();
        if (appointments.isEmpty()) { return; }
        LocalDateTime nowDate = LocalDateTime.now();
        for (Notification notification : appointments) {
            if (notification.getSentAt().truncatedTo(ChronoUnit.HOURS)
                    .isEqual(nowDate.truncatedTo(ChronoUnit.HOURS))) {
                notificationService.sendNotification(notification.getId());
                webSocketNotificationService.sendNotificationToClients(notification);
            }
        }
    }
    @PostConstruct
    public void performInitialCheck() {
        checkForAppointment();
    }
}
