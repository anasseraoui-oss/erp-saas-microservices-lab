import {ServiceType} from "../api/OrderInvoiceService";
import {DataPaidDate} from "./DataPaidDate";

export interface Payment{
    id:number;
    orderId:number;
    orderType:ServiceType;
    amountPaid:number;
    totalAmount:number;
    supplierClientId:number;
    paidDates:Array<DataPaidDate>;
    dueDate:Date;
}