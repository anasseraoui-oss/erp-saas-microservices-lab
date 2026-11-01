# Store Management Desktop MVP

A **mini desktop application** for store management, derived from a Spring Boot microservices project. Built with **JavaFX**, **H2 database**, and **Hibernate**.

## Features

1. **Product Management**
   - Create, update, delete products
   - Track quantity in stock
   - Search by name

2. **Invoice Management**
   - Create sales invoices
   - Associate products with quantities
   - Automatic total calculation
   - Automatic stock reduction on invoice creation

3. **Payment Tracking**
   - Register payments for invoices
   - Automatic status update (PAID / PARTPAID / UNPAID)

4. **Customer Management**
   - Add and list customers (simplified for MVP)

## Architecture

```
store-management-desktop/
├── src/main/java/com/store/
│   ├── MainApp.java                    # JavaFX entry point
│   ├── domain/entity/                  # Domain entities
│   │   ├── Product.java
│   │   ├── Customer.java
│   │   ├── Invoice.java
│   │   ├── InvoiceLine.java
│   │   ├── Payment.java
│   │   ├── PaymentRecord.java
│   │   └── PaymentStatus.java
│   ├── application/service/            # Business logic
│   │   ├── ProductService.java
│   │   ├── InvoiceService.java
│   │   ├── PaymentService.java
│   │   └── CustomerService.java
│   ├── infrastructure/persistence/     # Data layer
│   │   ├── HibernateUtil.java
│   │   ├── *Repository.java
│   │   └── DataInitializer.java
│   └── presentation/controller/        # JavaFX controllers
│       ├── MainController.java
│       ├── ProductController.java
│       ├── InvoiceController.java
│       └── CustomerController.java
└── src/main/resources/fxml/            # UI layouts
    ├── main.fxml
    ├── products.fxml
    ├── invoices.fxml
    └── customers.fxml
```

## Class Diagram (UML - Summary)

```
+------------------+       +------------------+       +------------------+
|     Product      |       |     Invoice      |       |     Payment      |
+------------------+       +------------------+       +------------------+
| id: Long         |       | id: Long         |       | id: Long         |
| name: String     |       | customerId: Long |       | invoiceId: Long  |
| barcode: String  |       | totalAmount: BD  |       | amountPaid: BD   |
| quantity: int    |       | date: LocalDate  |       | totalAmount: BD  |
| price: BigDecimal|       | paymentStatus    |       +------------------+
| category: String |       +------------------+       | 1        *       |
+------------------+       | 1        *       |       +------------------+
                           +------------------+       
                           |                  |       
                           v                  v       
                    +------------------+  +------------------+
                    |   InvoiceLine    |  |  PaymentRecord   |
                    +------------------+  +------------------+
                    | productId: Long  |  | date: LocalDate  |
                    | quantity: int    |  | amountPaid: BD   |
                    | price: BigDecimal|  | paymentMethod    |
                    +------------------+  +------------------+
```

## Database Schema (H2)

- **products**: id, name, barcode, quantity, price, price_init, category, date_creating, date_last_modification
- **customers**: id, name, email, phone
- **invoices**: id, customer_id, total_amount, date, payment_status
- **invoice_lines**: id, invoice_id, product_id, quantity, price
- **payments**: id, invoice_id, amount_paid, total_amount
- **payment_records**: id, payment_id, date, amount_paid, payment_method

Data is stored in `./data/store_db` (file-based H2).

## How to Run

### Prerequisites
- Java 17+
- Maven 3.6+

### Build and Run

```bash
cd store-management-desktop
mvn clean javafx:run
```

Or:

```bash
mvn clean compile
mvn exec:java -Dexec.mainClass="com.store.MainApp"
```

### JAR (with dependencies)

```bash
mvn clean package
# Run with: java --module-path <javafx-sdk/lib> --add-modules javafx.controls,javafx.fxml -jar target/store-management-desktop-1.0.0-SNAPSHOT.jar
```

For a standalone JAR including JavaFX, use `jlink` or the Gluon Maven plugin.

## Future Improvements

1. **Purchase Invoices** – Add stock on purchase (mirror Sales logic)
2. **Reports** – Sales summary, low-stock alerts
3. **Barcode Scanner** – Integrate barcode input for products
4. **PDF Export** – Generate invoice PDFs
5. **User Authentication** – Login and roles
6. **Database Migration** – Use Flyway for schema versioning
