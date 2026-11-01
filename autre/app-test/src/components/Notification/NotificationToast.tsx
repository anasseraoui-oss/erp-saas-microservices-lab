import React from 'react';
import styles from '../../Css/Notification/NotificationToast.module.css';
import {useNotifications} from "./NotificationContext";

const NotificationToast = () => {
    // @ts-ignore
    const { currentToast, dismissToast } = useNotifications();

    if (!currentToast) {
        return null;
    }

    return (
        <div className={`${styles.toastWrapper} ${currentToast ? styles.visible : ''}`}>
            <div className={styles.toastHeader}>
                <span className={styles.toastSubject}>{currentToast.subject}</span>
                <button onClick={dismissToast} className={styles.dismissButton}>×</button>
            </div>
            <div className={styles.toastBody}>
                {currentToast.message}
            </div>
        </div>
    );
};

export default NotificationToast;