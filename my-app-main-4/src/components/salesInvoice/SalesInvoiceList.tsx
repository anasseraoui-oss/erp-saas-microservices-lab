import React from 'react';
import InvoiceList from "../basec/invoice/InvoiceOrOrderList";

const SalesInvoiceList = () => {
    return (
       <InvoiceList ServiceType="sales" OrderType="Invoice"></InvoiceList>
    );
};

export default SalesInvoiceList;