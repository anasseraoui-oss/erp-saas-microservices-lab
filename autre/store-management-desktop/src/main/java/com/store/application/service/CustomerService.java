package com.store.application.service;

import com.store.domain.entity.Customer;
import com.store.infrastructure.persistence.CustomerRepository;

import java.util.List;
import java.util.Optional;

public class CustomerService {

    private final CustomerRepository repo = new CustomerRepository();

    public List<Customer> getAllCustomers() {
        return repo.findAll();
    }

    public Optional<Customer> getById(Long id) {
        return repo.findById(id);
    }

    public Customer createCustomer(String name, String email, String phone) {
        Customer c = new Customer();
        c.setName(name);
        c.setEmail(email != null ? email : "");
        c.setPhone(phone != null ? phone : "");
        return repo.save(c);
    }

    public void updateCustomer(Long id, String name, String email, String phone) {
        repo.findById(id).ifPresent(c -> {
            c.setName(name);
            c.setEmail(email);
            c.setPhone(phone);
            repo.update(c);
        });
    }

    public void deleteCustomer(Long id) {
        repo.delete(id);
    }

    public List<Customer> searchByName(String name) {
        return repo.searchByName(name);
    }

    public void updateTotalOrders(Long customerId, java.math.BigDecimal amount) {
        if (customerId == null || customerId == 0)
            return;
        repo.findById(customerId).ifPresent(c -> {
            if (c.getTotalOrdersAmount() == null)
                c.setTotalOrdersAmount(java.math.BigDecimal.ZERO);
            c.setTotalOrdersAmount(c.getTotalOrdersAmount().add(amount));
            repo.update(c);
        });
    }
}
