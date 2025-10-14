import { CSSProperties } from "react";
export type ProductViewMode = 'quantity' | 'value';

export interface ChartDataPoint {
    date: string;
    displayDate: string;
    totalAmount: number;
    documentCount: number;
    avgValue: number;
}
export interface SupplierClientData {
    name: string;
    borrowingPricePurchase: number;
    borrowingPriceSales: number;
    totalePurchase: number;
    totalSales: number;
}
export interface ProductChartData {
    name: string;
    soldQuantity: number;
    soldValue: number;
    purchasedQuantity: number;
    purchasedValue: number;
    salesReturnedQuantity: number;
    salesReturnedValue: number;
    purchaseReturnedQuantity: number;
    purchaseReturnedValue: number;
}
export type StyleSet = { [key: string]: CSSProperties };
type ActiveButtonFn = (isActive: boolean) => CSSProperties;

// --- Style Definitions (Shared) ---
export const styles: StyleSet = {
    pageContainer: { minHeight: '100vh', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', fontFamily: 'system-ui, -apple-system, sans-serif', transition: 'background-color 0.3s ease, color 0.3s ease' },
    flexContainer: { display: 'flex', height: '100vh' },
    mainContent: { flex: 1, padding: '24px', overflowY: 'auto' },
    mainHeader: { marginBottom: '32px' },
    h2: { fontSize: '28px', fontWeight: '600', margin: '0 0 8px 0', color: 'var(--accent-color)' },
    h3: { fontSize: '16px', fontWeight: '500', margin: '0 0 16px 0', color: 'var(--text-secondary)' },
    pLead: { color: 'var(--text-secondary)', margin: '0', fontSize: '16px' },
    controlsContainer: { display: 'flex', gap: '24px', marginBottom: '32px', flexWrap: 'wrap', alignItems: 'center' },
    buttonGroup: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
    selectContainer: { display: 'flex', alignItems: 'center', gap: '8px' },
    select: { padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s ease' },
    checkboxLabel: { display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', color: 'var(--text-secondary)' },
    chartContainer: { padding: '24px', borderRadius: '12px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', height: '500px', transition: 'background-color 0.3s ease, border-color 0.3s ease' },
};
export const getActiveButton: ActiveButtonFn = (isActive) => ({ padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '500', transition: 'all 0.2s ease', border: `1px solid ${isActive ? 'var(--accent-color)' : 'var(--border-color)'}`, backgroundColor: isActive ? 'var(--accent-color)' : 'var(--bg-secondary)', color: isActive ? '#fff' : 'var(--text-primary)' });
