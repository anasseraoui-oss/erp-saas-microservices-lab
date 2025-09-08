package com.spring.productsevice.product.DTO;

import lombok.Getter;
import lombok.Setter;

import java.util.Date;

@Getter
@Setter
public class ExpiredProductCreateDTO {
    private String subBarcode;
    private int quantityExpired;
    private Date expirationDate;
    private String lotNumber;
    private Long productId; // This matches your frontend
}

// Alternative controller method using DTO
/*
@PostMapping
public ResponseEntity<ExpiredProduct> createExpiredProduct(@RequestBody ExpiredProductCreateDTO dto) {
    try {
        // Fetch the product
        Product product = productService.findById(dto.getProductId());
        if (product == null) {
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        }

        // Create ExpiredProduct from DTO
        ExpiredProduct expiredProduct = new ExpiredProduct();
        expiredProduct.setSubBarcode(dto.getSubBarcode());
        expiredProduct.setQuantityExpired(dto.getQuantityExpired());
        expiredProduct.setExpirationDate(dto.getExpirationDate());
        expiredProduct.setLotNumber(dto.getLotNumber());
        expiredProduct.setProduct(product);

        ExpiredProduct created = expiredProductService.createExpired(expiredProduct);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    } catch (Exception e) {
        e.printStackTrace();
        return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
*/