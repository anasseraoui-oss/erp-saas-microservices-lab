package com.spring.paymentservice.config;

import com.eraoui.Processor.NotificationProcessor;
import com.eraoui.notification.NotificationPayload;
import com.eraoui.notification.NotificationPaymentPayload;
import com.eraoui.notification.NotificationRequest;
import com.eraoui.notification.NotificationSandType;
import org.springframework.stereotype.Component;

// 2. Processor séparé pour la logique métier
@Component
public class PaymentNotificationProcessor implements NotificationProcessor {

    @Override
    public NotificationRequest processPayload(NotificationPayload payload) {
        NotificationPaymentPayload paymentPayload = (NotificationPaymentPayload) payload;

        return NotificationRequest.builder()
                .subject("Payment Alert - Order #" + paymentPayload.getOrderId())
                .message(payload.getMessage())
                .type(NotificationSandType.EMAIL)
                .build();
    }
    @Override
    public boolean supports(String topic) {
        return "payment-due-date-topic".equals(topic);
    }

    @Override
    public String getSupportedTopic() {
        return "payment-due-date-topic";
    }
}