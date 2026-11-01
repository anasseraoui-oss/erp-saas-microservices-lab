package com.store.application.service;

import com.store.domain.entity.Supplier;
import com.store.infrastructure.persistence.SupplierRepository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public class SupplierService {

    private final SupplierRepository repo = new SupplierRepository();

    public List<Supplier> getAllSuppliers() {
        return repo.findAll();
    }

    public Optional<Supplier> getById(Long id) {
        return repo.findById(id);
    }

    public Supplier createSupplier(String name, String email, String phone, String address) {
        Supplier s = new Supplier();
        s.setName(name);
        s.setEmail(email != null ? email : "");
        s.setPhone(phone != null ? phone : "");
        s.setAddress(address != null ? address : "");
        return repo.save(s);
    }

    public void updateSupplier(Long id, String name, String email, String phone, String address) {
        repo.findById(id).ifPresent(s -> {
            s.setName(name);
            s.setEmail(email);
            s.setPhone(phone);
            s.setAddress(address);
            repo.save(s);
        });
    }

    public void deleteSupplier(Long id) {
        repo.delete(id);
    }

    public List<Supplier> searchByName(String name) {
        return repo.searchByName(name);
    }

    public void updateTotalPurchases(Long supplierId, BigDecimal amount) {
        if (supplierId == null || supplierId == 0)
            return;
        repo.findById(supplierId).ifPresent(s -> {
            if (s.getTotalPurchasesAmount() == null)
                s.setTotalPurchasesAmount(BigDecimal.ZERO);
            s.setTotalPurchasesAmount(s.getTotalPurchasesAmount().add(amount));
            repo.save(s);
        });
    }
}
