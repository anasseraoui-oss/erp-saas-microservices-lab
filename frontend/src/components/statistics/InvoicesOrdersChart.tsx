import {CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis} from "recharts";
import React from "react";
import {ChartDataPoint, getActiveButton, styles} from "./basec";
import {Calendar} from "lucide-react";
interface InvoicesOrdersChartProps {
    data: ChartDataPoint[];
    categories: string[];
    selectedCategory: string;
    onSelectCategory: (category: string) => void;
    timeRanges: string[];
    timeRange: string;
    onTimeRangeChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    showSecondaryAxis: boolean;
    onToggleSecondaryAxis: (e: React.ChangeEvent<HTMLInputElement>) => void;
}
// --- Helper Components (Tooltips, Loading, Error) - No Changes ---
const CustomTooltip = ({ active, payload }: { active?: boolean, payload?: any[] }) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload as ChartDataPoint;
        return (
            <div style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--accent-color)', borderRadius: '8px', padding: '12px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)', transition: 'background-color 0.3s ease' }}>
                <p style={{ color: 'var(--text-primary)', margin: '0 0 8px 0', fontWeight: '500' }}>{new Date(data.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <p style={{ color: 'var(--accent-color)', margin: '0 0 4px 0' }}>Total Amount: ${data.totalAmount.toLocaleString()}</p>
                <p style={{ color: 'var(--text-secondary)', margin: '0 0 4px 0' }}>Documents: {data.documentCount}</p>
                <p style={{ color: 'var(--text-secondary)', margin: '0' }}>Avg Value: ${data.avgValue.toLocaleString()}</p>
            </div>
        );
    } return null;
};
const InvoicesOrdersChart: React.FC<InvoicesOrdersChartProps> = ({ data, categories, selectedCategory, onSelectCategory, timeRanges, timeRange, onTimeRangeChange, showSecondaryAxis, onToggleSecondaryAxis }) => (
    <>
        <div style={styles.mainHeader}>
            <h2 style={styles.h2}>Invoices & Orders Analysis</h2>
            <p style={styles.pLead}>Track your business performance over time</p>
        </div>
        <div style={styles.controlsContainer}>
            <div style={styles.buttonGroup}>{categories.map(cat => (<button key={cat} onClick={() => onSelectCategory(cat)} style={getActiveButton(selectedCategory === cat)}>{cat}</button>))}</div>
            <div style={styles.selectContainer}><Calendar size={16} style={{ color: 'var(--text-secondary)' }} /><select value={timeRange} onChange={onTimeRangeChange} style={styles.select}>{timeRanges.map(range => (<option key={range} value={range}>{range}</option>))}</select></div>
            <label style={styles.checkboxLabel}><input type="checkbox" checked={showSecondaryAxis} onChange={onToggleSecondaryAxis} style={{ accentColor: 'var(--accent-color)' }} />Show Document Count</label>
        </div>
        <div style={styles.chartContainer}>
            <h3 style={styles.h3}>{selectedCategory} - {timeRange}</h3>
            <ResponsiveContainer width="100%" height="90%">
                <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                    <XAxis dataKey="displayDate" stroke="var(--text-secondary)" fontSize={12} />
                    <YAxis yAxisId="amount" stroke="var(--text-secondary)" fontSize={12} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                    {showSecondaryAxis && <YAxis yAxisId="count" orientation="right" stroke="var(--chart-green)" fontSize={12} />}
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--chart-cursor)' }} />
                    <Line yAxisId="amount" type="monotone" dataKey="totalAmount" stroke="var(--accent-color)" strokeWidth={3} dot={{ r: 0 }} activeDot={{ r: 6 }} />
                    {showSecondaryAxis && <Line yAxisId="count" type="monotone" dataKey="documentCount" stroke="var(--chart-green)" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 0 }} />}
                </LineChart>
            </ResponsiveContainer>
        </div>
    </>
);
export default InvoicesOrdersChart;