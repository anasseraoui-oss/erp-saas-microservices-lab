package com.spring.salesorderservice.config;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "Payment-Service", path = "/payment")
public interface FeignPaiement {
    @PostMapping("/update/ofFeign/{orderType}/{orderId}")
    void updatePayment(            @PathVariable("orderType") String orderType,
                                   @PathVariable("orderId") Long orderId,
                                   @RequestParam double amount,
                                   @RequestParam String status,
                                   @RequestParam double totalAmount,
                                   @RequestParam Long supplierClientId );
}
