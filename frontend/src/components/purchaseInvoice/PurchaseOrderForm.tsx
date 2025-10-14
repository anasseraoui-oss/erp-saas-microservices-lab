import React from 'react';
import InvoiceForm from "../basec/invoice/InvoiceForm";

const PurchaseOrderForm = () => {
    return (
        <div>
            <InvoiceForm serviceType="purchases" orderType="Order"/>
        </div>
    );
};

export default PurchaseOrderForm;
;
