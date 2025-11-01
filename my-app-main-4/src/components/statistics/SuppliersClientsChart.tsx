// ====================================================================
// --- SUB-COMPONENT 3: Suppliers & Clients Chart ---
// ====================================================================
import React, { useState, useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import styles from '../../Css/SupplierClient/SuppliersClientsChart.module.css';
import { useDarkMode } from '../DarkModeProvider';

// Fixed import path to match existing folder structure
import { SupplierClientData } from './basec';

interface SuppliersClientsChartProps {
    data: SupplierClientData[];
    onBarClick: (partnerId: number) => void;
}

const chartColors = {
    totalSales: '#3b82f6',        // Blue
    totalPurchases: '#10b981',   // Green
    salesCredit: '#f59e0b', // Amber
    purchaseDebt: '#ef4444', // Red
    gridLight: '#e5e7eb',
    gridDark: '#374151',
    textLight: '#6b7280',
    textDark: '#d1d5db',
    tooltipBgLight: 'rgba(255, 255, 255, 0.95)',
    tooltipBgDark: 'rgba(30, 41, 59, 0.9)',
    tooltipBorderLight: '#e2e8f0',
    tooltipBorderDark: '#4a5568',
};

const CustomTooltip = ({ active, payload, isDarkMode }: { active?: boolean, payload?: any[], isDarkMode: boolean }) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload as SupplierClientData;
        return (
            <div className={styles.tooltip} style={{ backgroundColor: isDarkMode ? chartColors.tooltipBgDark : chartColors.tooltipBgLight, borderColor: isDarkMode ? chartColors.tooltipBorderDark : chartColors.tooltipBorderLight, boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}>
                <p className={styles.tooltipName} style={{ color: isDarkMode ? chartColors.textDark : chartColors.textLight, fontWeight: 600 }}>{data.name}</p>
                <p className={styles.tooltipRow} style={{ color: chartColors.totalSales }}>
                    <i className="fas fa-chart-line" style={{ marginRight: '8px' }}></i> Total Sales: ${data.totalSales.toLocaleString()}
                </p>
                <p className={styles.tooltipRow} style={{ color: chartColors.totalPurchases }}>
                    <i className="fas fa-shopping-cart" style={{ marginRight: '8px' }}></i> Total Purchases: ${data.totalePurchase.toLocaleString()}
                </p>
                <p className={styles.tooltipRow} style={{ color: chartColors.salesCredit }}>
                    <i className="fas fa-hand-holding-usd" style={{ marginRight: '8px' }}></i> Sales Credit/Debt: ${data.borrowingPriceSales.toLocaleString()}
                </p>
                <p className={styles.tooltipRow} style={{ color: chartColors.purchaseDebt }}>
                    <i className="fas fa-receipt" style={{ marginRight: '8px' }}></i> Purchase Credit/Debt: ${data.borrowingPricePurchase.toLocaleString()}
                </p>
            </div>
        );
    }
    return null;
};

type SortByType = keyof Omit<SupplierClientData, 'name'>;

const SuppliersClientsChart: React.FC<SuppliersClientsChartProps> = ({ data, onBarClick }) => {
    // @ts-ignore
    const { isDarkMode } = useDarkMode();
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<SortByType>('totalSales');
    const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

    const processedData = useMemo(() => {
        const filteredData = data.filter(item =>
            item.name.toLowerCase().includes(searchQuery.toLowerCase())
        );

        return filteredData.sort((a, b) => {
            const valA = a[sortBy] || 0;
            const valB = b[sortBy] || 0;

            if (sortOrder === 'desc') {
                return valB - valA;
            }
            return valA - valB;
        });
    }, [data, searchQuery, sortBy, sortOrder]);

    // Calculate dynamic width for the chart to ensure it's spacious
    const chartWidth = Math.max(800, processedData.length * 80); // 80px per partner, min 800px

    return (<div className={`${styles.chartPageContainer} ${isDarkMode ? styles.dark : ''}`}> <div className={styles.mainHeader}>
                <h2 className={styles.h2}>Suppliers & Clients Analysis</h2>
                <p className={styles.pLead}>A visual comparison of financial relationships with partners.</p>
            </div>

            {/* Search and Sort Controls */}
            <div className={styles.controlsContainer}>
                <div className={styles.searchInputWrapper}>
                    <i className={`fas fa-search ${styles.searchIcon}`}></i>
                    <input
                        type="text"
                        placeholder="Search by partner name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={styles.searchInput}
                    />
                </div>
                <div className={styles.sortControls}>
                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortByType)} className={styles.sortSelect}>
                        <option value="totalSales">Sort by Total Sales</option>
                        <option value="totalePurchase">Sort by Total Purchases</option>
                        <option value="borrowingPriceSales">Sort by Sales Credit</option>
                        <option value="borrowingPricePurchase">Sort by Purchase Debt</option>
                    </select>
                    <button onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')} className={styles.sortButton} title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}>
                        <i className={`fas ${sortOrder === 'desc' ? 'fa-sort-amount-down-alt' : 'fa-sort-amount-up-alt'}`}></i>
                    </button>
                </div>
            </div>

            {/* Custom Legend */}
            <div className={styles.customLegend}>
                <div className={styles.legendItem}><span className={styles.legendColorBox} style={{ backgroundColor: chartColors.totalSales }}></span>مجموع المبيعات</div>
                <div className={styles.legendItem}><span className={styles.legendColorBox} style={{ backgroundColor: chartColors.totalPurchases }}></span>مجموع المشتريات</div>
                <div className={styles.legendItem}><span className={styles.legendColorBox} style={{ backgroundColor: chartColors.salesCredit }}></span>ائتمان المبيعات</div>
                <div className={styles.legendItem}><span className={styles.legendColorBox} style={{ backgroundColor: chartColors.purchaseDebt }}></span>دين الشراء</div>
            </div>

            {/* This wrapper makes the chart scrollable horizontally */}
            <div className={styles.chartContainer} style={{ overflowX: 'auto' }}>
                <h3 className={styles.h3}>نظرة عامة مالية حسب الشريك</h3>
                <div style={{ width: chartWidth, height: '500px' }}>
                    <BarChart
                        data={processedData}
                        width={chartWidth}
                        height={500}
                        margin={{ top: 20, right: 30, left: 20, bottom: 120 }}
                        onClick={(data: any) => { if (data && data.activePayload && data.activePayload.length > 0) { onBarClick(data.activePayload[0].payload.id); } }}
                    >
                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke={isDarkMode ? chartColors.gridDark : chartColors.gridLight}
                        />
                        <XAxis 
                            dataKey="name"
                            stroke={isDarkMode ? chartColors.textDark : chartColors.textLight} 
                            fontSize={12} 
                            angle={-45}
                            textAnchor="end"
                            interval={0}
                            height={100}
                        />
                        <YAxis 
                            stroke={isDarkMode ? chartColors.textDark : chartColors.textLight} 
                            fontSize={12}
                            tickFormatter={(value) => `$${(Number(value) / 1000).toFixed(0)}k`}
                        />
                        <Tooltip
                            content={<CustomTooltip isDarkMode={isDarkMode} />}
                            cursor={{ fill: isDarkMode ? 'rgba(75, 85, 99, 0.1)' : 'rgba(128, 128, 128, 0.1)' }}
                        />
                        <Bar dataKey="totalSales" fill={chartColors.totalSales} name="Total Sales" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="totalePurchase" fill={chartColors.totalPurchases} name="Total Purchases" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="borrowingPriceSales" fill={chartColors.salesCredit} name="Sales Credit" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="borrowingPricePurchase" fill={chartColors.purchaseDebt} name="Purchase Debt" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </div>
            </div>
        </div>
    );
};

export default SuppliersClientsChart;
