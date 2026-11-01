import {Invoice} from "./Invoice";
import {Delivery} from "./Delivery";

export interface Order extends Invoice{
    orderStatus:string;
    delivery:Delivery;
    soldAmount:number;
    paidAmount:number;
}