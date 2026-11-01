# UML Class Diagram

## Domain Model

```
                    <<enumeration>>
                    PaymentStatus
                    ─────────────
                    PAID
                    PARTPAID
                    UNPAID

┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│    Product      │         │    Invoice      │         │    Payment      │
├─────────────────┤         ├─────────────────┤         ├─────────────────┤
│ - id: Long      │         │ - id: Long      │         │ - id: Long      │
│ - name: String  │         │ - customerId    │         │ - invoiceId     │
│ - barcode       │         │ - totalAmount   │         │ - amountPaid    │
│ - quantity: int │         │ - date          │         │ - totalAmount   │
│ - price         │         │ - paymentStatus │         └────────┬────────┘
│ - category      │         └────────┬────────┘                  │
└─────────────────┘                  │                           │
        △                            │ 1                         │ *
        │                            │                           │
        │ productId                  │ *                         │
        │                            ▼                           ▼
        │                   ┌─────────────────┐         ┌─────────────────┐
        │                   │  InvoiceLine    │         │ PaymentRecord   │
        └───────────────────│ - productId    │         │ - date          │
                            │ - quantity     │         │ - amountPaid    │
                            │ - price        │         │ - paymentMethod │
                            └─────────────────┘         └─────────────────┘

┌─────────────────┐
│    Customer     │
├─────────────────┤
│ - id: Long      │
│ - name: String  │
│ - email         │
│ - phone         │
└─────────────────┘
```
