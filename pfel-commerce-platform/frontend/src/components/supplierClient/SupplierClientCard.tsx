// src/components/cards/SupplierClientCard.tsx (Final Themed Version)

import React, { useMemo } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import type { ChartOptions } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import styles from '../../Css/SupplierClient/SupplierClientCard.module.css';
import { useDarkMode } from "../DarkModeProvider";

ChartJS.register(ArcElement, Tooltip, Legend);

// @ts-ignore
const SupplierClientCard = ({ partner }) => {
    // @ts-ignore
    const { isDarkMode } = useDarkMode();
    const { name, email, phoneNumber, totalSeles, totalePurch } = partner;

    // --- NOUVEAU : Création d'un objet de thème pour les couleurs du graphique ---
    const theme = useMemo(() => ({
        // Couleurs du texte pour la légende et le titre
        textColor: isDarkMode ? '#e2e8f0' : '#2d3748',
        // Couleurs des segments du graphique Pie
        salesColor: isDarkMode ? 'rgba(46, 204, 113, 0.8)' : 'rgba(26, 188, 156, 0.7)',
        purchaseColor: isDarkMode ? 'rgba(231, 76, 60, 0.8)' : 'rgba(231, 76, 60, 0.7)',
        // Couleurs des bordures
        salesBorderColor: isDarkMode ? '#2ecc71' : '#1abc9c',
        purchaseBorderColor: isDarkMode ? '#ff7675' : '#e74c3c',
        // Couleurs du tooltip
        tooltipBg: isDarkMode ? '#16213e' : '#ffffff',
        tooltipText: isDarkMode ? '#e2e8f0' : '#2d3748',
    }), [isDarkMode]);

    const chartData = {
        labels: ['Total Sales', 'Total Purchases'],
        datasets: [{
            label: 'Amount (DH)',
            data: [totalSeles || 0, totalePurch || 0],
            backgroundColor: [theme.salesColor, theme.purchaseColor],
            borderColor: [theme.salesBorderColor, theme.purchaseBorderColor],
            borderWidth: 1,
        }],
    };

    // --- NOUVEAU : Utilisation des couleurs du thème dans les options du graphique ---
    const chartOptions: ChartOptions<'pie'> = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top' as const,
                labels: { color: theme.textColor, font: { size: 14 } }
            },
            title: {
                display: true,
                text: 'Sales vs Purchases Ratio',
                color: theme.textColor,
                font: { size: 16, weight: 'bold' }
            },
            tooltip: {
                backgroundColor: theme.tooltipBg,
                titleColor: theme.tooltipText,
                bodyColor: theme.tooltipText,
            }
        },
    };

    const totalTransactions = (totalSeles || 0) + (totalePurch || 0);
    const salesPercentage = totalTransactions > 0 ? ((totalSeles / totalTransactions) * 100).toFixed(1) : 0;
    const purchasePercentage = totalTransactions > 0 ? ((totalePurch / totalTransactions) * 100).toFixed(1) : 0;

    return (
        <div className={`${styles.card} ${isDarkMode ? styles.dark : ''}`}>
            <div className={styles.header}>
                <h3>{name}</h3>
                <p>{email}</p>
                <p>{phoneNumber}</p>
            </div>
            <div className={styles.body}>
                <div className={styles.chartContainer}>
                    <Pie data={chartData} options={chartOptions}/>
                </div>
                <div className={styles.stats}>
                    {/* --- NOUVEAU : Application des classes sémantiques pour les couleurs --- */}
                    <div className={`${styles.statItem} ${styles.success}`}>
                        <span>Sales</span>
                        <strong>{salesPercentage}%</strong>
                        <small>({(totalSeles || 0).toFixed(2)} DH)</small>
                    </div>
                    <div className={`${styles.statItem} ${styles.danger}`}>
                        <span>Purchases</span>
                        <strong>{purchasePercentage}%</strong>
                        <small>({(totalePurch || 0).toFixed(2)} DH)</small>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SupplierClientCard;