package com.spring.purchaseorderservice.service;

import com.spring.purchaseorderservice.config.FeignClientSupplierService;
import com.spring.purchaseorderservice.config.FeignPaiement;
import com.spring.purchaseorderservice.config.FeignProductService;
import com.spring.purchaseorderservice.dto.PurchaseInvoiceDto;
import com.spring.purchaseorderservice.dto.PurchaseLineDto;
import com.spring.purchaseorderservice.model.*;
import com.spring.purchaseorderservice.repository.PurchaseInvoiceRepository;
import com.spring.purchaseorderservice.repository.PurchaseLineRepository;
import com.spring.purchaseorderservice.service.Mapper.MapperToDto;
import com.spring.purchaseorderservice.service.specifications.PurchaseInvoiceSpecifications;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;



@Service
public class PurchaseInvoiceService {
    @Autowired
    private PurchaseLineRepository purchaseLineRepository;
    @Autowired
    private PurchaseInvoiceRepository purchaseInvoiceRepository;
    @Autowired
    private FeignProductService feignProductService;
    @Autowired
    private FeignClientSupplierService feignClientSupplierService;
    @Autowired
    private FeignPaiement feignPaiement;
    private final MapperToDto mapperToDto = new MapperToDto();
    @Transactional
    public PurchaseInvoice createPurchaseInvoice(PurchaseInvoiceDto purchaseInvoiceDto,Long orderId) throws IllegalArgumentException {
        PurchaseInvoice purchaseInvoice = new PurchaseInvoice();
        purchaseInvoice.setSupplierId(purchaseInvoiceDto.getSupplier());
        purchaseInvoice.setUserCreator(purchaseInvoiceDto.getUserExecutor());
        purchaseInvoice.setDate(new Date());
        purchaseInvoice.setOrderId(orderId);
        double totalAmount = 0;
        for (PurchaseLineDto line : purchaseInvoiceDto.getPurchaseLines()) {
            PurchaseLine purchaseLine = new PurchaseLine();
            purchaseLine.setProductId(line.getProductId());
            purchaseLine.setQuantity(line.getQuantity());
            purchaseLine.setPrice(line.getPrice());
            // Add product stock
            feignProductService.addStock(purchaseLine.getProductId(), purchaseLine.getQuantity());
            feignProductService.updateDate(purchaseLine.getProductId(),purchaseInvoice.getDate());
            purchaseLine.setPurchaseInvoice(purchaseInvoice);
            purchaseInvoice.getPurchaseLines().add(purchaseLine);
            totalAmount += line.getPrice() * line.getQuantity();
        }
        purchaseInvoice.setPaymentStatus(purchaseInvoiceDto.getPaymentStatus());
        if (purchaseInvoice.getSupplierId()!=null||purchaseInvoice.getTotalAmount()!=0) {
            feignClientSupplierService.updateTotalOrder(purchaseInvoice.getSupplierId(), totalAmount, "PurchService", purchaseInvoice.getPaymentStatus());
        }
        purchaseInvoice.setTotalAmount(totalAmount);
        return purchaseInvoiceRepository.save(purchaseInvoice);

    }

    public PurchaseInvoice getPurchaseInvoiceById(Long id) {
        return purchaseInvoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase Order not found with id: " + id));
    }
    /*public List<PurchaseInvoice> getAllPurchaseInvoices() {
        return purchaseInvoiceRepository.findAll();
    }*/
    public List<PurchaseInvoiceDto> getAllPurchaseInvoices() {
        List<PurchaseInvoice> invoices = purchaseInvoiceRepository.findAll();
        return invoices.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    private PurchaseInvoiceDto convertToDto(PurchaseInvoice invoice) {
        return mapperToDto.convertToDto(invoice);
    }
    public PurchaseInvoice deletePurchaseInvoice(Long id) {
        PurchaseInvoice purchaseInvoice = getPurchaseInvoiceById(id);
        purchaseInvoiceRepository.delete(purchaseInvoice);
        return purchaseInvoice;
    }
    @Transactional
    public PurchaseInvoice updatePurchaseInvoice(long id ,PurchaseInvoiceDto purchaseInvoiceDto) throws Exception {
        PurchaseInvoice purchaseInvoice = getPurchaseInvoiceById(id);
        purchaseInvoice.setSupplierId(purchaseInvoiceDto.getSupplier());
        purchaseInvoice.setUserExecutor(purchaseInvoiceDto.getUserExecutor());
        if (purchaseInvoiceDto.getPaymentStatus() != null) {
            purchaseInvoice.setPaymentStatus(purchaseInvoiceDto.getPaymentStatus());
        }
        if(purchaseInvoiceDto.getTotalAmount()!=purchaseInvoice.getTotalAmount()){
            purchaseInvoice.setTotalAmount(purchaseInvoiceDto.getTotalAmount());
            if(purchaseInvoice.getPaymentStatus()==PaymentStatus.UNPAID||purchaseInvoice.getPaymentStatus()==PaymentStatus.PARTPAID) {
                feignPaiement.updatePayment("purchases",purchaseInvoice.getId(), 0L, String.valueOf(purchaseInvoice.getPaymentStatus()),purchaseInvoice.getTotalAmount(),purchaseInvoice.getSupplierId());
            }
        }
        purchaseInvoice.setDate(purchaseInvoice.getDate());
        return purchaseInvoiceRepository.save(purchaseInvoice);
    }

    public List<PurchaseInvoice> searchPurchaseInvoices(String query) {
        if (query == null || query.trim().isEmpty()) {
            return new ArrayList<>();
        }

        Specification<PurchaseInvoice> spec = PurchaseInvoiceSpecifications.findByCriteria(query);
        return purchaseInvoiceRepository.findAll(spec);
    }
    public List<PurchaseLine> getLinesByPurchaseInvoiceId(Long id){
        return purchaseLineRepository.findPurchaseLineByPurchaseOrderId(id);
    }
    public PurchaseInvoice getPurchaseInvoiceByPurchaseLineId(Long id) {
        PurchaseLine purchaseLine = purchaseLineRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("purchaseLine not found"));
        return purchaseInvoiceRepository.findByPurchaseLinesContaining(purchaseLine);
    }

}
