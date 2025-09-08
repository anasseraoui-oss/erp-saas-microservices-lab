import React, { useEffect, useState } from 'react';
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

// Mock function to generate fake activity data
const generateMockActivity = () => {
    const data = [];
    let currentDate = new Date();
    currentDate.setDate(currentDate.getDate() - 30);
    for (let i = 0; i < 30; i++) {
        data.push({
            date: new Date(currentDate),
            actions: Math.floor(Math.random() * 50) + 10,
            sessionDuration: Math.floor(Math.random() * 60) + 5,
        });
        currentDate.setDate(currentDate.getDate() + 1);
    }
    return data;
};

function UserActivityModal({ user, onClose }: UserActivityModalProps) {
    // @ts-ignore
    const { isDarkMode } = useDarkMode();
    const [activityData, setActivityData] = useState<any[]>([]);
    const [stats, setStats] = useState({ totalActions: 0, avgDuration: 0, peakActivity: 0 });

    useEffect(() => {
        const mockData = generateMockActivity();
        setActivityData(mockData);

        const totalActions = mockData.reduce((sum, day) => sum + day.actions, 0);
        const totalDuration = mockData.reduce((sum, day) => sum + day.sessionDuration, 0);
        const peakActivity = Math.max(...mockData.map(day => day.actions));
        const avgDuration = mockData.length > 0 ? totalDuration / mockData.length : 0;

        setStats({ totalActions, avgDuration: Math.round(avgDuration), peakActivity });
    }, [user.id]);

    const chartData = {
        labels: activityData.map(d => d.date),
        datasets: [
            {
                label: 'Daily Actions',
                data: activityData.map(d => d.actions),
                borderColor: isDarkMode ? '#63b3ed' : '#3498db',
                backgroundColor: isDarkMode ? 'rgba(99, 179, 237, 0.2)' : 'rgba(52, 152, 219, 0.2)',
                fill: true,
                tension: 0.4,
                yAxisID: 'y',
            },
            {
                label: 'Session Duration (min)',
                data: activityData.map(d => d.sessionDuration),
                borderColor: isDarkMode ? '#f6e05e' : '#f1c40f',
                backgroundColor: 'transparent',
                borderDash: [5, 5],
                tension: 0.4,
                yAxisID: 'y1',
            },
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
                title: { display: true, text: 'Actions', color: isDarkMode ? '#e2e8f0' : '#2c3e50' },
                ticks: { color: isDarkMode ? '#a0aec0' : '#7f8c8d' },
                grid: { color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }
            },
            y1: {
                type: 'linear' as const,
                display: true,
                position: 'right' as const,
                title: { display: true, text: 'Duration (min)', color: isDarkMode ? '#e2e8f0' : '#2c3e50' },
                ticks: { color: isDarkMode ? '#a0aec0' : '#7f8c8d' },
                grid: { drawOnChartArea: false }
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
                        <Icon as={FiActivity} /> User Activity: {user.fullName}
                    </h2>
                    <button onClick={onClose} className="activity-modal__close-btn" aria-label="Close">×</button>
                </header>
                <main className="activity-modal__body">
                    <div className="activity-modal__stats-grid">
                        <div className="stat-card">
                            <h3 className="stat-card__value">{stats.totalActions}</h3>
                            <p className="stat-card__label"><Icon as={FiZap} /> Total Actions (30d)</p>
                        </div>
                        <div className="stat-card">
                            <h3 className="stat-card__value">{stats.avgDuration} min</h3>
                            <p className="stat-card__label"><Icon as={FiClock} /> Avg. Session (30d)</p>
                        </div>
                        <div className="stat-card">
                            <h3 className="stat-card__value">{stats.peakActivity}</h3>
                            <p className="stat-card__label"><Icon as={FiActivity} /> Peak Daily Actions</p>
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