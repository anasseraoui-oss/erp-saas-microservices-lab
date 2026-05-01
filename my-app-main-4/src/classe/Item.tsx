export interface Item {
    id: number;
    productId: number;
    quantity: number;
    price: number;
    salesInvoiceId?: number;
    salesOrderId?: number;
    purchaseInvoiceId?: number;
    purchaseOrderId?: number;
    returnReason?: string;
    returnDate?: string | Date;
}