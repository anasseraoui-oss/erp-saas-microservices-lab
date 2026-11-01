package com.spring.purchaseorderservice.service;

import com.spring.purchaseorderservice.config.FeignPaiement;
import com.spring.purchaseorderservice.config.FeignProductService;
import com.spring.purchaseorderservice.dto.PurchaseLineDto;
import com.spring.purchaseorderservice.model.PaymentStatus;
import com.spring.purchaseorderservice.model.PurchaseLine;
import com.spring.purchaseorderservice.model.PurchaseOrder;
import com.spring.purchaseorderservice.repository.PurchaseLineRepository;
import com.spring.purchaseorderservice.repository.PurchaseOrderRepository;
import com.spring.purchaseorderservice.service.specifications.PurchaseLineSpecifications;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

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
    public PurchaseLine deletePurchaseLine(Long id) throws Exception {
        PurchaseLine purchaseLine = purchaseLineRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("SalesLine not found"));
        PurchaseOrder order = purchaseOrderService.getPurchaseOrderByPurchaseLineId(id);
        order.setTotalAmount(order.getTotalAmount()-purchaseLine.getPrice()*purchaseLine.getQuantity());
        purchaseOrderRepository.save(order);
        feignProductService.reduceStock(purchaseLine.getProductId(),purchaseLine.getQuantity());
        feignProductService.updateDate(purchaseLine.getProductId(),new Date());
            feignPaiement.updatePayment("purchases",order.getId(),0L, String.valueOf(order.getPaymentStatus()),order.getTotalAmount(),order.getSupplierId());
        purchaseLineRepository.delete(purchaseLine);
        return purchaseLine;
    }
    public PurchaseLine updatePurchaseLine(Long id, PurchaseLineDto purchaseLineDto) throws Exception {
        PurchaseLine purchaseLine = purchaseLineRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("SalesLine not found"));
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
    public List<PurchaseLine> searchPurchaseLines(String query) {
        if (query == null || query.trim().isEmpty()) {
            return new ArrayList<>();
        }
        return purchaseLineRepository.findAll(PurchaseLineSpecifications.findByCriteria(query));
    }
}

