import React, { useState, useEffect } from "react";
import { DataPaidDate } from "../../../../classe/DataPaidDate";
import { useDarkMode } from "../../../DarkModeProvider";
import styles from '../../../../Css/invoiceOrOrder/paymentDetails.module.css';
import {getUserName} from "../../../../axiosBasec/storagByUser";
import {useTranslation} from "react-i18next";

interface Props {
    visible: boolean;
    onClose: () => void;
    onSave?: (updated: DataPaidDate) => void;
    data: DataPaidDate;
    mode: 'view' | 'edit';
    paymentId: number;
}

const PaymentModal: React.FC<Props> = ({ visible, onClose, data, mode, onSave, paymentId }) => {
    const [editableData, setEditableData] = useState<DataPaidDate>(data);
    const [userCreatorName, setUserCreatorName] = useState<string>('Loading...');
    const [userExecutorName, setUserExecutorName] = useState<string>('Loading...');

    // @ts-ignore
    const { isDarkMode } = useDarkMode();
    const { t: translate } = useTranslation(); // Renomme 't' en 'translate'
    useEffect(() => {
        setEditableData(data);
    }, [data]);

    // Fetch user creator name when component mounts or data changes
    useEffect(() => {
        const fetchUserName = async () => {
            try {
                const rC = await getUserName(data.userCreator);
                const nameC = rC.data.name;
                setUserCreatorName(nameC);
                const rE = await getUserName(data.userExecutor);
                const nameE = rE.data.name;
                setUserExecutorName(nameE);
            } catch (error) {
                console.error('Error fetching user name:', error);
                setUserCreatorName('Unknown User');
            }
        };

        if (data.userCreator || data.userExecutor) {
            fetchUserName();
        }
    }, [data.userCreator ,data.userExecutor]);

    if (!visible) return null;

    const isEdit = mode === 'edit';

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setEditableData(prev => ({ ...prev, [name]: value as any }));
    };

    const handleSave = () => {
        if (!onSave || !paymentId) return;
        const finalData = { ...editableData, paymentId: paymentId };
        onSave(finalData);
    };

    // Properly combine classes for dark mode
    const modalContainerClasses = [
        styles.modalContainer,
        isDarkMode ? styles.dark : ''
    ].filter(Boolean).join(' ');

    const modalHeaderClasses = [
        styles.modalHeader,
        isDarkMode ? styles.dark : ''
    ].filter(Boolean).join(' ');

    const modalBodyClasses = [
        styles.modalBody,
        isDarkMode ? styles.dark : ''
    ].filter(Boolean).join(' ');

    const modalTitleClasses = [
        styles.modalTitle,
        isDarkMode ? styles.dark : ''
    ].filter(Boolean).join(' ');

    const closeButtonClasses = [
        styles.closeButton,
        isDarkMode ? styles.dark : ''
    ].filter(Boolean).join(' ');

    const modalFooterClasses = [
        styles.modalFooter,
        isDarkMode ? styles.dark : ''
    ].filter(Boolean).join(' ');

    const formLabelClasses = [
        styles.formLabel,
        isDarkMode ? styles.dark : ''
    ].filter(Boolean).join(' ');

    const formSelectClasses = [
        styles.formSelect,
        isDarkMode ? styles.dark : ''
    ].filter(Boolean).join(' ');

    const formValueClasses = [
        styles.formValue,
        isDarkMode ? styles.dark : ''
    ].filter(Boolean).join(' ');

    const btnSecondaryClasses = [
        styles.btn,
        styles.btnSecondary,
        isDarkMode ? styles.dark : ''
    ].filter(Boolean).join(' ');

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={modalContainerClasses} onClick={(e) => e.stopPropagation()}>
                <div className={modalHeaderClasses}>
                    <h5 className={modalTitleClasses}>
                        {isEdit ? translate("edit_payment_info") : translate("view_payment_info")}
                    </h5>
                    <button
                        type="button"
                        className={closeButtonClasses}
                        onClick={onClose}
                    >
                        ×
                    </button>
                </div>

                <div className={modalBodyClasses}>
                    <label className={formLabelClasses}>User Creator</label>
                    <p className={formLabelClasses}>{userCreatorName}</p>
                    <label className={formLabelClasses}>User Executor</label>
                    <p className={formLabelClasses}>{userExecutorName}</p>
                    {/* Status Row */}
                    <div className={styles.formRow}>
                        <label className={formLabelClasses}>Status</label>
                        {isEdit ? (
                            <select
                                name="status"
                                value={editableData.status}
                                className={formSelectClasses}
                                onChange={handleChange}
                            >
                                <option value="DEBUT">DEBUT</option>
                                <option value="DANS">DANS</option>
                                <option value="FIN">FIN</option>
                            </select>
                        ) : (
                            <p className={formValueClasses}>{data.status}</p>
                        )}
                    </div>

                    {/* Schedule Status Row */}
                    <div className={styles.formRow}>
                        <label className={formLabelClasses}>Schedule Status</label>
                        {isEdit ? (
                            <select
                                name="paymentScheduleStatus"
                                value={editableData.paymentScheduleStatus}
                                className={formSelectClasses}
                                onChange={handleChange}
                            >
                                <option value="PAID">PAID</option>
                                <option value="SCHEDULED">SCHEDULED</option>
                                <option value="FAILED">FAILED</option>
                                <option value="OVERDUE">OVERDUE</option>
                            </select>
                        ) : (
                            <p className={formValueClasses}>{data.paymentScheduleStatus}</p>
                        )}
                    </div>

                    {/* Payment Method Row */}
                    <div className={styles.formRow}>
                        <label className={formLabelClasses}>Payment Method</label>
                        {isEdit ? (
                            <select
                                name="methodePayment"
                                value={editableData.methodePayment}
                                className={formSelectClasses}
                                onChange={handleChange}
                            >
                                <option value="CASH_PAYMENT">Cash</option>
                                <option value="BANK_TRANSFER">Bank Transfer</option>
                                <option value="PAYPAL_PAYMENT">PayPal</option>
                                <option value="CREDIT_CARD_PAYMENT">Credit Card</option>
                                <option value="POST_PAID">Post Paid</option>
                            </select>
                        ) : (
                            <p className={formValueClasses}>{data.methodePayment}</p>
                        )}
                    </div>
                </div>

                <div className={modalFooterClasses}>
                    <button
                        className={btnSecondaryClasses}
                        onClick={onClose}
                    >
                        Close
                    </button>
                    {isEdit && (
                        <button
                            className={`${styles.btn} ${styles.btnSuccess}`}
                            onClick={handleSave}
                        >
                            Save Changes
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PaymentModal;