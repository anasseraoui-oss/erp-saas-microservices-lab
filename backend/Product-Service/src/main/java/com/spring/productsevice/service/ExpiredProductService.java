package com.spring.productsevice.service;

import com.spring.productsevice.product.ExpiredProduct;
import com.spring.productsevice.repository.ExpiredProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ExpiredProductService {
    @Autowired
    private ExpiredProductRepository expiredProductRepository;

    public ExpiredProduct createExpired(ExpiredProduct expiredProduct){
        return expiredProductRepository.save(expiredProduct);
    }
    public ExpiredProduct updateExpired(ExpiredProduct expiredProduct){
        ExpiredProduct existingExpiredProduct = expiredProductRepository.findById(expiredProduct.getId())
                .orElseThrow(() -> new RuntimeException("ExpiredProduct not found with id: " + expiredProduct.getId()));
        if (expiredProduct.getQuantityExpired() != 0) { existingExpiredProduct.setQuantityExpired(expiredProduct.getQuantityExpired());
        }
        if (expiredProduct.getLotNumber() != null) {
            existingExpiredProduct.setLotNumber(expiredProduct.getLotNumber());
        }
        if (expiredProduct.getSubBarcode() != null) {
            existingExpiredProduct.setSubBarcode(expiredProduct.getSubBarcode());
        }
        if (expiredProduct.getExpirationDate() != null) {
            existingExpiredProduct.setExpirationDate(expiredProduct.getExpirationDate());
        }
        return expiredProductRepository.save(expiredProduct);
    }
    public Void deleteExpired(ExpiredProduct expiredProduct){
         expiredProductRepository.delete(expiredProduct);
        return null;
    }
    public List<ExpiredProduct> searchExpired(ExpiredProduct expiredProduct){
        return expiredProductRepository.findByExpirationDate(expiredProduct.getExpirationDate());
    }
    public List<ExpiredProduct> getAllExpired(){
        return expiredProductRepository.findAll();
    }
    public Optional<ExpiredProduct> findById(Long id){
        return expiredProductRepository.findById(id);
    }

}