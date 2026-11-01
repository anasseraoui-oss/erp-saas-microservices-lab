import React from 'react';
import InvoiceForm from "../basec/invoice/InvoiceForm";


const SalesInvoiceForm = () => {
    return (
            <InvoiceForm serviceType="sales" orderType="Invoice" />
    );
};

export default SalesInvoiceForm;
