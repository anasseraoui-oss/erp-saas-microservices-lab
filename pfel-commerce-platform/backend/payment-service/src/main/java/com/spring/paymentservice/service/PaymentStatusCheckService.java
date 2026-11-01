// Fixed PaymentStatusCheckService.java
package com.spring.paymentservice.service;

import com.eraoui.kafka.NotificationProducer;
import com.eraoui.notification.NotificationPaymentPayload;
import com.eraoui.notification.NotificationType;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.spring.paymentservice.model.Payment;
import com.spring.paymentservice.model.PaymentScheduleStatus;
import com.spring.paymentservice.model.DataPaidDate;

import com.spring.paymentservice.repository.PaymentRepository;
import com.spring.paymentservice.repository.DataPaidDateRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.*;
import java.util.Date;
import java.util.List;
import java.util.Optional;
@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentStatusCheckService {

    private final PaymentRepository paymentRepository;
    private final DataPaidDateRepository dataPaidDateRepository;
    private final NotificationProducer notificationProducer;
    private final ObjectMapper objectMapper;

    @PostConstruct
    @Transactional(readOnly = true)
    public void performInitialCheck() {
        log.info("Performing initial checks on application startup...");
        checkForDueDate();
        checkForDataPaids();
        checkForOverduePayments();
        log.info("Initial startup checks finished.");
    }
    @Scheduled(cron = "0 0 8 * * *") // Runs at 8:00 AM every day
    @Transactional(readOnly = true)
    public void checkForDueDate() {
        log.info("Running scheduled check for due date payments...");

        try {
            LocalDate today = LocalDate.now();
            LocalDateTime startOfDay = today.atStartOfDay(); // e.g., 2025-08-15T00:00:00
            LocalDateTime endOfDay = today.atTime(LocalTime.MAX);   // e.g., 2025-08-15T23:59:59.999...            
            Date startOfDayDate = Date.from(startOfDay.atZone(ZoneId.systemDefault()).toInstant());
            Date endOfDayDate = Date.from(endOfDay.atZone(ZoneId.systemDefault()).toInstant());
            Optional<List<Payment>> dueToday = paymentRepository.findPaymentsByDueDateBetween(startOfDayDate, endOfDayDate);
            if (dueToday.isPresent() && !dueToday.get().isEmpty()) {
                List<Payment> duePayments = dueToday.get();

                for (Payment payment : duePayments) {
                    try {
                        NotificationPaymentPayload payload = createPaymentNotificationPayload(payment);

                        // إرسال notification مع retry
                        notificationProducer.sendNotification("payment-due-date-topic", payload);

                        log.debug("Payment due notification sent for order: {}", payment.getOrderId());

                    } catch (Exception e) {
                        log.error("Failed to send notification for payment {}: {}",
                                payment.getOrderId(), e.getMessage());
                    }
                }

                log.info("Finished check. Found {} payments due today.", duePayments.size());

            } else {
                log.info("No payments due today.");
            }

        } catch (Exception e) {
            log.error("Error during scheduled payment check: {}", e.getMessage(), e);
        }
    }

    private NotificationPaymentPayload createPaymentNotificationPayload(Payment payment) {
        String message = String.format(
                "Payment Alert: Order #%s is due today. Amount: %s, Supplier: %s",
                payment.getOrderId(),
                payment.getAmountPaid(),
                payment.getSupplierClientId()
        );

        return NotificationPaymentPayload.builder()
                .subject("Payment Alert: Order #" + payment.getOrderId())
                .message(message)
                .type(NotificationType.PAYMENT_DUE)
                .timestamp(Instant.now())
                .orderId(payment.getOrderId())
                .supplierClientId(String.valueOf(payment.getSupplierClientId()))
                .orderType(payment.getOrderType())
                .priority("HIGH");
    }

    @Scheduled(cron = "0 0 10 * * *") // Runs at 10:00 AM every day
    @Transactional(readOnly = true)
    public void checkForOverduePayments() {
        log.info("Running scheduled check for overdue payments...");

        try {
            Date yesterday = new Date(System.currentTimeMillis() - 24 * 60 * 60 * 1000);
            Optional<List<Payment>> overduePayments = Optional.ofNullable(paymentRepository.findOverduePayments(yesterday));

            if (overduePayments.isPresent() && !overduePayments.get().isEmpty()) {
                for (Payment payment : overduePayments.get()) {
                    NotificationPaymentPayload payload = createOverduePaymentNotification(payment);
                    notificationProducer.sendNotificationAsync("payment-due-date-topic", payload);
                }

                log.info("Sent overdue notifications for {} payments.", overduePayments.get().size());
            }

        } catch (Exception e) {
            log.error("Error during overdue payment check: {}", e.getMessage(), e);
        }
    }
    @Scheduled(cron = "0 0 10 * * *") // Runs at 10:00 AM every day
    @Transactional(readOnly = true)
    public void checkForDataPaids() {
        log.info("Running scheduled check for overdue payments...");

        try {
            LocalDate today = LocalDate.now();
            LocalDateTime startOfDay = today.atStartOfDay();
            LocalDateTime endOfDay = today.atTime(LocalTime.MAX);

            Date startOfDayDate = Date.from(startOfDay.atZone(ZoneId.systemDefault()).toInstant());
            Date endOfDayDate = Date.from(endOfDay.atZone(ZoneId.systemDefault()).toInstant());

            List<DataPaidDate> data = dataPaidDateRepository.findByDateBetween(startOfDayDate, endOfDayDate);

            if (!data.isEmpty()) {
                List<PaymentScheduleStatus> statusesToIgnore = List.of(
                        PaymentScheduleStatus.SCHEDULED,
                        PaymentScheduleStatus.OVERDUE
                );
                for (DataPaidDate dataPaidDate : data) {
                    if (!statusesToIgnore.contains(dataPaidDate.getPaymentScheduleStatus())) {
                        NotificationPaymentPayload payload = createOverdueDataPaidDateNotification(dataPaidDate);
                        String jsonPayload = objectMapper.writeValueAsString(payload);

                        notificationProducer.sendNotificationAsync("payment-due-date-topic", payload);
                    }
                }

                log.info("Sent overdue notifications for {} payments.", data.size());
            }

        } catch (Exception e) {
            log.error("Error during overdue payment check: {}", e.getMessage(), e);
        }
    }

    private NotificationPaymentPayload createOverduePaymentNotification(Payment payment) {
        String message = String.format(
                "URGENT: Payment for Order #%s is OVERDUE! Amount: %s, Supplier: %s. Please process immediately.",
                payment.getOrderId(),
                payment.getAmountPaid(),
                payment.getSupplierClientId()
        );

        return NotificationPaymentPayload.builder()
                .subject("Payment Alert: Order #" + payment.getOrderId())
                .message(message)
                .type(NotificationType.PAYMENT_OVERDUE)
                .timestamp(Instant.now())
                .orderId(payment.getOrderId())
                .supplierClientId(String.valueOf(payment.getSupplierClientId()))
                .orderType(payment.getOrderType())
                .priority("CRITICAL");
    }
    
    private NotificationPaymentPayload createOverdueDataPaidDateNotification(DataPaidDate dataPaidDate) {
        String message = String.format(
                "URGENT: Payment for Order #%s is OVERDUE! Amount: %s, Supplier: %s. Please process immediately. PaymentScheduleStatus: %s",
                dataPaidDate.getPayment().getOrderId(),
                dataPaidDate.getAmountPaid(),
                dataPaidDate.getPayment().getSupplierClientId(),
                dataPaidDate.getPaymentScheduleStatus(), dataPaidDate.getDate()
        );

        return NotificationPaymentPayload.builder()
                .subject("Payment Alert: Order #" + dataPaidDate.getPayment().getOrderId())
                .message(message)
                .type(NotificationType.PAYMENT_OVERDUE)
                .timestamp(Instant.now())
                .orderId(dataPaidDate.getPayment().getOrderId())
                .supplierClientId(String.valueOf(dataPaidDate.getPayment().getSupplierClientId()))
                .orderType(dataPaidDate.getPayment().getOrderType())
                .priority("CRITICAL");
    }
}