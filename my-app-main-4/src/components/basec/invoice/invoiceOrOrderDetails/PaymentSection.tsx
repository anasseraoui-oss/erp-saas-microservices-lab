import React, { useEffect, useState } from "react";
import { Invoice } from "../../../../classe/Invoice";
import { Order } from "../../../../classe/Order";
import { ServiceType } from "../../../../api/lineApiService";
import { useDarkMode } from "../../../DarkModeProvider";
import { Payment } from "../../../../classe/Payment";
import { addOrUpdatePayment, getPaymentByServiceTypeAndOrderId } from "../../../../api/payment/paymentService";
import styles from '../../../../Css/invoiceOrOrder/paymentDetails.module.css';
import {OrderType, updateOrderOrInvoice} from "../../../../api/OrderInvoiceService";
import { DataPaidDate } from "../../../../classe/DataPaidDate";
import dataPaidDateService from "../../../../api/payment/dataPaidDateService";
import PaymentModal from "./PaymentModal";
import GenericActionButtons from "../../GenericActionButtons";
import {useTranslation} from "react-i18next";
import partialPaymentService from "../../../../api/payment/partialPaymentService";

const getDueDateStatusClass = (dueDate: string | Date, styles: any): string => {
    const due = new Date(dueDate);
    const today = new Date();
    due.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return styles.statusOverdue;
    if (diffDays === 0) return styles.statusDue;
    if (diffDays <= 14) return styles.statusNear;
    if (diffDays <= 30) return styles.statusApproaching;
    return styles.statusSafe;
};

interface PaymentSectionProps {
    invoiceOrOrder: Invoice | Order;
    ServiceType: ServiceType;
    OrderType: OrderType;
}

const PaymentSection: React.FC<PaymentSectionProps> = ({ invoiceOrOrder, ServiceType, OrderType }) => {
    // @ts-ignore
    const { isDarkMode } = useDarkMode();
    const [payment, setPayment] = useState<Payment | null>(null);
    let [amountPaid, setAmountPaid] = useState<number | string>(0);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedPaymentRecord, setSelectedPaymentRecord] = useState<DataPaidDate | null>(null);
    const [modalMode, setModalMode] = useState<'view' | 'edit'>("view");
    const { t: translate } = useTranslation(); // Renomme 't' en 'translate'
    const fetchPayment = async () => {
        if (!invoiceOrOrder.id) return;
        setIsLoading(true);
        try {
            if (OrderType==="Invoice"){
            const paymentData = await getPaymentByServiceTypeAndOrderId(ServiceType, invoiceOrOrder.id);
            setPayment(paymentData || null);}
        } catch (error) {
            console.error('Failed to fetch payment details:', error);
        } finally {
            setIsLoading(false);
        }
    };
    // Helper function to safely get paid amount from invoice
    const getPaidAmount = (order: Order | Invoice) => {
        if ('soldAmount' in order) {
            return order.paidAmount;
        }
        return null;
    };

    useEffect(() => {
        fetchPayment();
    }, [invoiceOrOrder.id, ServiceType]);

    const openModal = (mode: 'view' | 'edit', data: DataPaidDate) => {
        setSelectedPaymentRecord(data);
        setModalMode(mode);
    };

    const closeModal = () => {
        setSelectedPaymentRecord(null);
    };

    const handleDeleteOld = async (id: number) => {
        if (window.confirm("Are you sure you want to delete this payment record?")) {
            try {
                await dataPaidDateService.delete(id);
                await fetchPayment(); // Refresh payment details
            } catch (error) {
                console.error("Failed to delete payment record:", error);
                alert("Error: Could not delete payment record.");
            }
        }
    };

    const handleDeleteNew = async (paymentRecord: DataPaidDate) => {
        if (window.confirm("This will delete the payment and update the borrowing amount. Are you sure?")) {
            try {
                const supplierClientId = invoiceOrOrder.customer || invoiceOrOrder.supplier;
                if (!supplierClientId) {
                    alert("Error: Customer or supplier information is missing.");
                    return;
                }
                await partialPaymentService.deletePaymentAndUpdateBorrowing(paymentRecord.id, ServiceType, Number(supplierClientId));
                await fetchPayment(); // Refresh payment details
            } catch (error) {
                console.error("Failed to execute new delete process:", error);
                alert("Error: Could not complete the new delete process.");
            }
        }
    };

    const handleSave = async (updatedRecord: DataPaidDate) => {
        try {
            await dataPaidDateService.save(updatedRecord.id, updatedRecord, "update");
            closeModal();
            await fetchPayment();
        } catch (error) {
            console.error("Failed to save payment record:", error);
            alert("Error: Could not save payment record.");
        }
    };

    const handleAddPayment = async () => {
        const numericAmount = parseFloat(String(amountPaid));
        if (isNaN(numericAmount) || numericAmount <= 0) {
            alert("Please enter a valid amount.");
            return;
        }

        try {
            if(OrderType == "Invoice"){
                // Get the supplier/customer ID and validate it exists
                const supplierClientId = invoiceOrOrder.customer || invoiceOrOrder.supplier;

                if (!supplierClientId) {
                    alert("Error: Customer or supplier information is missing.");
                    return;
                }

                await addOrUpdatePayment(
                    ServiceType,
                    invoiceOrOrder.id,
                    numericAmount,
                    invoiceOrOrder.paymentStatus || "DEBUT",
                    "PAID",
                    "CASH_PAYMENT",
                    invoiceOrOrder.totalAmount,
                    Number(supplierClientId), // Explicitly convert to number
                    undefined,
                );
            } else if(OrderType == "Order"){
                if ('orderStatus' in invoiceOrOrder) {
                    const paidAmount = invoiceOrOrder.paidAmount || 0;

                    const totalAmountPaid = numericAmount + paidAmount;

                    await updateOrderOrInvoice(
                        invoiceOrOrder.id,
                        {...invoiceOrOrder, paidAmount: totalAmountPaid},
                        ServiceType,
                        "Order"
                    );
                }
            }
            setAmountPaid('');
            await fetchPayment();
        } catch (error) {
            alert("Failed to process payment.");
            console.error(error);
        }
    };

    const containerClass = `${styles.paymentSectionContainer} ${isDarkMode ? styles.dark : ''}`;

    if (isLoading) {
        return <div className={containerClass}><p className={styles.noPaymentsText}>Loading payment history...</p></div>;
    }

    const totalAmount = OrderType === 'Invoice' ? payment?.totalAmount : invoiceOrOrder.totalAmount;
    const currentAmountPaid = OrderType === 'Invoice' ? payment?.amountPaid : getPaidAmount(invoiceOrOrder);
    const remainingAmount = (totalAmount || 0) - (currentAmountPaid || 0);
    const paymentStatus = invoiceOrOrder.paymentStatus;
    const dueDate = OrderType === 'Invoice' ? payment?.dueDate : undefined;
    const progress = totalAmount && totalAmount > 0 ? ((currentAmountPaid || 0) / totalAmount) * 100 : 0;

    return (
        <div className={containerClass}>
            {OrderType === 'Invoice' && (
                <>
                    <div className={styles.paymentSummary}>
                        <div className={`${styles.summaryCard} ${styles.totalCard}`}>
                            <i className={`fas fa-file-invoice-dollar ${styles.summaryIcon}`}></i>
                            <div className={styles.summaryText}>
                                <span className={styles.summaryLabel}>{translate("order_invoice.total_amount")}</span>
                                <span className={styles.summaryValue}>${(totalAmount || 0).toFixed(2)}</span>
                            </div>
                        </div>
                        <div className={`${styles.summaryCard} ${styles.paidCard}`}>
                            <i className={`fas fa-hand-holding-usd ${styles.summaryIcon}`}></i>
                            <div className={styles.summaryText}>
                                <span className={styles.summaryLabel}>{translate("order_invoice.paid_amount")}</span>
                                <span className={styles.summaryValue}>${(currentAmountPaid || 0).toFixed(2)}</span>
                            </div>
                        </div>
                        <div className={`${styles.summaryCard} ${styles.balanceCard}`}>
                            <i className={`fas fa-balance-scale-right ${styles.summaryIcon}`}></i>
                            <div className={styles.summaryText}>
                                <span className={styles.summaryLabel}>{translate("order_invoice.balance")}</span>
                                <span className={`${styles.summaryValue} ${remainingAmount > 0 ? styles.amountDueValue : ''}`}>
                                    ${remainingAmount.toFixed(2)}
                                </span>
                            </div>
                        </div>
                        <div className={`${styles.summaryCard} ${styles.statusCard}`}>
                            <i className={`fas fa-info-circle ${styles.summaryIcon}`}></i>
                            <div className={styles.summaryText}>
                                <span className={styles.summaryLabel}>{translate("order_invoice.payment_status")}</span>
                                <span className={`${styles.statusBadge} ${styles[`status${paymentStatus}`]}`}>
                                    {paymentStatus ? translate(`order_invoice.${paymentStatus.toLowerCase()}`) : 'N/A'}
                                </span>
                            </div>
                        </div>
                        {dueDate && (
                            <div className={`${styles.summaryCard} ${styles.dueDateCard}`}>
                                <i className={`fas fa-calendar-times ${styles.summaryIcon}`}></i>
                                <div className={styles.summaryText}>
                                    <span className={styles.summaryLabel}>{translate("order_invoice.due_date_placeholder")}</span>
                                    <span className={`${styles.summaryValue} ${getDueDateStatusClass(dueDate, styles)}`}>{new Date(dueDate).toLocaleDateString()}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className={styles.progressBarContainer}>
                        <div className={styles.progressBar} style={{ width: `${progress}%` }}>
                            {progress.toFixed(0)}%
                        </div>
                    </div>
                </>
            )}

            <div className={styles.historyBody}>
                {payment?.paidDates && payment.paidDates.length > 0 && OrderType==="Invoice" ? (
                    <ul className={styles.paymentList}>
                        {payment.paidDates.map((p) => (
                            <li key={p.id} className={styles.paymentItem} onClick={() => openModal('view', p)} title="View Details">
                                <span className={styles.paymentText} >
                                     {translate("order_invoice.paid_on_date", {
                                        amount: `${p.amountPaid.toFixed(2)}`,
                                        date: new Date(p.date).toLocaleDateString()
                                    })}
                                </span>
                                <div onClick={(e) => e.stopPropagation()}>
                                    <GenericActionButtons
                                        actions={[
                                            { label: 'Edit', onClick: () => openModal('edit', p), className: 'btn-primary' },
                                            { label: 'Delete', onClick: () => handleDeleteOld(p.id), className: 'btn-danger' },
                                            { label: 'Delete and Update Borrowing', onClick: () => handleDeleteNew(p), className: 'btn-warning' }
                                        ]}
                                    />
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : OrderType==="Order" ? (
                    <p className={styles.paidAmountValue}>{getPaidAmount(invoiceOrOrder)}</p>
                ) : (
                    <p className={styles.noPaymentsText}>{translate("order_invoice.no_payments_yet")}</p>
                )}
                <div className={styles.addPaymentContainer}>
                    <div className={styles.amountInputWrapper}>
                        <span className={styles.currencySymbol}>$</span>
                        <input
                            type="number"
                            className={styles.amountInput}
                            value={amountPaid}
                            onChange={(e) => setAmountPaid(e.target.value)}
                            placeholder="0"
                        />
                    </div>
                    <button className={styles.addButton} onClick={handleAddPayment}>{translate("order_invoice.add_payment")}</button>
                </div>
            </div>
            {selectedPaymentRecord && payment && (
                <PaymentModal
                    visible={!!selectedPaymentRecord}
                    onClose={closeModal}
                    data={selectedPaymentRecord}
                    mode={modalMode}
                    onSave={handleSave}
                    paymentId={payment.id}
                />
            )}
        </div>
    );
};

export default PaymentSection;