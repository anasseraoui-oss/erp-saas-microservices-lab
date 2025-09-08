package com.spring.paymentservice.config;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
@FeignClient(name = "Purchase-Order-Service" ,url = "http://localhost:8033/purchases/Invoice")
public interface FeignPurch {
    @PostMapping("/status/{id}")
    void updateStatus(@PathVariable("id") Integer id, @RequestParam("status") String status);
}
