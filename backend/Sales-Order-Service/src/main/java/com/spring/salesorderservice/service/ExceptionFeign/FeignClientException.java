package com.spring.salesorderservice.service.ExceptionFeign;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_GATEWAY)
public class FeignClientException  extends RuntimeException {
    public FeignClientException (String message) {
        super(message);
    }
}
