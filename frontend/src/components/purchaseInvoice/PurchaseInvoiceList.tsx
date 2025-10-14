import React from 'react';
import InvoiceList from "../basec/invoice/InvoiceOrOrderList";

const PurchaseInvoiceList = () => {
    return (
       <InvoiceList ServiceType="purchases" OrderType="Invoice"></InvoiceList>
    );

};

export default PurchaseInvoiceList;
