import {Item} from "./Item";

export interface Return extends Item{
    returnDate: string;
    returnReason: string;
}