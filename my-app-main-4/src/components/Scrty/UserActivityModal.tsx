import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
// =================================================================
//  **THE ONLY CHANGE NEEDED IS HERE**
//  Import 'Line' directly from the main package, not the internal path.
// =================================================================
import { Line } from "react-chartjs-2";

import { Chart, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, TimeScale } from 'chart.js';
import 'chartjs-adapter-date-fns';
import { useDarkMode } from '../DarkModeProvider';
import { User } from '../../classe/types';
import '../../Css/account/UserActivityModal.css';
import { FiActivity, FiClock, FiZap } from 'react-icons/fi';
import type { IconType } from "react-icons";
import activityLogger from '../../classe/ActivityLoggerService';
import { ActivityLog } from '../../classe/ActivityLog';

// Register Chart.js components - This is correct.
Chart.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, TimeScale);

// Your Icon component - This is correct.
interface IconProps {
    as: IconType;
    className?: string;
    size?: number;
}
const Icon: React.FC<IconProps> = ({ as, ...props }) => {
    const IconComponent = as as React.ElementType;
    return <IconComponent {...props} />;
};

// The rest of the component does not need to change. It is well-structured.

interface UserActivityModalProps {
    user: User;
    onClose: () => void;
}

function UserActivityModal({ user, onClose }: UserActivityModalProps) {
    const { t } = useTranslation('account');
    // @ts-ignore
    const { isDarkMode } = useDarkMode();
    const [activityData, setActivityData] = useState<any[]>([]);
    const [stats, setStats] = useState({ totalActions: 0, peakActivity: 0 });

    useEffect(() => {
        const fetchActivities = async () => {
            if (!user?.id) return;
            
            try {
                const activities: ActivityLog[] = await activityLogger.getActivitiesForUser(user.id);

                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                thirtyDaysAgo.setHours(0, 0, 0, 0);

                const recentActivities = activities.filter(a => new Date(a.timestamp) > thirtyDaysAgo);

                const processedData: { [key: string]: { date: Date, actions: number } } = {};
                recentActivities.forEach(activity => {
                    const date = new Date(activity.timestamp);
                    date.setHours(0, 0, 0, 0);
                    const dateString = date.toISOString().split('T')[0];

                    if (!processedData[dateString]) {
                        processedData[dateString] = {
                            date: date,
                            actions: 0,
                        };
                    }
                    processedData[dateString].actions += 1;
                });

                const chartReadyData = Object.values(processedData).sort((a, b) => a.date.getTime() - b.date.getTime());
                setActivityData(chartReadyData);

                const totalActions = chartReadyData.reduce((sum, day) => sum + day.actions, 0);
                const peakActivity = Math.max(0, ...chartReadyData.map(day => day.actions));

                setStats({ totalActions, peakActivity });
            } catch (error) {
                console.error("Failed to fetch user activities:", error);
                // Optionally, handle the error in the UI
            }
        };

        fetchActivities();
    }, [user.id]);

    const chartData = {
        labels: activityData.map(d => d.date),
        datasets: [
            {
                label: t('dailyActions'),
                data: activityData.map(d => d.actions),
                borderColor: isDarkMode ? '#63b3ed' : '#3498db',
                backgroundColor: isDarkMode ? 'rgba(99, 179, 237, 0.2)' : 'rgba(52, 152, 219, 0.2)',
                fill: true,
                tension: 0.4,
                yAxisID: 'y',
            }
        ],
    };

    const chartOptions: any = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index' as const, intersect: false },
        scales: {
            x: {
                type: 'time' as const,
                time: { unit: 'day' },
                ticks: { color: isDarkMode ? '#a0aec0' : '#7f8c8d' },
                grid: { color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }
            },
            y: {
                type: 'linear' as const,
                display: true,
                position: 'left' as const,
                title: { display: true, text: t('actions'), color: isDarkMode ? '#e2e8f0' : '#2c3e50' },
                ticks: { color: isDarkMode ? '#a0aec0' : '#7f8c8d' },
                grid: { color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }
            }
        },
        plugins: {
            legend: { labels: { color: isDarkMode ? '#e2e8f0' : '#2c3e50' } },
            tooltip: {
                backgroundColor: isDarkMode ? '#1a202c' : '#ffffff',
                titleColor: isDarkMode ? '#e2e8f0' : '#2c3e50',
                bodyColor: isDarkMode ? '#cbd5e0' : '#34495e',
                borderColor: isDarkMode ? '#4a5568' : '#e9ecef',
                borderWidth: 1,
            }
        },
    };

    return (
        <div className="activity-modal__backdrop" onClick={onClose}>
            <div className={`activity-modal__content ${isDarkMode ? 'dark' : ''}`} onClick={(e) => e.stopPropagation()}>
                <header className="activity-modal__header">
                    <h2 className="activity-modal__header-title">
                        <Icon as={FiActivity} /> {t('userActivity')}: {user.fullName}
                    </h2>
                    <button onClick={onClose} className="activity-modal__close-btn" aria-label={t('close')}>×</button>
                </header>
                <main className="activity-modal__body">
                    <div className="activity-modal__stats-grid">
                        <div className="stat-card">
                            <h3 className="stat-card__value">{stats.totalActions}</h3>
                            <p className="stat-card__label"><Icon as={FiZap} /> {t('totalActions30d')}</p>
                        </div>
                        <div className="stat-card">
                            <h3 className="stat-card__value">{stats.peakActivity}</h3>
                            <p className="stat-card__label"><Icon as={FiActivity} /> {t('peakDailyActions')}</p>
                        </div>
                    </div>
                    <div className="activity-modal__chart-container">
                        <Line options={chartOptions} data={chartData} />
                    </div>
                </main>
            </div>
        </div>
    );
}

export default UserActivityModal;