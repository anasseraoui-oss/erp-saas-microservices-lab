package com.spring.salesorderservice.controller;
import com.spring.salesorderservice.dto.SalesInvoiceDto;
import com.spring.salesorderservice.dto.SalesLineDto;
import com.spring.salesorderservice.model.PaymentStatus;
import com.spring.salesorderservice.model.SalesInvoice;
import com.spring.salesorderservice.model.SalesLine;
import com.spring.salesorderservice.repository.SalesInvoiceRepository;
import com.spring.salesorderservice.service.SalesInvoiceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
//@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/sales/Invoice")
public class SalesInvoiceController {

    @Autowired
    private SalesInvoiceService salesInvoiceService;
    @Autowired
    private SalesInvoiceRepository salesInvoiceRepository;
    @PreAuthorize("hasAuthority('ADMIN') or hasRole('ADMIN') or hasAuthority('CREATE_SALES_INVOICES')")
    @PostMapping("/create")
    public SalesInvoice create(@RequestBody SalesInvoiceDto salesInvoiceDto) {
        System.out.println(salesInvoiceDto);
        return salesInvoiceService.createSalesInvoice(salesInvoiceDto, null);
    }
    @PreAuthorize("hasAuthority('ADMIN') or hasRole('ADMIN') or hasAuthority('VIEW_SALES_INVOICES')")
    @GetMapping
    public List<SalesInvoiceDto> getAllSalesOrders() {
        return salesInvoiceService.getAllSalesInvoices();
    }
    @PreAuthorize("hasAuthority('ADMIN') or hasRole('ADMIN') or hasAuthority('VIEW_SALES_INVOICES')")
    @GetMapping("/{id}")
    public SalesInvoice getSalesInvoice(@PathVariable Long id) {
        return salesInvoiceService.getSalesInvoiceById(id);
    }
    @GetMapping("/{totalAmount}")
    public Optional<SalesInvoice> getSalesInvoiceByTotalAmount(@PathVariable Double totalAmount){
        return salesInvoiceService.getSalesInvoiceByTotalAmount(totalAmount);
    }
    @PreAuthorize("hasAuthority({'ADMIN','DELELE'}) or hasRole('ADMIN') or hasAuthority('DELETE_SALES_INVOICES')")
    @DeleteMapping("/delete/{id}")
    public void deleteSalesInvoice(@PathVariable Long id){
         salesInvoiceService.deleteSalesInvoice(id);
    }
    @PreAuthorize("hasAuthority('ADMIN') or hasRole('ADMIN') or hasAuthority('UPDATE_SALES_INVOICES')")
    @PutMapping("/update/{id}")
    public SalesInvoice updateSalesInvoice(@PathVariable Long id, @RequestBody SalesInvoiceDto salesInvoiceDto){
        return salesInvoiceService.updateSalesInvoice(id, salesInvoiceDto);
    }

    @PutMapping("/status/{id}")
    public void updateStatus(@PathVariable("id") Long id, @RequestParam("status") String status){
        SalesInvoice salesInvoice = salesInvoiceService.getSalesInvoiceById(id);
        salesInvoice.setPaymentStatus(PaymentStatus.valueOf(status));
        salesInvoiceRepository.save(salesInvoice);
    }
    @PreAuthorize("hasAuthority('ADMIN') or hasRole('ADMIN') or hasAuthority('VIEW_SALES_INVOICES')")
    @GetMapping("/search")
    public List<SalesInvoice> searchInvoices(@RequestParam String query) {
        return salesInvoiceService.searchSalesInvoices(query);
    }
    @PreAuthorize("hasAuthority('ADMIN') or hasRole('ADMIN') or hasAuthority('VIEW_SALES_INVOICES')")
    @GetMapping("/line/{id}")
    public ResponseEntity<SalesInvoice> getSalesInvoiceBySalesLineId(@PathVariable Long id) {
        SalesInvoice salesInvoice = salesInvoiceService.getSalesInvoiceBySalesLineId(id);
        return ResponseEntity.ok(salesInvoice);
    }
    @PreAuthorize("hasAuthority('ADMIN') or hasRole('ADMIN') or hasAuthority('VIEW_SALES_INVOICES')")
    @GetMapping("/lines/{id}")
    public List<SalesLineDto> getSalesLinesBySalesInvoiceId(@PathVariable("id") Long id){
        return salesInvoiceService.getSalesLinesBySalesInvoiceId(id);
    }
}