import React from 'react';
import InvoiceList from "../basec/invoice/InvoiceOrOrderList";

const SalesOrderList = () => {
    return (
        <InvoiceList ServiceType="sales" OrderType="Order"></InvoiceList>
    );
};

export default SalesOrderList;