import React, { useState, useEffect } from 'react';
import { useDarkMode } from '../DarkModeProvider';
import { useNotifications } from "./NotificationContext";
import { fetchAllNotifications, triggerAllServiceChecks } from '../../api/notificationService';

// --- Child Components ---
import NotificationHistory from './NotificationHistory';
import Appointments from './Appointments';
import EmailNotifications from './EmailNotifications'; // FIX: Make sure this component is created and imported

// --- Icons and Styling ---
import { FaHistory, FaRegCalendarAlt, FaBroom, FaSync, FaEnvelopeOpenText } from 'react-icons/fa';
import { SafeIcon } from '../Home';
import styles from '../../Css/Notification/NotificationConter.module.css';

// Define the shape of your notification data
interface NotificationData {
    id: number;
    subject: string;
    message: string;
    createdAt: string;
}

// Define the possible views for the center
type NotificationView = 'history' | 'appointments' | 'emailNotifications';

const NotificationCenter: React.FC = () => {
    // FIX: Corrected the type definition for the view state
    const [view, setView] = useState<NotificationView>('history');

    // It's better to define the type for the context value to remove @ts-ignore
 // @ts-ignore
    const { isDarkMode } = useDarkMode();    
    const { notifications: contextNotifications } = useNotifications();
    const [displayedNotifications, setDisplayedNotifications] = useState<NotificationData[]>([]);

    useEffect(() => {
        if (Array.isArray(contextNotifications)) {
            // Transform context notifications to match the local interface
            const transformedNotifications: NotificationData[] = contextNotifications.map(notification => ({
                id: typeof notification.id === 'string' ? parseInt(notification.id, 10) : notification.id,
                subject: notification.subject,
                message: notification.message,
                createdAt: notification.createdAt
            }));
            setDisplayedNotifications(transformedNotifications);
        }
    }, [contextNotifications]);

    const handleTriggerChecks = async () => {
        try {
            // IMPROVEMENT: Use a more modern notification system than alert() if available
            alert("Triggering notification checks...");
            const result = await triggerAllServiceChecks();
            alert(`Success: ${result || 'Checks triggered successfully!'}`);
        } catch (error: any) {
            console.error("Failed to trigger checks:", error);
            alert(`Error: ${error.response?.data?.message || 'Could not trigger notification checks.'}`);
        }
    };

    const handleFetchAll = async () => {
        try {
            alert("Fetching all notifications...");
            const allNotifications = await fetchAllNotifications();
            const transformedNotifications: NotificationData[] = allNotifications.map(notification => ({
                id: typeof notification.id === 'string' ? parseInt(notification.id, 10) : notification.id,
                subject: notification.subject,
                message: notification.message,
                createdAt: notification.createdAt
            }));
            setDisplayedNotifications(transformedNotifications);
            setView('history'); // Switch to history view to show results
            alert(`Successfully fetched ${transformedNotifications.length} notifications.`);
        } catch (error: any) {
            console.error("Failed to fetch all notifications:", error);
            alert(`Error: ${error.response?.data?.message || 'Could not fetch all notifications.'}`);
        }
    };

    // IMPROVEMENT: Extracted render logic for clarity
    const renderContent = () => {
        switch (view) {
            case 'history':
                return <NotificationHistory notifications={displayedNotifications} />;
            case 'appointments':
                return <Appointments />;
            case 'emailNotifications':
                return <EmailNotifications />;
            default:
                return <NotificationHistory notifications={displayedNotifications} />;
        }
    };

    return (
        <div className={`${styles.centerContainer} ${isDarkMode ? styles.dark : styles.light}`}>
            <header className={styles.centerHeader}>
                <h1>Notification Center</h1>
                <div className={styles.controlPanel}>
                    <button onClick={() => setView('history')} className={`${styles.controlButton} ${view === 'history' ? styles.active : ''}`}>
                        <SafeIcon icon={FaHistory} /> History
                    </button>
                    <button onClick={() => setView('appointments')} className={`${styles.controlButton} ${view === 'appointments' ? styles.active : ''}`}>
                        <SafeIcon icon={FaRegCalendarAlt} /> Appointments
                    </button>
                    {/* FIX: Corrected onClick and active state logic for this button */}
                    <button onClick={() => setView('emailNotifications')} className={`${styles.controlButton} ${view === 'emailNotifications' ? styles.active : ''}`}>
                        <SafeIcon icon={FaEnvelopeOpenText} /> Email Notifications
                    </button>
                    <button onClick={handleTriggerChecks} className={styles.controlButton} title="Check for new notifications">
                        <SafeIcon icon={FaBroom} /> Check All
                    </button>
                    <button onClick={handleFetchAll} className={styles.controlButton} title="Fetch all stored notifications">
                        <SafeIcon icon={FaSync} /> Fetch All
                    </button>
                </div>
            </header>

            {/* FIX: Corrected the conditional rendering logic */}
            <main className={styles.contentArea}>
                {renderContent()}
            </main>
        </div>
    );
};

export default NotificationCenter;