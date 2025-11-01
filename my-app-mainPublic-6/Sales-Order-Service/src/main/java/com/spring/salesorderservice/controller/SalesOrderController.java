package com.spring.salesorderservice.controller;

import com.spring.salesorderservice.dto.SalesLineDto;
import com.spring.salesorderservice.dto.SalesOrderDto;
import com.spring.salesorderservice.model.SalesOrder;
import com.spring.salesorderservice.service.SalesOrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/sales/Order")
public class SalesOrderController {

    @Autowired
    private SalesOrderService salesOrderService;
    @PreAuthorize("hasAuthority('ADMIN') or hasRole('ADMIN') or hasAuthority('CREATE_SALES_ORDERS')")
    @PostMapping("/create")
    public ResponseEntity<SalesOrderDto> createOrder(@RequestBody SalesOrderDto orderDto) {
        SalesOrderDto createdOrder = salesOrderService.createOrder(orderDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdOrder);
    }
    @PreAuthorize("hasAuthority('ADMIN') or hasRole('ADMIN') or hasAuthority('UPDATE_SALES_ORDERS')")
    @PutMapping("/update/{id}")
    public ResponseEntity<SalesOrderDto> updateOrder(@RequestBody SalesOrderDto orderDto, @PathVariable Long id) {
        SalesOrderDto updatedOrder = salesOrderService.updateOrder(orderDto, id);
        return ResponseEntity.ok(updatedOrder);
    }
    @PreAuthorize("hasAuthority('ADMIN') or hasRole('ADMIN') or hasAuthority('DELETE_SALES_ORDERS')")
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> deleteOrder(@PathVariable Long id) {
        salesOrderService.deleteOrder(id);
        return ResponseEntity.ok("Order has been deleted successfully");
    }
    @PreAuthorize("hasAuthority('ADMIN') or hasRole('ADMIN') or hasAuthority('UPDATE_SALES_ORDERS')")
    @PutMapping("/{orderId}/pending")
    public ResponseEntity<String> pendingOrder(@PathVariable Long orderId) {
        salesOrderService.pendingOrder(orderId);
        return ResponseEntity.ok("`Order has been pending successfully ${salesOrderDto}`");
    }
    @PreAuthorize("hasAuthority('ADMIN') or hasRole('ADMIN') or hasAuthority('UPDATE_SALES_ORDERS')")
    @PutMapping("/{orderId}/confirm")
    public ResponseEntity<SalesOrderDto> confirmOrder(@PathVariable Long orderId) {
        SalesOrderDto confirmedOrder = salesOrderService.confirmOrder(orderId);
        return ResponseEntity.ok(confirmedOrder);
    }
    @PreAuthorize("hasAuthority('ADMIN') or hasRole('ADMIN') or hasAuthority('UPDATE_SALES_ORDERS')")
    @PutMapping("/{orderId}/ship")
    public ResponseEntity<String> shipOrder(@PathVariable Long orderId) {
        salesOrderService.shipOrder(orderId);
        return ResponseEntity.ok("Order has been shipped successfully");
    }
    @PreAuthorize("hasAuthority('ADMIN') or hasRole('ADMIN') or hasAuthority('UPDATE_SALES_ORDERS')")
    @PutMapping("/{orderId}/cancel")
    public ResponseEntity<String> cancelOrder(@PathVariable Long orderId) {
        salesOrderService.cancelOrder(orderId);
        return ResponseEntity.ok("Order has been canceled successfully");
    }
    @PreAuthorize("hasAuthority('ADMIN') or hasRole('ADMIN') or hasAuthority('VIEW_SALES_ORDERS')")
    @GetMapping("/{id}")
    public ResponseEntity<SalesOrderDto> getOrderById(@PathVariable Long id) {
        SalesOrderDto order = salesOrderService.getOrderById(id);
        return ResponseEntity.ok(order);
    }
    @PreAuthorize("hasAuthority('ADMIN') or hasRole('ADMIN') or hasAuthority('VIEW_SALES_ORDERS')")
    @GetMapping
    public ResponseEntity<List<SalesOrderDto>> getAllOrders() {
        List<SalesOrderDto> orders = salesOrderService.getAllOrders();
        return ResponseEntity.ok(orders);
    }
    @PreAuthorize("hasAuthority('ADMIN') or hasRole('ADMIN') or hasAuthority('VIEW_SALES_ORDERS')")
    @GetMapping("/search")
    public List<SalesOrder> searchOrders(@RequestParam String query) {
        return salesOrderService.searchSalesOrders(query);
    }
    @PreAuthorize("hasAuthority('ADMIN') or hasRole('ADMIN') or hasAuthority('VIEW_SALES_ORDERS')")
    @GetMapping("/line/{id}")
    public ResponseEntity<SalesOrderDto> getSalesOrderBySalesLineId(@PathVariable Long id) {
        SalesOrderDto order = salesOrderService.getSalesOrderBySalesLineId(id);
        return ResponseEntity.ok(order);
    }
    @PreAuthorize("hasAuthority('ADMIN') or hasRole('ADMIN') or hasAuthority('VIEW_SALES_ORDERS')")
    @GetMapping("/lines/{id}")
    public ResponseEntity<List<SalesLineDto>> getSalesLinesBySalesOrderId(@PathVariable Long id) {
        List<SalesLineDto> salesLines = salesOrderService.getSalesLinesBySalesOrderId(id);
        return ResponseEntity.ok(salesLines);
    }
}