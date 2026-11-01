# Store Management Desktop - Architecture

## 1. Architecture Diagram (High-Level)

```
┌─────────────────────────────────────────────────────────────────────┐
│                        PRESENTATION LAYER                             │
│  (JavaFX Controllers + FXML)                                          │
│  MainController | ProductController | InvoiceController | CustomerController │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        APPLICATION LAYER                              │
│  (Business Logic - Services)                                          │
│  ProductService | InvoiceService | PaymentService | CustomerService   │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    INFRASTRUCTURE LAYER                               │
│  Repositories (Product, Invoice, Payment, Customer)                   │
│  HibernateUtil | H2 Database                                          │
└─────────────────────────────────────────────────────────────────────┘
```

## 2. Flow: Create Invoice

1. User selects products and quantities in InvoiceController
2. InvoiceController calls InvoiceService.createInvoice(...)
3. InvoiceService:
   - Creates Invoice + InvoiceLine entities
   - For each line: ProductService.reduceStock(productId, quantity)
   - Computes total
   - Saves Invoice
   - Creates Payment record (amountPaid=0 if UNPAID)

## 3. Flow: Register Payment

1. User selects invoice and enters amount in InvoiceController
2. InvoiceController calls PaymentService.registerPayment(invoiceId, amount)
3. PaymentService:
   - Finds or creates Payment for invoice
   - Adds PaymentRecord
   - Updates amountPaid
   - Computes new PaymentStatus (PAID/PARTPAID/UNPAID)
   - Updates Invoice.paymentStatus
