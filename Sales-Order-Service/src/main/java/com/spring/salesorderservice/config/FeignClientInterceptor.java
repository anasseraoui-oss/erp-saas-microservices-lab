package com.spring.salesorderservice.config;

import feign.RequestInterceptor;
import feign.RequestTemplate;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Component
public class FeignClientInterceptor implements RequestInterceptor {

    @Override
    public void apply(RequestTemplate requestTemplate) {
        ServletRequestAttributes requestAttributes =
                (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (requestAttributes != null) {
            String authToken = requestAttributes.getRequest().getHeader("Authorization");
            if (authToken != null) {
                // إضافة التوكن إلى الرؤوس الخاصة بـ Feign
                requestTemplate.header("Authorization", authToken);
            }
        }
    }
}