package com.spring.salesorderservice.service;

import com.spring.salesorderservice.config.FeignClientSupplierService;
import com.spring.salesorderservice.config.FeignPaiement;
import com.spring.salesorderservice.config.FeignProductService;
import com.spring.salesorderservice.dto.SalesLineDto;
import com.spring.salesorderservice.dto.SalesLineResponseDto;
import com.spring.salesorderservice.model.PaymentStatus;
import com.spring.salesorderservice.model.SalesInvoice;
import com.spring.salesorderservice.model.SalesLine;
import com.spring.salesorderservice.model.SalesOrder;
import com.spring.salesorderservice.repository.SalesInvoiceRepository;
import com.spring.salesorderservice.repository.SalesLineRepository;
import com.spring.salesorderservice.repository.SalesOrderRepository;
import com.spring.salesorderservice.service.specifications.SalesLineSpecifications;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class LineService {
    @Autowired
    private SalesInvoiceRepository salesInvoiceRepository;
    @Autowired
    private SalesLineRepository salesLineRepository;
    @Autowired
    private SalesInvoiceService salesInvoiceService;
    @Autowired
    private FeignProductService feignProductService;
    @Autowired
    private FeignPaiement feignPaiement;
    public SalesLine deleteSalesLine(Long id) {
        SalesLine salesLine = salesLineRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("SalesLine not found"));
        SalesInvoice order = salesInvoiceService.getSalesInvoiceBySalesLineId(id);
        if (order == null) {
            throw new RuntimeException("Could not find a SalesInvoice associated with SalesLine id: " + id);
        }
        order.setTotalAmount(order.getTotalAmount()-salesLine.getPrice()*salesLine.getQuantity());
        salesInvoiceRepository.save(order);
        feignProductService.addStock(salesLine.getProductId(),salesLine.getQuantity());
        feignProductService.updateDate(salesLine.getProductId(),new Date());
            feignPaiement.updatePayment("sales",order.getId(),0L, String.valueOf(order.getPaymentStatus()),order.getTotalAmount(),order.getCustomerId());
        salesLineRepository.delete(salesLine);
        return salesLine;
    }
    @Transactional
    public SalesLine updateSalesLine(Long id, SalesLineDto salesLineDto) {
        SalesLine existingLine = salesLineRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SalesLine not found with id: " + id));
        feignProductService.addStock(existingLine.getProductId(), existingLine.getQuantity());
        SalesInvoice oldInvoice = existingLine.getSalesInvoice();
        if (oldInvoice != null) {
            double oldLineTotal = existingLine.getQuantity() * existingLine.getPrice();
            oldInvoice.setTotalAmount(oldInvoice.getTotalAmount() - oldLineTotal);
        }
        existingLine.setProductId(salesLineDto.getProductId());
        existingLine.setQuantity(salesLineDto.getQuantity());
        existingLine.setPrice(salesLineDto.getPrice());

        SalesInvoice finalInvoiceToUpdate = null;
        if (salesLineDto.getSalesInvoiceId() != null) {
            Long newInvoiceId = salesLineDto.getSalesInvoiceId();
            SalesInvoice newInvoice = salesInvoiceRepository.findById(newInvoiceId)
                    .orElseThrow(() -> new ResourceNotFoundException("SalesInvoice to link not found with id: " + newInvoiceId));
            existingLine.setSalesInvoice(newInvoice);
            double newLineTotal = existingLine.getQuantity() * existingLine.getPrice();
            newInvoice.setTotalAmount(newInvoice.getTotalAmount() + newLineTotal);

            finalInvoiceToUpdate = newInvoice;

        } else {
            existingLine.setSalesInvoice(null);
            finalInvoiceToUpdate = oldInvoice;
        }

        feignProductService.reduceStock(existingLine.getProductId(), existingLine.getQuantity());
        feignProductService.updateDate(existingLine.getProductId(), new Date());

        if (finalInvoiceToUpdate != null) {
            feignPaiement.updatePayment(
                    "sales",
                    finalInvoiceToUpdate.getId(),
                    0L,
                    String.valueOf(finalInvoiceToUpdate.getPaymentStatus()),
                    finalInvoiceToUpdate.getTotalAmount(),
                    finalInvoiceToUpdate.getCustomerId()
            );
            salesInvoiceRepository.save(finalInvoiceToUpdate);
        }
        return salesLineRepository.save(existingLine);
    }
    public List<SalesLineResponseDto> getSalesLines() {
        // 1. Fetch the list of entities from the database
        List<SalesLine> salesLines = salesLineRepository.findAll();

        // 2. Convert (map) each entity to a DTO
        return salesLines.stream()
                .map(this::convertToDto) // Use a helper method for conversion
                .collect(Collectors.toList());
    }
    public List<SalesLine> searchSalesLines(String query) {
        if (query == null || query.trim().isEmpty()) {
            return new ArrayList<>();
        }

        Specification<SalesLine> spec = SalesLineSpecifications.findByCriteria(query);
        return salesLineRepository.findAll(spec);
    }
    // Helper method to convert a single entity to a DTO
    private SalesLineResponseDto convertToDto(SalesLine salesLine) {
        SalesLineResponseDto dto = new SalesLineResponseDto();

        // Map basic fields
        dto.setId(salesLine.getId());
        dto.setQuantity(salesLine.getQuantity());
        dto.setPrice(salesLine.getPrice());
        dto.setProductId(salesLine.getProductId());

        // **This is the key part:**
        // Safely get the ID from the related parent objects.
        // If the parent is null, the ID will also be null.
        if (salesLine.getSalesOrder() != null) {
            dto.setSalesOrderId(salesLine.getSalesOrder().getId());
        }

        if (salesLine.getSalesInvoice() != null) {
            dto.setSalesInvoiceId(salesLine.getSalesInvoice().getId());
        }

        return dto;
    }

}
