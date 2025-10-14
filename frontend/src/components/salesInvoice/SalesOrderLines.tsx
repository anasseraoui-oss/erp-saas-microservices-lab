import LinesPage from "../basec/invoice/LinesPage";
import React from "react";

const SalesOrderLines = () => {
    return (
        <LinesPage ServiceType="sales" OrderType="Order"></LinesPage>
    );
};

export default SalesOrderLines;