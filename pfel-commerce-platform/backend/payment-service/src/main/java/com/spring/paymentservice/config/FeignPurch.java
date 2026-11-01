package com.spring.paymentservice.config;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@FeignClient(name = "Purchase-Order-Service" ,path = "/purchases/Invoice")
public interface FeignPurch {
    @PostMapping("/status/{id}")
    void updateStatus(@PathVariable("id") Long id, @RequestParam("status") String status);
    /*@GetMapping
    List<Long,Double,String> getInvoices();*/
}
