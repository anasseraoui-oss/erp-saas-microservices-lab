import React, { useEffect, useState } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, Filler, BarElement } from 'chart.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import { useDarkMode } from "../DarkModeProvider";
import { Product } from "../../classe/Product";
import {ClientSupplier} from "../../classe/ClientSupplier";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, Filler, BarElement);

interface EnhancedStatsProps {
    products?: Product[];
    suppliers?: ClientSupplier[];
    dataType: 'products' | 'suppliers' | 'both';
}

const EnhancedStats: React.FC<EnhancedStatsProps> = ({ products = [], suppliers = [], dataType }) => {
    // @ts-ignore
    const { isDarkMode } = useDarkMode();
    const [chartData, setChartData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const processChartData = async () => {
            setIsLoading(true);

            // Activity tracking for time series
            const activityData: { [key: string]: {
                    productCreations: number;
                    productUpdates: number;
                    supplierCreations: number;
                    supplierUpdates: number;
                } } = {};

            // User interactions
            const userInteractions: { [key: string]: { products: number; suppliers: number; total: number } } = {};

            // Category analysis
            const categoryData: { [key: string]: number } = {};

            // Financial data for suppliers
            let totalPurchases = 0;
            let totalSales = 0;
            const supplierFinancials: { name: string; purchases: number; sales: number; profit: number }[] = [];

            // Simple user name resolver
            const resolveUserName = (executor: string | number | undefined): string => {
                if (!executor) return 'Unknown';
                if (typeof executor === 'string') return executor;
                return `User #${executor}`;
            };

            // Process Products
            if (products && (dataType === 'products' || dataType === 'both')) {
                for (const product of products) {
                    if (!product.dateCreating) continue;

                    const creationDate = new Date(product.dateCreating);
                    const monthKey = `${creationDate.getFullYear()}-${String(creationDate.getMonth() + 1).padStart(2, '0')}`;

                    if (!activityData[monthKey]) {
                        activityData[monthKey] = { productCreations: 0, productUpdates: 0, supplierCreations: 0, supplierUpdates: 0 };
                    }
                    activityData[monthKey].productCreations++;

                    const userName = resolveUserName(product.userExecutor);
                    if (!userInteractions[userName]) {
                        userInteractions[userName] = { products: 0, suppliers: 0, total: 0 };
                    }
                    userInteractions[userName].products++;
                    userInteractions[userName].total++;

                    // Category tracking for products
                    if (product.category) {
                        categoryData[`Product: ${product.category}`] = (categoryData[`Product: ${product.category}`] || 0) + 1;
                    }

                    // Handle product updates
                    if (product.dateLastModification && new Date(product.dateLastModification).getTime() !== creationDate.getTime()) {
                        const updateDate = new Date(product.dateLastModification);
                        const updateMonthKey = `${updateDate.getFullYear()}-${String(updateDate.getMonth() + 1).padStart(2, '0')}`;
                        if (!activityData[updateMonthKey]) {
                            activityData[updateMonthKey] = { productCreations: 0, productUpdates: 0, supplierCreations: 0, supplierUpdates: 0 };
                        }
                        activityData[updateMonthKey].productUpdates++;
                    }
                }
            }

            // Process Suppliers
            if (suppliers && (dataType === 'suppliers' || dataType === 'both')) {
                for (const supplier of suppliers) {
                    if (!supplier.createdAt) continue;

                    const creationDate = new Date(supplier.createdAt);
                    const monthKey = `${creationDate.getFullYear()}-${String(creationDate.getMonth() + 1).padStart(2, '0')}`;

                    if (!activityData[monthKey]) {
                        activityData[monthKey] = { productCreations: 0, productUpdates: 0, supplierCreations: 0, supplierUpdates: 0 };
                    }
                    activityData[monthKey].supplierCreations++;

                    const userName = resolveUserName(supplier.userExecutor);
                    if (!userInteractions[userName]) {
                        userInteractions[userName] = { products: 0, suppliers: 0, total: 0 };
                    }
                    userInteractions[userName].suppliers++;
                    userInteractions[userName].total++;

                    // Category tracking for suppliers
                    if (supplier.category) {
                        categoryData[`Supplier: ${supplier.category}`] = (categoryData[`Supplier: ${supplier.category}`] || 0) + 1;
                    }

                    // Financial tracking
                    totalPurchases += supplier.totalePurchase || 0;
                    totalSales += supplier.totalSales || 0;

                    supplierFinancials.push({
                        name: supplier.name,
                        purchases: supplier.totalePurchase || 0,
                        sales: supplier.totalSales || 0,
                        profit: (supplier.totalSales || 0) - (supplier.totalePurchase || 0)
                    });

                    // Handle supplier updates
                    if (supplier.updatedAt && new Date(supplier.updatedAt).getTime() !== creationDate.getTime()) {
                        const updateDate = new Date(supplier.updatedAt);
                        const updateMonthKey = `${updateDate.getFullYear()}-${String(updateDate.getMonth() + 1).padStart(2, '0')}`;
                        if (!activityData[updateMonthKey]) {
                            activityData[updateMonthKey] = { productCreations: 0, productUpdates: 0, supplierCreations: 0, supplierUpdates: 0 };
                        }
                        activityData[updateMonthKey].supplierUpdates++;
                    }
                }
            }

            // Prepare time series data
            const sortedMonths = Object.keys(activityData).sort();
            const timeLabels = sortedMonths.map(month => new Date(month + '-01').toLocaleString('default', { month: 'short', year: 'numeric' }));

            const datasets = [];

            if (dataType === 'products' || dataType === 'both') {
                datasets.push(
                    {
                        label: 'Products Created',
                        data: sortedMonths.map(month => activityData[month].productCreations),
                        borderColor: 'rgb(54, 162, 235)',
                        backgroundColor: 'rgba(54, 162, 235, 0.2)',
                        fill: true,
                        tension: 0.4
                    },
                    {
                        label: 'Products Updated',
                        data: sortedMonths.map(month => activityData[month].productUpdates),
                        borderColor: 'rgb(255, 99, 132)',
                        backgroundColor: 'rgba(255, 99, 132, 0.2)',
                        fill: true,
                        tension: 0.4
                    }
                );
            }

            if (dataType === 'suppliers' || dataType === 'both') {
                datasets.push(
                    {
                        label: 'Suppliers Created',
                        data: sortedMonths.map(month => activityData[month].supplierCreations),
                        borderColor: 'rgb(75, 192, 192)',
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        fill: true,
                        tension: 0.4
                    },
                    {
                        label: 'Suppliers Updated',
                        data: sortedMonths.map(month => activityData[month].supplierUpdates),
                        borderColor: 'rgb(255, 159, 64)',
                        backgroundColor: 'rgba(255, 159, 64, 0.2)',
                        fill: true,
                        tension: 0.4
                    }
                );
            }

            // Prepare user activity data
            const sortedUsers = Object.entries(userInteractions).sort((a, b) => b[1].total - a[1].total).slice(0, 7);
            const userLabels = sortedUsers.map(entry => entry[0]);
            const userData = sortedUsers.map(entry => entry[1].total);

            // Prepare category data
            const sortedCategories = Object.entries(categoryData).sort((a, b) => b[1] - a[1]).slice(0, 8);
            const categoryLabels = sortedCategories.map(entry => entry[0]);
            const categoryCounts = sortedCategories.map(entry => entry[1]);

            // Top profitable suppliers (for supplier view)
            const topSuppliers = supplierFinancials.sort((a, b) => b.profit - a.profit).slice(0, 6);

            setChartData({
                timeSeries: {
                    labels: timeLabels,
                    datasets: datasets,
                },
                userActivity: {
                    labels: userLabels,
                    datasets: [{
                        label: 'Total Interactions',
                        data: userData,
                        backgroundColor: [
                            'rgba(75, 192, 192, 0.7)',
                            'rgba(255, 159, 64, 0.7)',
                            'rgba(153, 102, 255, 0.7)',
                            'rgba(255, 205, 86, 0.7)',
                            'rgba(54, 162, 235, 0.7)',
                            'rgba(255, 99, 132, 0.7)',
                            'rgba(201, 203, 207, 0.7)'
                        ],
                        borderColor: isDarkMode ? '#1a1a2e' : '#ffffff',
                        borderWidth: 3,
                    }],
                },
                categoryDistribution: {
                    labels: categoryLabels,
                    datasets: [{
                        label: 'Items by Category',
                        data: categoryCounts,
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.8)',
                            'rgba(54, 162, 235, 0.8)',
                            'rgba(255, 205, 86, 0.8)',
                            'rgba(75, 192, 192, 0.8)',
                            'rgba(153, 102, 255, 0.8)',
                            'rgba(255, 159, 64, 0.8)',
                            'rgba(199, 199, 199, 0.8)',
                            'rgba(83, 102, 255, 0.8)'
                        ],
                        borderColor: isDarkMode ? '#1a1a2e' : '#ffffff',
                        borderWidth: 2,
                    }],
                },
                supplierProfitability: dataType !== 'products' ? {
                    labels: topSuppliers.map(s => s.name),
                    datasets: [{
                        label: 'Profit Margin',
                        data: topSuppliers.map(s => s.profit),
                        backgroundColor: topSuppliers.map(s => s.profit >= 0 ? 'rgba(34, 197, 94, 0.7)' : 'rgba(239, 68, 68, 0.7)'),
                        borderColor: topSuppliers.map(s => s.profit >= 0 ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)'),
                        borderWidth: 2,
                    }],
                } : null,
                totalFinancials: {
                    totalPurchases,
                    totalSales,
                    totalProfit: totalSales - totalPurchases
                }
            });
            setIsLoading(false);
        };

        if ((products && products.length > 0) || (suppliers && suppliers.length > 0)) {
            processChartData();
        } else {
            setIsLoading(false);
            setChartData(null);
        }
    }, [products, suppliers, dataType, isDarkMode]);

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top' as const,
                labels: {
                    color: isDarkMode ? '#e2e8f0' : '#4a5568',
                    font: { size: 14 }
                },
            },
            title: {
                display: true,
                color: isDarkMode ? '#e2e8f0' : '#2d3748',
                font: {
                    size: 18,
                    weight: 'bold' as const
                },
            },
            tooltip: {
                backgroundColor: isDarkMode ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                titleColor: isDarkMode ? '#e2e8f0' : '#2d3748',
                bodyColor: isDarkMode ? '#cbd5e1' : '#4a5568',
                borderColor: isDarkMode ? '#4a5568' : '#e2e8f0',
                borderWidth: 1,
            }
        },
        scales: {
            x: {
                ticks: { color: isDarkMode ? '#a0aec0' : '#6c757d' },
                grid: { color: isDarkMode ? 'rgba(74, 85, 106, 0.4)' : 'rgba(226, 232, 240, 0.6)' },
            },
            y: {
                ticks: { color: isDarkMode ? '#a0aec0' : '#6c757d' },
                grid: { color: isDarkMode ? 'rgba(74, 85, 106, 0.4)' : 'rgba(226, 232, 240, 0.6)' },
            },
        },
    };

    const doughnutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'right' as const,
                labels: {
                    color: isDarkMode ? '#e2e8f0' : '#4a5568',
                    font: { size: 14 },
                    boxWidth: 20
                }
            },
            title: {
                ...chartOptions.plugins.title,
            },
            tooltip: chartOptions.plugins.tooltip
        }
    };

    const containerClasses = `p-6 rounded-2xl shadow-lg transition-all duration-300 ${
        isDarkMode ? 'bg-gray-800/90 border border-gray-700' : 'bg-white/95 border border-gray-200'
    }`;

    const getTitle = () => {
        switch (dataType) {
            case 'products': return 'Product Statistics Dashboard';
            case 'suppliers': return 'Supplier Statistics Dashboard';
            case 'both': return 'Products & Suppliers Statistics Dashboard';
            default: return 'Statistics Dashboard';
        }
    };

    if (isLoading) {
        return <div className="p-8 text-center">Loading statistics...</div>;
    }

    if (!chartData || (products.length === 0 && suppliers.length === 0)) {
        return <div className="p-8 text-center">No data available to generate statistics.</div>;
    }

    return (
        <div className="p-4 md:p-8 space-y-8">
            <h1 className={`text-3xl font-bold text-center mb-4 ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                {getTitle()}
            </h1>

            {/* Financial Summary for Suppliers */}
            {(dataType === 'suppliers' || dataType === 'both') && chartData.totalFinancials && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className={`${containerClasses} text-center`}>
                        <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                            Total Purchases
                        </h3>
                        <p className={`text-2xl font-bold text-blue-500`}>
                            ${chartData.totalFinancials.totalPurchases.toLocaleString()}
                        </p>
                    </div>
                    <div className={`${containerClasses} text-center`}>
                        <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                            Total Sales
                        </h3>
                        <p className={`text-2xl font-bold text-green-500`}>
                            ${chartData.totalFinancials.totalSales.toLocaleString()}
                        </p>
                    </div>
                    <div className={`${containerClasses} text-center`}>
                        <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                            Total Profit
                        </h3>
                        <p className={`text-2xl font-bold ${chartData.totalFinancials.totalProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            ${chartData.totalFinancials.totalProfit.toLocaleString()}
                        </p>
                    </div>
                </div>
            )}

            {/* Time Series Chart */}
            <div className={containerClasses} style={{ height: '450px' }}>
                <Line
                    options={{
                        ...chartOptions,
                        plugins: {
                            ...chartOptions.plugins,
                            title: {
                                ...chartOptions.plugins.title,
                                text: `${dataType === 'both' ? 'Products & Suppliers' : dataType === 'products' ? 'Product' : 'Supplier'} Activity Over Time`
                            }
                        }
                    }}
                    data={chartData.timeSeries}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* User Activity Chart */}
                <div className={containerClasses} style={{ height: '400px' }}>
                    <Doughnut
                        options={{
                            ...doughnutOptions,
                            plugins: {
                                ...doughnutOptions.plugins,
                                title: {
                                    ...doughnutOptions.plugins.title,
                                    text: 'Top User Activity'
                                }
                            }
                        }}
                        data={chartData.userActivity}
                    />
                </div>

                {/* Category Distribution Chart */}
                <div className={containerClasses} style={{ height: '400px' }}>
                    <Doughnut
                        options={{
                            ...doughnutOptions,
                            plugins: {
                                ...doughnutOptions.plugins,
                                title: {
                                    ...doughnutOptions.plugins.title,
                                    text: 'Category Distribution'
                                }
                            }
                        }}
                        data={chartData.categoryDistribution}
                    />
                </div>
            </div>

            {/* Supplier Profitability Chart */}
            {chartData.supplierProfitability && (
                <div className={containerClasses} style={{ height: '400px' }}>
                    <Bar
                        options={{
                            ...chartOptions,
                            plugins: {
                                ...chartOptions.plugins,
                                title: {
                                    ...chartOptions.plugins.title,
                                    text: 'Top Suppliers by Profitability'
                                }
                            }
                        }}
                        data={chartData.supplierProfitability}
                    />
                </div>
            )}
        </div>
    );
};

export default EnhancedStats;