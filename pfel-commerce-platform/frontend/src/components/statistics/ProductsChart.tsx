
// ====================================================================
// --- SUB-COMPONENT 4: Products Chart ---
// ====================================================================
import {getActiveButton, ProductChartData, ProductViewMode, styles} from "./basec";
import {Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis} from "recharts";
import React from "react";

interface ProductsChartProps {
    data: ProductChartData[];
    viewMode: ProductViewMode;
    onViewModeChange: (mode: ProductViewMode) => void;
}
const ProductTooltip = ({ active, payload, viewMode }: { active?: boolean, payload?: any[], viewMode: ProductViewMode }) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload as ProductChartData;
        const format = (val: number) => viewMode === 'value' ? `$${val.toLocaleString()}` : `${val.toLocaleString()} units`;
        return (
            <div style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--accent-color)', borderRadius: '8px', padding: '12px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)' }}>
                <p style={{ color: 'var(--text-primary)', margin: '0 0 8px 0', fontWeight: '500' }}>{data.name}</p>
                <p style={{ color: 'var(--accent-color)', margin: '0 0 4px 0' }}>Sold: {format(viewMode === 'value' ? data.soldValue : data.soldQuantity)}</p>
                <p style={{ color: 'var(--chart-green)', margin: '0 0 4px 0' }}>Purchased: {format(viewMode === 'value' ? data.purchasedValue : data.purchasedQuantity)}</p>
                <p style={{ color: 'var(--chart-red)', margin: '0 0 4px 0' }}>Sales Returns: {format(viewMode === 'value' ? data.salesReturnedValue : data.salesReturnedQuantity)}</p>
                <p style={{ color: 'var(--chart-yellow)', margin: '0' }}>Purchase Returns: {format(viewMode === 'value' ? data.purchaseReturnedValue : data.purchaseReturnedQuantity)}</p>
            </div>
        );
    } return null;
};
const chartColors = {
    sold: '#3b82f6',        // أزرق
    purchased: '#10b981',   // أخضر
    salesReturns: '#ef4444', // أحمر
    purchaseReturns: '#f59e0b', // أصفر/برتقالي
    border: '#374151',      // رمادي للحدود
    text: '#6b7280'         // رمادي للنص
};const ProductsChart: React.FC<ProductsChartProps> = ({ data, viewMode, onViewModeChange }) => (
    <>
        <div style={styles.mainHeader}>
            <h2 style={styles.h2}>Product Performance Analysis</h2>
            <p style={styles.pLead}>Top 10 products by metrics</p>
        </div>
        <div style={styles.controlsContainer}>
            <div style={styles.buttonGroup}>
                <button onClick={() => onViewModeChange('quantity')} style={getActiveButton(viewMode === 'quantity')}>By Quantity</button>
                <button onClick={() => onViewModeChange('value')} style={getActiveButton(viewMode === 'value')}>By Value</button>
            </div>
        </div>
        <div style={styles.chartContainer}>
            <h3 style={styles.h3}>Top 10 Products by {viewMode === 'quantity' ? 'Volume' : 'Value'}</h3>
            <ResponsiveContainer width="100%" height="90%">
                <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartColors.border} />
                    <XAxis
                        dataKey="name"
                        stroke={chartColors.text}
                        fontSize={12}
                        angle={-45}
                        textAnchor="end"
                        interval={0}
                    />
                    <YAxis
                        stroke={chartColors.text}
                        fontSize={12}
                        tickFormatter={(value) => viewMode === 'value' ? `$${(Number(value) / 1000).toFixed(0)}k` : value}
                    />
                    <Tooltip content={<ProductTooltip viewMode={viewMode} />} cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }} />
                    <Legend />
                    <Bar dataKey={viewMode === 'quantity' ? 'soldQuantity' : 'soldValue'} fill={chartColors.sold} name="Sold" />
                    <Bar dataKey={viewMode === 'quantity' ? 'purchasedQuantity' : 'purchasedValue'} fill={chartColors.purchased} name="Purchased" />
                    <Bar dataKey={viewMode === 'quantity' ? 'salesReturnedQuantity' : 'salesReturnedValue'} fill={chartColors.salesReturns} name="Sales Returns" />
                    <Bar dataKey={viewMode === 'quantity' ? 'purchaseReturnedQuantity' : 'purchaseReturnedValue'} fill={chartColors.purchaseReturns} name="Purchase Returns" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    </>
);
export default ProductsChart;