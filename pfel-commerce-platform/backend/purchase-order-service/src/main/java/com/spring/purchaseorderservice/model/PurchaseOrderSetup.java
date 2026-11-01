package com.spring.purchaseorderservice.model;

import com.spring.purchaseorderservice.repository.DeliveryRepository;
import com.spring.purchaseorderservice.repository.PurchaseOrderRepository;
import com.spring.purchaseorderservice.repository.PurchaseInvoiceRepository;

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
public class PurchaseOrderSetup {

    private static final Logger logger = LoggerFactory.getLogger(PurchaseOrderSetup.class);

    private final PurchaseOrderRepository purchaseOrderRepository;
    private final PurchaseInvoiceRepository purchaseInvoiceRepository;
    private final DeliveryRepository deliveryRepository;

    @Value("${app.setup.initial-data.enabled:true}")
    private boolean setupEnabled;

    @Autowired
    public PurchaseOrderSetup(
            PurchaseOrderRepository purchaseOrderRepository,
            PurchaseInvoiceRepository purchaseInvoiceRepository,
            DeliveryRepository deliveryRepository) {
        this.purchaseOrderRepository = purchaseOrderRepository;
        this.purchaseInvoiceRepository = purchaseInvoiceRepository;
        this.deliveryRepository = deliveryRepository;
    }

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void setupInitialPurchaseData() {
        if (!setupEnabled) {
            logger.info("Initial purchase data setup is disabled. Skipping...");
            return;
        }

        logger.info("Starting initial setup for Purchase Orders and Invoices...");
        long startTime = System.currentTimeMillis();

        int ordersCreated = 0;
        int invoicesCreated = 0;

        // Check if data already exists
        if (purchaseOrderRepository.count() > 0) {
            logger.info("Purchase Orders already exist. Skipping setup.");
            return;
        }

        // Create deliveries first
        List<Delivery> deliveries = createDeliveries();

        // Create sample purchase orders
        List<PurchaseOrder> orders = createSamplePurchaseOrders(deliveries);
        ordersCreated = orders.size();

        // Create sample invoices
        List<PurchaseInvoice> invoices = createSampleInvoices(orders);
        invoicesCreated = invoices.size();

        long duration = System.currentTimeMillis() - startTime;
        logger.info("Initial setup finished. Orders Created: {}, Invoices Created: {}, Duration: {}ms",
                ordersCreated, invoicesCreated, duration);
    }

    private List<Delivery> createDeliveries() {
        List<Delivery> deliveries = new ArrayList<>();
        Random random = new Random();

        String[] locations = {
                "Casablanca - Zone Industrielle Ain Sebaa",
                "Rabat - Technopolis",
                "Marrakech - Route de Safi",
                "Fes - Zone Industrielle Sidi Brahim",
                "Tangier - Zone Franche",
                "Agadir - Port"
        };

        for (int i = 0; i < 20; i++) {
            Delivery delivery = new Delivery();
            delivery.setDeliveryDate(getRandomDate(-30, 30));
            delivery.setLocation(locations[random.nextInt(locations.length)]);
            delivery.setPsbllocation("Warehouse " + (char)('A' + i));
            delivery.setDescription("Standard delivery service for order batch " + (i + 1));
            delivery.setDeliveryPrice(50.0 + (random.nextDouble() * 200.0));

            deliveries.add(deliveryRepository.save(delivery));
        }

        logger.info("Created {} deliveries", deliveries.size());
        return deliveries;
    }

    private List<PurchaseOrder> createSamplePurchaseOrders(List<Delivery> deliveries) {
        List<PurchaseOrder> orders = new ArrayList<>();
        Random random = new Random();

        // Supplier IDs (assuming these exist in supplier-client-service)
        Long[] supplierIds = {1L, 2L, 3L, 4L, 5L, 6L, 7L, 8L, 9L, 10L,
                11L, 12L, 13L, 14L, 15L, 16L, 17L, 18L, 19L, 20L};

        // Product IDs (assuming these exist in product-service)
        Long[] productIds = {1L, 2L, 3L, 4L, 5L, 6L, 7L, 8L, 9L, 10L,
                11L, 12L, 13L, 14L, 15L, 16L, 17L, 18L, 19L, 20L};

        OrderStatus[] statuses = OrderStatus.values();
        PaymentStatus[] paymentStatuses = PaymentStatus.values();

        for (int i = 0; i < 50; i++) {
            PurchaseOrder order = new PurchaseOrder();

            order.setSupplierId(supplierIds[random.nextInt(supplierIds.length)]);
            order.setDate(getRandomDate(-90, 0));
            order.setUserCreator(1L + random.nextInt(5)); // Users 1-5
            order.setUserExecutor(1L + random.nextInt(5));

            // Random order status
            order.setOrderStatus(statuses[random.nextInt(statuses.length)]);

            // Create purchase lines
            List<PurchaseLine> lines = new ArrayList<>();
            int numberOfLines = 2 + random.nextInt(5); // 2-6 lines per order
            double totalAmount = 0.0;

            for (int j = 0; j < numberOfLines; j++) {
                PurchaseLine line = new PurchaseLine();
                line.setProductId(productIds[random.nextInt(productIds.length)]);
                line.setQuantity(1 + random.nextInt(50)); // 1-50 units
                line.setPrice(10.0 + (random.nextDouble() * 990.0)); // 10-1000 MAD
                line.setPurchaseOrder(order);

                totalAmount += line.getQuantity() * line.getPrice();
                lines.add(line);
            }

            order.setPurchaseLines(lines);
            order.setTotalAmount(Math.round(totalAmount * 100.0) / 100.0);

            // Set payment status and amounts
            PaymentStatus paymentStatus = paymentStatuses[random.nextInt(paymentStatuses.length)];
            order.setPaymentStatus(paymentStatus);

            switch (paymentStatus) {
                case PAID:
                    order.setPaidAmount(order.getTotalAmount());
                    order.setSoldAmount(0.0);
                    break;
                case PARTPAID:
                    double paidPercentage = 0.2 + (random.nextDouble() * 0.6); // 20-80%
                    order.setPaidAmount(Math.round(order.getTotalAmount() * paidPercentage * 100.0) / 100.0);
                    order.setSoldAmount(order.getTotalAmount() - order.getPaidAmount());
                    break;
                case UNPAID:
                    order.setPaidAmount(0.0);
                    order.setSoldAmount(order.getTotalAmount());
                    break;
            }

            // Assign delivery (50% of orders have delivery)
            if (random.nextBoolean() && !deliveries.isEmpty()) {
                order.setDelivery(deliveries.get(random.nextInt(deliveries.size())));
            }

            // Add some returns for delivered/completed orders (20% chance)
            if ((order.getOrderStatus() == OrderStatus.DELIVERED ||
                    order.getOrderStatus() == OrderStatus.RETURNED) &&
                    random.nextDouble() < 0.2) {

                List<LineReturn> returns = new ArrayList<>();
                int returnsCount = 1 + random.nextInt(Math.min(2, lines.size()));

                for (int k = 0; k < returnsCount; k++) {
                    PurchaseLine originalLine = lines.get(random.nextInt(lines.size()));

                    LineReturn lineReturn = new LineReturn();
                    lineReturn.setLineId(originalLine.getId());
                    lineReturn.setProductId(originalLine.getProductId());
                    lineReturn.setQuantity(1 + random.nextInt(Math.max(1, originalLine.getQuantity() / 2)));
                    lineReturn.setPrice(originalLine.getPrice());
                    lineReturn.setReturnDate(getRandomDate(0, 30));
                    lineReturn.setReturnReason(getRandomReturnReason());
                    lineReturn.setPurchaseOrder(order);

                    returns.add(lineReturn);
                }

                order.setLineReturns(returns);
            }

            orders.add(purchaseOrderRepository.save(order));
        }

        logger.info("Created {} purchase orders", orders.size());
        return orders;
    }

    private List<PurchaseInvoice> createSampleInvoices(List<PurchaseOrder> orders) {
        List<PurchaseInvoice> invoices = new ArrayList<>();
        Random random = new Random();

        // Create invoices for 70% of the orders
        for (PurchaseOrder order : orders) {
            if (random.nextDouble() < 0.7) {
                PurchaseInvoice invoice = new PurchaseInvoice();

                invoice.setSupplierId(order.getSupplierId());
                invoice.setOrderId(order.getId());
                invoice.setDate(addDays(order.getDate(), 1 + random.nextInt(7))); // 1-7 days after order
                invoice.setUserCreator(order.getUserCreator());
                invoice.setUserExecutor(order.getUserExecutor());
                invoice.setPaymentStatus(order.getPaymentStatus());

                // Copy some lines from the order to the invoice
                List<PurchaseLine> invoiceLines = new ArrayList<>();
                List<PurchaseLine> orderLines = order.getPurchaseLines();

                // Invoice 50-100% of order lines
                int linesToInvoice = Math.max(1, orderLines.size() / 2 + random.nextInt(orderLines.size() / 2 + 1));
                double invoiceTotal = 0.0;

                for (int i = 0; i < linesToInvoice && i < orderLines.size(); i++) {
                    PurchaseLine orderLine = orderLines.get(i);

                    PurchaseLine invoiceLine = new PurchaseLine();
                    invoiceLine.setProductId(orderLine.getProductId());
                    invoiceLine.setQuantity(orderLine.getQuantity());
                    invoiceLine.setPrice(orderLine.getPrice());
                    invoiceLine.setPurchaseInvoice(invoice);

                    invoiceTotal += invoiceLine.getQuantity() * invoiceLine.getPrice();
                    invoiceLines.add(invoiceLine);
                }

                invoice.setPurchaseLines(invoiceLines);
                invoice.setTotalAmount(Math.round(invoiceTotal * 100.0) / 100.0);

                // Add returns if the order has returns (30% of invoices with returns)
                if (!order.getLineReturns().isEmpty() && random.nextDouble() < 0.3) {
                    List<LineReturn> invoiceReturns = new ArrayList<>();

                    for (LineReturn orderReturn : order.getLineReturns()) {
                        LineReturn invoiceReturn = new LineReturn();
                        invoiceReturn.setLineId(orderReturn.getLineId());
                        invoiceReturn.setProductId(orderReturn.getProductId());
                        invoiceReturn.setQuantity(orderReturn.getQuantity());
                        invoiceReturn.setPrice(orderReturn.getPrice());
                        invoiceReturn.setReturnDate(orderReturn.getReturnDate());
                        invoiceReturn.setReturnReason(orderReturn.getReturnReason());
                        invoiceReturn.setPurchaseInvoice(invoice);

                        invoiceReturns.add(invoiceReturn);
                    }

                    invoice.setLineReturns(invoiceReturns);
                }

                invoices.add(purchaseInvoiceRepository.save(invoice));
            }
        }

        logger.info("Created {} purchase invoices", invoices.size());
        return invoices;
    }

    private Date getRandomDate(int minDaysFromNow, int maxDaysFromNow) {
        Random random = new Random();
        int daysOffset = minDaysFromNow + random.nextInt(maxDaysFromNow - minDaysFromNow + 1);

        LocalDate date = LocalDate.now().plusDays(daysOffset);
        return Date.from(date.atStartOfDay(ZoneId.systemDefault()).toInstant());
    }

    private Date addDays(Date date, int days) {
        LocalDate localDate = date.toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
        localDate = localDate.plusDays(days);
        return Date.from(localDate.atStartOfDay(ZoneId.systemDefault()).toInstant());
    }

    private String getRandomReturnReason() {
        String[] reasons = {
                "Produit défectueux",
                "Mauvaise qualité",
                "Produit endommagé pendant la livraison",
                "Ne correspond pas à la description",
                "Commande erronée",
                "Produit périmé",
                "Quantité incorrecte reçue",
                "Couleur/modèle incorrect",
                "Client a changé d'avis",
                "Produit non conforme aux normes"
        };

        Random random = new Random();
        return reasons[random.nextInt(reasons.length)];
    }
}