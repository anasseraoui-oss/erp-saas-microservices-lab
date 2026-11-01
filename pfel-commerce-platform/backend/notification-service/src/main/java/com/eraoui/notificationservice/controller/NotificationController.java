package com.eraoui.notificationservice.controller;

import com.eraoui.notification.NotificationRequest;
import com.eraoui.notificationservice.model.Notification;
import com.eraoui.notificationservice.model.NotificationStatus;
import com.eraoui.notificationservice.service.NotificationService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;
    @PreAuthorize("hasAuthority('SAVE_NOTIFICATION_HISTORY')")
    @PostMapping("/send")
    public ResponseEntity<?> sendNotification(@Valid @RequestBody Notification request) {
        try {
            CompletableFuture<Boolean> result = notificationService.sendImmediateNotification(request);
            return ResponseEntity.ok().body("Notification en cours d'envoi");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erreur lors de l'envoi: " + e.getMessage());
        }
    }
    @PreAuthorize("hasAuthority('SAVE_NOTIFICATION_HISTORY')")
    @PostMapping("/create")
    public ResponseEntity<Notification> createNotification(@Valid @RequestBody NotificationRequest request) {
        try {
            System.out.println("=== Received Notification Request ===");
            System.out.println("Recipient: " + request.getRecipient());
            System.out.println("Subject: " + request.getSubject());
            System.out.println("Message: " + request.getMessage());
            System.out.println("SentAt: " + request.getSentAt());
            System.out.println("Type: " + request.getType());
            System.out.println("Priority: " + request.getPriority());
            System.out.println("NotificationType: " + request.getNotificationType());
            System.out.println("Metadata: " + request.getMetadata());
            System.out.println("=====================================");
            Notification notification = notificationService.createNotification(request);
            return ResponseEntity.ok(notification);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    @PreAuthorize("hasAuthority('SAVE_NOTIFICATION_HISTORY')")
    @PutMapping("/update/{id}")
    public ResponseEntity<Notification> updateNotification(@PathVariable Long id,@Valid @RequestBody NotificationRequest request,@RequestParam NotificationStatus status) {
        try {
            Notification notification = notificationService.updateNotification(id,request, status);
            return ResponseEntity.ok(notification);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PreAuthorize("hasAuthority('SAVE_NOTIFICATION_HISTORY')")
    @PostMapping("/send/{id}")
    public ResponseEntity<?> sendNotificationById(@PathVariable Long id) {
        try {
            CompletableFuture<Boolean> result = notificationService.sendNotification(id);
            return ResponseEntity.ok().body("Notification en cours d'envoi" + result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erreur lors de l'envoi: " + e.getMessage());
        }
    }

    @PreAuthorize("hasAuthority('VIEW_NOTIFICATION_HISTORY')")
    @GetMapping("/recipient/{recipient}")
    public ResponseEntity<List<Notification>> getNotificationsByRecipient(@PathVariable String recipient) {
        try {
            List<Notification> notifications = notificationService.getNotificationsByRecipient(recipient);
            // Always return 200 OK with a list (empty if no notifications found)
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            System.err.println("Error in getNotificationsByRecipient controller " +e);
            // Return empty list with 200 status instead of error
            return ResponseEntity.ok(new ArrayList<>());
        }
    }

    @PreAuthorize("hasAuthority('VIEW_NOTIFICATION_HISTORY')")
    @GetMapping("/status/{status}")
    public ResponseEntity<List<Notification>> getNotificationsByStatus(@PathVariable NotificationStatus status) {
        List<Notification> notifications = notificationService.getNotificationsByStatus(status);
        return ResponseEntity.ok(notifications);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Notification> getNotificationById(@PathVariable Long id) {
        Optional<Notification> notification = notificationService.getNotificationById(id);
        return notification.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PreAuthorize("hasAuthority('VIEW_NOTIFICATION_HISTORY')")
    @GetMapping
    public ResponseEntity<List<Notification>> getAllNotifications() {
        List<Notification> notifications = notificationService.getAllNotifications();
        return ResponseEntity.ok(notifications);
    }

    @PostMapping("/retry-failed")
    public ResponseEntity<?> retryFailedNotifications() {
        try {
            notificationService.retryFailedNotifications();
            return ResponseEntity.ok().body("Relance des notifications échouées en cours");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erreur lors de la relance: " + e.getMessage());
        }
    }
}
