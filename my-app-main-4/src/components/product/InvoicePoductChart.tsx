import React, { useState, useEffect, useRef } from 'react';
import { Chart, registerables, ChartType } from 'chart.js';
import 'chartjs-adapter-date-fns';
import { getAllOrdersOrInvoices } from '../../api/OrderInvoiceService';
import { useDarkMode } from '../DarkModeProvider';
import '../../Css/product/InvoiceProductChart.css';
import { Invoice } from '../../classe/Invoice';
import { getAllLinesAllContexts } from "../../api/lineApiService";

interface Line {
    productId: number;
    quantity: number;
    price: number;
    salesInvoiceId?: number;
    purchaseInvoiceId?: number;
}

interface ProcessedDataPoint {
    date: string;
    total: number;
}

Chart.register(...registerables);

const aggregateDataByDate = (data: ProcessedDataPoint[]): ProcessedDataPoint[] => {
    const map = new Map<string, number>();
    data.forEach(({ date, total }) => {
        const day = new Date(date).toISOString().split('T')[0];
        map.set(day, (map.get(day) || 0) + total);
    });
    return Array.from(map.entries()).map(([date, total]) => ({ date, total }));
};

const InvoiceProductChart = ({ productId }: { productId: number }) => {
    const [chartData, setChartData] = useState<{ sales: ProcessedDataPoint[]; purchases: ProcessedDataPoint[] }>({ sales: [], purchases: [] });
    const [loading, setLoading] = useState(true);
    // @ts-ignore
    const { isDarkMode } = useDarkMode(); // @ts-ignore
    const chartRef = useRef<HTMLCanvasElement | null>(null);
    const chartInstanceRef = useRef<Chart<ChartType, any[]> | null>(null);

    useEffect(() => {
        let active = true;

        const fetchData = async () => {
            setLoading(true);
            try {
                const [salesInvs, purchaseInvs, salesLinesRes, purchaseLinesRes] = await Promise.all([
                    getAllOrdersOrInvoices('sales', 'Invoice'),
                    getAllOrdersOrInvoices('purchases', 'Invoice'),
                    getAllLinesAllContexts('sales', "line"),
                    getAllLinesAllContexts('purchases', "lineReturn")
                ]);

                if (!active || !salesLinesRes || !purchaseLinesRes) return;

                const salesDates = new Map((salesInvs as Invoice[]).map((inv) => [Number(inv.id), inv.date]));
                const purchaseDates = new Map((purchaseInvs as Invoice[]).map((inv) => [Number(inv.id), inv.date]));

                const salesLines = (salesLinesRes as Line[]).filter((line) => line.productId === productId);
                const purchaseLines = (purchaseLinesRes as Line[]).filter((line) => line.productId === productId);

                const salesData = salesLines
                    .map((line) => ({ date: salesDates.get(Number(line.salesInvoiceId!)), total: line.quantity * line.price }))
                    .filter((d): d is ProcessedDataPoint => !!d.date);

                const purchaseData = purchaseLines
                    .map((line) => ({ date: purchaseDates.get(Number(line.purchaseInvoiceId!)), total: line.quantity * line.price }))
                    .filter((d): d is ProcessedDataPoint => !!d.date);

                if (active) {
                    setChartData({
                        sales: aggregateDataByDate(salesData),
                        purchases: aggregateDataByDate(purchaseData)
                    });
                }
            } catch (err) {
                console.error('Chart data error:', err);
                if (active) setChartData({ sales: [], purchases: [] });
            } finally {
                if (active) setLoading(false);
            }
        };

        fetchData();
        return () => {
            active = false;
        };
    }, [productId]);

    useEffect(() => {
        if (!chartRef.current) return;

        if (chartInstanceRef.current) chartInstanceRef.current.destroy();
        if (!chartData.sales.length && !chartData.purchases.length) return;

        const ctx = chartRef.current.getContext('2d');
        if (!ctx) return;

        const color = isDarkMode ? '#fff' : '#222';
        const grid = isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';

        chartInstanceRef.current = new Chart(ctx, {
            type: 'line',
            data: {
                datasets: [
                    {
                        label: 'Sales',
                        data: chartData.sales.map(({ date, total }) => ({ x: new Date(date), y: total })),
                        borderColor: '#007bff',
                        backgroundColor: 'rgba(0,123,255,0.2)',
                        fill: true,
                        tension: 0.4
                    },
                    {
                        label: 'Purchases',
                        data: chartData.purchases.map(({ date, total }) => ({ x: new Date(date), y: total })),
                        borderColor: '#28a745',
                        backgroundColor: 'rgba(40,167,69,0.2)',
                        fill: true,
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        type: 'time',
                        time: { unit: 'day' },
                        grid: { color: grid },
                        ticks: { color }
                    },
                    y: {
                        beginAtZero: true,
                        grid: { color: grid },
                        ticks: {
                            color,
                            callback: (value) => `$${Number(value).toLocaleString()}`
                        }
                    }
                },
                plugins: {
                    legend: { labels: { color } },
                    title: { display: true, text: 'Sales & Purchases Trend', color }
                }
            }
        });
    }, [chartData, isDarkMode]);

    return (
        <div className={`chart-container ${isDarkMode ? 'dark-mode' : ''}`}>
            {loading ? (
                <div className="chart-loader" />
            ) : chartData.sales.length === 0 && chartData.purchases.length === 0 ? (
                <div className="chart-no-data">
                    <i className="fas fa-chart-line"></i>
                    No sales or purchase data available for this product.
                </div>
            ) : (
                <canvas ref={chartRef} />
            )}
        </div>
    );
};

export default InvoiceProductChart;
