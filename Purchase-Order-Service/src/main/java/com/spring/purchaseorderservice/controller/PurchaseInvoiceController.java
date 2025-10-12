package com.spring.purchaseorderservice.controller;
import com.spring.purchaseorderservice.dto.PurchaseInvoiceDto;
import com.spring.purchaseorderservice.dto.PurchaseLineDto;
import com.spring.purchaseorderservice.dto.PurchaseOrderDto;
import com.spring.purchaseorderservice.model.PaymentStatus;
import com.spring.purchaseorderservice.model.PurchaseInvoice;
import com.spring.purchaseorderservice.model.PurchaseLine;
import com.spring.purchaseorderservice.model.PurchaseOrder;
import com.spring.purchaseorderservice.repository.PurchaseInvoiceRepository;
import com.spring.purchaseorderservice.service.PurchaseInvoiceService;
import com.spring.purchaseorderservice.service.PurchaseOrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@PreAuthorize("isAuthenticated()")
@RestController
@RequestMapping("/purchases/Invoice")
public class PurchaseInvoiceController {

    @Autowired
    private PurchaseInvoiceService purchaseInvoiceService;
    @Autowired
    private PurchaseInvoiceRepository purchaseInvoiceRepository;
    @PreAuthorize("hasAuthority('ADMIN') or hasRole('ADMIN') or hasAuthority('CREATE_PURCHASE_INVOICES')")
    @PostMapping("/create")
    public PurchaseInvoice create(@RequestBody PurchaseInvoiceDto purchaseInvoiceDto /*,@RequestParam("name") String name*/) {
        System.out.println(purchaseInvoiceDto);
        return purchaseInvoiceService.createPurchaseInvoice(purchaseInvoiceDto,null);
    }
    @PreAuthorize("hasAuthority('ADMIN') or hasRole('ADMIN') or hasAuthority('VIEW_PURCHASE_INVOICES')")
    @GetMapping("/{id}")
    public PurchaseInvoice getPurchaseInvoice(@PathVariable Long id) {
        return purchaseInvoiceService.getPurchaseInvoiceById(id);
    }
    @PreAuthorize("hasAuthority('ADMIN') or hasRole('ADMIN') or hasAuthority('VIEW_PURCHASE_INVOICES')")
    @GetMapping
    public List<PurchaseInvoiceDto> getPurchaseInvoices() {
        return purchaseInvoiceService.getAllPurchaseInvoices();
    }
    @PreAuthorize("hasAuthority('ADMIN') or hasRole('ADMIN') or hasAuthority('DELETE_PURCHASE_INVOICES')")
    @DeleteMapping("/delete/{id}")
    public PurchaseInvoice deletePurchaseInvoice(@PathVariable Long id){
        return purchaseInvoiceService.deletePurchaseInvoice(id);
    }
    @PreAuthorize("hasAuthority('ADMIN') or hasRole('ADMIN') or hasAuthority('UPDATE_PURCHASE_INVOICES')")
    @PutMapping("/update/{id}")
    public PurchaseInvoice updatePurchaseInvoice(@PathVariable Long id, @RequestBody PurchaseInvoiceDto purchaseInvoiceDto) throws Exception {
        return purchaseInvoiceService.updatePurchaseInvoice(id, purchaseInvoiceDto);
    }
    @PreAuthorize("isAuthenticated()")
    @PostMapping("/status/{id}")
    public void updateStatus(@PathVariable("id") Long id, @RequestParam("status") String status){
        PurchaseInvoice purchaseInvoice = purchaseInvoiceService.getPurchaseInvoiceById(id);
        purchaseInvoice.setPaymentStatus(PaymentStatus.valueOf(status));
        purchaseInvoiceRepository.save(purchaseInvoice);
    }
    @PreAuthorize("hasAuthority('ADMIN') or hasRole('ADMIN') or hasAuthority('VIEW_PURCHASE_INVOICES')")
    @GetMapping("/search")
    public ResponseEntity<List<PurchaseInvoice>> searchPurchaseInvoices(@RequestParam String query) {
        List<PurchaseInvoice> results = purchaseInvoiceService.searchPurchaseInvoices(query);
        return ResponseEntity.ok(results);
    }
    @PreAuthorize("hasAuthority('ADMIN') or hasRole('ADMIN') or hasAuthority('VIEW_PURCHASE_INVOICES')")
    @GetMapping("/lines/{id}")
    public List<PurchaseLine> getLinesByPurchaseInvoiceId(@PathVariable("id") Long id){
        return purchaseInvoiceService.getLinesByPurchaseInvoiceId(id);
    }
    @PreAuthorize("hasAuthority('ADMIN') or hasRole('ADMIN') or hasAuthority('VIEW_PURCHASE_INVOICES')")
    @GetMapping("/line/{id}")
    public PurchaseInvoice getPurchaseInvoiceByPurchaseLineId(@PathVariable("id") Long id){
        return purchaseInvoiceService.getPurchaseInvoiceByPurchaseLineId(id);
    }
}