package com.eraoui.notificationservice.model;


import com.eraoui.notification.NotificationType;
import com.eraoui.notification.NotificationSandType;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.HashSet;
import java.util.Set;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Sand {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private String description;
    private String email;
    private String phoneNumber;
    @Enumerated(EnumType.STRING)
    private EnableStatus enableStatus = EnableStatus.ENABLED;
    @Enumerated(EnumType.STRING)
    private NotificationSandType sandType=NotificationSandType.EMAIL;
    @Enumerated(EnumType.STRING)
    private NotificationType notificationType=NotificationType.LOW_STOCK;
    // If Sand has many Notifications, use List<Notification> and @OneToMany
    // import java.util.List; at the top if not present
    @ManyToMany(mappedBy = "subscribers", cascade = {CascadeType.DETACH, CascadeType.MERGE, CascadeType.PERSIST, CascadeType.REFRESH})
    @JsonIgnore
    private Set<Notification> notifications = new HashSet<>();
    @JsonProperty("notificationCount")
    public int getNotificationCount() {
        return notifications != null ? notifications.size() : 0;
    }

}
