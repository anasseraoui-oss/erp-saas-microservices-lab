import React from 'react';
import { useDarkMode } from "../../../DarkModeProvider";
import styles from '../../../../Css/invoiceOrOrder/OrderStatus.module.css';
import {useTranslation} from "react-i18next";

interface OrderStatusBadgeProps {
    status: string | null | undefined;
}

const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({ status }) => {
    // @ts-ignore
    const { isDarkMode } = useDarkMode();
    const { t: translate } = useTranslation(); // Renomme 't' en 'translate'


    const statusKey = status?.toLowerCase() || 'default';

    // Build the className string dynamically
    // 1. The base class for the badge
    // 2. The specific class for the status (e.g., styles.pending)
    // 3. The dark mode class, which is also a utility class in the CSS module
    const badgeClasses = `
    ${styles.statusBadge} 
    ${styles[statusKey] || styles.default}
    ${isDarkMode ? styles.darkMode : ''}
  `;

    return (
        <span className={badgeClasses.trim()}>
      {translate(`order_invoice.${statusKey}`, { defaultValue: status || 'N/A' })}
    </span>
    );
};

export default OrderStatusBadge;