package com.spring.salesorderservice.service;

import com.spring.salesorderservice.config.FeignClientSupplierService;
import com.spring.salesorderservice.config.FeignPaiement;
import com.spring.salesorderservice.config.FeignProductService;
import com.spring.salesorderservice.dto.LineReturnDto;
import com.spring.salesorderservice.dto.SalesInvoiceDto;
import com.spring.salesorderservice.dto.SalesLineDto;
import com.spring.salesorderservice.dto.SalesOrderDto;
import com.spring.salesorderservice.model.*;
import com.spring.salesorderservice.repository.SalesInvoiceRepository;
import com.spring.salesorderservice.repository.SalesLineRepository;
import com.spring.salesorderservice.repository.SalesOrderRepository;
import com.spring.salesorderservice.service.Mapper.MapperToDto;
import com.spring.salesorderservice.service.specifications.SalesInvoiceSpecifications;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import static com.spring.salesorderservice.model.PaymentStatus.PARTPAID;
import static com.spring.salesorderservice.model.PaymentStatus.UNPAID;


@Service
public class SalesInvoiceService {
    @Autowired
    FeignClientSupplierService feignClientSupplierService;
    @Autowired
    private SalesInvoiceRepository salesInvoiceRepository;
    @Autowired
    private FeignProductService feignProductService;
    @Autowired
    private SalesLineRepository salesLineRepository;
    @Autowired
    private FeignPaiement feignPaiement;
    private final MapperToDto mapperToDto = new MapperToDto();

    @Transactional
    public SalesInvoice createSalesInvoice(SalesInvoiceDto salesInvoiceDto, Long orderId ) throws IllegalArgumentException {

        SalesInvoice salesInvoice = new SalesInvoice();
        salesInvoice.setCustomerId(salesInvoiceDto.getCustomer());
        salesInvoice.setUserCreator(salesInvoiceDto.getUserExecutor());
        salesInvoice.setDate(new Date());
        salesInvoice.setOrderId(orderId);
        double totalAmount = 0;

        for (SalesLineDto line : salesInvoiceDto.getSalesLines()) {
            SalesLine salesLine = new SalesLine();
            salesLine.setProductId(line.getProductId());
            salesLine.setQuantity(line.getQuantity());
            salesLine.setPrice(line.getPrice());

            // Add product stock
            feignProductService.reduceStock(salesLine.getProductId(), salesLine.getQuantity());
            feignProductService.updateDate(salesLine.getProductId(),salesInvoice.getDate());

            salesLine.setSalesInvoice(salesInvoice);
            salesInvoice.getSalesLines().add(salesLine);
            totalAmount += line.getPrice() * line.getQuantity();
           // salesLineRepository.save(salesLine);
        }salesInvoice.setPaymentStatus(salesInvoiceDto.getPaymentStatus());
        if (salesInvoice.getCustomerId()!=null|| salesInvoice.getTotalAmount()!=0) {
            feignClientSupplierService.updateTotalOrder(salesInvoice.getCustomerId(), totalAmount, "SalesService", salesInvoice.getPaymentStatus());
        }
        salesInvoice.setTotalAmount(totalAmount);
        return salesInvoiceRepository.save(salesInvoice);

    }
    public SalesInvoice getSalesInvoiceById(Long id) {
        return salesInvoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sales Order not found with id: " + id));
    }
    /*public List<SalesInvoice> getAllSalesInvoices() {
        return salesInvoiceRepository.findAll();
    }*/
    public List<SalesInvoiceDto> getAllSalesInvoices() {
        List<SalesInvoice> invoices = salesInvoiceRepository.findAll();
        return invoices.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    private SalesInvoiceDto convertToDto(SalesInvoice invoice) {
        return mapperToDto.convertToDto(invoice);
    }

    public void deleteSalesInvoice(Long id) {
        salesInvoiceRepository.deleteById(id);
    }
    public Optional<SalesInvoice> getSalesInvoiceByTotalAmount(Double totalAmount) {
        return salesInvoiceRepository.findByTotalAmount(totalAmount);
    }

    @Transactional
    public SalesInvoice updateSalesInvoice( Long id,  SalesInvoiceDto salesInvoiceDto){
        Optional<SalesInvoice> salesInvoice = salesInvoiceRepository.findById(id);
        if (salesInvoice.isPresent()) {
            salesInvoice.get().setCustomerId(salesInvoiceDto.getCustomer());
            salesInvoice.get().setUserExecutor(salesInvoiceDto.getUserExecutor());
            if(salesInvoiceDto.getTotalAmount()!=salesInvoice.get().getTotalAmount()){
                salesInvoice.get().setTotalAmount(salesInvoiceDto.getTotalAmount());
                if(salesInvoice.get().getPaymentStatus()==UNPAID ||salesInvoice.get().getPaymentStatus()==PARTPAID) {
                    feignPaiement.updatePayment("sales",salesInvoice.get().getId(),0L, String.valueOf(salesInvoice.get().getPaymentStatus()),salesInvoice.get().getTotalAmount(),salesInvoice.get().getCustomerId());
                }
            }
            salesInvoice.get().setPaymentStatus(salesInvoiceDto.getPaymentStatus());
            salesInvoice.get().setDate(salesInvoiceDto.getDate());
            salesInvoiceRepository.save(salesInvoice.get());
        }
        return salesInvoice.get();
    }
    public List<SalesInvoice> searchSalesInvoices(String query) {
        if (query == null || query.trim().isEmpty()) {
            return new ArrayList<>();
        }
        Specification<SalesInvoice> spec = SalesInvoiceSpecifications.findByCriteria(query);
        return salesInvoiceRepository.findAll(spec);
    }

    public SalesInvoice getSalesInvoiceBySalesLineId(Long id) {
        SalesLine salesLine = salesLineRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("SalesLine not found"));

        return salesInvoiceRepository.findBySalesLinesContaining(salesLine);
    }
    public List<SalesLineDto> getSalesLinesBySalesInvoiceId(Long id) {
        List<SalesLine> salesLines = salesLineRepository.findSalesLinesBySalesInvoiceId(id); // افترضنا أن اسم الدالة الصحيح هو هذا

        return salesLines.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    private SalesLineDto convertToDto(SalesLine salesLine) {
        return mapperToDto.convertLineToDto(salesLine);
    }
    public SalesInvoice getSalesInvoiceByDate(Date date) {
        return salesInvoiceRepository.findByDate(date);
    }
    public SalesInvoice getSalesInvoiceByPaymentStatus(PaymentStatus paymentStatus) {
        return salesInvoiceRepository.findByPaymentStatus(paymentStatus);
    }


}