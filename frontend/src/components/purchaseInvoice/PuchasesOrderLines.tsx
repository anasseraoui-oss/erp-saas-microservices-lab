import LinesPage from "../basec/invoice/LinesPage";
import React from "react";

const PuchasesOrderLines = () => {
    return (
        <LinesPage ServiceType="purchases" OrderType='Order'></LinesPage>
    );
};

export default PuchasesOrderLines;