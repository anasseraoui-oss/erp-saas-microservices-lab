import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getAllPayments } from '../../api/payment/paymentService';
import { Payment } from '../../classe/Payment';
import styles from '../../Css/statistics/AdvancedPaymentStatistics.module.css';
import { useDarkMode } from '../DarkModeProvider';
import { getSupplerClients } from '../../api/supplierClientService';
import { getOrderOrInvoiceById } from '../../api/OrderInvoiceService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface Client {
    id: number;
    name: string;
}

const AdvancedPaymentStatistics = () => {
    const { t } = useTranslation();
    const { isDarkMode } = useDarkMode();
    const [payments, setPayments] = useState<Payment[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
    const [clientName, setClientName] = useState<string>('');
    const [totalBusinessVolume, setTotalBusinessVolume] = useState<number>(0);
    const [avgPaymentDelay, setAvgPaymentDelay] = useState<number | null>(null);
    const [paymentHistoryData, setPaymentHistoryData] = useState<any[]>([]);
    const [clientPaymentStatus, setClientPaymentStatus] = useState<any[]>([]);
    const [overdueClientPayments, setOverdueClientPayments] = useState<Payment[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [allPayments, allClients] = await Promise.all([getAllPayments(), getSupplerClients()]);
                setPayments(allPayments);
                setClients(allClients);
            } catch (error) {
                console.error('Failed to fetch data:', error);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (selectedClientId) {
            const selectedClient = clients.find(c => c.id === selectedClientId);
            if (!selectedClient) return;

            setClientName(selectedClient.name);

            const clientPayments = payments.filter(p => p.supplierClientId === selectedClientId);
            const volume = clientPayments.reduce((acc, p) => acc + p.totalAmount, 0);
            setTotalBusinessVolume(volume);

            // Payment Status
            const statusCounts = clientPayments.reduce((acc, p) => {
                const status = p.amountPaid >= p.totalAmount ? 'PAID' : p.amountPaid > 0 ? 'PARTPAID' : 'UNPAID';
                acc[status] = (acc[status] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);
            const statusData = [
                { name: t('statisticsp_pay.payment.paid'), value: statusCounts['PAID'] || 0 },
                { name: t('statisticsp_pay.payment.partially_paid'), value: statusCounts['PARTPAID'] || 0 },
                { name: t('statisticsp_pay.payment.unpaid'), value: statusCounts['UNPAID'] || 0 },
            ];
            setClientPaymentStatus(statusData);

            // Overdue Payments
            const overdue = clientPayments.filter(p => p.amountPaid < p.totalAmount && new Date(p.dueDate) < new Date());
            setOverdueClientPayments(overdue);

            // Avg Payment Delay & History
            let totalDelay = 0;
            let paidCount = 0;
            const historyData: any[] = [];
            const processClientPayments = async () => {
                for (const payment of clientPayments) {
                    if (payment.amountPaid >= payment.totalAmount && payment.paidDates.length > 0) {
                        try {
                            const order = await getOrderOrInvoiceById(payment.orderId, payment.orderType, 'Order');
                            if (order && order.creationDate) {
                                const creationDate = new Date(order.creationDate);
                                const finalPaymentDate = new Date(payment.paidDates[payment.paidDates.length - 1].date);
                                const delay = (finalPaymentDate.getTime() - creationDate.getTime()) / (1000 * 3600 * 24);
                                totalDelay += delay;
                                paidCount++;
                            }
                        } catch (e) {
                            console.error(`Could not fetch order ${payment.orderId}`, e);
                        }
                    }
                    payment.paidDates.forEach(pd => {
                        historyData.push({ date: new Date(pd.date).toLocaleDateString(), amount: pd.amountPaid });
                    });
                }
                setAvgPaymentDelay(paidCount > 0 ? totalDelay / paidCount : 0);
                setPaymentHistoryData(historyData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
            };
            processClientPayments();
        }
    }, [selectedClientId, payments, clients, t]);

    const handleClientChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedClientId(Number(event.target.value));
    };

    const COLORS = ['#4CAF50', '#FFC107', '#F44336'];

    return (
        <div className={`${styles.container} ${isDarkMode ? styles.dark : ''}`}>
            <h1 className={styles.header}>{t('advanced_stats.title')}</h1>

            <div className={styles.filters}>
                <select onChange={handleClientChange} value={selectedClientId || ''}>
                    <option value="" disabled>{t('advanced_stats.select_client')}</option>
                    {clients.map(client => (
                        <option key={client.id} value={client.id}>{client.name}</option>
                    ))}
                </select>
            </div>

            {selectedClientId && (
                <div className={styles.content}>
                    <h2 className={styles.clientName}>{clientName}</h2>
                    <div className={styles.summaryGrid}>
                        <div className={styles.card}>
                            <h3>{t('advanced_stats.total_business_volume')}</h3>
                            <p>${totalBusinessVolume.toFixed(2)}</p>
                        </div>
                        <div className={styles.card}>
                            <h3>{t('advanced_stats.avg_payment_delay')}</h3>
                            <p>{avgPaymentDelay !== null ? `${avgPaymentDelay.toFixed(2)} ${t('days')}` : t('global.loading')}</p>
                        </div>
                    </div>
                    <div className={styles.chartsGrid}>
                        <div className={styles.chartWrapper}>
                            <h3>{t('advanced_stats.payment_history')}</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={paymentHistoryData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="amount" stroke="#8884d8" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                        <div className={styles.chartWrapper}>
                            <h3>{t('statisticsp_pay.payment.payment_status_distribution')}</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie data={clientPaymentStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label>
                                        {clientPaymentStatus.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    <div className={styles.overdueSection}>
                        <h3>{t('advanced_stats.overdue_payments_list')}</h3>
                        <ul>
                            {overdueClientPayments.map(p => (
                                <li key={p.id}>
                                    <span>{p.orderType} #{p.orderId}</span>
                                    <span>${(p.totalAmount - p.amountPaid).toFixed(2)}</span>
                                    <span>{t('global.due_date')}: {new Date(p.dueDate).toLocaleDateString()}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdvancedPaymentStatistics;