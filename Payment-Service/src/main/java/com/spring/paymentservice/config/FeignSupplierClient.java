package com.spring.paymentservice.config;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "SupplierClient-Service" ,path = "/SupplierClients")
public interface FeignSupplierClient {
    @PutMapping("/Borrowing/{id}")
    void updateBorrowing(@PathVariable("id") Long SupplierClientId, @RequestParam double amountPaid, @RequestParam String orderType ,@RequestParam double dff);
    @PutMapping("/BorrowingByDelete/{id}")
    void updateBorrowingByDeleteDataPaidDate(@PathVariable("id") Long SupplierClientId, @RequestParam double amountPaid, @RequestParam String orderType);
}
