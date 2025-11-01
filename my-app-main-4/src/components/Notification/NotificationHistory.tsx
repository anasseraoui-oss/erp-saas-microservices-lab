import React from 'react';
import styles from '../../Css/Notification/NotificationHistory.module.css';
import { useDarkMode } from '../DarkModeProvider';
import {useTranslation} from 'react-i18next';
interface Notification {
    id: number;
    subject: string;
    message: string;
    createdAt: string;
}

interface NotificationHistoryProps {
    notifications: Notification[];
}

const NotificationHistory: React.FC<NotificationHistoryProps> = ({ notifications }) => {
    // @ts-ignore
    const { isDarkMode } = useDarkMode();
    const { t } = useTranslation();

    return (
        <div className={`${styles.historyContainer} ${isDarkMode ? styles.dark : styles.light}`}>
            <h2 className={styles.historyTitle}>Notification History</h2>
            <ul className={styles.notificationList}>
                {notifications.length === 0 ? (
                    <li className={styles.emptyState}>{t('notifications.no_notifications_found')}</li>
                ) : (
                    notifications.map((notif) => (
                        <li key={notif.id} className={styles.notificationItem}>
                            <strong className={styles.itemSubject}>
                                {t(`notifications.subjects.${notif.subject}`, {defaultValue: notif.subject})}
                            </strong>
                            <div className={styles.itemMessage}>{t(`notifications.messages.${notif.subject}_MESSAGE`, { defaultValue: notif.message })}</div>
                            <div className={styles.itemTime}>
                                {new Date(notif.createdAt).toLocaleString('en-US')}
                            </div>
                        </li>
                    ))
                )}
            </ul>
        </div>
    );
};

export default NotificationHistory;