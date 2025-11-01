package com.eraoui.notificationservice.service;

import com.eraoui.notification.NotificationRequest;
import com.eraoui.notification.NotificationSandType;
import com.eraoui.notificationservice.model.Notification;
import com.eraoui.notificationservice.model.NotificationStatus;
import com.eraoui.notificationservice.model.Sand;
import com.eraoui.notificationservice.repository.NotificationRepository;
import com.eraoui.notificationservice.repository.SandRepository;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;

@Service
public class NotificationService {

    private static final Logger logger = LoggerFactory.getLogger(NotificationService.class);

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private SandRepository sandRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private SmsService smsService;

    @Autowired
    private PushNotificationService pushNotificationService;

    @Transactional // Add this annotation to the service method
    public Notification createNotification(NotificationRequest request) {
        if (request.getSubject() == null || request.getSubject().isBlank()) {
            throw new IllegalArgumentException("Notification subject must not be null or empty");
        }
        boolean isDuplicate = notificationRepository.existsBySubjectAndType(
            request.getSubject(),
            request.getType()
        );

        if (isDuplicate) {
            // Fetch and return the existing notification to make the operation idempotent
            return notificationRepository.findFirstBySubjectAndType(request.getSubject(), request.getType())
                    .orElseThrow(() -> new IllegalStateException("A notification with the same subject and type exists but could not be retrieved."));
        }
        if (request.getType() == null) {
            request.setType(NotificationSandType.EMAIL);
        }

        Notification notification = new Notification(
                request.getSubject(),
                request.getMessage(),
                request.getType(),
                request.getNotificationType(),
                request.getSentAt()
        );
        notification.setMetadata(request.getMetadata());
        if (request.getRecipient() != null){
            System.out.println("Looking for Sand with email: " + request.getRecipient());
            Sand sand = sandRepository.findByEmailContainingIgnoreCase(request.getRecipient());
            System.out.println("Found Sand: " + sand);

            if (sand != null) {
                System.out.println("Adding sand to subscribers...");
                if (notification.getSubscribers() == null) {
                    notification.setSubscribers(new HashSet<>());
                }
                notification.getSubscribers().add(sand);
                System.out.println("Subscribers size: " + notification.getSubscribers().size());
            }
        }
        return notificationRepository.save(notification);
    }
    @Transactional // Add this annotation to the service method
    public Notification updateNotification(Long id,NotificationRequest request,NotificationStatus status) {
        if (request.getSubject() == null || request.getSubject().isBlank()) {
            throw new IllegalArgumentException("Notification subject must not be null or empty");
        }
        Optional<Notification> notification = notificationRepository.findById(id);
        if (notification.isPresent()) {
            notification.get().setSubject(request.getSubject());
            notification.get().setMessage(request.getMessage());
            notification.get().setType(request.getType());
            notification.get().setMetadata(request.getMetadata());
            if(status != null) notification.get().setStatus(status);
            return notificationRepository.save(notification.get());
        }

        return null;
    }

    @Async
    public CompletableFuture<Boolean> sendNotification(Long notificationId) {
        Optional<Notification> optionalNotification = notificationRepository.findById(notificationId);

        if (optionalNotification.isEmpty()) {
            logger.error("Notification avec ID {} non trouvée", notificationId);
            return CompletableFuture.completedFuture(false);
        }

        Notification notification = optionalNotification.get();

        try {
            boolean success = switch (notification.getType()) {
                case EMAIL -> emailService.sendEmail(notification);
                case SMS -> smsService.sendSms(notification);
                case PUSH -> pushNotificationService.sendPushNotification(notification, notification.getNotificationType());
                case IN_APP -> true; // Notification in-app toujours réussie
            };

            notification.setStatus(success ? NotificationStatus.SENT : NotificationStatus.FAILED);
            notification.setSentAt(LocalDateTime.now());
            notificationRepository.save(notification);

            logger.info("Notification {} envoyée avec succès: {}", notificationId, success);
            return CompletableFuture.completedFuture(success);

        } catch (Exception e) {
            logger.error("Erreur lors de l'envoi de la notification {}: {}", notificationId, e.getMessage());
            notification.setStatus(NotificationStatus.FAILED);
            notificationRepository.save(notification);
            return CompletableFuture.completedFuture(false);
        }
    }

    public CompletableFuture<Boolean> sendImmediateNotification(Notification request) {
        return sendNotification(request.getId());
    }

    public List<Notification> getNotificationsByStatus(NotificationStatus status) {
        return notificationRepository.findByStatus(status);
    }

    public List<Notification> getAllNotifications() {
        return notificationRepository.findAll();
    }

    public Optional<Notification> getNotificationById(Long id) {
        return notificationRepository.findById(id);
    }

    public void retryFailedNotifications() {
        List<Notification> failedNotifications = notificationRepository.findByStatus(NotificationStatus.FAILED);
        for (Notification notification : failedNotifications) {
            notification.setStatus(NotificationStatus.PENDING);
            notificationRepository.save(notification);
            sendNotification(notification.getId());
        }
    }

    // NotificationService.java
    public List<Notification> getNotificationsByRecipient(String recipient) {
        try {
            Sand subscriber = sandRepository.findByEmailContainingIgnoreCase(recipient);
            if (subscriber != null) {
                List<Notification> notifications = notificationRepository.findBySubscriber(subscriber);
                return notifications != null ? notifications : new ArrayList<>();
            }
            // Return empty list instead of null when subscriber not found
            return new ArrayList<>();
        } catch (Exception e) {
            logger.error("Error fetching notifications for recipient: " + recipient, e);
            return new ArrayList<>();
        }
    }
}
