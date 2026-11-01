import React, { useMemo, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ChartOptions } from 'chart.js';
import styles from '../../../Css/invoiceOrOrder/StatisticsModal.module.css';
import { useTranslation } from 'react-i18next';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface StatisticsModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: any[];
    title: string;
    productNameMap: { [key: number]: string };
    isDarkMode: boolean;
}

const StatisticsModal: React.FC<StatisticsModalProps> = ({ isOpen, onClose, data, title, productNameMap, isDarkMode }) => {
    const [criteria, setCriteria] = useState<'quantity' | 'value'>('quantity');
    const { t } = useTranslation();
    const chartData = useMemo(() => {
        const productStats: { [key: string]: number } = {};

        data.forEach(item => {
            const currentVal = productStats[item.productId] || 0;
            if (criteria === 'quantity') {
                productStats[item.productId] = currentVal + (item.quantity || 0);
            } else { // criteria === 'value'
                productStats[item.productId] = currentVal + ((item.quantity || 0) * (item.price || 0));
            }
        });

        const sortedStats = Object.entries(productStats).sort(([, a], [, b]) => b - a).slice(0, 15); // Show top 15

        const labels = sortedStats.map(([productId]) => productNameMap[Number(productId)] || `ID: ${productId}`);
        const values = sortedStats.map(([, value]) => value);

        return {
            labels,
            datasets: [
                {
                    label: criteria === 'quantity' ? t('statistics_page.label_total_quantity') : t('statistics_page.label_total_value'),
                    data: values,
                    backgroundColor: isDarkMode ? 'rgba(54, 162, 235, 0.6)' : 'rgba(75, 192, 192, 0.6)',
                    borderColor: isDarkMode ? 'rgba(54, 162, 235, 1)' : 'rgba(75, 192, 192, 1)',
                    borderWidth: 1,
                    borderRadius: 4,
                },
            ],
        };
    }, [data, isDarkMode, criteria, productNameMap, t]);

    if (!isOpen) {
        return null;
    }

    const chartOptions: ChartOptions<'bar'> = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'top', labels: { color: isDarkMode ? '#e5e7eb' : '#374151', font: { size: 14 } } },
            title: {
                display: true,
                text: t('statistics.chart_title', {
                    title: title,
                    criteria: criteria === 'quantity' ? t('statistics_page.by_quantity') : t('statistics_page.by_value')
                })},
                tooltip: {
                backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                titleColor: isDarkMode ? '#f9fafb' : '#111827',
                bodyColor: isDarkMode ? '#e5e7eb' : '#374151',
                borderColor: isDarkMode ? '#4b5563' : '#e5e7eb',
                borderWidth: 1,
                callbacks: {
                    label: function(context) {
                        let label = context.dataset.label || '';
                        if (label) label += ': ';
                        if (context.parsed.y !== null) {
                            label += criteria === 'value' ? new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(context.parsed.y) : context.parsed.y;
                        }
                        return label;
                    }
                }
            }
        },
        scales: {
            y: { beginAtZero: true, ticks: { color: isDarkMode ? '#9ca3af' : '#6b7280' }, grid: { color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' } },
            x: { ticks: { color: isDarkMode ? '#9ca3af' : '#6b7280' }, grid: { display: false } }
        }
    };

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={`${styles.modalContent} ${isDarkMode ? styles.dark : ''}`} onClick={e => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h2 className={styles.modalTitle}>{title}</h2>
                    <button onClick={onClose} className={styles.closeButton}>×</button>
                </div>
                <div className={styles.modalBody}>
                    <div className="btn-group mb-4" role="group">
                        <button type="button" className={`btn ${criteria === 'quantity' ? 'btn-primary' : `btn-outline-primary ${isDarkMode ? 'btn-outline-light' : ''}`}`} onClick={() => setCriteria('quantity')}>
                            {t('statistics_page.button_by_quantity')}
                        </button>
                        <button type="button" className={`btn ${criteria === 'value' ? 'btn-primary' : `btn-outline-primary ${isDarkMode ? 'btn-outline-light' : ''}`}`} onClick={() => setCriteria('value')}>
                            {t('statistics_page.button_by_value')}
                        </button>
                    </div>

                    <div className={styles.chartContainer}>
                        {chartData.labels.length > 0 ? (
                            <Bar options={chartOptions} data={chartData} />
                        ) : (
                            <p className={styles.noDataText}>{t('statistics_page.no_data_message')}</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StatisticsModal;