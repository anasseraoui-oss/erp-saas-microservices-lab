package com.spring.salesorderservice.config;

import com.spring.salesorderservice.model.PaymentStatus;
import feign.RequestInterceptor;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.context.annotation.Bean;
import org.springframework.web.bind.annotation.*;

@FeignClient(name = "SupplierClient-Service" , path = "/SupplierClients")
public interface FeignClientSupplierService {

    @Bean
     default RequestInterceptor feignRequestInterceptor() {
        return requestTemplate -> {
            String serviceName = "SalesService";
            requestTemplate.header("Source-Service", serviceName);
        };
    }

    @PutMapping("/SupplierClients/{id}")
    void updateTotalOrder(@PathVariable("id") Long id ,@RequestParam("totale")double totale,@RequestParam("sourceService")  String sourceService ,@RequestParam(value = "paymentStatus", required = false) PaymentStatus paymentStatus);

}
