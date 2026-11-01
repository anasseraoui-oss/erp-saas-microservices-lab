package com.spring.paymentservice.model;

import com.spring.paymentservice.model.*;
import com.spring.paymentservice.repository.PaymentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.*;

@Component
public class PaymentSetup {

    private static final Logger logger = LoggerFactory.getLogger(PaymentSetup.class);

    private final PaymentRepository paymentRepository;

    @Value("${app.setup.initial-data.enabled:true}")
    private boolean setupEnabled;

    @Autowired
    public PaymentSetup(PaymentRepository paymentRepository) {
        this.paymentRepository = paymentRepository;
    }

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void setupInitialPayments() {
        if (!setupEnabled) {
            logger.info("Initial payment data setup is disabled. Skipping...");
            return;
        }

        logger.info("Starting initial setup for Payments...");
        long startTime = System.currentTimeMillis();

        // Check if data already exists
        if (paymentRepository.count() > 0) {
            logger.info("Payments already exist. Skipping setup.");
            return;
        }

        int paymentsCreated = 0;

        // Create payments for Purchase Orders (IDs 1-50)
        paymentsCreated += createPaymentsForSales();

        // Create payments for Purchase Invoices (IDs 1-35 approximately 70% of 50)
        paymentsCreated += createPaymentsForPurchases();

        long duration = System.currentTimeMillis() - startTime;
        logger.info("Initial setup finished. Payments Created: {}, Duration: {}ms",
                paymentsCreated, duration);
    }

    private int createPaymentsForSales() {
        int created = 0;
        Random random = new Random();

        // Assuming 50 Purchase Orders were created with IDs 1-50
        // We'll create payments for orders with different payment statuses
        for (long orderId = 1; orderId <= 50; orderId++) {

            // Determine payment status based on orderId pattern
            String paymentStatus = determineOrderPaymentStatus(orderId);

            if (paymentStatus.equals("UNPAID")) {
                // Skip creating payment for unpaid orders
                continue;
            }

            Payment payment = new Payment();
            payment.setOrderId(orderId);
            payment.setOrderType("sales");

            // Supplier IDs cycle through 1-20
            Long supplierId = ((orderId - 1) % 20) + 1;
            payment.setSupplierClientId(supplierId);

            // Calculate amounts based on orderId (simulate the same logic as PurchaseOrderSetup)
            double totalAmount = calculateOrderTotalAmount(orderId);
            payment.setTotalAmount(Math.round(totalAmount * 100.0) / 100.0);

            // Set due date (15-60 days from order date)
            Date orderDate = getOrderDate(orderId);
            payment.setDueDate(addDays(orderDate, 15 + random.nextInt(46)));

            // User IDs (1-5)
            payment.setUserCreator(1L + random.nextInt(5));
            payment.setUserExecutor(1L + random.nextInt(5));

            // Create payment schedule based on payment status
            List<DataPaidDate> paidDates = new ArrayList<>();

            if (paymentStatus.equals("PAID")) {
                payment.setAmountPaid(payment.getTotalAmount());
                paidDates = createFullPaymentSchedule(payment, orderDate, random);

            } else if (paymentStatus.equals("PARTPAID")) {
                double paidPercentage = 0.2 + (random.nextDouble() * 0.6); // 20-80%
                payment.setAmountPaid(Math.round(payment.getTotalAmount() * paidPercentage * 100.0) / 100.0);
                paidDates = createPartialPaymentSchedule(payment, orderDate, random);
            }

            payment.setPaidDates(paidDates);

            try {
                paymentRepository.save(payment);
                created++;
                logger.debug("Created payment for Purchase Order ID: {}", orderId);
            } catch (Exception e) {
                logger.error("Failed to create payment for Order {}: {}", orderId, e.getMessage());
            }
        }

        logger.info("Created {} payments for Purchase Orders", created);
        return created;
    }

    private int createPaymentsForPurchases() {
        int created = 0;
        Random random = new Random();

        // Assuming ~35 Purchase Invoices were created (70% of 50 orders)
        // Invoice IDs are sequential, and they reference order IDs
        int invoiceCount = 35;

        for (long invoiceId = 1; invoiceId <= invoiceCount; invoiceId++) {

            // Determine payment status
            String paymentStatus = determineInvoicePaymentStatus(invoiceId);

            if (paymentStatus.equals("UNPAID")) {
                continue;
            }

            Payment payment = new Payment();
            payment.setOrderId(invoiceId);
            payment.setOrderType("purchases");

            // Match supplier ID with the corresponding order
            Long correspondingOrderId = getCorrespondingOrderId(invoiceId);
            Long supplierId = ((correspondingOrderId - 1) % 20) + 1;
            payment.setSupplierClientId(supplierId);

            // Calculate invoice amount (typically 50-100% of order amount)
            double orderAmount = calculateOrderTotalAmount(correspondingOrderId);
            double invoicePercentage = 0.5 + (random.nextDouble() * 0.5); // 50-100%
            double totalAmount = orderAmount * invoicePercentage;
            payment.setTotalAmount(Math.round(totalAmount * 100.0) / 100.0);

            // Set due date (invoice date + 15-45 days)
            Date invoiceDate = getInvoiceDate(correspondingOrderId);
            payment.setDueDate(addDays(invoiceDate, 15 + random.nextInt(31)));

            payment.setUserCreator(1L + random.nextInt(5));
            payment.setUserExecutor(1L + random.nextInt(5));

            // Create payment schedule
            List<DataPaidDate> paidDates = new ArrayList<>();

            if (paymentStatus.equals("PAID")) {
                payment.setAmountPaid(payment.getTotalAmount());
                paidDates = createFullPaymentSchedule(payment, invoiceDate, random);

            } else if (paymentStatus.equals("PARTPAID")) {
                double paidPercentage = 0.3 + (random.nextDouble() * 0.5); // 30-80%
                payment.setAmountPaid(Math.round(payment.getTotalAmount() * paidPercentage * 100.0) / 100.0);
                paidDates = createPartialPaymentSchedule(payment, invoiceDate, random);
            }

            payment.setPaidDates(paidDates);

            try {
                paymentRepository.save(payment);
                created++;
                logger.debug("Created payment for Purchase Invoice ID: {}", invoiceId);
            } catch (Exception e) {
                logger.error("Failed to create payment for Invoice {}: {}", invoiceId, e.getMessage());
            }
        }

        logger.info("Created {} payments for Purchase Invoices", created);
        return created;
    }

    private List<DataPaidDate> createFullPaymentSchedule(Payment payment, Date startDate, Random random) {
        List<DataPaidDate> paidDates = new ArrayList<>();

        // Determine number of payments (1-4)
        int numberOfPayments = 1 + random.nextInt(4);
        double remainingAmount = payment.getTotalAmount();

        for (int i = 0; i < numberOfPayments; i++) {
            DataPaidDate paidDate = new DataPaidDate();

            // Calculate amount for this payment
            double amountPaid;
            if (i == numberOfPayments - 1) {
                amountPaid = remainingAmount; // Last payment gets remainder
            } else {
                double maxPayment = remainingAmount * 0.7; // Max 70% per payment
                amountPaid = Math.round((remainingAmount * 0.2 + random.nextDouble() * maxPayment) * 100.0) / 100.0;
            }

            paidDate.setAmountPaid(amountPaid);
            remainingAmount -= amountPaid;

            // Set payment date (spread across time)
            int daysOffset = (i * 15) + random.nextInt(10);
            paidDate.setDate(addDays(startDate, daysOffset));

            // Set status based on date
            if (paidDate.getDate().before(new Date())) {
                paidDate.setStatus(Status.FIN);
                paidDate.setPaymentScheduleStatus(PaymentScheduleStatus.PAID);
            } else {
                paidDate.setStatus(Status.DEBUT);
                paidDate.setPaymentScheduleStatus(PaymentScheduleStatus.SCHEDULED);
            }

            // Random payment method
            paidDate.setMethodePayment(getRandomPaymentMethod(random));

            paidDate.setUserCreator(payment.getUserCreator());
            paidDate.setUserExecutor(payment.getUserExecutor());
            paidDate.setPayment(payment);

            paidDates.add(paidDate);
        }

        return paidDates;
    }

    private List<DataPaidDate> createPartialPaymentSchedule(Payment payment, Date startDate, Random random) {
        List<DataPaidDate> paidDates = new ArrayList<>();

        // Create 1-3 completed payments
        int completedPayments = 1 + random.nextInt(3);
        double paidSoFar = 0.0;

        for (int i = 0; i < completedPayments; i++) {
            DataPaidDate paidDate = new DataPaidDate();

            // Calculate payment amount
            double maxPayment = (payment.getAmountPaid() - paidSoFar) * 0.8;
            double amountPaid;

            if (i == completedPayments - 1) {
                amountPaid = payment.getAmountPaid() - paidSoFar; // Last paid amount
            } else {
                amountPaid = Math.round((100 + random.nextDouble() * maxPayment) * 100.0) / 100.0;
            }

            paidDate.setAmountPaid(amountPaid);
            paidSoFar += amountPaid;

            // Set past date
            int daysOffset = (i * 10) + random.nextInt(7);
            paidDate.setDate(addDays(startDate, daysOffset - 30)); // Past dates

            paidDate.setStatus(Status.FIN);
            paidDate.setPaymentScheduleStatus(PaymentScheduleStatus.PAID);
            paidDate.setMethodePayment(getRandomPaymentMethod(random));
            paidDate.setUserCreator(payment.getUserCreator());
            paidDate.setUserExecutor(payment.getUserExecutor());
            paidDate.setPayment(payment);

            paidDates.add(paidDate);
        }

        // Create 1-2 scheduled future payments for remaining amount
        double remainingAmount = payment.getTotalAmount() - payment.getAmountPaid();
        int scheduledPayments = 1 + random.nextInt(2);

        for (int i = 0; i < scheduledPayments; i++) {
            DataPaidDate paidDate = new DataPaidDate();

            double amountPaid;
            if (i == scheduledPayments - 1) {
                amountPaid = remainingAmount; // Last scheduled payment
            } else {
                amountPaid = Math.round((remainingAmount * 0.5) * 100.0) / 100.0;
            }

            paidDate.setAmountPaid(amountPaid);
            remainingAmount -= amountPaid;

            // Future date
            int daysOffset = 7 + (i * 15) + random.nextInt(7);
            paidDate.setDate(addDays(new Date(), daysOffset));

            paidDate.setStatus(Status.DEBUT);
            paidDate.setPaymentScheduleStatus(PaymentScheduleStatus.SCHEDULED);
            paidDate.setMethodePayment(getRandomPaymentMethod(random));
            paidDate.setUserCreator(payment.getUserCreator());
            paidDate.setUserExecutor(payment.getUserExecutor());
            paidDate.setPayment(payment);

            paidDates.add(paidDate);
        }

        return paidDates;
    }

    private String determineOrderPaymentStatus(long orderId) {
        // Pattern matching the PurchaseOrderSetup logic
        int pattern = (int) (orderId % 3);
        switch (pattern) {
            case 0: return "PAID";
            case 1: return "PARTPAID";
            case 2: return "UNPAID";
            default: return "UNPAID";
        }
    }

    private String determineInvoicePaymentStatus(long invoiceId) {
        int pattern = (int) (invoiceId % 3);
        switch (pattern) {
            case 0: return "PAID";
            case 1: return "PARTPAID";
            case 2: return "UNPAID";
            default: return "UNPAID";
        }
    }

    private double calculateOrderTotalAmount(long orderId) {
        // Simulate total amount calculation (matching PurchaseOrderSetup)
        Random random = new Random(orderId); // Use orderId as seed for consistency
        int numberOfLines = 2 + random.nextInt(5);
        double total = 0.0;

        for (int i = 0; i < numberOfLines; i++) {
            int quantity = 1 + random.nextInt(50);
            double price = 10.0 + (random.nextDouble() * 990.0);
            total += quantity * price;
        }

        return total;
    }

    private Long getCorrespondingOrderId(long invoiceId) {
        // Invoices are created for 70% of orders
        // Simple mapping: invoice 1-7 -> orders 1-10, invoice 8-14 -> orders 11-20, etc.
        return ((invoiceId - 1) * 10 / 7) + 1;
    }

    private Date getOrderDate(long orderId) {
        Random random = new Random(orderId);
        int daysOffset = -90 + random.nextInt(91); // -90 to 0 days
        return getDateOffset(daysOffset);
    }

    private Date getInvoiceDate(long orderId) {
        Date orderDate = getOrderDate(orderId);
        Random random = new Random(orderId + 1000);
        return addDays(orderDate, 1 + random.nextInt(7)); // 1-7 days after order
    }

    private Date getDateOffset(int daysOffset) {
        LocalDate date = LocalDate.now().plusDays(daysOffset);
        return Date.from(date.atStartOfDay(ZoneId.systemDefault()).toInstant());
    }

    private Date addDays(Date date, int days) {
        LocalDate localDate = date.toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
        localDate = localDate.plusDays(days);
        return Date.from(localDate.atStartOfDay(ZoneId.systemDefault()).toInstant());
    }

    private Methode getRandomPaymentMethod(Random random) {
        Methode[] methods = Methode.values();
        return methods[random.nextInt(methods.length)];
    }
}
