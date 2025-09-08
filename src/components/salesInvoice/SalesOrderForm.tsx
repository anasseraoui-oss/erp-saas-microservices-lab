import React from 'react';
import InvoiceForm from "../basec/invoice/InvoiceForm";


const SalesOrderForm = () => {
    return (
        <InvoiceForm serviceType="sales" orderType="Order" />
    );
};

export default SalesOrderForm;
