import React, { useState } from 'react';
import { Delivery } from "../../../classe/Delivery";
import { useDarkMode } from '../../DarkModeProvider';
import { useTranslation } from "react-i18next";

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
    const { t } = useTranslation('order_invoice');
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

    const inputClasses = `form-control ${isDarkMode ? 'input-dark-theme' : ''}`;

    return (
        <form onSubmit={handleSubmit}>
            <div className="mb-3">
                <label className="form-label">{t('delivery_form_price')}</label>
                <input
                    type="number"
                    value={deliveryPrice}
                    onChange={(e) => setDeliveryPrice(parseFloat(e.target.value) || 0)}
                    required
                    className={inputClasses}
                />
            </div>
            <div className="mb-3">
                <label className="form-label">{t('delivery_form_description')}</label>
                <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    className={inputClasses}
                />
            </div>
            <div className="mb-3">
                <label className="form-label">{t('delivery_date_label')}</label>
                <input
                    type="date"
                    value={deliveryDateString}
                    onChange={(e) => setDeliveryDateString(e.target.value)}
                    required
                    className={inputClasses}
                />
            </div>
            <div className="mb-3">
                <label className="form-label">{t('delivery_form_location')}</label>
                <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                    className={inputClasses}
                />
            </div>
            <div className="d-grid">
                <button type="submit" className="btn btn-primary">
                    <i className="fas fa-paper-plane me-2"></i>{t('send_delivery_info')}
                </button>
            </div>
        </form>
    );
};

export default DeliveryForm;