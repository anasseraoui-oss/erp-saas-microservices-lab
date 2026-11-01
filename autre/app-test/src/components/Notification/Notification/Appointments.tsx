import React, { useState, useEffect } from 'react';
import { createAppointment, getAppointmentsByRecipient, AppointmentData, NotificationRequest } from '../../api/appointmentsService';
import { updateNotification } from "../../api/notificationService";
import styles from '../../Css/Notification/Appointments.module.css';
import { useTranslation } from 'react-i18next';

interface Appointment {
    id: number;
    subject: string;
    message: string;
    sentAt: string;
    status: 'PENDING' | 'SENT' | 'FAILED';
    recipient: string;
}

const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
        fullDate: date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
        time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };
};

const Appointments: React.FC = () => {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
    const [isUpdating, setIsUpdating] = useState<Set<number>>(new Set());
    const { t } = useTranslation();
    const currentRecipient: string = localStorage.getItem('username') || 'anass.eraoui62@gmail.com';
    const [newAppointment, setNewAppointment] = useState({
        title: '',
        description: '',
        appointmentTime: ''
    });

    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await getAppointmentsByRecipient(currentRecipient);
                console.log(data);
                // Ensure data is always an array
                setAppointments(Array.isArray(data) ? data : []);
            } catch (err: any) {
                console.error('Error fetching appointments:', err);
                // Set error message but don't crash the app
                if (err.response?.status === 403) {
                    setError('Authentication error. Please log in again.');
                } else if (err.response?.status === 404) {
                    setError('User not found.');
                    setAppointments([]); // Set empty array for 404
                } else {
                    setError(err.message || t('alert_fetch_appointments_failed'));
                }
                setAppointments([]); // Ensure appointments is always an array
            } finally {
                setLoading(false);
            }
        };
        fetchAppointments();
    }, [t]);

    // In your update function, make sure to format the date properly
    const formatDateTime = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toISOString().replace('Z', '').padEnd(23, '0');
    };
    const handleManualStatusUpdate = async (appointmentId: number, newStatus: 'PENDING' | 'SENT' | 'FAILED') => {
        const appointment = appointments.find(app => app.id === appointmentId);
        if (!appointment || isUpdating.has(appointmentId)) return;
        try {
            setIsUpdating(prev => new Set(prev).add(appointmentId));
            const requestData = {
                recipient: appointment.recipient,
                subject: appointment.subject,
                message: appointment.message,
                sentAt: formatDateTime(appointment.sentAt),
                metadata: JSON.stringify({ isAppointment: true }),
                type: 'EMAIL',
                priority: 'NORMAL',
                notificationType: 'APPOINTMENT'
            };
            await updateNotification(appointment.id, requestData, newStatus);
            setAppointments(prev =>
                prev.map(app => (app.id === appointmentId ? { ...app, status: newStatus } : app))
            );
        } catch (error: any) {
            console.error('Error updating status:', error);
            alert(t('alert_update_status_failed', { error: error.message }));
        } finally {
            setIsUpdating(prev => {
                const newSet = new Set(prev);
                newSet.delete(appointmentId);
                return newSet;
            });
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setNewAppointment(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (new Date(newAppointment.appointmentTime) <= new Date()) {
            alert(t('alert_future_date_required'));
            return;
        }
        const appointmentData: AppointmentData = {
            recipient: currentRecipient,
            title: newAppointment.title,
            description: newAppointment.description,
            appointmentTime: new Date(newAppointment.appointmentTime).toISOString()
        };
        try {
            const created = await createAppointment(appointmentData);
            setAppointments(prev => [...prev, created].sort((a,b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime()));
            setNewAppointment({ title: '', description: '', appointmentTime: '' });
        } catch (err: any) {
            console.error('Error creating appointment:', err);
            if (err.response?.status === 403) {
                alert('Authentication error. Please log in again.');
            } else {
                alert(err.message || "Failed to create appointment.");
            }
        }
    };

    // Ensure appointments is always an array before grouping
    const groupedAppointments = (appointments || []).reduce((groups: { [key: string]: Appointment[] }, app) => {
        const dateKey = new Date(app.sentAt).toDateString();
        if (!groups[dateKey]) groups[dateKey] = [];
        groups[dateKey].push(app);
        return groups;
    }, {});

    const sortedDates = Object.keys(groupedAppointments).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

    return (
        <div className={styles.appointmentsContainer}>
            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Create New Appointment</h2>
                <form onSubmit={handleSubmit} className={styles.appointmentForm}>
                    <input
                        type="text"
                        name="title"
                        placeholder="Appointment Title *"
                        value={newAppointment.title}
                        onChange={handleInputChange}
                        required
                        className={styles.formInput}
                    />
                    <textarea
                        name="description"
                        placeholder="Appointment Details"
                        value={newAppointment.description}
                        onChange={handleInputChange}
                        className={styles.formInput}
                        rows={3}
                    />
                    <input
                        type="datetime-local"
                        name="appointmentTime"
                        value={newAppointment.appointmentTime}
                        onChange={handleInputChange}
                        required
                        className={styles.formInput}
                    />
                    <button type="submit" className={styles.formButton}>
                        {t('notifications.save_appointment_button')}
                    </button>
                </form>
            </div>

            <div className={styles.section}>
                <div className={styles.viewToggleContainer}>
                    <h2 className={styles.sectionTitle} style={{ margin: 0, border: 'none' }}>
                        {t('notifications.scheduled_appointments_title')}
                    </h2>
                    <div className={styles.viewToggleButtons}>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`${styles.toggleButton} ${viewMode === 'list' ? styles.active : ''}`}
                        >
                            {t('notifications.list_view_button')}
                        </button>
                        <button
                            onClick={() => setViewMode('calendar')}
                            className={`${styles.toggleButton} ${viewMode === 'calendar' ? styles.active : ''}`}
                        >
                            {t('notifications.calendar_view_button')}
                        </button>
                    </div>
                </div>

                {loading && <p>{t('notifications.loading_text')}</p>}
                {error && (
                    <div style={{ color: 'var(--color-danger)', padding: '1rem', backgroundColor: 'var(--color-danger-light)', borderRadius: '4px', marginBottom: '1rem' }}>
                        <strong>Error:</strong> {error}
                    </div>
                )}
                {!loading && !appointments.length && !error && (
                    <div className={styles.emptyState}>
                        <h3>{t('notifications.no_appointments_scheduled_title')}</h3>
                        <p>{t('notifications.create_first_appointment_message')}</p>
                    </div>
                )}

                {!loading && appointments.length > 0 && sortedDates.map(date => (
                    <div key={date} className={styles.dateGroup}>
                        <div className={styles.dateHeader}>{formatDate(date).fullDate}</div>
                        {groupedAppointments[date].map(app => {
                            const statusClass = styles[app.status.toLowerCase()] || '';
                            const isBeingUpdated = isUpdating.has(app.id);
                            return (
                                <div key={app.id} className={`${styles.appointmentCard} ${statusClass}`}>
                                    <div className={styles.statusIndicator}></div>
                                    <div className={styles.appointmentDetails}>
                                        <h4 className={styles.appointmentSubject}>{app.subject}</h4>
                                        <p className={styles.appointmentMessage}>{app.message}</p>
                                    </div>
                                    <div className={styles.appointmentMeta}>
                                        <span className={styles.appointmentTime}>{formatDate(app.sentAt).time}</span>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div className={styles.manualActions} style={{ display: 'flex', gap: '4px' }}>
                                                <button
                                                    onClick={() => handleManualStatusUpdate(app.id, 'PENDING')}
                                                    disabled={isBeingUpdated}
                                                    title="Mark as Pending"
                                                >
                                                    P
                                                </button>
                                                <button
                                                    onClick={() => handleManualStatusUpdate(app.id, 'SENT')}
                                                    disabled={isBeingUpdated}
                                                    title="Mark as Sent"
                                                >
                                                    S
                                                </button>
                                                <button
                                                    onClick={() => handleManualStatusUpdate(app.id, 'FAILED')}
                                                    disabled={isBeingUpdated}
                                                    title="Mark as Failed"
                                                >
                                                    F
                                                </button>
                                            </div>
                                            <span className={styles.statusBadge}>
                                                {isBeingUpdated ? "..." : t(`status_${app.status.toLowerCase()}`, app.status)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Appointments;