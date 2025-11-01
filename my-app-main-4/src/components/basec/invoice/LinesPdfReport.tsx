import React from 'react';
import styles from '../../../Css/LinesPdfReport.module.css';
import { Item } from "../../../classe/Item";
import { Return } from "../../../classe/Return";

interface LinesPdfReportProps {
    data: (Item | Return)[];
    productNameMap: { [key: number]: string };
    reportTitle: string;
    isReturnMode: boolean;
    idField: keyof Item;
    isInvoiceMode: boolean;
}

const LinesPdfReport: React.FC<LinesPdfReportProps> = ({
   data,
   productNameMap,
   reportTitle,
   isReturnMode,
   idField,
   isInvoiceMode
}) => {
    const generationDate = new Date().toLocaleDateString();

    return (
        <div className={styles.reportContainer}>
            <header className={styles.reportHeader}>
                <h1>{reportTitle}</h1>
                <p>Generated on: {generationDate}</p>
            </header>
            <main>
                <table className={styles.reportTable}>
                    <thead>
                    <tr>
                        <th>ID</th>
                        <th>Product</th>
                        <th>Quantity</th>
                        <th>Price</th>
                        <th>{isInvoiceMode ? 'Invoice' : 'Order'} ID</th>
                        {isReturnMode && (
                            <>
                                <th>Return Date</th>
                                <th>Reason</th>
                            </>
                        )}
                    </tr>
                    </thead>
                    <tbody>
                    {data.length > 0 ? data.map((item: any) => (
                        <tr key={item.id}>
                            <td>{item.id}</td>
                            <td>{productNameMap[item.productId] || `ID: ${item.productId}`}</td>
                            <td>{item.quantity}</td>
                            <td>${item.price.toFixed(2)}</td>
                            <td>{item[idField] || 'N/A'}</td>
                            {isReturnMode && <><td>{item.returnDate ? new Date(item.returnDate).toLocaleDateString() : 'N/A'}</td><td>{item.returnReason || 'N/A'}</td></>}
                        </tr>
                    )) : <tr><td colSpan={isReturnMode ? 7 : 5} className={styles.noData}>No data available for this report.</td></tr>}
                    </tbody>
                </table>
            </main>
        </div>
    );
};

export default LinesPdfReport;