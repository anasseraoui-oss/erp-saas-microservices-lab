package com.spring.productsevice.service;

// ProductStatusCheckService.java
import com.eraoui.kafka.NotificationProducer;
import com.eraoui.notification.*;
import com.spring.productsevice.product.ExpiredProduct;
import com.spring.productsevice.product.Product;
import com.spring.productsevice.repository.ExpiredProductRepository;
import com.spring.productsevice.repository.ProductRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Date;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductStatusCheckService {

    private final ProductRepository productRepository;
    private final ExpiredProductRepository expiredProductRepository;
    private final NotificationProducer notificationProducer;

    @PostConstruct
    public void performInitialCheck() {
        log.info("Performing initial checks on application startup...");
        checkForLowStockLevels();
        checkForProductExpirations();
        log.info("Initial startup checks finished.");
    }
    /**
     * هذه المهمة تعمل كل يوم في الساعة 8 صباحًا للتحقق من انتهاء الصلاحية.
     * cron = "초 분 시 일 월 요일" (Second, Minute, Hour, Day of Month, Month, Day of week)
     */
    @Scheduled(cron = "0 0 8 * * *") // Runs at 8:00 AM every day
    @Transactional(readOnly = true)
    public void checkForProductExpirations() {
        log.info("Running scheduled check for product expirations...");
        LocalDate today = LocalDate.now();
        LocalDateTime startOfDay = today.atStartOfDay(); // مثلاً: 2025-08-14T00:00:00
        LocalDateTime endOfDay = today.atTime(LocalTime.MAX);   // مثلاً: 2025-08-14T23:59:59.999999999

        List<ExpiredProduct> expiringToday = expiredProductRepository.findByExpirationDateBetween(startOfDay, endOfDay);

        for (ExpiredProduct record : expiringToday) {
            Product product = record.getProduct();
            if (product == null) {
                log.warn("Skipping orphaned expired record with ID: {}. The associated product does not exist.", record.getId());
                continue;
            }
            NotificationPayload payload = createExpirationsProductNotification(product, record);
            notificationProducer.sendNotification("product-notifications",payload);
        }
        log.info("Finished check. Found {} products expiring today.", expiringToday.size());
    }

    /**
     * هذه المهمة تعمل كل ساعة للتحقق من مستويات المخزون.
     */
    @Scheduled(cron = "0 0 * * * *") // Runs at the beginning of every hour
    @Transactional(readOnly = true)
    public void checkForLowStockLevels() {
        log.info("Running scheduled check for low stock levels...");
        List<Product> lowStockProducts = productRepository.findLowStockProducts();

        for (Product product : lowStockProducts) {
            NotificationPayload payload = createLowStockProductNotification(product);
            notificationProducer.sendNotification("product-notifications",payload);
        }
        log.info("Finished check. Found {} products with low stock.", lowStockProducts.size());
    }
    public void checkForLowStockByProduct(Product product){
        NotificationPayload payload = createLowStockProductNotification(product);

        // ✅ CRITICAL: Set the payloadType manually
        payload.setPayloadType("product"); // This matches @JsonSubTypes.Type name


        notificationProducer.sendNotification("product-notifications",payload);
    }
    private NotificationProductPayload createLowStockProductNotification(Product product) {
        String message = String.format(
                "Alert: Stock for product '%s' is low. Current quantity: %d, Threshold: %d.",
                product.getName(),
                product.getQuantity(),
                product.getQuantityAlmostDepleted()
        );

        return NotificationProductPayload.builder()
                .subject("Alert: Stock")
                .message(message)
                .type(NotificationType.LOW_STOCK)
                .timestamp(Instant.now())
                .productId(product.getId())
                .productName(product.getName())
                .priority("CRITICAL");
    }
    private NotificationProductPayload createExpirationsProductNotification(Product product, ExpiredProduct record) {
        String message = String.format(
                "Warning: A quantity of %d for product '%s' (Lot: %s) expires today!",
                record.getQuantityExpired(),
                product.getName(),
                record.getLotNumber()
        );

        return NotificationProductPayload.builder()
                .subject("Warning: Expiration")
                .message(message)
                .type(NotificationType.EXPIRATION)
                .timestamp(Instant.now())
                .productId(product.getId())
                .productName(product.getName())
                .priority("CRITICAL");
    }
}
