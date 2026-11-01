package com.spring.salesorderservice.service.ExceptionFeign;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice
public class FeignExceptionHandler {
    @ExceptionHandler(FeignClientException.class)
    public ResponseEntity<String> handleFeignClientException(FeignClientException ex) {
        return new ResponseEntity<>(ex.getMessage(), HttpStatus.BAD_REQUEST);
    }
}
