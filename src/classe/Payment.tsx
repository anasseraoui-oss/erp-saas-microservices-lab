import {OrderType} from "../api/OrderInvoiceService";
import {DataPaidDate} from "./DataPaidDate";

export interface Payment{
    id:number;
    OrderId:number;
    orderType:OrderType
    amountPaid:number;
    totalAmount:number;
    supplierClientId:number;
    paidDates:Array<DataPaidDate>;
    dueDate:Date;
}