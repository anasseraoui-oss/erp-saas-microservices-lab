import React, { useState, useEffect } from 'react';
import { useDarkMode } from "../../../DarkModeProvider";
import styles from "../../../../Css/invoiceOrOrder/InvoiceForm.module.css";
import { ExpiredProduct } from "../../../../classe/Product";

interface ExpiredProductFormProps {
    purchaseLines: Array<{
        productId: number;
        quantity: number;
        price: number;
    }>;
    supplierId: string | number;
    onSave: (expiredProducts: ExpiredProduct[]) => Promise<void>;
    onCancel: () => void;
}

const ExpiredProductForm: React.FC<ExpiredProductFormProps> = ({
                                                                   purchaseLines,
                                                                   supplierId,
                                                                   onSave,
                                                                   onCancel
                                                               }) => {
    // @ts-ignore
    const { isDarkMode } = useDarkMode();
    const [expiredProducts, setExpiredProducts] = useState<ExpiredProduct[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        // Initialize expired products based on purchase lines with correct interface properties
        const initialExpiredProducts = purchaseLines.map((line, index) => ({
            id: 0, // Will be assigned by backend
            productId: line.productId,
            product: { id: line.productId }, // Send minimal product object instead of just number
            expirationDate: '' as string, // Explicitly type as string for form input
            quantityExpired: 0,
            lotNumber: '',
            subBarcode: ''
        }));
        // @ts-ignore
        setExpiredProducts(initialExpiredProducts);
    }, [purchaseLines]);
    const handleExpiredProductChange = (index: number, field: keyof ExpiredProduct, value: any) => {
        setExpiredProducts(prev => prev.map((item, i) =>
            i === index ? { ...item, [field]: value } : item
        ));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Filter out products with no expiry data using correct property names
            const validExpiredProducts = expiredProducts.filter(product =>
                product.expirationDate && product.quantityExpired > 0
            );

            await onSave(validExpiredProducts);
        } catch (error) {
            console.error('Error saving expired products:', error);
            alert('Failed to save expired products data.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const inputClasses = `form-control ${isDarkMode ? styles.inputDark : ''}`;
    const containerClasses = `${styles.container} ${isDarkMode ? styles.darkMode : ''}`;

    return (
        <div className={containerClasses}>
            <div className={styles.modalContent}>
                <h3>Add Expired Products Information</h3>
                <p className="text-muted mb-4">
                    Add expiry information for products that may expire soon or are already expired.
                </p>

                <form onSubmit={handleSubmit}>
                    {expiredProducts.map((expiredProduct, index) => {
                        const purchaseLine = purchaseLines[index];
                        return (
                            <div key={index} className={`${styles.lineItemRow} mb-4 p-3 border rounded`}>
                                <h5 className="mb-3">
                                    Product ID: {purchaseLine.productId}
                                    <small className="text-muted ms-2">
                                        (Purchased Qty: {purchaseLine.quantity})
                                    </small>
                                </h5>

                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Expiry Date:</label>
                                        <input
                                            type="date"
                                            className={inputClasses}
                                            value={typeof expiredProduct.expirationDate === 'string'
                                                ? expiredProduct.expirationDate
                                                : expiredProduct.expirationDate instanceof Date
                                                    ? expiredProduct.expirationDate.toISOString().split('T')[0]
                                                    : ''
                                            }
                                            onChange={(e) => handleExpiredProductChange(index, 'expirationDate', e.target.value)}
                                            min={new Date().toISOString().split('T')[0]}
                                        />
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Expired Quantity:</label>
                                        <input
                                            type="number"
                                            className={inputClasses}
                                            value={expiredProduct.quantityExpired}
                                            onChange={(e) => handleExpiredProductChange(index, 'quantityExpired', parseInt(e.target.value) || 0)}
                                            min="0"
                                            max={purchaseLine.quantity}
                                            placeholder="0"
                                        />
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Lot Number (Optional):</label>
                                        <input
                                            type="text"
                                            className={inputClasses}
                                            value={expiredProduct.lotNumber}
                                            onChange={(e) => handleExpiredProductChange(index, 'lotNumber', e.target.value)}
                                            placeholder="Enter lot number"
                                        />
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Sub Barcode (Optional):</label>
                                        <input
                                            type="text"
                                            className={inputClasses}
                                            value={expiredProduct.subBarcode}
                                            onChange={(e) => handleExpiredProductChange(index, 'subBarcode', e.target.value)}
                                            placeholder="Enter sub barcode"
                                        />
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    <div className={styles.bottomActionsWrapper}>
                        <button
                            type="button"
                            className="btn btn-secondary me-2"
                            onClick={onCancel}
                            disabled={isSubmitting}
                        >
                            Skip
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <i className="fas fa-save me-2"></i>
                                    Save Expired Products
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ExpiredProductForm;