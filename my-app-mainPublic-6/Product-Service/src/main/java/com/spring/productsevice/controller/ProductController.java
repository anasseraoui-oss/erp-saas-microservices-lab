package com.spring.productsevice.controller;

import com.spring.productsevice.product.Product;
import com.spring.productsevice.service.ProductService;
import com.spring.productsevice.service.ProductStatusCheckService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.crossstore.ChangeSetPersister;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
@RestController
@RequestMapping("/api/products")
public class ProductController {
    @Autowired
    private ProductStatusCheckService productStatusCheckService;
    @Autowired
    private ProductService productService;
    @PreAuthorize("hasAuthority('VIEW_PRODUCTS') or hasRole('ADMIN')")
    @GetMapping
    public List<Product> getAllProducts() {
        return productService.getAllProducts();
    }

    @PreAuthorize("hasAuthority('CREATE_PRODUCTS') or hasRole('ADMIN')")
    @PostMapping
    public Product createProduct(@RequestBody Product product) {
        return productService.createProduct(product);
    }

    @PreAuthorize("hasAuthority({'VIEW_PRODUCTS' }) or hasRole('ADMIN')")
    @GetMapping("/{id}")
    public Product getProductById(@PathVariable("id") Long id) throws ChangeSetPersister.NotFoundException {
        return productService.getProductById(id);
    }

    @PreAuthorize("hasAuthority({'DELETE' , 'DELETE_PRODUCTS'}) or hasRole('ADMIN') ")
    @DeleteMapping("/delete/{id}")
    public void deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
    }

    @PutMapping("/{id}/reduceStock")
    public ResponseEntity<?> reduceStock(@PathVariable Long id, @RequestParam int quantity) {
        productService.reduceStock(id, quantity);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/addStock")
    public ResponseEntity<?> addStock(@PathVariable("id") Long id, @RequestParam int quantity) {
        productService.addStock(id, quantity);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/updateDate")
    public ResponseEntity<?> updateDate(
            @PathVariable("id") Long id,
            // --- THIS IS THE FIX ---
            // Tell Spring to expect the date in ISO 8601 format.
            @RequestParam("date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Date date) {
        System.out.println(date);
        System.out.println(id);
        productService.updateDate(id, date);
        return ResponseEntity.ok().build();
    }
    @PreAuthorize("isAuthenticated()") // Checks if the token is valid
    @GetMapping("/search/name")
    public List<Product> searchByName(@RequestParam String name) {
        return productService.findByNameContaining(name);
    }

    @GetMapping("/search/category")
    public List<Product> searchByCategory(@RequestParam String category) {
        return productService.findByCategoryContaining(category);
    }

    @GetMapping("/search/id")
    public Product searchById(@RequestParam Long id) {
        return productService.findById(id);
    }

    @GetMapping("/search/barcode")
    public Product searchByBarcode(@RequestParam String barcode) {
        return productService.findByBarcode(barcode);
    }

    @GetMapping("/search/price")
    public List<Product> searchByPrice(@RequestParam Double price) {
        return productService.findByPrice(price);
    }

    @GetMapping("/search/priceInit")
    public List<Product> searchByPriceInit(@RequestParam Double priceInit) {
        return productService.findByPriceInit(priceInit);
    }

    @GetMapping("/search/quantity")
    public List<Product> searchByQuantity(@RequestParam Integer quantity) {
        return productService.findByQuantity(quantity);
    }

    @PreAuthorize("hasAuthority({'UPDATE' })  or hasRole('ADMIN')")
    @PutMapping("/products/{id}")
    public ResponseEntity<Product> updateProduct(@PathVariable Long id, @RequestBody Product updatedProduct) {
        Product updated = productService.updateProduct(id, updatedProduct);
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/{id}/Stock")
    boolean isStockAvailable(@PathVariable("id") Long id, @RequestParam("quantity") int quantity) {
        Product product = productService.findById(id);
        if (product.getQuantity()-quantity < 0) {
            return false;
        }
        return true;
    }
    @PreAuthorize("hasAuthority({'SEARCH' }) or hasRole('ADMIN') ")
    @GetMapping("/search")
    public ResponseEntity<List<Product>> searchProducts(@RequestParam String query) {
        List<Product> results = productService.searchProducts(query);
        return ResponseEntity.ok(results);
    }
    @PreAuthorize("hasAuthority({'SEARCH' }) or hasRole('ADMIN') ")
    @GetMapping("/trigger-checks")
    public void triggerChecks() {
        productStatusCheckService.performInitialCheck();
    }
}
