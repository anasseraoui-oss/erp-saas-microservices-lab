package com.spring.productsevice.config;

import com.eraoui.Processor.NotificationProcessor;
import com.eraoui.notification.NotificationPayload;
import com.eraoui.notification.NotificationProductPayload;
import com.eraoui.notification.NotificationRequest;
import com.eraoui.notification.NotificationSandType;
import com.eraoui.notification.NotificationType;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class ProductNotificationProcessor implements NotificationProcessor {

    @Override
    public NotificationRequest processPayload(NotificationPayload payload) {
        if (!(payload instanceof NotificationProductPayload productPayload)) {
            throw new IllegalArgumentException("Expected NotificationProductPayload");
        }

        return NotificationRequest.builder()
                .subject(buildSubject(productPayload))
                .message(payload.getMessage())
                .type(determineNotificationType(productPayload))
                .priority(payload.getPriority())
                .notificationType(payload.getType())
                .build();

        // ✅ CRITICAL: Set the payloadType manually
        // This matches @JsonSubTypes.Type name


    }

    @Override
    public boolean supports(String topic) {
        return "product-notifications".equals(topic);
    }

    @Override
    public String getSupportedTopic() {
        return "product-notifications";
    }
    private String buildSubject(NotificationProductPayload payload) {
        if (payload.getSubject() != null && !payload.getSubject().isEmpty()) {
            return payload.getSubject();
        }

        String productName = payload.getProductName() != null ?
                payload.getProductName() : "Product #" + payload.getProductId();

        return switch (payload.getType()) {
            case LOW_STOCK -> "⚠️ Low Stock Alert - " + productName;
            case OUT_OF_STOCK -> "🔴 OUT OF STOCK - " + productName;
            case RESTOCK_NEEDED -> "📦 Restock Required - " + productName;
            case PRICE_CHANGE -> "💰 Price Update - " + productName;
            case NEW_PRODUCT -> "✨ New Product Added - " + productName;
            case PRODUCT_DISCONTINUED -> "❌ Product Discontinued - " + productName;
            case EXPIRATION -> "🔥 Expiration Warning - " + productName;
            default -> "📢 Product Alert - " + productName;
        };
    }
    private NotificationSandType determineNotificationType(NotificationProductPayload payload) {
        // Critical situations get SMS
        if (isCritical(payload)) {
            return NotificationSandType.SMS;
        }

        // Everything else gets email
        return NotificationSandType.EMAIL;
    }

    private boolean isCritical(NotificationProductPayload payload) {
        return "CRITICAL".equals(payload.getPriority()) ||
                payload.getType() == NotificationType.OUT_OF_STOCK ||
                (payload.getType() == NotificationType.LOW_STOCK &&
                        payload.getQuantity() != null && payload.getQuantity() <= 2);
    }
}