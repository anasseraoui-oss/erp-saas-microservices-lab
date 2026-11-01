package com.spring.supplierclientservice;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.nio.file.AccessDeniedException;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
@RestController
@RequestMapping("/SupplierClients")
public class SupplierClientController {

    @Autowired
    private SupplierClientService clientSupplierService;
    @PreAuthorize("hasAuthority({'CREATE_CLIENTS_SUPPLIERS'}) or hasRole('ADMIN')")
    @PostMapping("/supplierClient")
    public SupplierClient saveSupplierClient(@RequestBody SupplierClient supplierClient) throws AccessDeniedException {
        return clientSupplierService.saveSupplierClient(supplierClient);
    }
    @PreAuthorize("hasAuthority('VIEW_CLIENTS_SUPPLIERS') or hasRole('ADMIN')")
    @GetMapping("/supplierClient")
    public List<SupplierClient> getAllSupplierClients() throws AccessDeniedException {
        return clientSupplierService.getAllSupplierClients();
    }
    @PreAuthorize("hasAuthority('VIEW_CLIENTS_SUPPLIERS') or hasRole('ADMIN')")
    @GetMapping("/name/{name}")
    public SupplierClient getSupplierClientByName(@PathVariable("name") String name){
        return clientSupplierService.getSupplierClientByName(name);
    }
    @PreAuthorize("hasAuthority('VIEW_CLIENTS_SUPPLIERS') or hasAuthority('GET_ID') or hasRole('ADMIN')")
    @GetMapping("/id/{id}")
    public SupplierClient getSupplierClientById(@PathVariable("id") long id){
        return clientSupplierService.getSupplierClientById(id);
    }
    @PreAuthorize("hasAuthority('DELETE_CLIENTS_SUPPLIERS') or hasAuthority('DELETE') or hasRole('ADMIN')")
    @DeleteMapping("/Delete/{id}")
    public ResponseEntity<String> deleteSupplierClient(@PathVariable("id") long id) {
        SupplierClient isDeleted = clientSupplierService.deleteSupplierClientById(id);

        if (isDeleted!=null) {
            return ResponseEntity.ok("SupplierClient with ID " + id + " deleted successfully.");
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("SupplierClient not found with ID: " + id);
        }
    }
    @GetMapping("/{email}")
    public SupplierClient getSupplierClientByEmail(@PathVariable("email") String email){
        return clientSupplierService.findByEmail(email);
    }
    @GetMapping("/search")
    public ResponseEntity<List<SupplierClient>> searchSupplierClients(@RequestParam String query) throws AccessDeniedException {
        List<SupplierClient> results = clientSupplierService.searchSupplarClients(query);
        return ResponseEntity.ok(results
        );
    }
    @PreAuthorize("hasAuthority({'UPDATE'}) or hasAuthority('UPDATE_CLIENTS_SUPPLIERS') or hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<?> updateSupplierClient(@PathVariable("id") long id, @RequestBody SupplierClient supplierClient) {
         clientSupplierService.updateSupplierClient(id,supplierClient);
         return ResponseEntity.ok(supplierClient);
    }
    @PutMapping("/SupplierClients/{id}")
    public ResponseEntity<?> updateTotalOrder(@PathVariable("id") Long id, @RequestParam("totale") double totale, @RequestHeader("Source-Service")@RequestParam("sourceService") String sourceService,@RequestParam(value = "paymentStatus", required = false)String paymentStatus){
        Optional<SupplierClient> supplierClient = Optional.ofNullable(clientSupplierService.getSupplierClientById(id));
        if (supplierClient.isPresent()) {
            SupplierClient client = supplierClient.get();
            if (sourceService.equals("SalesService")) {
                client.setTotalSales(client.getTotalSales() + totale);
                if (Objects.equals(paymentStatus, "UNPAID")){
                    client.setBorrowingPriceSales(client.getBorrowingPriceSales() + totale);
                }
            } else if (sourceService.equals("PurchService")) {
                client.setTotalePurchase(client.getTotalePurchase() + totale);
                if (Objects.equals(paymentStatus, "UNPAID")){
                    client.setBorrowingPricePurchase(client.getBorrowingPricePurchase() + totale);
                }
            }
            // Save the updated supplier client if necessary
            clientSupplierService.saveSupplierClient(client);
        }
        return ResponseEntity.ok().build();
    }
    @PutMapping("/Borrowing/{id}")
    public ResponseEntity<Void> updateBorrowing(
            @PathVariable("id") Long supplierClientId,      // 4. يطابق @PathVariable("id")
            @RequestParam("amountPaid") double amountPaid,  // 5. يطابق @RequestParam double amountPaid
            @RequestParam("orderType") String orderType,     // 6. يطابق @RequestParam String orderType
            @RequestParam("dff") double dff
    ) {
        clientSupplierService.updateBorrowingAmount(supplierClientId, amountPaid, orderType,"NotByDelete",dff);
        return ResponseEntity.ok().build();
    }
    @PutMapping("/BorrowingByDelete/{id}")
    public ResponseEntity<Void> updateBorrowingByDelete(
            @PathVariable("id") Long supplierClientId,      // 4. يطابق @PathVariable("id")
            @RequestParam("amountPaid") double amountPaid,  // 5. يطابق @RequestParam double amountPaid
            @RequestParam("orderType") String orderType) {  // 6. يطابق @RequestParam String orderType
        clientSupplierService.updateBorrowingAmount(supplierClientId, amountPaid, orderType,"ByDelete",0);
        return ResponseEntity.ok().build();
    }
}