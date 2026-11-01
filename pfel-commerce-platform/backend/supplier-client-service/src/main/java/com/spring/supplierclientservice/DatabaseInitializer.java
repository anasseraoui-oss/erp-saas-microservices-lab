package com.spring.supplierclientservice;

import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
public class DatabaseInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DatabaseInitializer.class);
    private final JdbcTemplate jdbcTemplate;

    // SQL statements for supplier_client data
    // Storing them as a list of strings
    private static final List<String> SUPPLIER_CLIENT_INSERTS = Arrays.asList(
            "INSERT INTO supplier_client (id, email, name, phone_number, total_seles, totale_purch) VALUES (1, 'supplier1@example.com', 'Global Supplies Ltd.', '111-222-3333', 15000.50, 8000.75);",
            "INSERT INTO supplier_client (id, email, name, phone_number, total_seles, totale_purch) VALUES (2, 'client.alpha@example.com', 'Alpha Customers Inc.', '222-333-4444', 2500.00, 12000.00);",
            "INSERT INTO supplier_client (id, email, name, phone_number, total_seles, totale_purch) VALUES (3, 'techparts@example.com', 'Tech Parts Direct', '333-444-5555', 45000.00, 22000.50);",
            "INSERT INTO supplier_client (id, email, name, phone_number, total_seles, totale_purch) VALUES (4, 'officegear@example.com', 'Office Gear Co.', '444-555-6666', 8000.25, 5000.00);",
            "INSERT INTO supplier_client (id, email, name, phone_number, total_seles, totale_purch) VALUES (5, 'buildmasters@example.com', 'Build Masters LLC', '555-666-7777', 75000.00, 40000.00);",
            "INSERT INTO supplier_client (id, email, name, phone_number, total_seles, totale_purch) VALUES (6, 'foodiesupply@example.com', 'Foodie Supply Network', '666-777-8888', 30000.75, 18000.25);",
            "INSERT INTO supplier_client (id, email, name, phone_number, total_seles, totale_purch) VALUES (7, 'beta.corp@example.com', 'Beta Corporation', '777-888-9999', 1200.50, 9500.00);",
            "INSERT INTO supplier_client (id, email, name, phone_number, total_seles, totale_purch) VALUES (8, 'gadgetworld@example.com', 'Gadget World', '888-999-0000', 95000.00, 60000.00);",
            "INSERT INTO supplier_client (id, email, name, phone_number, total_seles, totale_purch) VALUES (9, 'healthfirst@example.com', 'Health First Providers', '999-000-1111', 22000.00, 15000.50);",
            "INSERT INTO supplier_client (id, email, name, phone_number, total_seles, totale_purch) VALUES (10, 'autokingdom@example.com', 'Auto Kingdom', '000-111-2222', 150000.00, 90000.00);",
            "INSERT INTO supplier_client (id, email, name, phone_number, total_seles, totale_purch) VALUES (11, 'greenplanet@example.com', 'Green Planet Organics', '123-456-7890', 5000.00, 3000.00);",
            "INSERT INTO supplier_client (id, email, name, phone_number, total_seles, totale_purch) VALUES (12, 'delta.solutions@example.com', 'Delta Solutions', '234-567-8901', 1800.00, 11000.00);",
            "INSERT INTO supplier_client (id, email, name, phone_number, total_seles, totale_purch) VALUES (13, 'fashionhub@example.com', 'Fashion Hub Central', '345-678-9012', 60000.00, 35000.00);",
            "INSERT INTO supplier_client (id, email, name, phone_number, total_seles, totale_purch) VALUES (14, 'petparadise@example.com', 'Pet Paradise Supplies', '456-789-0123', 7500.50, 4500.75);",
            "INSERT INTO supplier_client (id, email, name, phone_number, total_seles, totale_purch) VALUES (15, 'securetech@example.com', 'SecureTech Systems', '567-890-1234', 85000.00, 55000.00);"
    );

    public DatabaseInitializer(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    @Transactional // Optional: run all inserts in a single transaction
    public void run(String... args) throws Exception {
        logger.info("Checking if initial data for supplier_client needs to be inserted...");

        // Optional: Check if data already exists to prevent duplicate primary key errors
        // This is a simple check; for more complex scenarios, consider existence checks per row
        // or use INSERT IGNORE / ON CONFLICT DO NOTHING if your DB supports it and it's desired behavior.
        Integer count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM supplier_client WHERE id = 1", Integer.class);
        if (count != null && count > 0) {
            logger.info("Initial data for supplier_client (ID 1) already exists. Skipping insertion.");
            return;
        }

        logger.info("Inserting initial data into supplier_client table...");
        int recordsInserted = 0;
        for (String sqlInsert : SUPPLIER_CLIENT_INSERTS) {
            try {
                jdbcTemplate.execute(sqlInsert);
                recordsInserted++;
            } catch (Exception e) {
                logger.error("Error inserting record: {} - Error: {}", sqlInsert.substring(0, Math.min(sqlInsert.length(), 100)) + "...", e.getMessage());
                // Decide if you want to stop on error or continue
            }
        }
        logger.info("{} records inserted into supplier_client table.", recordsInserted);
    }
}