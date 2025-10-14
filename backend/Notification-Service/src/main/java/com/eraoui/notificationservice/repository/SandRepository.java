package com.eraoui.notificationservice.repository;

import java.util.List;

import javax.management.Notification;

import com.eraoui.notification.NotificationSandType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.eraoui.notification.NotificationType;
import com.eraoui.notificationservice.model.Sand;
@Repository
public interface SandRepository extends JpaRepository<Sand, Long> {
    List<Sand> findBySandType(NotificationSandType notificationSandType);
    Sand findByEmailContainingIgnoreCase(String email);
    List<Sand> findByNotificationType(NotificationType notificationType);
}