package com.eraoui.notificationservice.model;



import com.eraoui.notification.NotificationSandType;
import com.eraoui.notification.NotificationType;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Setter
@Getter
@Entity
@Table(name = "notifications")
public class Notification {
    // Getters and Setters
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    //@Column(nullable = false)
    //private String recipient;

    private List<String> recipients;

    @Column(nullable = false)
    private String subject;

    @Column(columnDefinition = "TEXT")
    private String message;

    @Enumerated(EnumType.STRING)
    private NotificationSandType type;

    @Enumerated(EnumType.STRING)
    private NotificationType notificationType;

    @Enumerated(EnumType.STRING)
    private NotificationStatus status = NotificationStatus.PENDING;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "sent_at")
    private LocalDateTime sentAt;

    @ManyToMany(fetch = FetchType.EAGER, cascade = { CascadeType.PERSIST, CascadeType.MERGE })
    @JoinTable(
      name = "notification_subscriptions", // اسم الجدول الوسيط الذي سيتم إنشاؤه
      joinColumns = @JoinColumn(name = "notification_id"), // العمود الذي يشير إلى Notification
      inverseJoinColumns = @JoinColumn(name = "sand_id") // العمود الذي يشير إلى Sand
    )
   // @JsonManagedReference
    private Set<Sand> subscribers;

    private String metadata; // JSON pour données additionnelles

    // Constructors
    public Notification() {}

    public Notification(String subject, String message, NotificationSandType type, NotificationType notificationType, LocalDateTime sentAt) {
       // this.recipient = recipient;
        this.subject = subject;
        this.message = message;
        this.type = type;
        this.createdAt = LocalDateTime.now();
        this.sentAt = sentAt;
        this.notificationType = notificationType;
        this.subscribers = new HashSet<>(); // Add this line
    }
    @Transient
    public boolean isAppointment() {
        if (this.metadata == null || this.metadata.isBlank()) {
            return false;
        }
        try {
            ObjectMapper objectMapper = new ObjectMapper();
            JsonNode metadataJson = objectMapper.readTree(this.metadata);
            if (metadataJson.has("isAppointment")) {
                return metadataJson.get("isAppointment").asBoolean();
            }
        } catch (JsonProcessingException e) {
            System.err.println("Error parsing metadata JSON: " + e.getMessage());
            return false;
        }
        return false;
    }
}
