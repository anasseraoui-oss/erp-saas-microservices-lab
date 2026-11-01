package com.spring.purchaseorderservice.controller;

import com.spring.purchaseorderservice.dto.PurchaseLineDto;
import com.spring.purchaseorderservice.dto.PurchaseOrderDto;
import com.spring.purchaseorderservice.model.Delivery;
import com.spring.purchaseorderservice.model.PaymentStatus;
import com.spring.purchaseorderservice.model.PurchaseLine;
import com.spring.purchaseorderservice.model.PurchaseOrder;
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
@RequestMapping("/purchases/Order")
public class PurchaseOrderController {

    @Autowired
    private PurchaseOrderService purchaseOrderService;
    @PreAuthorize("hasAuthority('ADMIN') or hasRole('ADMIN') or hasAuthority('CREATE_PURCHASE_ORDERS')")
    @PostMapping("/create")
    public PurchaseOrderDto createPurchaseOrder(@RequestBody PurchaseOrderDto purchaseOrderDto) {
        System.out.println(purchaseOrderDto);
        return purchaseOrderService.createOrder(purchaseOrderDto);
    }
    @PreAuthorize("hasAuthority('ADMIN') or hasRole('ADMIN') or hasAuthority('UPDATE_PURCHASE_ORDERS')")
    @PutMapping("/{orderId}/pending")
    public ResponseEntity<String> pendingOrder(@PathVariable Long orderId) {
        purchaseOrderService.pendingOrder(orderId);
        return ResponseEntity.ok("`Order has been pending successfully ${salesOrderDto}`");
    }
    @PreAuthorize("hasAuthority('ADMIN') or hasRole('ADMIN') or hasAuthority('UPDATE_PURCHASE_ORDERS')")
    @PutMapping("/{orderId}/confirm")
    public ResponseEntity<PurchaseOrderDto> confirmOrder(@PathVariable Long orderId) throws Exception {
        PurchaseOrderDto confirmedOrder = purchaseOrderService.confirmOrder(orderId);
        return ResponseEntity.ok(confirmedOrder);
    }
    @PreAuthorize("hasAuthority('ADMIN') or hasRole('ADMIN') or hasAuthority('UPDATE_PURCHASE_ORDERS')")
    @PutMapping("/{orderId}/ship")
    public ResponseEntity<String> shipOrder(@PathVariable Long orderId) {
        purchaseOrderService.shipOrder(orderId);
        return ResponseEntity.ok("Order has been shipped successfully");
    }
    @PreAuthorize("hasAuthority('ADMIN') or hasRole('ADMIN') or hasAuthority('UPDATE_PURCHASE_ORDERS')")
    @PutMapping("/{orderId}/cancel")
    public ResponseEntity<String> cancelOrder(@PathVariable Long orderId) {
        purchaseOrderService.cancelOrder(orderId);
        return ResponseEntity.ok("Order has been canceled successfully");
    }
    @PreAuthorize("hasAuthority('ADMIN') or hasRole('ADMIN') or hasAuthority('VIEW_PURCHASE_ORDERS')")
    @GetMapping("/{id}")
    public PurchaseOrderDto getPurchaseOrder(@PathVariable Long id) {
        return purchaseOrderService.getOrderById(id);
    }
    @PreAuthorize("hasAuthority('ADMIN') or hasRole('ADMIN') or hasAuthority('VIEW_PURCHASE_ORDERS')")
    @GetMapping
    public List<PurchaseOrderDto> getPurchaseOrders() {
        return purchaseOrderService.getAllOrders();
    }
    @PreAuthorize("hasAuthority('ADMIN') or hasRole('ADMIN') or hasAuthority('DELETE_PURCHASE_ORDERS')")
    @DeleteMapping("/delete/{id}")
    public void deleteSalesOrder(@PathVariable Long id){
        purchaseOrderService.deleteOrder(id);
    }
    @PreAuthorize("hasAuthority('ADMIN') or hasRole('ADMIN') or hasAuthority('UPDATE_PURCHASE_ORDERS')")
    @PutMapping("/update/{id}")
    public PurchaseOrderDto updatePurchaseInvoice(@PathVariable Long id, @RequestBody PurchaseOrderDto purchaseOrderDto) throws Exception {
        return purchaseOrderService.updateOrder(id, purchaseOrderDto);
    }
    @PreAuthorize("hasAuthority('ADMIN') or hasRole('ADMIN') or hasAuthority('VIEW_PURCHASE_ORDERS')")
    @GetMapping("/search")
    public ResponseEntity<List<PurchaseOrder>> searchPurchaseOrder(@RequestParam String query) {
        List<PurchaseOrder> results = purchaseOrderService.searchPurchaseOrders(query);
        return ResponseEntity.ok(results);
    }
    @PreAuthorize("hasAuthority('ADMIN') or hasRole('ADMIN') or hasAuthority('VIEW_PURCHASE_ORDERS')")
    @GetMapping("/lines/{id}")
    public List<PurchaseLineDto> getSalesLinesBySalesOrderId(@PathVariable("id") Long id){
        return purchaseOrderService.getLinesByOrderId(id);
    }
    @PreAuthorize("hasAuthority('ADMIN') or hasRole('ADMIN') or hasAuthority('VIEW_PURCHASE_ORDERS')")
    @GetMapping("/line/{id}")
    public PurchaseOrder getPurchaseOrderByPurchaseLineId(@PathVariable("id") Long id){
        return purchaseOrderService.getPurchaseOrderByPurchaseLineId(id);
    }
}