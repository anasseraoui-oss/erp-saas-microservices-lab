// ====================================================================
// --- SUB-COMPONENT 3: Suppliers & Clients Chart ---
// ====================================================================
import React from 'react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import styles from '../../Css/SupplierClient/SuppliersClientsChart.module.css';
import { useDarkMode } from '../DarkModeProvider';

// Fixed import path to match existing folder structure
import { SupplierClientData } from './basec';

interface SuppliersClientsChartProps {
    data: SupplierClientData[];
}

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload as SupplierClientData;
        return (
            <div className={styles.tooltip}>
                <p className={styles.tooltipName}>{data.name}</p>
                <p className={`${styles.tooltipRow} ${styles.salesColor}`}>
                    Total Sales: ${data.totalSales.toLocaleString()}
                </p>
                <p className={`${styles.tooltipRow} ${styles.purchasesColor}`}>
                    Total Purchases: ${data.totalePurchase.toLocaleString()}
                </p>
                <p className={`${styles.tooltipRow} ${styles.salesCreditColor}`}>
                    Sales Credit/Debt: ${data.borrowingPriceSales.toLocaleString()}
                </p>
                <p className={`${styles.tooltipRow} ${styles.purchaseDebtColor}`}>
                    Purchase Credit/Debt: ${data.borrowingPricePurchase.toLocaleString()}
                </p>
            </div>
        );
    }
    return null;
};

const SuppliersClientsChart: React.FC<SuppliersClientsChartProps> = ({ data }) => {
    // @ts-ignore
    const { isDarkMode } = useDarkMode();

    return (
        <div className={`${styles.chartPageContainer} ${isDarkMode ? styles.dark : ''}`}>
            <div className={styles.mainHeader}>
                <h2 className={styles.h2}>Suppliers & Clients Analysis</h2>
                <p className={styles.pLead}>A visual comparison of financial relationships with partners.</p>
            </div>
            <div className={styles.chartContainer}>
                <h3 className={styles.h3}>Financial Overview by Partner</h3>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke={isDarkMode ? '#374151' : '#e5e7eb'}
                        />
                        <XAxis
                            dataKey="name"
                            stroke={isDarkMode ? '#d1d5db' : '#6b7280'}
                            fontSize={12}
                            angle={-45}
                            textAnchor="end"
                            height={100}
                            interval={0}
                        />
                        <YAxis
                            stroke={isDarkMode ? '#d1d5db' : '#6b7280'}
                            fontSize={12}
                            tickFormatter={(value) => `$${(Number(value) / 1000).toFixed(0)}k`}
                        />
                        <Tooltip
                            content={<CustomTooltip />}
                            cursor={{ fill: isDarkMode ? 'rgba(75, 85, 99, 0.1)' : 'rgba(128, 128, 128, 0.1)' }}
                        />
                        <Legend wrapperStyle={{ bottom: 10, left: 20 }} />
                        <Bar dataKey="totalSales" fill="#3b82f6" name="Total Sales" />
                        <Bar dataKey="totalePurchase" fill="#10b981" name="Total Purchases" />
                        <Bar dataKey="borrowingPriceSales" fill="#f59e0b" name="Sales Credit" />
                        <Bar dataKey="borrowingPricePurchase" fill="#ef4444" name="Purchase Debt" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default SuppliersClientsChart;