package com.spring.supplierclientservice;

import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
public class SupplierClientService {

    @Autowired
    private SupplierClientRepository clientRepository;
    @Autowired
    private SupplierClientRepository supplierClientRepository;

    public SupplierClient getSupplierClientById(long id) {
        return clientRepository.findById(id);
    }
     public SupplierClient getSupplierClientByName(String name){
        return clientRepository.findByName(name);
     }

    public SupplierClient saveSupplierClient(SupplierClient supplierClient) {
        supplierClient.setCreatedAt(new Date());
        return clientRepository.save(supplierClient);
    }

    public List<SupplierClient> getAllSupplierClients() {
        return clientRepository.findAll();
    }
    public  SupplierClient deleteSupplierClientById(long id) {
        SupplierClient supplierClient = getSupplierClientById(id);
        clientRepository.delete(supplierClient);
        return supplierClient;
    }

    public SupplierClient findByEmail(String email){
        return clientRepository.findByemail(email);
    }
    public List<SupplierClient> searchSupplarClients(String query) {
        return clientRepository.searchByNameOrEmail(query);
    }
    public void updateSupplierClient(Long id,SupplierClient supplierClient) {
        SupplierClient oldClient = getSupplierClientById(id);
        oldClient.setName(supplierClient.getName());
        oldClient.setEmail(supplierClient.getEmail());
        oldClient.setDescription(supplierClient.getDescription());
        oldClient.setCategory(supplierClient.getCategory());
        oldClient.setUserExecutor(supplierClient.getUserExecutor());
        oldClient.setUpdatedAt(supplierClient.getUpdatedAt());
        clientRepository.save(oldClient);
    }
    @Transactional
    public void updateBorrowingAmount(Long supplierClientId, double amountPaid, String orderType) {
        SupplierClient client = supplierClientRepository.findById(supplierClientId)
                .orElseThrow(() -> new RuntimeException("Client/Supplier not found with id: " + supplierClientId));
        if ("sales".equalsIgnoreCase(orderType)) {
            client.setBorrowingPriceSales(client.getBorrowingPricePurchase() - amountPaid);
        } else if ("purchases".equalsIgnoreCase(orderType)) {
            client.setBorrowingPricePurchase(client.getBorrowingPricePurchase() - amountPaid);
        } else {
            throw new IllegalArgumentException("Invalid order type: " + orderType);
        }
        supplierClientRepository.save(client);
    }
}