import React from 'react';
import InvoiceForm from "../basec/invoice/InvoiceForm";

const PurchaseInvoiceForm = () => {
    return (
        <div>
            <InvoiceForm serviceType="purchases" orderType="Invoice"/>
        </div>
    );
};

export default PurchaseInvoiceForm;
