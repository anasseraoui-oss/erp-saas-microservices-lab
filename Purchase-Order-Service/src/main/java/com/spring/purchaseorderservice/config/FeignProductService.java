package com.spring.purchaseorderservice.config;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.*;

import java.util.Date;

@Component
@FeignClient(name = "Product-Service",path = "/api/products")
public interface FeignProductService {
    @PutMapping("/{id}/addStock")
    void addStock(@PathVariable("id") Long id, @RequestParam("quantity") int quantity);
    @PutMapping("/{productId}/reduceStock")
    void reduceStock(@PathVariable("productId") Long productId, @RequestParam("quantity") int quantity);
    @PutMapping("/{id}/updateDate")
    void updateDate(@PathVariable("id") Long id, @RequestParam("date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Date date);
    @GetMapping("/{id}/Stock")
    boolean isStockAvailable(@PathVariable("id") Long id, @RequestParam("quantity") int quantity);
}
