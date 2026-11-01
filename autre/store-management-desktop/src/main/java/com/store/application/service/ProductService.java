package com.store.application.service;

import com.store.domain.entity.Product;
import com.store.infrastructure.persistence.ProductRepository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Product business logic - CRUD and stock operations.
 */
public class ProductService {

    private final ProductRepository repo = new ProductRepository();

    public List<Product> getAllProducts() {
        return repo.findAll();
    }

    public Optional<Product> getById(Long id) {
        return repo.findById(id);
    }

    public Product createProduct(String name, String barcode, int quantity, BigDecimal price, String category,
            Integer minStockLevel, LocalDate expiryDate) {
        Product p = new Product();
        p.setName(name);
        p.setBarcode(barcode != null ? barcode : "");
        p.setQuantity(quantity);
        p.setPrice(price);
        p.setPriceInit(price);
        p.setCategory(category != null ? category : "");
        p.setMinStockLevel(minStockLevel);
        p.setExpiryDate(expiryDate);
        return repo.save(p);
    }

    public Product updateProduct(Long id, String name, String barcode, int quantity, BigDecimal price, String category,
            Integer minStockLevel, LocalDate expiryDate) {
        Product p = repo.findById(id).orElseThrow(() -> new IllegalArgumentException("Product not found: " + id));
        p.setName(name);
        p.setBarcode(barcode != null ? barcode : "");
        p.setQuantity(quantity);
        p.setPrice(price);
        p.setCategory(category != null ? category : "");
        p.setMinStockLevel(minStockLevel);
        p.setExpiryDate(expiryDate);
        return repo.save(p);
    }

    public void deleteProduct(Long id) {
        repo.deleteById(id);
    }

    /**
     * Reduce stock (called when creating a sales invoice).
     */
    public void reduceStock(Long productId, int quantity) {
        Product p = repo.findById(productId).orElseThrow(() -> new IllegalArgumentException("Product not found"));
        if (p.getQuantity() < quantity) {
            throw new IllegalArgumentException("Insufficient stock. Available: " + p.getQuantity());
        }
        p.setQuantity(p.getQuantity() - quantity);
        repo.save(p);
    }

    public void increaseStock(Long productId, int quantity) {
        Product p = repo.findById(productId).orElseThrow(() -> new IllegalArgumentException("Product not found"));
        p.setQuantity(p.getQuantity() + quantity);
        repo.save(p);
    }

    public List<Product> searchByName(String term) {
        return repo.findByNameContaining(term);
    }

    public List<Product> getLowStockProducts() {
        return repo.findAll().stream()
                .filter(Product::isLowStock)
                .collect(Collectors.toList());
    }

    public List<Product> getExpiredProducts() {
        return repo.findAll().stream()
                .filter(Product::isExpired)
                .collect(Collectors.toList());
    }
}
