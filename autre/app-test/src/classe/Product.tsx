export interface Product {
    id: number;
    name: string;
    barcode: string; // This is used as barcode in your current setup
    quantity: number;
    price: number;
    priceInit?: number; // Make it optional if not always present
    image?: string;     // Optional
    category?: string;  // Optional
    dateCreating?: string | Date; // Optional
    dateLastModification?: string | Date; // Optional
    userCreator?: string| number;
    userExecutor?: string | number;
    QuantityAlmostDepleted? : string | number;
}
export interface ExpiredProduct {
    id: number;
    lotNumber: string;
    expirationDate: Date | string;
    quantityExpired: number | 0;
    subBarcode: string;
    product:  Product | number;
    productId: number;
}