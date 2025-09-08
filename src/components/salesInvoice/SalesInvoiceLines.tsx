import React from 'react';
import LinesPage from "../basec/invoice/LinesPage";

const SalesInvoiceLines = () => {
    return (
        <LinesPage ServiceType="sales" OrderType="Invoice"></LinesPage>
    );
};

export default SalesInvoiceLines;