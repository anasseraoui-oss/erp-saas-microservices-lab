package com.eraoui.notificationservice.webSocket;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.scheduling.TaskScheduler;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // FIXED: Register the STOMP endpoint exactly as Gateway expects it
        registry.addEndpoint("/ws/notifications")
                .setAllowedOriginPatterns("*") // Allow all origins for testing
                .withSockJS()
                .setTransportHandlers(); // Use default transport handlers
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Enable a simple message broker and prefix subscription destinations with "/topic"
        config.enableSimpleBroker("/topic")
                .setHeartbeatValue(new long[]{10000, 10000}) // Set heartbeat on the broker
                .setTaskScheduler(heartBeatScheduler()); // Provide the required TaskScheduler
        // Prefix for destinations mapped to @MessageMapping methods
        config.setApplicationDestinationPrefixes("/app");
    }

    @Bean
    public TaskScheduler heartBeatScheduler() {
        ThreadPoolTaskScheduler scheduler = new ThreadPoolTaskScheduler();
        scheduler.setPoolSize(1);
        scheduler.setThreadNamePrefix("websocket-heartbeat-");
        scheduler.initialize();
        return scheduler;
    }
}