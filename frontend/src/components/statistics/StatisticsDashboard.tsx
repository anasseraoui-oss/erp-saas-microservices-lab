import React, { useState, useMemo, useEffect } from 'react';
import { useGlobalDarkMode } from "../hook/useGlobalDarkMode"; // Add this import
import {getAllOrdersOrInvoices, OrderType, ServiceType} from "../../api/OrderInvoiceService";
import { getSupplerClients } from "../../api/supplierClientService";
import { getAllProducts } from "../../api/product/productService";
import { getAllLines } from "../../api/lineApiService";
import DashboardSidebar from "./DashboardSidebar";
import {ChartDataPoint, ProductChartData, ProductViewMode, styles, SupplierClientData} from './basec';
import InvoicesOrdersChart from "./InvoicesOrdersChart";
import SuppliersClientsChart from "./SuppliersClientsChart";
import ProductsChart from "./ProductsChart";
import PaymentStatistics from "./PaymentStatistics";
import AdvancedPaymentStatistics from './AdvancedPaymentStatistics';

// ====================================================================
// --- MAIN CONTAINER COMPONENT: StatisticsDashboard ---
// ====================================================================
const categoryToApiParams: { [key: string]: { serviceType: ServiceType; orderType: OrderType } } = {
    'Sales Invoices': { serviceType: 'sales', orderType: 'Invoice' },
    'Purchase Invoices': { serviceType: 'purchases', orderType: 'Invoice' },
    'Sales Orders': { serviceType: 'sales', orderType: 'Order' },
    'Purchase Orders': { serviceType: 'purchases', orderType: 'Order' },
};

const StatisticsDashboard = () => {
    // Replace the old dark mode logic with the global hook
    useGlobalDarkMode();

    const [selectedStatistic, setSelectedStatistic] = useState('invoices-orders');
    const [productViewMode, setProductViewMode] = useState<ProductViewMode>('quantity');

    // State for data, loading, and errors
    const [rawInvoiceOrderData, setRawInvoiceOrderData] = useState<any[]>([]);
    const [rawSupplierClientData, setRawSupplierClientData] = useState<SupplierClientData[]>([]);
    const [rawProducts, setRawProducts] = useState<any[]>([]);
    const [rawSalesLines, setRawSalesLines] = useState<any[]>([]);
    const [rawPurchaseLines, setRawPurchaseLines] = useState<any[]>([]);
    const [rawSalesReturnLines, setRawSalesReturnLines] = useState<any[]>([]);
    const [rawPurchaseReturnLines, setRawPurchaseReturnLines] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // State for UI controls
    const [selectedCategory, setSelectedCategory] = useState('Sales Invoices');
    const [timeRange, setTimeRange] = useState('Last 30 Days');
    const [showSecondaryAxis, setShowSecondaryAxis] = useState(false);

    const categories = ['Sales Invoices', 'Purchase Invoices', 'Sales Orders', 'Purchase Orders'];
    const timeRanges = ['Last 7 Days', 'Last 30 Days', 'Last 90 Days', 'Year to Date'];

    // --- Data Fetching Logic (No Changes) ---
    useEffect(() => {
        const fetchAllData = async () => {
            setLoading(true);
            setError(null);
            try {
                if (selectedStatistic === 'invoices-orders') {
                    const apiParams = categoryToApiParams[selectedCategory];
                    const data = await getAllOrdersOrInvoices(apiParams.serviceType, apiParams.orderType);
                    setRawInvoiceOrderData(data);
                } else if (selectedStatistic === 'suppliers-clients') {
                    const data = await getSupplerClients();
                    setRawSupplierClientData(data);
                } else if (selectedStatistic === 'products') {
                    const [products, salesLines, purchaseLines, salesReturnLines, purchaseReturnLines] = await Promise.all([
                        getAllProducts(), getAllLines('sales', 'line'), getAllLines('purchases', 'line'),
                        getAllLines('sales', 'lineReturn'), getAllLines('purchases', 'lineReturn')
                    ]);
                    setRawProducts(products);
                    setRawSalesLines(salesLines);
                    setRawPurchaseLines(purchaseLines);
                    setRawSalesReturnLines(salesReturnLines);
                    setRawPurchaseReturnLines(purchaseReturnLines);
                }
            } catch (err: any) {
                setError(err.message || "Failed to load data.");
            } finally {
                setLoading(false);
            }
        };
        fetchAllData();
    }, [selectedStatistic, selectedCategory]);

    // --- Data Memoization Logic (No Changes) ---
    const invoiceOrderChartData = useMemo((): ChartDataPoint[] => {
        if (selectedStatistic !== 'invoices-orders' || !rawInvoiceOrderData.length) return [];
        const now = new Date();
        const daysToLookBack = timeRange === 'Last 7 Days' ? 7 : timeRange === 'Last 30 Days' ? 30 : timeRange === 'Last 90 Days' ? 90 : Math.ceil((now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) / (1000 * 60 * 60 * 24));
        const cutoffDate = new Date();
        cutoffDate.setDate(now.getDate() - daysToLookBack);
        const filteredData = rawInvoiceOrderData.filter(item => new Date(item.date) >= cutoffDate);
        const dateGroups: { [key: string]: ChartDataPoint } = {};
        for (let i = 0; i < daysToLookBack; i++) {
            const date = new Date();
            date.setDate(now.getDate() - i);
            const dateKey = date.toISOString().split('T')[0];
            dateGroups[dateKey] = { date: dateKey, displayDate: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), totalAmount: 0, documentCount: 0, avgValue: 0 };
        }
        filteredData.forEach(item => {
            const dateKey = new Date(item.date).toISOString().split('T')[0];
            if (dateGroups[dateKey]) {
                dateGroups[dateKey].totalAmount += item.totalAmount;
                dateGroups[dateKey].documentCount += 1;
            }
        });
        Object.values(dateGroups).forEach(g => { if (g.documentCount > 0) g.avgValue = Math.round(g.totalAmount / g.documentCount); });
        return Object.values(dateGroups).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [rawInvoiceOrderData, timeRange, selectedStatistic]);

    const productChartData = useMemo((): ProductChartData[] => {
        if (selectedStatistic !== 'products' || !rawProducts.length) return [];
        const productStats: { [key: number]: ProductChartData } = {};
        rawProducts.forEach((product: any) => {
            productStats[product.id] = { name: product.name, soldQuantity: 0, soldValue: 0, purchasedQuantity: 0, purchasedValue: 0, salesReturnedQuantity: 0, salesReturnedValue: 0, purchaseReturnedQuantity: 0, purchaseReturnedValue: 0 };
        });
        rawSalesLines.forEach((line: any) => { if (productStats[line.productId]) { productStats[line.productId].soldQuantity += line.quantity; productStats[line.productId].soldValue += (line.quantity * line.price); } });
        rawPurchaseLines.forEach((line: any) => { if (productStats[line.productId]) { productStats[line.productId].purchasedQuantity += line.quantity; productStats[line.productId].purchasedValue += (line.quantity * line.price); } });
        rawSalesReturnLines.forEach((line: any) => { if (productStats[line.productId]) { productStats[line.productId].salesReturnedQuantity += line.quantity; productStats[line.productId].salesReturnedValue += (line.quantity * line.price); } });
        rawPurchaseReturnLines.forEach((line: any) => { if (productStats[line.productId]) { productStats[line.productId].purchaseReturnedQuantity += line.quantity; productStats[line.productId].purchaseReturnedValue += (line.quantity * line.price); } });
        return Object.values(productStats).sort((a, b) => b.soldValue - a.soldValue).slice(0, 10);
    }, [rawProducts, rawSalesLines, rawPurchaseLines, rawSalesReturnLines, rawPurchaseReturnLines, selectedStatistic]);

    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorDisplay error={error} />;

    return (
        <div style={styles.pageContainer}>
            <div style={styles.flexContainer}>
                <DashboardSidebar selectedStatistic={selectedStatistic} onSelectStatistic={setSelectedStatistic} />
                <div style={styles.mainContent}>
                    {selectedStatistic === 'invoices-orders' && (
                        <InvoicesOrdersChart
                            data={invoiceOrderChartData}
                            categories={categories}
                            selectedCategory={selectedCategory}
                            onSelectCategory={setSelectedCategory}
                            timeRanges={timeRanges}
                            timeRange={timeRange}
                            onTimeRangeChange={(e) => setTimeRange(e.target.value)}
                            showSecondaryAxis={showSecondaryAxis}
                            onToggleSecondaryAxis={(e) => setShowSecondaryAxis(e.target.checked)}
                        />
                    )}
                    {selectedStatistic === 'suppliers-clients' && (
                        <SuppliersClientsChart data={rawSupplierClientData} />
                    )}
                    {selectedStatistic === 'products' && (
                        <ProductsChart
                            data={productChartData}
                            viewMode={productViewMode}
                            onViewModeChange={setProductViewMode}
                        />
                    )}
                    {selectedStatistic === "payment-invoices-orders" &&  (
                        <PaymentStatistics />
                    )}
                    {selectedStatistic === "advanced-payment-stats" &&  (
                        <AdvancedPaymentStatistics />
                    )}
                </div>
            </div>
        </div>
    );
};

const LoadingSpinner = () => (
    <div style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg-primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'background-color 0.3s ease'
    }}>
        <div style={{ textAlign: 'center' }}>
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            <div style={{
                width: '40px',
                height: '40px',
                border: '4px solid var(--border-color)',
                borderTop: '4px solid var(--accent-color)',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 16px'
            }}></div>
            <p style={{ color: 'var(--text-primary)' }}>Loading statistics...</p>
        </div>
    </div>
);

const ErrorDisplay = ({ error }: { error: string }) => (
    <div style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg-primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'background-color 0.3s ease'
    }}>
        <div style={{
            textAlign: 'center',
            maxWidth: '400px',
            padding: '20px',
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: '12px',
            border: '1px solid #dc2626',
            transition: 'background-color 0.3s ease'
        }}>
            <div style={{
                backgroundColor: '#dc2626',
                color: 'white',
                padding: '12px',
                borderRadius: '8px',
                marginBottom: '16px'
            }}>{error}</div>
            <button
                onClick={() => window.location.reload()}
                style={{
                    padding: '8px 16px',
                    backgroundColor: 'var(--accent-color)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                }}
            >
                Retry
            </button>
        </div>
    </div>
);

export default StatisticsDashboard;