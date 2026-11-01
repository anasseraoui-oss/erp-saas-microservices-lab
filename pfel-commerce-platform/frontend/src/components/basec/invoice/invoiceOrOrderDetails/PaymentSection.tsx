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
            const paymentData = await getPaymentByServiceTypeAndOrderId(ServiceType, invoiceOrOrder.id);
            setPayment(paymentData || null);
        } catch (error) {
            console.error('Failed to fetch payment details:', error);
        } finally {
            setIsLoading(false);
        }
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

    const handleDelete = async (id: number) => {
        if (window.confirm("Are you sure you want to delete this payment record?")) {
            try {
                await dataPaidDateService.delete(id);
                await fetchPayment();
            } catch (error) {
                console.error("Failed to delete payment record:", error);
                alert("Error: Could not delete payment record.");
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
                const paidAmount = invoiceOrOrder.order.paidAmount;
                const totalAmountPaid = numericAmount + paidAmount;

                await updateOrderOrInvoice(
                    invoiceOrOrder.id,
                    {...invoiceOrOrder, paidAmount: totalAmountPaid},
                    ServiceType,
                    "Order"
                );
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

    return (
        <div className={containerClass}>
            <div className={styles.historyBody}>
                {payment?.paidDates && payment.paidDates.length > 0 ? (
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
                                            { label: 'Delete', onClick: () => handleDelete(p.id), className: 'btn-danger' },
                                        ]}
                                    />
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className={styles.noPaymentsText}>No payments made yet</p>
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
                    <button className={styles.addButton} onClick={handleAddPayment}>
                        Add Payment
                    </button>
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