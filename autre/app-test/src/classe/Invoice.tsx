
import {Order} from "./Order";

export interface Invoice {
    id: number;
    customer?: string;
    supplier?: string;
    userExecutor:string|number;
    userCreator:string|number;
    totalAmount: number;
    paymentStatus:"UNPAID"|"PARTPAID"|"PAID";
    date: string;
    order: Order;
    items: Array<{ productId: number; quantity: number ; price : number}>;
    returns: Array<{productId: number; quantity: number ; price : number; returnDate:Date; returnReason:string}>
}