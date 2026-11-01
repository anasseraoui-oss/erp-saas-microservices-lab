package com.spring.productsevice.repository;

import com.spring.productsevice.product.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

     Product findByBarcode(String barcode);

     List<Product> findByNameContainingIgnoreCase(String name);

     List<Product> findByCategoryContainingIgnoreCase(String category);

     Product findByName(String name);

     List<Product> findByPrice(Double price);

     List<Product> findByQuantity(Integer quantity);

     List<Product> findByPriceInit(Double price);
     @Query("SELECT p FROM Product p WHERE " +
             "LOWER(p.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
             "LOWER(p.barcode) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
             "LOWER(p.category) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
             "(:amount IS NOT NULL AND p.price >= :amount) OR " +
             "(:amountInit IS NOT NULL AND p.priceInit >= :amountInit)")
     List<Product> searchProducts(
             @Param("amount") Double amount,
             @Param("amountInit") Double amountInit,
             @Param("query") String query
     );

     @Query("SELECT p FROM Product p WHERE p.quantity >= 0 AND p.quantity <= p.QuantityAlmostDepleted")
     List<Product> findLowStockProducts();
}

