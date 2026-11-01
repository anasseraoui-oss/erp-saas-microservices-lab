import React, { useState, useEffect, useMemo } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { CreditCard, Calendar, DollarSign, TrendingUp, Users, AlertCircle, CheckCircle, Clock, XCircle, RefreshCw } from 'lucide-react';
import { getAllPayments } from '../../api/payment/paymentService';
import dataPaidDateService from '../../api/payment/dataPaidDateService';
import { useGlobalDarkMode } from "../hook/useGlobalDarkMode";
import { Payment } from "../../classe/Payment";
import { DataPaidDate } from "../../classe/DataPaidDate";
import styles from '../../Css/invoiceOrOrder/PaymentStatistics.module.css';

// Type definitions
interface StatCardProps {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    value: string | number;
    subtitle?: string;
    color?: 'emerald' | 'blue' | 'purple' | 'yellow';
}

interface PaymentMethodData {
    name: string;
    value: number;
    percentage: string;
    [x: string]: any;
}

interface StatusData {
    name: string;
    value: number;
    amount: number;
    [x: string]: any;
}

interface MonthlyData {
    month: string;
    amount: number;
    count: number;
}

interface Statistics {
    totalPayments: number;
    totalAmount: number;
    totalPaid: number;
    averagePayment: number;
    paymentMethodData: PaymentMethodData[];
    statusData: StatusData[];
    monthlyChartData: MonthlyData[];
    completionRate: string;
}

// Enhanced Payment interface with paidDates
export interface EnhancedPayment extends Omit<Payment, 'paidDates'> {
    paidDates?: DataPaidDate[];
    date?: string;
}

const PaymentStatistics: React.FC = () => {
    const { isDarkMode } = useGlobalDarkMode();

    const [payments, setPayments] = useState<EnhancedPayment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeView, setActiveView] = useState('overview');
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    const theme = isDarkMode ? 'dark' : 'light';

    // Load real data
    const fetchPayments = async () => {
        try {
            setLoading(true);
            setError(null);

            // 1. Make two API calls in parallel for efficiency
            const [paymentsData, allDatesResponse] = await Promise.all([
                getAllPayments(),
                dataPaidDateService.getAll()
            ]);

            const allPaidDates: DataPaidDate[] = allDatesResponse.data || [];

            // 2. Create a Map for efficient lookup of paid dates by paymentId
            const datesByPaymentId = new Map<number, DataPaidDate[]>();
            allPaidDates.forEach(date => {
                if (date.paymentId) { // Ensure paymentId exists
                    const existingDates = datesByPaymentId.get(date.paymentId) || [];
                    existingDates.push(date);
                    datesByPaymentId.set(date.paymentId, existingDates);
                }
            });

            // 3. Combine the data into a single, enhanced array
            const enhancedPayments = paymentsData.map((payment: Payment) => ({
                ...payment,
                paidDates: datesByPaymentId.get(payment.id) || []
            }));

            setPayments(enhancedPayments as EnhancedPayment[]);
            setLastUpdated(new Date());

        } catch (err) {
            console.error('Error fetching and processing payment data:', err);
            setError('Error loading payment data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayments();
    }, []);

    // Statistical calculations based on real data
    const statistics = useMemo((): Statistics => {
        console.log('=== DEBUGGING STATISTICS ===');
        console.log('Payments length:', payments.length);
        console.log('First payment:', payments[0]);

        if (!payments.length) {
            console.log('No payments data, using test data');
            return {
                totalPayments: 0,
                totalAmount: 0,
                totalPaid: 0,
                averagePayment: 0,
                paymentMethodData: [
                    { name: 'Credit Card', value: 45, percentage: '45.0' },
                    { name: 'Cash', value: 30, percentage: '30.0' },
                    { name: 'Bank Transfer', value: 25, percentage: '25.0' }
                ],
                statusData: [
                    { name: 'PAID', value: 80, amount: 15000 },
                    { name: 'SCHEDULED', value: 15, amount: 3000 },
                    { name: 'FAILED', value: 5, amount: 500 }
                ],
                monthlyChartData: [
                    { month: 'Jan 24', amount: 5000, count: 10 },
                    { month: 'Feb 24', amount: 7000, count: 15 },
                    { month: 'Mar 24', amount: 6000, count: 12 }
                ],
                completionRate: '85'
            };
        }

        const allPaidDates = payments.flatMap(p => p.paidDates || []);
        console.log('All paid dates:', allPaidDates);
        console.log('All paid dates length:', allPaidDates.length);

        // General statistics
        const totalPayments = payments.length;
        const totalAmount = payments.reduce((sum, p) => sum + (p.totalAmount || 0), 0);
        const totalPaid = payments.reduce((sum, p) => sum + (p.amountPaid || 0), 0);
        const averagePayment = totalPayments > 0 ? totalAmount / totalPayments : 0;

        console.log('Total payments:', totalPayments);
        console.log('Total amount:', totalAmount);
        console.log('Total paid:', totalPaid);

        // Payment methods
        const paymentMethodStats: Record<string, number> = allPaidDates.reduce((acc, pd) => {
            const method = pd.methodePayment || 'UNKNOWN';
            acc[method] = (acc[method] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        console.log('Payment method stats:', paymentMethodStats);

        const paymentMethodData: PaymentMethodData[] = Object.entries(paymentMethodStats).map(([method, count]) => ({
            name: method.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase()),
            value: count,
            percentage: allPaidDates.length > 0 ? ((count / allPaidDates.length) * 100).toFixed(1) : '0'
        }));

        console.log('Payment method data:', paymentMethodData);

        // If no method data, create default data
        const finalPaymentMethodData = paymentMethodData.length > 0 ? paymentMethodData : [
            { name: 'No Method', value: totalPayments, percentage: '100' }
        ];

        // Payment statuses
        const statusStats: Record<string, number> = allPaidDates.reduce((acc, pd) => {
            const status = pd.paymentScheduleStatus || 'UNKNOWN';
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const statusData: StatusData[] = Object.entries(statusStats).map(([status, count]) => ({
            name: status,
            value: count,
            amount: allPaidDates.filter(pd => pd.paymentScheduleStatus === status)
                .reduce((sum, pd) => sum + (pd.amountPaid || 0), 0)
        }));

        // If no status data, create default data
        const finalStatusData = statusData.length > 0 ? statusData : [
            { name: 'PENDING', value: totalPayments, amount: totalAmount }
        ];

        // Monthly data
        const monthlyData: Record<string, MonthlyData> = allPaidDates.reduce((acc, pd) => {
            if (pd.date) {
                const date = new Date(pd.date);
                const month = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
                if (!acc[month]) {
                    acc[month] = { month, amount: 0, count: 0 };
                }
                acc[month].amount += pd.amountPaid || 0;
                acc[month].count += 1;
            }
            return acc;
        }, {} as Record<string, MonthlyData>);

        const monthlyChartData = Object.values(monthlyData).sort((a, b) => {
            // Sort by date
            const dateA = new Date(a.month);
            const dateB = new Date(b.month);
            return dateA.getTime() - dateB.getTime();
        });

        const result = {
            totalPayments,
            totalAmount,
            totalPaid,
            averagePayment,
            paymentMethodData: finalPaymentMethodData,
            statusData: finalStatusData,
            monthlyChartData,
            completionRate: totalAmount > 0 ? ((totalPaid / totalAmount) * 100).toFixed(1) : '0'
        };

        console.log('Final statistics result:', result);
        return result;
    }, [payments]);

    // Colors for charts
    const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4'];
    const STATUS_COLORS: Record<string, string> = {
        'PAID': '#10b981',
        'SCHEDULED': '#f59e0b',
        'FAILED': '#ef4444',
        'OVERDUE': '#dc2626',
        'UNKNOWN': '#6b7280'
    };

    const StatCard: React.FC<StatCardProps> = ({ icon: Icon, title, value, subtitle, color = 'emerald' }) => (
        <div className={`${styles.statCard} ${styles[theme]}`}>
            <div className={styles.statCardContent}>
                <div className={`${styles.statCardInfo} ${styles[theme]}`}>
                    <p>{title}</p>
                    <p className={`${styles.statCardValue} ${styles[color]}`}>{value}</p>
                    {subtitle && <p className={`${styles.statCardSubtitle} ${styles[theme]}`}>{subtitle}</p>}
                </div>
                <div className={`${styles.statCardIcon} ${styles[color]}`}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className={`${styles.loadingContainer} ${styles[theme]}`}>
                <div className={styles.loadingContent}>
                    <RefreshCw className={styles.loadingSpinner} />
                    <span className={`${styles.loadingText} ${styles[theme]}`}>Loading statistics...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`${styles.errorContainer} ${styles[theme]}`}>
                <div className={`${styles.errorCard} ${styles[theme]}`}>
                    <AlertCircle className={styles.errorIcon} />
                    <h2 className={`${styles.errorTitle} ${styles[theme]}`}>Loading Error</h2>
                    <p className={`${styles.errorMessage} ${styles[theme]}`}>{error}</p>
                    <button
                        onClick={fetchPayments}
                        className={styles.retryButton}
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    const renderOverviewTab = () => (
        <>
            {/* Statistics cards */}
            <div className={styles.statsGrid}>
                <StatCard
                    icon={DollarSign}
                    title="Total Amount"
                    value={`$${statistics.totalAmount.toLocaleString('en-US')}`}
                    subtitle={`${statistics.completionRate}% paid`}
                    color="emerald"
                />
                <StatCard
                    icon={CreditCard}
                    title="Total Payments"
                    value={statistics.totalPayments}
                    subtitle={`Average: $${Math.round(statistics.averagePayment).toLocaleString('en-US')}`}
                    color="blue"
                />
                <StatCard
                    icon={TrendingUp}
                    title="Amount Paid"
                    value={`$${statistics.totalPaid.toLocaleString('en-US')}`}
                    subtitle="Total collected"
                    color="purple"
                />
                <StatCard
                    icon={CheckCircle}
                    title="Success Rate"
                    value={`${statistics.completionRate}%`}
                    subtitle="Completed payments"
                    color="yellow"
                />
            </div>

            {/* Main charts */}
            <div className={styles.chartsGrid}>
                {/* Payment methods */}
                <div className={`${styles.chartCard} ${styles[theme]}`}>
                    <h3 className={`${styles.chartTitle} ${styles[theme]}`}>Distribution by Method</h3>
                    {statistics.paymentMethodData.length > 0 ? (
                        <div style={{ width: '100%', height: '300px' }}>
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie
                                        data={statistics.paymentMethodData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percentage }) => `${percentage}%`}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {statistics.paymentMethodData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                                            border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
                                            borderRadius: '8px',
                                            color: isDarkMode ? '#ffffff' : '#000000'
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className={`${styles.emptyState} ${styles[theme]}`}>
                            No payment method data available
                            <br />
                            <small>Number of payments: {payments.length}</small>
                        </div>
                    )}
                </div>

                {/* Payment statuses */}
                <div className={`${styles.chartCard} ${styles[theme]}`}>
                    <h3 className={`${styles.chartTitle} ${styles[theme]}`}>Payment Status</h3>
                    {statistics.statusData.length > 0 ? (
                        <div style={{ width: '100%', height: '300px' }}>
                            <ResponsiveContainer>
                                <BarChart data={statistics.statusData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#e5e7eb'} />
                                    <XAxis dataKey="name" tick={{ fill: isDarkMode ? '#9ca3af' : '#6b7280' }} />
                                    <YAxis tick={{ fill: isDarkMode ? '#9ca3af' : '#6b7280' }} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                                            border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
                                            borderRadius: '8px',
                                            color: isDarkMode ? '#ffffff' : '#000000'
                                        }}
                                    />
                                    <Bar dataKey="value" fill="#10b981" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className={`${styles.emptyState} ${styles[theme]}`}>
                            No status data available
                            <br />
                            <small>Number of payments: {payments.length}</small>
                        </div>
                    )}
                </div>
            </div>
        </>
    );

    const renderMethodsTab = () => (
        <div className="space-y-8">
            <div className={`${styles.chartCard} ${styles[theme]}`}>
                <h3 className={`${styles.chartTitle} ${styles[theme]}`}>Payment Methods Analysis</h3>
                {statistics.paymentMethodData.length > 0 ? (
                    <div className={styles.methodAnalysisGrid}>
                        <ResponsiveContainer width="100%" height={400}>
                            <PieChart>
                                <Pie
                                    data={statistics.paymentMethodData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={150}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {statistics.paymentMethodData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                                        border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
                                        borderRadius: '8px',
                                        color: isDarkMode ? '#ffffff' : '#000000'
                                    }}
                                />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>

                        <div className={styles.methodsList}>
                            {statistics.paymentMethodData.map((method, index) => (
                                <div key={method.name} className={`${styles.methodItem} ${styles[theme]}`}>
                                    <div className={styles.methodItemLeft}>
                                        <div
                                            className={styles.methodColorIndicator}
                                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                        />
                                        <span className={styles.methodName}>{method.name}</span>
                                    </div>
                                    <div className={styles.methodStats}>
                                        <div className={styles.methodValue}>{method.value}</div>
                                        <div className={`${styles.methodPercentage} ${styles[theme]}`}>{method.percentage}%</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className={`${styles.emptyState} ${styles[theme]}`}>
                        No payment method data available
                    </div>
                )}
            </div>
        </div>
    );

    const renderStatusTab = () => (
        <div className="space-y-8">
            <div className={styles.statusCardsGrid}>
                {statistics.statusData.map((status) => (
                    <div key={status.name} className={`${styles.statusCard} ${styles[theme]}`}>
                        <div className={styles.statusCardHeader}>
                            <h4 className={`${styles.statusCardTitle} ${styles[theme]}`}>{status.name}</h4>
                            <div className={styles.statusCardIconContainer} style={{ backgroundColor: `${STATUS_COLORS[status.name] || STATUS_COLORS.UNKNOWN}20` }}>
                                {status.name === 'PAID' && <CheckCircle className="w-5 h-5" style={{ color: STATUS_COLORS[status.name] }} />}
                                {status.name === 'SCHEDULED' && <Clock className="w-5 h-5" style={{ color: STATUS_COLORS[status.name] }} />}
                                {status.name === 'FAILED' && <XCircle className="w-5 h-5" style={{ color: STATUS_COLORS[status.name] }} />}
                                {status.name === 'OVERDUE' && <AlertCircle className="w-5 h-5" style={{ color: STATUS_COLORS[status.name] }} />}
                            </div>
                        </div>
                        <div className={styles.statusCardValue} style={{ color: STATUS_COLORS[status.name] || STATUS_COLORS.UNKNOWN }}>
                            {status.value}
                        </div>
                        <div className={`${styles.statusCardAmount} ${styles[theme]}`}>
                            ${status.amount.toLocaleString('en-US')} total
                        </div>
                    </div>
                ))}
            </div>

            {statistics.statusData.length > 0 && (
                <div className={`${styles.chartCard} ${styles[theme]}`}>
                    <h3 className={`${styles.chartTitle} ${styles[theme]}`}>Status Distribution</h3>
                    <ResponsiveContainer width="100%" height={400}>
                        <PieChart>
                            <Pie
                                data={statistics.statusData}
                                cx="50%"
                                cy="50%"
                                outerRadius={140}
                                dataKey="value"
                            >
                                {statistics.statusData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || STATUS_COLORS.UNKNOWN} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                                    border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
                                    borderRadius: '8px',
                                    color: isDarkMode ? '#ffffff' : '#000000'
                                }}
                            />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );

    const renderTrendsTab = () => {
        const getChartData = () => {
            let chartData = statistics.monthlyChartData;

            if (chartData.length === 0 && payments.length > 0) {
                const monthlyFromPayments: Record<string, MonthlyData> = {};

                payments.forEach(payment => {
                    if (payment.date) {
                        const date = new Date(payment.date);
                        const month = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });

                        if (!monthlyFromPayments[month]) {
                            monthlyFromPayments[month] = { month, amount: 0, count: 0 };
                        }

                        monthlyFromPayments[month].amount += payment.totalAmount || 0;
                        monthlyFromPayments[month].count += 1;
                    }
                });

                chartData = Object.values(monthlyFromPayments).sort((a, b) => {
                    const dateA = new Date(a.month + ' 01');
                    const dateB = new Date(b.month + ' 01');
                    return dateA.getTime() - dateB.getTime();
                });
            }

            return chartData;
        };

        const chartData = getChartData();

        return (
            <div className="space-y-8">
                <div className={`${styles.chartCard} ${styles[theme]}`}>
                    <h3 className={`${styles.chartTitle} ${styles[theme]}`}>Monthly Evolution</h3>
                    {chartData.length > 0 ? (
                        <div style={{ width: '100%', height: '400px' }}>
                            <ResponsiveContainer>
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#e5e7eb'} />
                                    <XAxis dataKey="month" tick={{ fill: isDarkMode ? '#9ca3af' : '#6b7280' }} />
                                    <YAxis tick={{ fill: isDarkMode ? '#9ca3af' : '#6b7280' }} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                                            border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
                                            borderRadius: '8px',
                                            color: isDarkMode ? '#ffffff' : '#000000'
                                        }}
                                    />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="amount"
                                        stroke="#10b981"
                                        strokeWidth={3}
                                        name="Amount ($)"
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="count"
                                        stroke="#3b82f6"
                                        strokeWidth={3}
                                        name="Number of payments"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className={`${styles.emptyState} ${styles[theme]}`}>
                            No temporal data available
                            <br />
                            <small>Number of payments: {payments.length}</small>
                            <br />
                            <small>Payments with dates: {payments.filter(p => p.date).length}</small>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className={`${styles.pageContainer} ${styles[theme]}`}>
            <div className={styles.mainContainer}>
                {/* Header */}
                <div className={styles.header}>
                    <div className={`${styles.headerInfo} ${styles[theme]}`}>
                        <h1>Payment Statistics</h1>
                        <p>Complete analysis of transactions and payment methods</p>
                    </div>
                    <div className={styles.headerActions}>
                        <button
                            onClick={fetchPayments}
                            className={`${styles.actionButton} ${styles[theme]}`}
                        >
                            <RefreshCw className="w-4 h-4" />
                            <span>Refresh</span>
                        </button>
                        {['overview', 'methods', 'status', 'trends'].map((view) => (
                            <button
                                key={view}
                                onClick={() => setActiveView(view)}
                                className={`${styles.actionButton} ${activeView === view ? styles.active : styles[theme]}`}
                            >
                                {view.charAt(0).toUpperCase() + view.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {!payments.length ? (
                    <div className={`${styles.noDataCard} ${styles[theme]}`}>
                        <CreditCard className={`${styles.noDataIcon} ${styles[theme]}`} />
                        <h3 className={`${styles.noDataTitle} ${styles[theme]}`}>No Data Available</h3>
                        <p className={`${styles.noDataMessage} ${styles[theme]}`}>No payments were found in the database.</p>
                    </div>
                ) : (
                    <>
                        {activeView === 'overview' && renderOverviewTab()}
                        {activeView === 'methods' && renderMethodsTab()}
                        {activeView === 'status' && renderStatusTab()}
                        {activeView === 'trends' && renderTrendsTab()}
                    </>
                )}

                {/* Footer with additional information */}
                <div className={`${styles.reportFooter} ${styles[theme]}`}>
                    <h3 className={`${styles.reportFooterTitle} ${styles[theme]}`}>Report Information</h3>
                    <div className={styles.reportFooterGrid}>
                        <div className={styles.reportFooterSection}>
                            <h4 className={`${styles.reportFooterSectionTitle} ${styles[theme]}`}>Analysis Period</h4>
                            <p className={`${styles.reportFooterText} ${styles[theme]}`}>All available data</p>
                        </div>
                        <div className={styles.reportFooterSection}>
                            <h4 className={`${styles.reportFooterSectionTitle} ${styles[theme]}`}>Last Updated</h4>
                            <p className={`${styles.reportFooterText} ${styles[theme]}`}>
                                {lastUpdated ? lastUpdated.toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                }) : 'N/A'}
                            </p>
                        </div>
                        <div className={styles.reportFooterSection}>
                            <h4 className={`${styles.reportFooterSectionTitle} ${styles[theme]}`}>Number of Transactions</h4>
                            <p className={`${styles.reportFooterText} ${styles[theme]}`}>
                                {payments.flatMap(p => p.paidDates || []).length} individual payments
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentStatistics;