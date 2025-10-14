export interface ClientSupplier{
    id:number;
    name:string;
    email:string;
    phoneNumber:string;
    userCreator:string | number;
    userExecutor: string | number;
    borrowingPricePurchase: number;
    borrowingPriceSales: number;
    totalePurchase: number;
    totalSales: number;
    description : string;
    category: string;
    createdAt:string;
    updatedAt:string;
    customerCreditCap?:number;
}
//aPH*uZmcsNZ2PBw