package com.spring.paymentservice.config;
import com.eraoui.kafka.NotificationProducer;
import com.eraoui.notification.NotificationPayload;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.core.KafkaTemplate;

@Configuration
public class NotificationConfig {
    // ✅ CHANGE: Use NotificationPayload instead of Object
    @Bean
    public NotificationProducer notificationProducer(KafkaTemplate<String, NotificationPayload> kafkaTemplate) {
        return new NotificationProducer(kafkaTemplate);
    }

}
