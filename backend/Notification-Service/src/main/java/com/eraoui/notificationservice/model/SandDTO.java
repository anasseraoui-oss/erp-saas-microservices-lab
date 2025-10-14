package com.eraoui.notificationservice.model;

import com.eraoui.notification.NotificationSandType;
import com.eraoui.notification.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SandDTO {
    private Long id;
    private String name;
    private String description;
    private String email;
    private String phoneNumber;
    private EnableStatus enableStatus;
    private NotificationSandType sandType;
    private NotificationType notificationType;

    // Optional: Include count of notifications if needed
    private int notificationCount;
}
