import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import styles from '../../Css/account/UserActivityModalAll.module.css';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    PointElement,
    LineElement,
    Filler
} from 'chart.js';
import activityLogger, {ActivityLog} from '../../classe/ActivityLoggerService';

ChartJS.register(
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    PointElement,
    LineElement,
    Filler
);

interface AggregatedData {
    activityCounts: Record<string, number>;
    hourlyCounts: number[];
    dailyCounts: Record<string, number>;
}

interface ChartDimensions {
    width: number;
    height: number;
}

type RenderState = 'initializing' | 'measuring' | 'ready' | 'error';

const ChartPlaceholder: React.FC<{ text: string; error?: boolean }> = ({ text, error = false }) => (
    <div className={styles.chartPlaceholder}>
        {!error && <div className={styles.spinner} />}
        <p className={error ? styles.errorText : styles.loadingText}>{text}</p>
    </div>
);

const ErrorBoundary: React.FC<{ children: React.ReactNode; fallback: React.ReactNode }> = ({
                                                                                               children,
                                                                                               fallback
                                                                                           }) => {
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        const handleError = () => setHasError(true);
        window.addEventListener('error', handleError);
        return () => window.removeEventListener('error', handleError);
    }, []);

    if (hasError) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
};

interface UserActivityModalAllProps {
    onClose: () => void;
}

const UserActivityModalAll: React.FC<UserActivityModalAllProps> = ({ onClose }) => {
    const [renderState, setRenderState] = useState<RenderState>('initializing');
    const [chartDimensions, setChartDimensions] = useState<ChartDimensions | null>(null);

    const modalRef = useRef<HTMLDivElement>(null);
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const timeoutRef = useRef<NodeJS.Timeout>();

    // Memoize aggregated data to prevent unnecessary recalculations
    const aggregatedData = useMemo((): AggregatedData => {
        try {
            const allLogs: ActivityLog[] = activityLogger.getAllActivities();

            const activityCounts: Record<string, number> = {};
            const hourlyCounts: number[] = Array(24).fill(0);
            const dailyCounts: Record<string, number> = {};

            allLogs.forEach(log => {
                try {
                    const date = new Date(log.timestamp);

                    // Validate date
                    if (isNaN(date.getTime())) {
                        console.warn('Invalid timestamp in activity log:', log);
                        return;
                    }

                    const hour = date.getHours();
                    const dayKey = date.toLocaleDateString('en-CA');

                    // Increment counters
                    activityCounts[log.type] = (activityCounts[log.type] || 0) + 1;
                    hourlyCounts[hour]++;
                    dailyCounts[dayKey] = (dailyCounts[dayKey] || 0) + 1;
                } catch (error) {
                    console.error('Error processing activity log:', log, error);
                }
            });

            return { activityCounts, hourlyCounts, dailyCounts };
        } catch (error) {
            console.error('Error aggregating activity data:', error);
            return {
                activityCounts: {},
                hourlyCounts: Array(24).fill(0),
                dailyCounts: {}
            };
        }
    }, []);

    // Memoize chart data configurations
    const chartConfigs = useMemo(() => {
        const activityTypes = Object.keys(aggregatedData.activityCounts);
        const hasData = activityTypes.length > 0;

        if (!hasData) {
            return null;
        }

        // Doughnut chart configuration
        const doughnutData = {
            labels: activityTypes,
            datasets: [{
                data: Object.values(aggregatedData.activityCounts),
                backgroundColor: [
                    '#4BC0C0', '#FF6384', '#FFCE56', '#36A2EB',
                    '#9966FF', '#FF9F40', '#FF6B8A', '#4BC0C8'
                ],
                borderColor: '#ffffff',
                borderWidth: 2,
                hoverBorderWidth: 3,
            }],
        };

        // Get last 7 days for line chart
        const sortedDailyKeys = Object.keys(aggregatedData.dailyCounts)
            .sort()
            .slice(-7);

        const lineData = {
            labels: sortedDailyKeys.map(key => {
                const date = new Date(key);
                return date.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                });
            }),
            datasets: [{
                label: 'Daily Activities (Last 7 Days)',
                data: sortedDailyKeys.map(key => aggregatedData.dailyCounts[key] || 0),
                fill: true,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                pointBackgroundColor: 'rgba(75, 192, 192, 1)',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 7,
                tension: 0.4,
            }],
        };

        // Bar chart for hourly distribution
        const barData = {
            labels: Array.from({ length: 24 }, (_, i) =>
                `${i.toString().padStart(2, '0')}:00`
            ),
            datasets: [{
                label: 'Hourly Activity Distribution',
                data: aggregatedData.hourlyCounts,
                backgroundColor: 'rgba(54, 162, 235, 0.7)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
                borderRadius: 4,
            }],
        };

        return { doughnutData, lineData, barData };
    }, [aggregatedData]);

    // Chart options
    const chartOptions = useMemo(() => ({
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom' as const,
                labels: {
                    padding: 15,
                    usePointStyle: true,
                }
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleColor: '#ffffff',
                bodyColor: '#ffffff',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                borderWidth: 1,
            }
        },
        scales: chartConfigs?.barData ? {
            x: {
                grid: {
                    display: false,
                }
            },
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(0, 0, 0, 0.1)',
                }
            }
        } : undefined,
    }), [chartConfigs]);

    // Handle modal animation and measurement
    const handleModalReady = useCallback(() => {
        if (!chartContainerRef.current) return;

        // Use multiple animation frames to ensure layout is stable
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                const container = chartContainerRef.current;
                if (!container) return;

                const rect = container.getBoundingClientRect();

                if (rect.width > 0 && rect.height > 0) {
                    setChartDimensions({
                        width: rect.width,
                        height: rect.height
                    });
                    setRenderState('ready');
                } else {
                    // Fallback: try again after a short delay
                    timeoutRef.current = setTimeout(() => {
                        handleModalReady();
                    }, 100);
                }
            });
        });
    }, []);

    // Effect to manage render lifecycle
    useEffect(() => {
        if (renderState === 'initializing') {
            const modalNode = modalRef.current;

            if (modalNode) {
                // Wait for modal animation to complete
                const handleAnimationEnd = () => {
                    setRenderState('measuring');
                    // Small delay to ensure DOM is ready
                    setTimeout(handleModalReady, 50);
                };

                modalNode.addEventListener('animationend', handleAnimationEnd, { once: true });

                // Fallback timeout in case animation event doesn't fire
                timeoutRef.current = setTimeout(() => {
                    setRenderState('measuring');
                    handleModalReady();
                }, 500);

                return () => {
                    modalNode.removeEventListener('animationend', handleAnimationEnd);
                    if (timeoutRef.current) {
                        clearTimeout(timeoutRef.current);
                    }
                };
            }
        }

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [renderState, handleModalReady]);

    // Handle backdrop click
    const handleBackdropClick = useCallback((e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    }, [onClose]);

    // Handle escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [onClose]);

    const hasData = chartConfigs !== null;
    const isReady = renderState === 'ready' && hasData;

    return (
        <div className={styles.backdrop} onClick={handleBackdropClick}>
            <div
                ref={modalRef}
                className={`${styles.modalContainer} ${styles.large}`}
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-title"
            >
                <header className={styles.modalHeader}>
                    <h2 id="modal-title">Overall System Activity</h2>
                    <button
                        onClick={onClose}
                        className={styles.closeButton}
                        aria-label="Close modal"
                        type="button"
                    >
                        ×
                    </button>
                </header>

                <div className={styles.modalBody}>
                    <div ref={chartContainerRef} className={styles.chartsWrapper}>
                        {!hasData ? (
                            <ChartPlaceholder
                                text="No activity data available"
                                error={true}
                            />
                        ) : !isReady ? (
                            <ChartPlaceholder
                                text={renderState === 'initializing' ? 'Loading...' : 'Preparing charts...'}
                            />
                        ) : (
                            <ErrorBoundary
                                fallback={
                                    <ChartPlaceholder
                                        text="Error loading charts"
                                        error={true}
                                    />
                                }
                            >
                                <div className={styles.chartGrid}>
                                    <div className={styles.chartContainer}>
                                        <h3>Activity Types Distribution</h3>
                                        <div className={styles.chartWrapper}>
                                            <Doughnut
                                                data={chartConfigs.doughnutData}
                                                options={chartOptions}
                                            />
                                        </div>
                                    </div>

                                    <div className={styles.chartContainer}>
                                        <h3>Hourly Activity Pattern</h3>
                                        <div className={styles.chartWrapper}>
                                            <Bar
                                                data={chartConfigs.barData}
                                                options={chartOptions}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className={styles.fullWidthChartContainer}>
                                    <h3>Daily Activity Trend</h3>
                                    <div className={styles.chartWrapper}>
                                        <Line
                                            data={chartConfigs.lineData}
                                            options={chartOptions}
                                        />
                                    </div>
                                </div>
                            </ErrorBoundary>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserActivityModalAll;