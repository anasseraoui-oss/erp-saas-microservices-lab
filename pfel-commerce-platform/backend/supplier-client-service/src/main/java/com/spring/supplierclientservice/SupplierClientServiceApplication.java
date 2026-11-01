package com.spring.supplierclientservice;

import com.ecommerce.security.core.util.EnableResourceSecurity;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication(exclude = { org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration.class })
@EnableResourceSecurity
@EnableDiscoveryClient
@EnableFeignClients
public class SupplierClientServiceApplication {
	public static void main(String[] args) {
		SpringApplication.run(SupplierClientServiceApplication.class, args);
	}
}
