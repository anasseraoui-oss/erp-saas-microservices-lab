package com.eraoui.notificationservice.repository;


import com.eraoui.notification.NotificationSandType;
import com.eraoui.notificationservice.model.Notification;
import com.eraoui.notificationservice.model.NotificationStatus;
import com.eraoui.notificationservice.model.Sand;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByStatus(NotificationStatus status);
    List<Notification> findByType(NotificationSandType type);
    boolean existsBySubjectAndType( String subject, NotificationSandType type);
    @Query(value = "SELECT * FROM notifications n " +
            "WHERE JSON_UNQUOTE(JSON_EXTRACT(n.metadata, '$.isAppointment')) = 'true'",
            nativeQuery = true)
    List<Notification> findByIsAppointmentTrue();
    @Query("SELECT n FROM Notification n JOIN n.subscribers s WHERE s = :subscriber")
    List<Notification> findBySubscriber(@Param("subscriber") Sand subscriber);}
