export interface DataPaidDate{
    id:number
    date:string;
    amountPaid:number;
    status:"DEBUT"|"DANS"|"FIN";
    paymentScheduleStatus:"PAID" | "SCHEDULED" | "FAILED" | "OVERDUE";
    methodePayment:"CASH_PAYMENT" | "BANK_TRANSFER" | "PAYPAL_PAYMENT" | "CREDIT_CARD_PAYMENT" | "POST_PAID";
    paymentId:number;
    userCreator:number
    userExecutor:number
}
