import React, { useState } from 'react';
import { Delivery } from "../../../classe/Delivery";
import styles from '../../../Css/invoiceOrOrder/DeliveryForm.module.css';
import { useDarkMode } from '../../DarkModeProvider';

interface DeliveryFormProps {
    initialData?: Partial<Delivery>;
    onSave: (data: Partial<Delivery>) => void;
}

const formatDateForInput = (date: Date | undefined): string => {
    if (!date) return '';
    return new Date(date).toISOString().split('T')[0];
};

const DeliveryForm = ({ initialData, onSave }: DeliveryFormProps) => {
    // @ts-ignore
    const { isDarkMode } = useDarkMode();
    const [deliveryPrice, setDeliveryPrice] = useState<number>(initialData?.deliveryPrice || 0);
    const [description, setDescription] = useState<string>(initialData?.description || '');
    const [location, setLocation] = useState<string>(initialData?.location || '');
    const [deliveryDateString, setDeliveryDateString] = useState<string>(
        formatDateForInput(initialData?.deliveryDate)
    );

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const deliveryData: Partial<Delivery> = {
            deliveryPrice,
            description,
            location,
            deliveryDate: new Date(deliveryDateString),
        };
        onSave(deliveryData);
    };


    const formClasses = `${styles.formContainer} ${isDarkMode ? styles.dark : ''}`;

    return (
        <form onSubmit={handleSubmit} className={formClasses}>
            <div className={styles.formGroup}>
                <label className={styles.label}>Delivery Price:</label>
                <input
                    type="number"
                    value={deliveryPrice}
                    onChange={(e) => setDeliveryPrice(parseFloat(e.target.value) || 0)}
                    required
                    className={styles.input}
                />
            </div>
            <div className={styles.formGroup}>
                <label className={styles.label}>Description:</label>
                <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    className={styles.input}
                />
            </div>
            <div className={styles.formGroup}>
                <label className={styles.label}>Delivery Date:</label>
                <input
                    type="date"
                    value={deliveryDateString}
                    onChange={(e) => setDeliveryDateString(e.target.value)}
                    required
                    className={styles.input}
                />
            </div>
            <div className={styles.formGroup}>
                <label className={styles.label}>Delivery Location:</label>
                <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                    className={styles.input}
                />
            </div>
            <button type="submit" className={styles.submitButton}>Send Delivery Info</button>
        </form>
    );
};

export default DeliveryForm;