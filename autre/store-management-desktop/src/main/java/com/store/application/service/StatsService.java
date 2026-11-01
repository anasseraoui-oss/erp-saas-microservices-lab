package com.store.application.service;

import com.store.domain.entity.Invoice;
import com.store.domain.entity.PurchaseInvoice;
import com.store.infrastructure.persistence.InvoiceRepository;
import com.store.infrastructure.persistence.ProductRepository;
import com.store.infrastructure.persistence.PurchaseRepository;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

public class StatsService {

        private final InvoiceRepository invoiceRepo = new InvoiceRepository();
        private final PurchaseRepository purchaseRepo = new PurchaseRepository();
        private final ProductRepository productRepo = new ProductRepository();

        public Map<String, Object> getDashboardStats() {
                Map<String, Object> stats = new HashMap<>();

                BigDecimal totalSales = invoiceRepo.findAll().stream()
                                .map(Invoice::getTotalAmount)
                                .reduce(BigDecimal.ZERO, BigDecimal::add);

                BigDecimal totalPurchases = purchaseRepo.findAll().stream()
                                .map(PurchaseInvoice::getTotalAmount)
                                .reduce(BigDecimal.ZERO, BigDecimal::add);

                // Calculate COGS-based profit
                BigDecimal totalProfit = BigDecimal.ZERO;
                for (Invoice inv : invoiceRepo.findAll()) {
                        for (com.store.domain.entity.InvoiceLine line : inv.getLines()) {
                                BigDecimal sellingPrice = line.getPrice();
                                BigDecimal costPrice = line.getCostPrice() != null ? line.getCostPrice()
                                                : BigDecimal.ZERO;
                                BigDecimal margin = sellingPrice.subtract(costPrice)
                                                .multiply(BigDecimal.valueOf(line.getQuantity()));
                                totalProfit = totalProfit.add(margin);
                        }
                }

                long lowStockCount = productRepo.findAll().stream()
                                .filter(p -> p.isLowStock())
                                .count();

                long expiredCount = productRepo.findAll().stream()
                                .filter(p -> p.isExpired())
                                .count();

                stats.put("totalSales", totalSales);
                stats.put("totalPurchases", totalPurchases);
                stats.put("profit", totalProfit);
                stats.put("lowStockCount", (int) lowStockCount);
                stats.put("expiredCount", (int) expiredCount);

                return stats;
        }
}
