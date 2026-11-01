import React, { useState, useEffect, FormEvent } from 'react';
import { useDarkMode } from '../DarkModeProvider';
import { sandApi } from '../../api/notificationService';
import { SandData, NotificationType, NotificationSandType, EnableStatus } from '../../api/notificationService';

// --- Icons and Styling ---
import { FaEnvelope, FaTags, FaUser, FaTrash, FaPlusCircle } from 'react-icons/fa';
import { SafeIcon } from '../Home';
import styles from '../../Css/Notification/EmailNotificationManager.module.css';
import { useTranslation } from 'react-i18next';

const EmailNotificationManager: React.FC = () => {
    // @ts-ignore
    const { isDarkMode } = useDarkMode();
    const { t } = useTranslation();
    // State for the form inputs
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [selectedType, setSelectedType] = useState<NotificationType>(NotificationType.LOW_STOCK);

    // State for managing the list of subscribed emails
    const [subscribers, setSubscribers] = useState<SandData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch all subscribers when the component mounts
    useEffect(() => {
        fetchSubscribers();
    }, []);

    const fetchSubscribers = async () => {
        try {
            setIsLoading(true);
            const response = await sandApi.getAll();
            setSubscribers(response.data.filter((s: SandData) => s.sandType === NotificationSandType.EMAIL));
            setError(null);
        } catch (err: any) {
            console.error("Failed to fetch subscribers:", err);
            setError(err.message || 'Could not fetch data from the server.');
        } finally {
            setIsLoading(false);
        }
    };

    // Handler for form submission
    const handleAddSubscriber = async (e: FormEvent) => {
        e.preventDefault();
        if (!name || !email) {
            alert(t('alert_name_and_email_required'));
            return;
        }

        const newSubscriber: SandData = {
            name,
            email,
            notificationType: selectedType,
            description: `Subscriber for ${selectedType}`,
            phoneNumber: '', // Not needed for email
            sandType: NotificationSandType.EMAIL,
            enableStatus: EnableStatus.ENABLED,
        };

        try {
            await sandApi.save(newSubscriber);
            alert(t('alert_add_subscriber_success', { email: email, type: selectedType }));
            // Reset form and refresh list
            setName('');
            setEmail('');
            fetchSubscribers();
        } catch (err: any) {
            console.error("Failed to add subscriber:", err);
            alert(t('alert_add_subscriber_failed'));
        }
    };

    // Handler for deleting a subscriber
    const handleDeleteSubscriber = async (id: number) => {
        if (window.confirm(t('confirm_delete_subscriber'))) {
            try {
                await sandApi.deleteById(id);
                alert(t('alert_delete_subscriber_success'));
                fetchSubscribers(); // Refresh the list
            } catch (err: any) {
                console.error("Failed to delete subscriber:", err);
                alert(t('alert_delete_subscriber_failed'));
            }
        }
    };

    return (
        <div className={`${styles.managerContainer} ${isDarkMode ? styles.dark : styles.light}`}>
            {/* --- Section 1: Add New Subscriber Form --- */}
            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>{t('notifications.add_email_for_notifications_title')}</h2>
                <form onSubmit={handleAddSubscriber} className={styles.subscriberForm}>
                    <div className={styles.inputGroup}>
                        <SafeIcon icon={FaUser} />
                        <input
                            type="text"
                            placeholder="Name (e.g., 'Inventory Manager')"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className={styles.formInput}
                            required
                        />
                    </div>
                    <div className={styles.inputGroup}>
                        <SafeIcon icon={FaEnvelope} />
                        <input
                            type="email"
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={styles.formInput}
                            required
                        />
                    </div>
                    <div className={styles.inputGroup}>
                        <SafeIcon icon={FaTags} />
                        <select
                            value={selectedType}
                            onChange={(e) => setSelectedType(e.target.value as NotificationType)}
                            className={styles.formInput}
                        >
                            {/* Map through all available notification types */}
                            {(Object.values(NotificationType) as string[]).map((type: string) => (
                                <option key={type} value={type}>
                                    {t(`notification_type_${type.toLowerCase()}`)}
                                </option>
                            ))}
                        </select>
                    </div>
                    <button type="submit" className={styles.formButton}>
                        <SafeIcon icon={FaPlusCircle} /> {t('notifications.add_subscriber_button')}
                    </button>
                </form>
            </section>

            {/* --- Section 2: List of Current Subscribers --- */}
            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>{t('notifications.current_email_subscribers_title')}</h2>
                <div className={styles.subscriberList}>
                    {isLoading ? (
                        <p>{t('notifications.loading_subscribers_text')}</p>
                    ) : error ? (
                        <p className={styles.errorText}>{error}</p>
                    ) : subscribers.length === 0 ? (
                        <p className={styles.emptyState}>{t('notifications.no_email_subscribers_message')}</p>
                    ) : (
                        subscribers.map((sub) => (
                            <div key={sub.id} className={styles.subscriberCard}>
                                <div className={styles.cardIcon}>
                                    <SafeIcon icon={FaEnvelope} />
                                </div>
                                <div className={styles.subscriberDetails}>
                                    <span className={styles.subscriberName}>{sub.name}</span>
                                    <span className={styles.subscriberEmail}>{sub.email}</span>
                                </div>
                                <div className={styles.subscriberType}>
                                    <span className={styles.typeBadge}>
                                        {t(`notification_type_${sub.notificationType.toLowerCase()}`)}
                                    </span>
                                </div>
                                <button
                                    onClick={() => handleDeleteSubscriber(sub.id!)}
                                    className={styles.deleteButton}
                                    title="Delete this subscriber"
                                >
                                    <SafeIcon icon={FaTrash} />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </section>
        </div>
    );
};

export default EmailNotificationManager;