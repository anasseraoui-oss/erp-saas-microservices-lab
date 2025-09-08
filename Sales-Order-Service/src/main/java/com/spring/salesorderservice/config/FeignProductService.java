package com.spring.salesorderservice.config;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.Date;

//@FeignClient(name = "Product-Service" ,url = http://localhost:8031/api/products"")
@FeignClient(name = "Product-Service", path = "/api/products")
public interface FeignProductService {
    @PutMapping("/{id}/updateDate")
    void updateDate(
            @PathVariable("id") Long id,
            // --- ADD THE SAME ANNOTATION HERE ---
            @RequestParam("date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Date date);
    @PutMapping("/{productId}/reduceStock")
    void reduceStock(@PathVariable("productId") Long productId, @RequestParam("quantity") int quantity);
    @PutMapping("/{id}/addStock")
    void addStock(@PathVariable("id") Long id, @RequestParam("quantity") int quantity);
    @GetMapping("/{id}/Stock")
    boolean isStockAvailable(@PathVariable("id") Long id, @RequestParam("quantity") int quantity);
}