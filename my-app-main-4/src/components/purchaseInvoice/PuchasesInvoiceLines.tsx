import React from 'react';
import LinesPage from "../basec/invoice/LinesPage"; // تعديل هنا

const PuchasesInvoiceLines = () => {
    return (
        <LinesPage ServiceType="purchases" OrderType='Invoice'></LinesPage>
    );
};

export default PuchasesInvoiceLines;