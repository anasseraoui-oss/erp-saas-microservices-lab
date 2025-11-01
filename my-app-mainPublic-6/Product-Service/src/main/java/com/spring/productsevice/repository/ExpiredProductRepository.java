package com.spring.productsevice.repository;

import com.spring.productsevice.product.ExpiredProduct;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;
@Repository
public interface ExpiredProductRepository extends JpaRepository<ExpiredProduct, Long> {
    List<ExpiredProduct> findByExpirationDate(Date expirationDate);
    @Query("SELECT ep FROM ExpiredProduct ep JOIN FETCH ep.product p WHERE ep.expirationDate >= :startOfDay AND ep.expirationDate <= :endOfDay")
    List<ExpiredProduct> findByExpirationDateBetween(
            @Param("startOfDay") LocalDateTime startOfDay,
            @Param("endOfDay") LocalDateTime endOfDay
    );
}

