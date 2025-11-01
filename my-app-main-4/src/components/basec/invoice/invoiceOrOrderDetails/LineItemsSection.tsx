// LineItemsSection.tsx
import React, {useEffect, useState} from 'react';
import styles from '../../../../Css/invoiceOrOrder/InvoiceDetails.module.css';
import {OrderType} from "../../../../api/OrderInvoiceService";
import {deleteLine, getLinesByParentId, ServiceType, updateLine} from "../../../../api/lineApiService";
import {useDarkMode} from "../../../DarkModeProvider";
import useLinesActions from "../../../hook/useLinesActions";
import {Item} from "../../../../classe/Item";
import GenericActionButtons from "../../GenericActionButtons";
import {getProductName} from "./InvoiceDetails";

interface LineItemsSectionProps {
    parentId: number;
    ServiceType: ServiceType;
    OrderType: OrderType;
}

const LineItemsSection: React.FC<LineItemsSectionProps> = ({ parentId, ServiceType, OrderType }) => {
    // @ts-ignore
    const { isDarkMode } = useDarkMode(); // Dark mode is now correctly used
    const [items, setItems] = useState<Item[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { moveToReturns } = useLinesActions();
    const [productName, setProductName] = useState<string>("");

    const [productNames, setProductNames] = useState<Record<string | number, string>>({});

    useEffect(() => {
        const fetchLines = async () => {
            setIsLoading(true);
            try {
                const linesData = await getLinesByParentId(parentId, ServiceType, OrderType);
                setItems(linesData || []);

                const names: Record<string | number, string> = {};
                for (const line of linesData) {
                    try {
                        names[line.productId] = await getProductName(line.productId);
                    } catch (e) {
                        console.error(`Failed to fetch product name for ${line.productId}`, e);
                        names[line.productId] = "Unknown Product";
                    }
                }
                setProductNames(names);
            } catch (error) {
                console.error('Failed to fetch line items:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchLines();
    }, [parentId, ServiceType, OrderType]);


    // Handlers are kept inside the component as they manage its local state
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, index: number, field: keyof Item) => {
        const newItems = [...items];
        (newItems[index] as any)[field] = e.target.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value;
        setItems(newItems);
    };

    const handleUpdateItem = async (item: Item) => {
        try {
            await updateLine(item.id, item, ServiceType, "line");
            alert('Item updated successfully!');
        } catch (error) {
            console.error('Error updating item:', error);
            alert('Failed to update item.');
        }
    };

    const handleDeleteItem = async (itemId: number) => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            try {
                await deleteLine(itemId, ServiceType, "line");
                setItems(prev => prev.filter(item => item.id !== itemId));
                alert('Item deleted successfully!');
            } catch (error) {
                console.error('Error deleting item:', error);
                alert('Failed to delete item.');
            }
        }
    };

    if (isLoading) return <div className="p-4 text-center">Loading items...</div>;

    return (
        <div className={styles.tableResponsive}>
            <table className={`${styles.contentTable} ${isDarkMode ? styles.dark : ''}`}>
                <thead>
                <tr>
                    <th>Product ID</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th style={{ width: '220px' }}>Actions</th>
                </tr>
                </thead>
                <tbody>
                {items.map((item, index) => {
                    const actions = [
                        { label: 'Update', onClick: () => handleUpdateItem(item), className: `btn btn-outline-primary btn-sm me-2 ${styles.actionButton}` },
                        { label: 'Return', onClick: () => moveToReturns(item, ServiceType), className: `btn btn-outline-secondary btn-sm me-2 ${styles.actionButton}` },
                        { label: 'Delete', onClick: () => handleDeleteItem(item.id), className: `btn btn-outline-danger btn-sm ${styles.actionButton}` },
                    ];
                    return (
                        <tr key={item.id || index} className={styles.tableRow}>
                            {/* FIXED: Dark mode classes added to inputs */}
                            <td className={styles.tableCell}><input type="text" className={`${styles.readOnlyInput} ${isDarkMode ? 'bg-dark text-white border-secondary' : ''}`} value={item.productId + ": " + (productNames[item.productId] || "Loading...")} readOnly /></td>
                            <td className={styles.tableCell}><input type="number" className={`${styles.inputField} ${isDarkMode ? 'bg-dark text-white border-secondary' : ''}`} value={item.quantity} onChange={(e) => handleInputChange(e, index, 'quantity')} /></td>
                            <td className={styles.tableCell}><input type="number" className={`${styles.inputField} ${isDarkMode ? 'bg-dark text-white border-secondary' : ''}`} value={item.price} onChange={(e) => handleInputChange(e, index, 'price')} /></td>
                            <td className={`${styles.tableCell} ${styles.actionsContainer}`}><GenericActionButtons actions={actions} /></td>
                        </tr>
                    );
                })}
                </tbody>
            </table>
        </div>
    );
};

export default LineItemsSection;