package com.eraoui.notificationservice;

import com.ecommerce.security.core.util.EnableResourceSecurity;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication(exclude = { org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration.class })
@EnableDiscoveryClient
@ComponentScan(basePackages = {
        "com.eraoui.notificationservice",
        "com.eraoui.Processor",
        "com.eraoui.kafka"
})
@EnableResourceSecurity
public class NotificationServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(NotificationServiceApplication.class, args);
    }

}
