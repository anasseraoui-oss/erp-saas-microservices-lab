package com.spring.salesorderservice.service.ExceptionFeign;

import feign.Response;
import feign.codec.ErrorDecoder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
@Configuration
public class FeignErrorDecoder implements ErrorDecoder {
    @Bean
    public ErrorDecoder errorDecoder() {
        return new FeignErrorDecoder();
    }
    @Override
    public Exception decode(String methodKey, Response response) {
        if (response.status() == 404) {
            return new FeignClientException("Resource not found");
        } else if (response.status() == 500) {
            return new FeignClientException("Internal server error");
        }
        return new Exception("Generic Feign Exception");
    }
}
