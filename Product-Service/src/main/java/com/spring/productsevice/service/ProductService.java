package com.spring.productsevice.service;

import com.spring.productsevice.product.Product;
import com.spring.productsevice.repository.ProductRepository;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;
    private final ProductStatusCheckService productStatusCheckService;

    public ProductService(ProductStatusCheckService productStatusCheckService) {
        this.productStatusCheckService = productStatusCheckService;
    }

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public Product createProduct(Product product) {
        return productRepository.save(product);
    }

    public void deleteProduct(Long id) {
        productRepository.deleteById(id);
    }

    public Product getProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
    }
    public Product reduceStock(Long id, int quantity) {
        Product product = getProductById(id);
        if (product.getQuantity() < quantity) throw new IllegalArgumentException("Not enough stock");
        if (product.getQuantity()<=product.getQuantityAlmostDepleted()){
            productStatusCheckService.checkForLowStockByProduct(product);
        }
        product.setQuantity(product.getQuantity() - quantity);
        return productRepository.save(product);
    }

    public Product addStock(Long id, int quantity) {
        Product product = getProductById(id);
        product.setQuantity(product.getQuantity() + quantity);
        return productRepository.save(product);
    }
   public Product updateDate(Long id, Date date){
        Product product = getProductById(id);
        if (product == null) throw new IllegalArgumentException("Product not found with id: " + id);
        if (product.getDateCreating() == null) product.setDateCreating(date);
        else{ product.setDateCreating(product.getDateCreating());
            product.setDateLastModification(date);}
        return productRepository.save(product);
    }

    public List<Product> findByNameContaining(String name) {
        return productRepository.findByNameContainingIgnoreCase(name);
    }
    public List<Product> findByCategoryContaining(String category){
        return productRepository.findByCategoryContainingIgnoreCase(category);
    }
    public Product findById(Long id) {
        return productRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException(" product not found with id: " + id));
    }

    public Product findByBarcode(String barcode) {
        return productRepository.findByBarcode(barcode);
    }

    public List<Product> findByPrice(Double price) {
        return productRepository.findByPrice(price);
    }
    public List<Product> findByPriceInit(Double price) {
        return productRepository.findByPriceInit(price);
    }

    public List<Product> findByQuantity(Integer quantity) {
        return productRepository.findByQuantity(quantity);
    }
    public Product updateProduct(long id, Product product) {
        Product existingProduct = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found with id: " + id));
        existingProduct.setName(product.getName());
        existingProduct.setBarcode(product.getBarcode());
        existingProduct.setPrice(product.getPrice());
        existingProduct.setQuantity(product.getQuantity());
        existingProduct.setPriceInit(product.getPriceInit());
        existingProduct.setCategory(product.getCategory());
        existingProduct.setImage(product.getImage());
        existingProduct.setUserExecutor(product.getUserExecutor());
        existingProduct.setDateLastModification(new Date()); // Optional: update modification date
        if (existingProduct.getQuantity()<=existingProduct.getQuantityAlmostDepleted()){
            productStatusCheckService.checkForLowStockByProduct(existingProduct);
        }
        return productRepository.save(existingProduct);
    }

    public List<Product> searchProducts(String query) {
        Double price = null;
        Double priceInit = null;
        try {
            price = Double.parseDouble(query);
            priceInit = Double.parseDouble(query);
        } catch (NumberFormatException e) {
            // ignore if query is not numeric
        }
        return productRepository.searchProducts(price, priceInit, query);
    }
}
