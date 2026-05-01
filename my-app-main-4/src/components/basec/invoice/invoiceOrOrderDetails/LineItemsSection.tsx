// LineItemsSection.tsx
import React, { useEffect, useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import styles from '../../../../Css/invoiceOrOrder/InvoiceDetails.module.css';
import { OrderType } from "../../../../api/OrderInvoiceService";
import { deleteLine, getLinesByParentId, ServiceType, updateLine } from "../../../../api/lineApiService";
import { useDarkMode } from "../../../DarkModeProvider";
import useLinesActions from "../../../hook/useLinesActions";
import { Item } from "../../../../classe/Item";
import GenericActionButtons from "../../GenericActionButtons";
import { getProductName } from "./InvoiceDetails";

// Icon Helper to solve TS JSX errors
const Icon: React.FC<{ as: any; className?: string; size?: number }> = ({ as, ...props }) => {
    const IconComponent = as as React.ElementType;
    return <IconComponent {...props} />;
};

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
    const { moveToReturns, updateLineOrReturn } = useLinesActions();
    const [productName, setProductName] = useState<string>("");

    const [productNames, setProductNames] = useState<Record<string | number, string>>({});

    // Return Modal State
    const [showReturnModal, setShowReturnModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState<Item | null>(null);
    const [returnQuantity, setReturnQuantity] = useState<number>(0);
    const [returnReason, setReturnReason] = useState<string>("");
    const [isSubmittingReturn, setIsSubmittingReturn] = useState(false);

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
            await updateLineOrReturn(item.id, item, "line", ServiceType, OrderType);
            alert('Item updated successfully!');
        } catch (error) {
            console.error('Error updating item:', error);
            alert('Failed to update item.');
        }
    };

    const handleDeleteItem = async (itemId: number) => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            try {
                await deleteLine(itemId, ServiceType, "line", OrderType);
                setItems(prev => prev.filter(item => item.id !== itemId));
                alert('Item deleted successfully!');
            } catch (error) {
                console.error('Error deleting item:', error);
                alert('Failed to delete item.');
            }
        }
    };
    const handleOpenReturnModal = (item: Item) => {
        setSelectedItem(item);
        setReturnQuantity(item.quantity);
        setReturnReason("");
        setShowReturnModal(true);
    };

    const handleConfirmReturn = async () => {
        if (!selectedItem) return;
        if (returnQuantity <= 0 || returnQuantity > selectedItem.quantity) {
            alert(`Please enter a valid quantity (1 - ${selectedItem.quantity})`);
            return;
        }
        if (!returnReason.trim()) {
            alert("Please provide a reason for the return.");
            return;
        }

        setIsSubmittingReturn(true);
        try {
            await moveToReturns(selectedItem, returnQuantity, returnReason, ServiceType, OrderType);
            alert('Item return initiated successfully!');
            setShowReturnModal(false);
            // Optionally refresh items if the backend logic modifies the original line
        } catch (error) {
            console.error('Error initiating return:', error);
            alert('Failed to initiate return.');
        } finally {
            setIsSubmittingReturn(false);
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
                            { label: 'Return', onClick: () => handleOpenReturnModal(item), className: `btn btn-outline-secondary btn-sm me-2 ${styles.actionButton}` },
                            { label: 'Delete', onClick: () => handleDeleteItem(item.id), className: `btn btn-outline-danger btn-sm ${styles.actionButton}` },
                        ];
                        return (
                            <tr key={item.id || index} className={styles.tableRow}>
                                <td className={styles.tableCell}><input type="text" className={styles.readOnlyInput} value={item.productId + ": " + (productNames[item.productId] || "Loading...")} readOnly /></td>
                                <td className={styles.tableCell}><input type="number" className={styles.inputField} value={item.quantity} onChange={(e) => handleInputChange(e, index, 'quantity')} /></td>
                                <td className={styles.tableCell}><input type="number" className={styles.inputField} value={item.price} onChange={(e) => handleInputChange(e, index, 'price')} /></td>
                                <td className={`${styles.tableCell} ${styles.actionsContainer}`}><GenericActionButtons actions={actions} /></td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            {/* Return Modal */}
            {showReturnModal && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'hsla(var(--background), 0.8)', backdropFilter: 'blur(8px)', zIndex: 1060 }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className={`${styles.modalContainer} border-primary/20`} style={{ borderRadius: '24px', overflow: 'hidden', backgroundColor: 'hsl(var(--card))' }}>
                            <div className="modal-header border-bottom-0 pt-6 px-8 flex justify-between items-center">
                                <h5 className={`${styles.modalTitle} text-xl`}>Return Item</h5>
                                <button type="button" className={`${styles.closeButton}`} onClick={() => setShowReturnModal(false)}>
                                    <Icon as={FaTimes} />
                                </button>
                            </div>
                            <div className="modal-body px-8 pb-6 space-y-4">
                                <div>
                                    <label className={styles.label}>Product</label>
                                    <input type="text" className={styles.readOnlyInput}
                                        value={selectedItem ? (productNames[selectedItem.productId] || selectedItem.productId) : ""} readOnly />
                                </div>
                                <div>
                                    <label className={styles.label}>Return Quantity (Max: {selectedItem?.quantity})</label>
                                    <input type="number" className={styles.inputField}
                                        value={returnQuantity} onChange={(e) => setReturnQuantity(parseInt(e.target.value) || 0)} min="1" max={selectedItem?.quantity} />
                                </div>
                                <div>
                                    <label className={styles.label}>Reason for Return</label>
                                    <textarea className={`${styles.inputField} min-h-[100px]`}
                                        value={returnReason} onChange={(e) => setReturnReason(e.target.value)} placeholder="Enter reason here..."></textarea>
                                </div>
                            </div>
                            <div className="modal-footer border-top-0 px-8 pb-8 flex gap-3">
                                <button type="button" className="flex-1 py-3 rounded-xl border border-border font-bold text-xs uppercase tracking-widest hover:bg-muted/50 transition-all" onClick={() => setShowReturnModal(false)} disabled={isSubmittingReturn}>Cancel</button>
                                <button type="button" className="flex-1 py-3 rounded-xl bg-primary text-white font-bold text-xs uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg shadow-primary/20" onClick={handleConfirmReturn} disabled={isSubmittingReturn}>
                                    {isSubmittingReturn ? 'Processing...' : 'Confirm Return'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LineItemsSection;