// ReturnItemsSection.tsx
import React, { useEffect, useState } from 'react';
import styles from '../../../../Css/invoiceOrOrder/InvoiceDetails.module.css';
import { OrderType } from "../../../../api/OrderInvoiceService";
import { getAllLines, ServiceType } from "../../../../api/lineApiService";
import { useDarkMode } from "../../../DarkModeProvider";
import { Item } from "../../../../classe/Item";
import { getProductName } from "./InvoiceDetails";

interface ReturnItemsSectionProps {
    parentId: number;
    ServiceType: ServiceType;
    OrderType: OrderType;
}

const ReturnItemsSection: React.FC<ReturnItemsSectionProps> = ({ parentId, ServiceType, OrderType }) => {
    // @ts-ignore
    const { isDarkMode } = useDarkMode();
    const [returnItems, setReturnItems] = useState<Item[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [productNames, setProductNames] = useState<Record<string | number, string>>({});

    useEffect(() => {
        const fetchReturnLines = async () => {
            setIsLoading(true);
            try {
                // Fetch ALL returns for this context (Order/Invoice in Sales/Purchases)
                // Since there's no specific parent-fetch for returns, we filter locally
                const allReturns = await getAllLines(ServiceType, "lineReturn", OrderType);

                // Filter returns by parentId
                const filteredReturns = allReturns.filter((item: any) => {
                    if (ServiceType === "sales") {
                        return OrderType === "Order" ? item.salesOrderId === parentId : item.salesInvoiceId === parentId;
                    } else {
                        return OrderType === "Order" ? item.purchaseOrderId === parentId : item.purchaseInvoiceId === parentId;
                    }
                });

                setReturnItems(filteredReturns);

                // Fetch product names for returns
                const names: Record<string | number, string> = {};
                for (const line of filteredReturns) {
                    if (!names[line.productId]) {
                        try {
                            names[line.productId] = await getProductName(line.productId);
                        } catch (e) {
                            names[line.productId] = "Unknown Product";
                        }
                    }
                }
                setProductNames(names);
            } catch (error) {
                console.error('Failed to fetch return items:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchReturnLines();
    }, [parentId, ServiceType, OrderType]);

    if (isLoading) return <div className="p-4 text-center">Loading returned items...</div>;
    if (returnItems.length === 0) return <div className="p-4 text-center text-secondary">No items have been returned for this {OrderType.toLowerCase()}.</div>;

    return (
        <div className={styles.tableResponsive}>
            <table className={`${styles.contentTable} ${isDarkMode ? styles.dark : ''}`}>
                <thead>
                    <tr>
                        <th>Product</th>
                        <th>Qty Returned</th>
                        <th>Price</th>
                        <th>Reason</th>
                        <th>Date</th>
                    </tr>
                </thead>
                <tbody>
                    {returnItems.map((item, index) => (
                        <tr key={item.id || index} className={styles.tableRow}>
                            <td className={styles.tableCell}>
                                <div className="fw-bold text-indigo-500">
                                    {productNames[item.productId] || "Loading..."}
                                </div>
                                <small className="text-secondary">ID: {item.productId}</small>
                            </td>
                            <td className={styles.tableCell}>{item.quantity}</td>
                            <td className={styles.tableCell}>${item.price.toFixed(2)}</td>
                            <td className={styles.tableCell}>
                                <div className="text-wrap" style={{ maxWidth: '200px' }}>
                                    {item.returnReason || "No reason provided"}
                                </div>
                            </td>
                            <td className={styles.tableCell}>
                                <small className="text-secondary">
                                    {item.returnDate ? new Date(item.returnDate).toLocaleDateString() : 'N/A'}
                                </small>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ReturnItemsSection;
