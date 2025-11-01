package com.eraoui.notificationservice.kafkaConfig;

import com.eraoui.notification.NotificationPayload;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.clients.producer.ProducerConfig;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.apache.kafka.common.serialization.StringSerializer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.annotation.EnableKafka;
import org.springframework.kafka.config.ConcurrentKafkaListenerContainerFactory;
import org.springframework.kafka.core.*;
import org.springframework.kafka.listener.DefaultErrorHandler;
import org.springframework.kafka.support.serializer.ErrorHandlingDeserializer;
import org.springframework.kafka.support.serializer.JsonDeserializer;
import org.springframework.kafka.support.serializer.JsonSerializer;
import org.springframework.util.backoff.FixedBackOff;

import java.util.HashMap;
import java.util.Map;

@EnableKafka
@Configuration
@Slf4j
public class KafkaConfig {

    @Value("${spring.kafka.bootstrap-servers:localhost:9092}")
    private String bootstrapServers;

    @Value("${spring.kafka.consumer.group-id:notification_group}")
    private String groupId;

    // ===== CONSUMER CONFIGURATION =====
    @Bean
    public ConsumerFactory<String, NotificationPayload> consumerFactory() {
        Map<String, Object> props = new HashMap<>();
        props.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        props.put(ConsumerConfig.GROUP_ID_CONFIG, groupId);

        // ✅ USE ERROR HANDLING DESERIALIZER
        props.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, ErrorHandlingDeserializer.class);
        props.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, ErrorHandlingDeserializer.class);

        // Delegate to actual deserializers
        props.put(ErrorHandlingDeserializer.KEY_DESERIALIZER_CLASS, StringDeserializer.class);
        props.put(ErrorHandlingDeserializer.VALUE_DESERIALIZER_CLASS, JsonDeserializer.class);

        // JsonDeserializer configuration
        props.put(JsonDeserializer.TRUSTED_PACKAGES, "*");
        props.put(JsonDeserializer.VALUE_DEFAULT_TYPE, NotificationPayload.class);
        props.put(JsonDeserializer.USE_TYPE_INFO_HEADERS, false);

        // ✅ ADD DEFAULT TYPE MAPPING
        props.put(JsonDeserializer.TYPE_MAPPINGS,
                "payment:com.eraoui.notification.NotificationPaymentPayload," +
                        "product:com.eraoui.notification.NotificationProductPayload," +
                        "order:com.eraoui.notification.NotificationOrderPayload," +
                        "user:com.eraoui.notification.NotificationUserPayload"
        );

        // Other consumer properties
        props.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest");

        return new DefaultKafkaConsumerFactory<>(props);
    }
    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, NotificationPayload> kafkaListenerContainerFactory(
            ConsumerFactory<String, NotificationPayload> consumerFactory) {

        ConcurrentKafkaListenerContainerFactory<String, NotificationPayload> factory = new ConcurrentKafkaListenerContainerFactory<>();
        factory.setConsumerFactory(consumerFactory);

        // Error Handler with FixedBackOff
        DefaultErrorHandler errorHandler = new DefaultErrorHandler(
                (consumerRecord, exception) -> {
                    log.error("❌ Error processing message from topic [{}] with key [{}]: {}",
                            consumerRecord.topic(), consumerRecord.key(), exception.getMessage(), exception);
                },
                new FixedBackOff(1000L, 2) // 2 retries with 1 second delay
        );

        factory.setCommonErrorHandler(errorHandler);

        return factory;
    }

    // ===== PRODUCER CONFIGURATION =====
    @Bean
    public ProducerFactory<String, NotificationPayload> producerFactory() {
        Map<String, Object> configProps = new HashMap<>();
        configProps.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        configProps.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class);
        configProps.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, JsonSerializer.class);

        // ✅ ENSURE TYPE INFO IS INCLUDED
        configProps.put(JsonSerializer.ADD_TYPE_INFO_HEADERS, true);

        return new DefaultKafkaProducerFactory<>(configProps);
    }

    @Bean
    public KafkaTemplate<String, NotificationPayload> kafkaTemplate() {
        return new KafkaTemplate<>(producerFactory());
    }
}
