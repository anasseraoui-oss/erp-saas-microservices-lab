package com.store.application.service;

import com.store.domain.entity.InvoiceType;
import com.store.domain.entity.PurchaseInvoice;
import com.store.domain.entity.PurchaseInvoiceLine;
import com.store.infrastructure.persistence.ProductRepository;
import com.store.infrastructure.persistence.PurchaseRepository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public class PurchaseService {

    private final PurchaseRepository purchaseRepo = new PurchaseRepository();
    private final ProductRepository productRepo = new ProductRepository();
    private final SupplierService supplierService = new SupplierService();

    public List<PurchaseInvoice> getAllPurchases() {
        return purchaseRepo.findAll();
    }

    public List<PurchaseInvoice> getPurchasesByType(InvoiceType type) {
        return purchaseRepo.findByType(type);
    }

    /**
     * Create a purchase invoice and INCREASE stock of products.
     */
    public PurchaseInvoice createPurchase(Long supplierId, List<PurchaseInvoiceLine> lines, InvoiceType type) {
        PurchaseInvoice inv = new PurchaseInvoice();
        inv.setSupplierId(supplierId);
        inv.setDate(LocalDate.now());
        inv.setType(type);

        BigDecimal total = BigDecimal.ZERO;
        for (PurchaseInvoiceLine line : lines) {
            total = total.add(line.getLineTotal());
            inv.addLine(line);

            // Increase stock only for actual invoices
            if (type == InvoiceType.PURCHASE_INVOICE) {
                productRepo.findById(line.getProductId()).ifPresent(p -> {
                    p.setQuantity(p.getQuantity() + line.getQuantity());
                    // Update purchase price
                    p.setPriceInit(line.getPrice());
                    productRepo.save(p);
                });
            }
        }
        inv.setTotalAmount(total);

        PurchaseInvoice saved = purchaseRepo.save(inv);

        // Update supplier stats
        supplierService.updateTotalPurchases(supplierId, total);

        return saved;
    }

    public void deletePurchase(Long id) {
        purchaseRepo.findById(id).ifPresent(inv -> {
            // Undo stock increase? Usually not for simple MVP, but good for consistency.
            // For now, simple delete.
            purchaseRepo.delete(id);
        });
    }
}
