package com.spring.purchaseorderservice.service;

import com.spring.purchaseorderservice.config.FeignPaiement;
import com.spring.purchaseorderservice.config.FeignProductService;
import com.spring.purchaseorderservice.dto.PurchaseLineDto;
import com.spring.purchaseorderservice.model.PurchaseInvoice;
import com.spring.purchaseorderservice.model.PurchaseLine;
import com.spring.purchaseorderservice.model.PurchaseOrder;
import com.spring.purchaseorderservice.repository.PurchaseInvoiceRepository;
import com.spring.purchaseorderservice.repository.PurchaseLineRepository;
import com.spring.purchaseorderservice.repository.PurchaseOrderRepository;
import com.spring.purchaseorderservice.service.specifications.PurchaseLineSpecifications;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class LineService {
    @Autowired
    private PurchaseOrderService purchaseOrderService;
    @Autowired
    private PurchaseOrderRepository purchaseOrderRepository;
    @Autowired
    private FeignPaiement feignPaiement;
    @Autowired
    private FeignProductService feignProductService;
    @Autowired
    private PurchaseLineRepository purchaseLineRepository;
    @Autowired
    private PurchaseInvoiceRepository purchaseInvoiceRepository;

    public PurchaseLine deletePurchaseLine(Long id) throws Exception {
        PurchaseLine purchaseLine = purchaseLineRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("PurchaseLine not found"));

        if (purchaseLine.getPurchaseOrder() != null) {
            PurchaseOrder order = purchaseLine.getPurchaseOrder();
            order.setTotalAmount(order.getTotalAmount() - purchaseLine.getPrice() * purchaseLine.getQuantity());
            purchaseOrderRepository.save(order);
           // feignPaiement.updatePayment("purchases", order.getId(), 0L, String.valueOf(order.getPaymentStatus()), order.getTotalAmount(), order.getSupplierId());
        } else if (purchaseLine.getPurchaseInvoice() != null) {
            PurchaseInvoice invoice = purchaseLine.getPurchaseInvoice();
            invoice.setTotalAmount(invoice.getTotalAmount() - purchaseLine.getPrice() * purchaseLine.getQuantity());
            purchaseInvoiceRepository.save(invoice);
            feignPaiement.updatePayment("purchases", invoice.getId(), 0L, String.valueOf(invoice.getPaymentStatus()), invoice.getTotalAmount(), invoice.getSupplierId());
        feignProductService.reduceStock(purchaseLine.getProductId(), purchaseLine.getQuantity());
        feignProductService.updateDate(purchaseLine.getProductId(), new Date());
        }
        purchaseLineRepository.delete(purchaseLine);
        return purchaseLine;
    }
    public PurchaseLine updatePurchaseLine(Long id, PurchaseLineDto purchaseLineDto) throws Exception {
        PurchaseLine purchaseLine = purchaseLineRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("PurchaseLine not found"));
        feignProductService.reduceStock(purchaseLine.getProductId(),purchaseLine.getQuantity());
        PurchaseOrder order = purchaseLine.getPurchaseOrder();
        double oldTotal = purchaseLine.getPrice() * purchaseLine.getQuantity();
        double newTotal = purchaseLineDto.getPrice() * purchaseLineDto.getQuantity();

        order.setTotalAmount(order.getTotalAmount() - oldTotal + newTotal);
        feignPaiement.updatePayment("purchases",order.getId(),0L, String.valueOf(order.getPaymentStatus()),order.getTotalAmount(),order.getSupplierId());
        purchaseLine.setProductId(purchaseLineDto.getProductId());
        purchaseLine.setQuantity(purchaseLineDto.getQuantity());
        purchaseLine.setPrice(purchaseLineDto.getPrice());
        feignProductService.addStock(purchaseLine.getProductId(),purchaseLine.getQuantity());
        feignProductService.updateDate(purchaseLine.getProductId(),new Date());
        purchaseLineRepository.save(purchaseLine);
        purchaseOrderRepository.save(order);

        return purchaseLine;
    }
    public List<PurchaseLine> getPurchaseLines(){
        return purchaseLineRepository.findAll();
    }
    /**
     * Return purchase lines filtered by optional parameters. Any parameter can be null.
     * - supplierId: filter by purchaseOrder.supplierId
     * - date: filter by purchaseOrder creation date (compares day-month-year)
     */
    public List<PurchaseLine> getFilteredPurchaseLines(Long supplierId, Date date, String type) {
        List<PurchaseLine> all = purchaseLineRepository.findAll();
        return all.stream()
                .filter(line -> {
                    if (supplierId != null) {
                        Long orderSupplier = (line.getPurchaseOrder() != null) ? line.getPurchaseOrder().getSupplierId() : null;
                        Long invoiceSupplier = (line.getPurchaseInvoice() != null) ? line.getPurchaseInvoice().getSupplierId() : null;
                        if (orderSupplier == null && invoiceSupplier == null) return false;
                        boolean matchesOrder = orderSupplier != null && supplierId.equals(orderSupplier);
                        boolean matchesInvoice = invoiceSupplier != null && supplierId.equals(invoiceSupplier);
                        if (!matchesOrder && !matchesInvoice) return false;
                    }
                    if (date != null) {
                        // prefer invoice.createdAt if present, otherwise use order.createdAt
                        Date created = null;
                        if (line.getPurchaseInvoice() != null && line.getPurchaseInvoice().getDate() != null) {
                            created = line.getPurchaseInvoice().getDate();
                        } else if (line.getPurchaseOrder() != null && line.getPurchaseOrder().getDate() != null) {
                            created = line.getPurchaseOrder().getDate();
                        }
                        if (created == null) return false;
                        if (!isSameDay(created, date)) return false;
                    }
                    return true;
                })
                .collect(Collectors.toList());
    }

    // helper to compare dates by day/month/year ignoring time
    private boolean isSameDay(Date d1, Date d2) {
        @SuppressWarnings("deprecation")
        int y1 = d1.getYear(), m1 = d1.getMonth(), day1 = d1.getDate();
        @SuppressWarnings("deprecation")
        int y2 = d2.getYear(), m2 = d2.getMonth(), day2 = d2.getDate();
        return y1 == y2 && m1 == m2 && day1 == day2;
    }
    public List<PurchaseLine> searchPurchaseLines(String query) {
        if (query == null || query.trim().isEmpty()) {
            return new ArrayList<>();
        }
        return purchaseLineRepository.findAll(PurchaseLineSpecifications.findByCriteria(query));
    }
}

