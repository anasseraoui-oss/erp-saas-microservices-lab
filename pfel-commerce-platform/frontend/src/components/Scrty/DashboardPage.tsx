import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
} from 'chart.js';
import styles from '../../Css/account/DashboardPage.module.css';
import activityLogger, { ActivityLog } from "../../classe/ActivityLoggerService";
import { FiBarChart2 } from 'react-icons/fi';
import UserActivityModalAll from "./UserActivityModalAll";
import { useDarkMode } from "../DarkModeProvider";
import type { IconType } from "react-icons";

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

interface DarkModeContext {
    isDarkMode: boolean;
    toggleDarkMode: () => void;
}

interface IconProps {
    as: IconType;
    className?: string;
    size?: number;
}

const Icon: React.FC<IconProps> = ({ as, ...props }) => {
    const IconComponent = as as React.ElementType;
    return <IconComponent {...props} />;
};

interface UserActivityCardProps {
    userLogs: ActivityLog[];
    userName: string;
    isDarkMode: boolean;
}

const UserActivityCard: React.FC<UserActivityCardProps> = ({ userLogs, userName, isDarkMode }) => {
    const { t } = useTranslation('account');
    const activityCounts = useMemo(() => {
        return userLogs.reduce((acc, log) => {
            acc[log.type] = (acc[log.type] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
    }, [userLogs]);

    // Dynamic colors based on dark mode
    const chartColors = isDarkMode
        ? ['#ef4444', '#3b82f6', '#f59e0b', '#10b981', '#8b5cf6', '#f97316', '#ec4899', '#6b7280', '#14b8a6', '#ef4444']
        : ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF', '#4BC0C0', '#FF6384'];

    const doughnutData = {
        labels: Object.keys(activityCounts),
        datasets: [{
            data: Object.values(activityCounts),
            backgroundColor: chartColors.slice(0, Object.keys(activityCounts).length),
            borderWidth: 2,
            borderColor: isDarkMode ? '#374151' : '#ffffff',
        }],
    };

    const chartOptions = {
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: 'bottom' as const,
                labels: {
                    boxWidth: 12,
                    fontSize: 10,
                    padding: 8,
                    color: isDarkMode ? '#e5e7eb' : '#374151',
                }
            },
            tooltip: {
                backgroundColor: isDarkMode ? '#374151' : '#ffffff',
                titleColor: isDarkMode ? '#f3f4f6' : '#1f2937',
                bodyColor: isDarkMode ? '#e5e7eb' : '#4b5563',
                borderColor: isDarkMode ? '#6b7280' : '#d1d5db',
                borderWidth: 1,
                callbacks: {
                    label: function(context: any) {
                        const label = context.label || '';
                        const value = context.parsed;
                        const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                        const percentage = ((value / total) * 100).toFixed(1);
                        return `${label}: ${value} (${percentage}%)`;
                    }
                }
            }
        },
        cutout: '60%',
    };

    return (
        <div className={`${styles.userCard} ${isDarkMode ? styles.dark : ''}`}>
            <div className={`${styles.cardHeader} ${isDarkMode ? styles.dark : ''}`}>
                <h3>{userName}</h3>
                <p>{t('totalActivities')}: {userLogs.length}</p>
            </div>
            <div className={styles.cardBody}>
                {userLogs.length > 0 ? (
                    <div className={styles.chartWrapper}>
                        <Doughnut data={doughnutData} options={chartOptions} />
                    </div>
                ) : (
                    <div className={styles.noActivityContainer}>
                        <p className={`${styles.noActivityText} ${isDarkMode ? styles.dark : ''}`}>
                            {t('noActivityRecorded')}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

interface DashboardStats {
    totalUsers: number;
    totalActivities: number;
    mostActiveUser: string | null;
    mostCommonActivity: string | null;
}

const DashboardPage: React.FC = () => {
    const { t } = useTranslation('account');
    const { isDarkMode } = useDarkMode() as DarkModeContext;
    const [isOverallModalOpen, setIsOverallModalOpen] = useState(false);

    const allActivitiesByUser = useMemo(() => {
        const allLogs = activityLogger.getAllActivities();
        return allLogs.reduce((acc, log) => {
            if (!acc[log.userId]) {
                acc[log.userId] = {
                    fullName: log.userFullName,
                    logs: []
                };
            }
            acc[log.userId].logs.push(log);
            return acc;
        }, {} as Record<string, { fullName: string, logs: ActivityLog[] }>);
    }, []);

    const dashboardStats = useMemo((): DashboardStats => {
        const allLogs = activityLogger.getAllActivities();
        const totalUsers = Object.keys(allActivitiesByUser).length;
        const totalActivities = allLogs.length;

        // Find most active user
        let mostActiveUser: string | null = null;
        let maxActivities = 0;
        Object.values(allActivitiesByUser).forEach(userData => {
            if (userData.logs.length > maxActivities) {
                maxActivities = userData.logs.length;
                mostActiveUser = userData.fullName;
            }
        });

        // Find most common activity type
        const activityTypeCounts = allLogs.reduce((acc, log) => {
            acc[log.type] = (acc[log.type] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const mostCommonActivity = Object.keys(activityTypeCounts).reduce((a, b) =>
                // @ts-ignore
                activityTypeCounts[a] > activityTypeCounts[b] ? a : b
            , Object.keys(activityTypeCounts)[0] || null);

        return {
            totalUsers,
            totalActivities,
            mostActiveUser,
            mostCommonActivity
        };
    }, [allActivitiesByUser]);

    const handleOverallCardClick = () => {
        setIsOverallModalOpen(true);
    };

    const handleModalClose = () => {
        setIsOverallModalOpen(false);
    };

    return (
        <div className={`${styles.dashboardPage} ${isDarkMode ? styles.dark : ''}`}>
            <div className={styles.dashboardHeader}>
                <h1 className={`${styles.pageTitle} ${isDarkMode ? styles.dark : ''}`}>
                    {t('usersActivityDashboard')}
                </h1>
                <div className={styles.statsOverview}>
                    <div className={`${styles.statItem} ${isDarkMode ? styles.dark : ''}`}>
                        <span className={`${styles.statValue} ${isDarkMode ? styles.dark : ''}`}>
                            {dashboardStats.totalUsers}
                        </span>
                        <span className={`${styles.statLabel} ${isDarkMode ? styles.dark : ''}`}>
                            {t('users')}
                        </span>
                    </div>
                    <div className={`${styles.statItem} ${isDarkMode ? styles.dark : ''}`}>
                        <span className={`${styles.statValue} ${isDarkMode ? styles.dark : ''}`}>
                            {dashboardStats.totalActivities}
                        </span>
                        <span className={`${styles.statLabel} ${isDarkMode ? styles.dark : ''}`}>
                            {t('totalActivities')}
                        </span>
                    </div>
                    {dashboardStats.mostActiveUser && (
                        <div className={`${styles.statItem} ${isDarkMode ? styles.dark : ''}`}>
                            <span className={`${styles.statValue} ${isDarkMode ? styles.dark : ''}`}>
                                {dashboardStats.mostActiveUser}
                            </span>
                            <span className={`${styles.statLabel} ${isDarkMode ? styles.dark : ''}`}>
                                {t('mostActiveUser')}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            <div className={styles.dashboardGrid}>
                {/* User Activity Cards */}
                {Object.entries(allActivitiesByUser).map(([userId, userData]) => (
                    <UserActivityCard
                        key={userId}
                        userName={userData.fullName}
                        userLogs={userData.logs}
                        isDarkMode={isDarkMode}
                    />
                ))}

                {/* Overall Activity Card */}
                <div
                    className={`${styles.userCard} ${styles.overallCard} ${isDarkMode ? styles.dark : ''}`}
                    onClick={handleOverallCardClick}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            handleOverallCardClick();
                        }
                    }}
                    aria-label={t('viewOverallActivityDetails')}
                >
                    <div className={styles.cardBody}>
                        <Icon as={FiBarChart2} className={styles.overallIcon} size={56} />
                        <h3>{t('viewOverallActivity')}</h3>
                        <p>{t('totalRecordedActions')}: {dashboardStats.totalActivities}</p>
                        {dashboardStats.mostCommonActivity && (
                            <p className={styles.subInfo}>
                                {t('mostCommon')}: {dashboardStats.mostCommonActivity}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Overall Activity Modal */}
            {isOverallModalOpen && (
                <UserActivityModalAll onClose={handleModalClose} />
            )}
        </div>
    );
};

export default DashboardPage;