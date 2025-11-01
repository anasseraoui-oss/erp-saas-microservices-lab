// PaymentDetailsModal.tsx - Optimized Version
import React, { useState, useEffect } from 'react';
import { Payment } from "../../../classe/Payment";
import { DataPaidDate } from "../../../classe/DataPaidDate";
import styles from "../../../Css/invoiceOrOrder/InvoiceForm.module.css";
import { useDarkMode } from "../../DarkModeProvider";

interface PaymentDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialData: Partial<Payment>;
    onSave: (data: Partial<Payment>) => void;
}

// @ts-ignore
const PaymentDetailsModal: React.FC<PaymentDetailsModalProps> = ({
                                                                     isOpen,
                                                                     onClose,
                                                                     initialData,
                                                                     onSave
                                                                 }) => {
    // @ts-ignore
    const { isDarkMode } = useDarkMode();
    const [dueDate, setDueDate] = useState<Date | string | undefined>(initialData.dueDate);
    const [paidDates, setPaidDates] = useState<Partial<DataPaidDate>[]>(initialData.paidDates || []);

    useEffect(() => {
        setDueDate(initialData.dueDate);
        setPaidDates(initialData.paidDates || []);
    }, [initialData]);

    if (!isOpen) return null;

    const handleAddPaidDate = () => {
        setPaidDates([...paidDates, {
            date: new Date().toISOString().split('T')[0],
            amountPaid: 0,
            methodePayment: 'CASH_PAYMENT',
            paymentScheduleStatus: 'SCHEDULED'
        }]);
    };

    const handlePaidDateChange = (index: number, field: keyof DataPaidDate, value: any) => {
        const newPaidDates = [...paidDates];
        (newPaidDates[index] as any)[field] = value;
        setPaidDates(newPaidDates);
    };

    // @ts-ignore
    const handleRemovePaidDate = (index: number) => {
        const newPaidDates = paidDates.filter((_, i) => i !== index);
        setPaidDates(newPaidDates);
    };

    // OPTIMIZED: Send only necessary data to backend
    const handleSave = () => {
        // Filter and validate paidDates - only include complete entries
        const completePaidDates = paidDates.filter(pd =>
            pd.date &&
            pd.amountPaid !== undefined &&
            pd.amountPaid > 0 &&
            pd.methodePayment &&
            pd.paymentScheduleStatus
        ) as DataPaidDate[];

        // Create optimized payload - only send what's needed
        const paymentData: Partial<Payment> = {
            supplierClientId: 0
        };

        // Only include dueDate if it's set and valid
        if (dueDate && dueDate !== '') {
            paymentData.dueDate = new Date(dueDate);
        }

        // Only include paidDates if there are valid entries
        if (completePaidDates.length > 0) {
            paymentData.paidDates = completePaidDates;
        }

        // Don't send empty object
        if (paymentData.dueDate || (paymentData.paidDates && paymentData.paidDates.length > 0)) {
            onSave(paymentData);
        } else {
            // If no meaningful data, just close modal
            console.log("No payment details to save");
        }

        onClose();
    };

    const inputClasses = `form-control ${isDarkMode ? styles.inputDark : ''}`;
    const selectClasses = `form-select ${isDarkMode ? styles.inputDark : ''}`;

    return (
        <div className={styles.modalBackdrop} onClick={onClose}>
            <div className={`${styles.modalContent} ${isDarkMode ? styles.darkMode : ''}`} onClick={(e) => e.stopPropagation()}>
                <button className={styles.closeBtn} onClick={onClose}>×</button>
                <h3>Payment Details</h3>

                <div className="mb-3">
                    <label className="form-label">Due Date (آخر أجل للدفع)</label>
                    <input
                        type="date"
                        className={inputClasses}
                        value={dueDate ? new Date(dueDate).toISOString().split('T')[0] : ''}
                        onChange={(e) => setDueDate(e.target.value || undefined)}
                    />
                    <small className="text-muted">Leave empty if no specific due date</small>
                </div>

                <hr/>

                <h4 className={styles.sectionTitle}>Partial Payments (الدفعات الجزئية)</h4>
                {paidDates.map((pd, index) => (
                    <div key={index} className={`${styles.lineItemRow} mb-3`}>
                        <input
                            type="date"
                            className={inputClasses}
                            value={pd.date || ''}
                            onChange={e => handlePaidDateChange(index, 'date', e.target.value)}
                            required
                        />
                        <input
                            type="number"
                            placeholder="Amount (required)"
                            className={inputClasses}
                            value={pd.amountPaid || ''}
                            onChange={e => handlePaidDateChange(index, 'amountPaid', parseFloat(e.target.value) || 0)}
                            min="0.01"
                            step="0.01"
                            required
                        />
                        <select
                            className={selectClasses}
                            value={pd.methodePayment || 'CASH_PAYMENT'}
                            onChange={e => handlePaidDateChange(index, 'methodePayment', e.target.value)}
                        >
                            <option value="CASH_PAYMENT">Cash</option>
                            <option value="BANK_TRANSFER">Bank Transfer</option>
                            <option value="CREDIT_CARD_PAYMENT">Credit Card</option>
                        </select>
                        <select
                            className={selectClasses}
                            value={pd.paymentScheduleStatus || 'SCHEDULED'}
                            onChange={e => handlePaidDateChange(index, 'paymentScheduleStatus', e.target.value)}
                        >
                            <option value="PAID">Paid</option>
                            <option value="SCHEDULED">Scheduled</option>
                            <option value="FAILED">Failed</option>
                            <option value="OVERDUE">Overdue</option>
                        </select>
                        <button
                            type="button"
                            className="btn btn-outline-danger"
                            onClick={() => handleRemovePaidDate(index)}
                        >
                            <i className="fas fa-trash"></i>
                        </button>
                    </div>
                ))}

                <button type="button" className="btn btn-secondary mb-3" onClick={handleAddPaidDate}>
                    <i className="fas fa-plus"></i> Add Partial Payment
                </button>

                <div className={styles.bottomActionsWrapper}>
                    <button type="button" className="btn btn-primary" onClick={handleSave}>
                        Save Details
                    </button>
                    <button type="button" className="btn btn-secondary" onClick={onClose}>
                        Cancel
                    </button>
                </div>

                {/* Show preview of what will be saved */}
                {(dueDate || paidDates.some(pd => pd.amountPaid && pd.amountPaid > 0)) && (
                    <div className="mt-3 p-2 bg-light rounded">
                        <small className="text-muted">
                            <strong>Will save:</strong>
                            {dueDate && <span> Due Date: {new Date(dueDate).toLocaleDateString()}</span>}
                            {paidDates.filter(pd => pd.amountPaid && pd.amountPaid > 0).length > 0 &&
                                <span> | {paidDates.filter(pd => pd.amountPaid && pd.amountPaid > 0).length} payment(s)</span>
                            }
                        </small>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentDetailsModal;