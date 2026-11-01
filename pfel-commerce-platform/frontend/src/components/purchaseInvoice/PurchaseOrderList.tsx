import React from 'react';
import InvoiceList from "../basec/invoice/InvoiceOrOrderList";

const PurchaseOrderList = () => {
    return (
        <InvoiceList ServiceType="purchases" OrderType="Order"></InvoiceList>
    );

};

export default PurchaseOrderList;
