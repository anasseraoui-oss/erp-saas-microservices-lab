package com.spring.productsevice.product;

import com.spring.productsevice.repository.ProductRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.Optional;

@Component
public class ProductSetup {

    private static final Logger logger = LoggerFactory.getLogger(ProductSetup.class);

    private final ProductRepository productRepository;

    @Autowired
    public ProductSetup(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void setupInitialProducts() {
        logger.info("Starting initial setup for Products...");

        createProductIfNotFound(
                "Laptop Pro X15",
                "LPX15-2024", // Barcode
                15,           // Quantity
                1200.00,      // Price
                950.50,       // Initial Price
                "laptop_pro_x15.jpg", // Image
                "Electronics" // Category
        );

        createProductIfNotFound(
                "Wireless Mouse M5",
                "WMM5-2024",
                150,
                25.99,
                15.00,
                "mouse_m5.jpg",
                "Accessories"
        );

        createProductIfNotFound(
                "Mechanical Keyboard K7",
                "MKK7-2024",
                75,
                89.50,
                60.00,
                "keyboard_k7.jpg",
                "Accessories"
        );

        logger.info("Initial setup for Products finished.");
    }

    private void createProductIfNotFound(String name, String barcode, int quantity, double price, double priceInit, String image, String category) {
        Optional<Product> existingProductOptional = Optional.ofNullable(productRepository.findByBarcode(barcode));

        existingProductOptional.ifPresentOrElse(
                existingProduct -> {
                    logger.info("Product with barcode '{}' already exists. Skipping.", barcode);
                },
                () -> {
                    logger.info("Creating new product: {}", name);
                    Product newProduct = new Product();
                    newProduct.setName(name);
                    newProduct.setBarcode(barcode);
                    newProduct.setQuantity(quantity);
                    newProduct.setPrice(price);
                    newProduct.setPriceInit(priceInit);
                    newProduct.setImage(image);
                    newProduct.setCategory(category);
                    newProduct.setDateCreating(new Date());
                    newProduct.setDateLastModification(new Date());

                    productRepository.save(newProduct);
                }
        );
    }
}