import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getAllPayments } from '../../api/payment/paymentService';
import { Payment } from '../../classe/Payment';
import styles from '../../Css/statistics/PaymentStatistics.module.css';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { useDarkMode } from '../DarkModeProvider';

const PaymentStatistics = () => {
    const { t } = useTranslation();
    const { isDarkMode } = useDarkMode();
    const [payments, setPayments] = useState<Payment[]>([]);
    const [activeTab, setActiveTab] = useState<'sales' | 'purchases'>('sales');

    const tooltipStyle = {
        backgroundColor: isDarkMode ? '#1f2937' : '#f9fafb',
        border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
        borderRadius: '8px',
        padding: '0.75rem',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
    };

    const labelStyle = {
        fontWeight: '600',
        marginBottom: '0.5rem',
        color: isDarkMode ? '#f9fafb' : '#1f2937'
    };

    const itemStyle = {
        padding: '0.25rem 0',
        color: isDarkMode ? '#d1d5db' : '#6b7280'
    };
    
    useEffect(() => {
        const fetchPayments = async () => {
            try {
                const allPayments = await getAllPayments();
                setPayments(allPayments);
            } catch (error) {
                console.error('Failed to fetch payments:', error);
            }
        };
        fetchPayments();
    }, []);

    const filteredPayments = payments.filter(p => p.orderType === activeTab);

    const totalPaid = filteredPayments.reduce((acc, p) => acc + p.amountPaid, 0);
    const totalAmount = filteredPayments.reduce((acc, p) => acc + p.totalAmount, 0);
    const totalUnpaid = totalAmount - totalPaid;

    const getPaymentStatus = (payment: Payment) => {
        if (payment.amountPaid >= payment.totalAmount) return 'PAID';
        if (payment.amountPaid > 0) return 'PARTPAID';
        return 'UNPAID';
    };

    const overduePayments = filteredPayments.filter(p => getPaymentStatus(p) !== 'PAID' && new Date(p.dueDate) < new Date());
    const overdueCount = overduePayments.length;
    const overdueAmount = overduePayments.reduce((acc, p) => acc + (p.totalAmount - p.amountPaid), 0);

    const paymentAmountDistribution = filteredPayments.reduce((acc, p) => {
        const amount = p.totalAmount;
        if (amount <= 100) acc['0-100'] = (acc['0-100'] || 0) + 1;
        else if (amount <= 500) acc['101-500'] = (acc['101-500'] || 0) + 1;
        else if (amount <= 1000) acc['501-1000'] = (acc['501-1000'] || 0) + 1;
        else if (amount <= 5000) acc['1001-5000'] = (acc['1001-5000'] || 0) + 1;
        else acc['>5000'] = (acc['>5000'] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const amountDistData = Object.keys(paymentAmountDistribution).map(key => ({
        range: key,
        count: paymentAmountDistribution[key],
    }));

    const statusCounts = filteredPayments.reduce((acc, p) => {
        const status = getPaymentStatus(p);
        acc[status] = (acc[status] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const pieData = [
        { name: t('statisticsp_pay.payment.paid'), value: statusCounts['PAID'] || 0 },
        { name: t('statisticsp_pay.payment.partially_paid'), value: statusCounts['PARTPAID'] || 0 },
        { name: t('statisticsp_pay.payment.unpaid'), value: statusCounts['UNPAID'] || 0 },
    ];

    const COLORS = ['#4CAF50', '#FFC107', '#F44336'];

    const barData = filteredPayments.slice(0, 15).map(p => ({
        name: `${p.orderType} #${p.orderId}`,
        paid: p.amountPaid,
        unpaid: p.totalAmount - p.amountPaid,
    }));

    const processTrendData = () => {
        const trendData: { [key: string]: number } = {};
        const today = new Date();
        const last30Days = new Date(today.setDate(today.getDate() - 30));

        filteredPayments.forEach(p => {
            p.paidDates.forEach(d => {
                const paymentDate = new Date(d.date);
                if (paymentDate >= last30Days) {
                    const dateString = paymentDate.toISOString().split('T')[0];
                    trendData[dateString] = (trendData[dateString] || 0) + d.amountPaid;
                }
            });
        });

        return Object.keys(trendData).map(date => ({
            date,
            amount: trendData[date],
        })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    };

    const topDebts = filteredPayments
        .filter(p => getPaymentStatus(p) !== 'PAID')
        .map(p => ({
            ...p,
            remaining: p.totalAmount - p.amountPaid,
        }))
        .sort((a, b) => b.remaining - a.remaining)
        .slice(0, 5);

    return (
        <div className={`${styles.container} ${isDarkMode ? styles.dark : ''}`}>
            <h1 className={styles.header}>{t('statisticsp_pay.payment.title')}</h1>

            <div className={styles.tabs}>
                <button onClick={() => setActiveTab('sales')} className={`${styles.tab} ${activeTab === 'sales' ? styles.active : ''}`}>
                    {t('statisticsp_pay.payment.sales')}
                </button>
                <button onClick={() => setActiveTab('purchases')} className={`${styles.tab} ${activeTab === 'purchases' ? styles.active : ''}`}>
                    {t('statisticsp_pay.payment.purchases')}
                </button>
            </div>

            <div className={styles.content}>
                <div className={styles.summaryCards}>
                    <div className={styles.card}>
                        <h2>{t('statisticsp_pay.payment.total_paid')}</h2>
                        <p>${totalPaid.toFixed(2)}</p>
                    </div>
                    <div className={styles.card}>
                        <h2>{t('statisticsp_pay.payment.total_unpaid')}</h2>
                        <p>${totalUnpaid.toFixed(2)}</p>
                    </div>
                    <div className={styles.card}>
                        <h2>{t('statisticsp_pay.payment.overdue_payments')}</h2>
                        <p>{overdueCount}</p>
                    </div>
                    <div className={styles.card}>
                        <h2>{t('statisticsp_pay.payment.total_overdue')}</h2>
                        <p>${overdueAmount.toFixed(2)}</p>
                    </div>
                </div>

                <div className={styles.chartsContainer}>
                    <div className={styles.chartWrapper}>
                        <h3>{t('statisticsp_pay.payment.payment_status_distribution')}</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label>
                                    {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                </Pie>
                                <Tooltip
                                    contentStyle={tooltipStyle}
                                    labelStyle={labelStyle}
                                    itemStyle={itemStyle}
                                />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className={styles.chartWrapper}>
                        <h3>{t('statisticsp_pay.payment.paid_vs_unpaid_recent')}</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={barData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip
                                    contentStyle={tooltipStyle}
                                    labelStyle={labelStyle}
                                    itemStyle={itemStyle}
                                />
                                <Legend />
                                <Bar dataKey="paid" stackId="a" fill="#82ca9d" />
                                <Bar dataKey="unpaid" stackId="a" fill="#ffc658" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className={styles.chartWrapper}>
                        <h3>{t('statisticsp_pay.payment.payments_trend_30_days')}</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={processTrendData()}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip
                                    contentStyle={tooltipStyle}
                                    labelStyle={labelStyle}
                                    itemStyle={itemStyle}
                                />
                                <Legend />
                                <Line type="monotone" dataKey="amount" stroke="#8884d8" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                    <div className={styles.chartWrapper}>
                        <h3>{t('statisticsp_pay.payment.payment_amount_distribution')}</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={amountDistData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="range" />
                                <YAxis />
                                <Tooltip
                                    contentStyle={tooltipStyle}
                                    labelStyle={labelStyle}
                                    itemStyle={itemStyle}
                                />
                                <Legend />
                                <Bar dataKey="count" fill="#8884d8" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className={styles.topDebtsContainer}>
                    <h3>{t('statisticsp_pay.payment.top_5_outstanding_debts')}</h3>
                    <ul className={styles.debtList}>
                        {topDebts.map(p => (
                            <li key={p.id} className={styles.debtItem}>
                                <span>{p.orderType} #{p.orderId}</span>
                                <span>${p.remaining.toFixed(2)}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default PaymentStatistics;
