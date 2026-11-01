package com.store.infrastructure.persistence;

import com.store.domain.entity.Customer;
import com.store.domain.entity.Product;
import com.store.domain.entity.Supplier;
import com.store.domain.entity.UserApp;

import java.math.BigDecimal;

/**
 * Seeds sample data on first run (optional - call from MainApp).
 */
public class DataInitializer {

    public static void seedIfEmpty() {
        ProductRepository pr = new ProductRepository();
        CustomerRepository cr = new CustomerRepository();
        if (pr.findAll().isEmpty()) {
            Product p1 = new Product();
            p1.setName("Sample Product A");
            p1.setBarcode("BAR001");
            p1.setQuantity(100);
            p1.setPrice(new BigDecimal("19.99"));
            p1.setPriceInit(new BigDecimal("19.99"));
            p1.setCategory("General");
            pr.save(p1);

            Product p2 = new Product();
            p2.setName("Sample Product B");
            p2.setBarcode("BAR002");
            p2.setQuantity(50);
            p2.setPrice(new BigDecimal("49.99"));
            p2.setPriceInit(new BigDecimal("49.99"));
            p2.setCategory("Electronics");
            pr.save(p2);
        }
        if (cr.findAll().isEmpty()) {
            Customer c = new Customer();
            c.setName("Walk-in Customer");
            c.setEmail("walkin@store.com");
            c.setPhone("");
            cr.save(c);
        }

        // Seed Admin user if missing
        UserRepository ur = new UserRepository();
        if (ur.findByUsername("admin").isEmpty()) {
            UserApp admin = new UserApp(null, "admin", "admin", "ADMIN");
            ur.save(admin);
        }

        // Seed Supplier if missing
        SupplierRepository sr = new SupplierRepository();
        if (sr.findAll().isEmpty()) {
            Supplier s = new Supplier(null, "Main Wholesaler", "contact@wholesaler.com", "0500112233",
                    "Industrial Zone, Casablanca", BigDecimal.ZERO);
            sr.save(s);
        }
    }
}
