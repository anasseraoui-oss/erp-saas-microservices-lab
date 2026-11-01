package com.spring.productsevice.controller;

import com.spring.productsevice.product.ExpiredProduct;
import com.spring.productsevice.product.Product;
import com.spring.productsevice.service.ExpiredProductService;
import com.spring.productsevice.service.ProductService; // Assuming you have this
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Date;
import java.util.List;
import java.util.Optional;
@PreAuthorize("hasAuthority('USER_MANAGEMENT') or hasRole('ADMIN')")
@RestController
@RequestMapping("/api/expired-products")
public class ExpiredProductController {

    @Autowired
    private ExpiredProductService expiredProductService;

    @Autowired
    private ProductService productService; // Inject ProductService

    // Create expired product
    @PostMapping
    public ResponseEntity<ExpiredProduct> createExpiredProduct(@RequestBody ExpiredProduct expiredProduct) {
        try {
            // If productId is provided, fetch and set the Product
            if (expiredProduct.getProductId() != null) {
                Product product = productService.findById(expiredProduct.getProductId());
                if (product == null) {
                    return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
                }
                expiredProduct.setProduct(product);
            }

            ExpiredProduct created = expiredProductService.createExpired(expiredProduct);
            return new ResponseEntity<>(created, HttpStatus.CREATED);
        } catch (Exception e) {
            e.printStackTrace(); // For debugging
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Update expired product
    @PutMapping("/{id}")
    public ResponseEntity<ExpiredProduct> updateExpiredProduct(
            @PathVariable Long id,
            @RequestBody ExpiredProduct expiredProduct) {
        try {
            expiredProduct.setId(id);

            // If productId is provided, fetch and set the Product
            if (expiredProduct.getProductId() != null) {
                Product product = productService.findById(expiredProduct.getProductId());
                if (product == null) {
                    return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
                }
                expiredProduct.setProduct(product);
            }

            ExpiredProduct updated = expiredProductService.updateExpired(expiredProduct);
            return new ResponseEntity<>(updated, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace(); // For debugging
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Delete expired product
    @DeleteMapping("/{id}")
    public ResponseEntity<HttpStatus> deleteExpiredProduct(@PathVariable Long id) {
        try {
            ExpiredProduct expiredProduct = new ExpiredProduct();
            expiredProduct.setId(id);
            expiredProductService.deleteExpired(expiredProduct);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            e.printStackTrace(); // For debugging
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Search expired products by expiration date
    @GetMapping("/search")
    public ResponseEntity<List<ExpiredProduct>> searchExpiredProducts(
            @RequestParam("expirationDate") String expirationDate) {
        try {
            ExpiredProduct searchCriteria = new ExpiredProduct();
            LocalDate localDate = LocalDate.parse(expirationDate);
            Date date = Date.from(localDate.atStartOfDay(ZoneId.systemDefault()).toInstant());
            searchCriteria.setExpirationDate(date);
            List<ExpiredProduct> expiredProducts = expiredProductService.searchExpired(searchCriteria);
            return new ResponseEntity<>(expiredProducts, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace(); // For debugging
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Get all expired products
    @GetMapping
    public ResponseEntity<List<ExpiredProduct>> getAllExpiredProducts() {
        try {
            List<ExpiredProduct> expiredProducts = expiredProductService.getAllExpired();
            return new ResponseEntity<>(expiredProducts, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace(); // For debugging
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Get expired product by ID
    @GetMapping("/{id}")
    public ResponseEntity<Optional<ExpiredProduct>> getExpiredProductById(@PathVariable Long id) {
        try {
            Optional<ExpiredProduct> expiredProduct = expiredProductService.findById(id);
            if (expiredProduct != null) {
                return new ResponseEntity<>(expiredProduct, HttpStatus.OK);
            } else {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            e.printStackTrace(); // For debugging
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}