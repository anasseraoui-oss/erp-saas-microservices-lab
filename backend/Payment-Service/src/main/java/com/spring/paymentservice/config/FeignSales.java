package com.spring.paymentservice.config;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "Sales-Order-Service" ,path =  "/sales/Invoice")
public interface FeignSales {
    @PutMapping("/status/{id}")
    void updateStatus(@PathVariable("id") Long id, @RequestParam("status") String status);
}
