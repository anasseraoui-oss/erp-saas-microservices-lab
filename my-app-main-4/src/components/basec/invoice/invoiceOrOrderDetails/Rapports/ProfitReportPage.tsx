import React, { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import styles from '../../../../../Css/invoiceOrOrder/ProfitReport.module.css';
import { Item } from "../../../../../classe/Item";
import { Product } from "../../../../../classe/Product";
import { useDarkMode } from "../../../../DarkModeProvider";
import { useTranslation } from 'react-i18next';

interface ReportState {
    lines: Item[];
    products: Product[];
    serviceType: 'sales' | 'purchases';
}

const ProfitReportPage: React.FC = () => {
    const { t } = useTranslation('profit_report');
    const location = useLocation();
    const { lines, products, serviceType } = (location.state as ReportState) || { lines: [], products: [], serviceType: 'sales' };
    const { isDarkMode } = useDarkMode();
    const [isInvoiceOpen, setInvoiceOpen] = useState(true);
    const [isProductOpen, setProductOpen] = useState(true);
    const [isLineOpen, setLineOpen] = useState(true);

    const productMap = useMemo(() => {
        const map = new Map<number, Product>();
        products.forEach(p => map.set(p.id, p));
        return map;
    }, [products]);

    const reportData = useMemo(() => {
        if (!lines || lines.length === 0) return null;

        const lineAnalysis = lines.map(line => {
            const product = productMap.get(line.productId);
            if (!product) return null;

            const costPrice = product.priceInit || 0;
            const sellingPrice = line.price;
            const quantity = line.quantity;

            const profitPerItem = sellingPrice - costPrice;
            const totalProfit = profitPerItem * quantity;

            return {
                ...line,
                productName: product.name,
                costPrice,
                profitPerItem,
                totalProfit,
            };
        }).filter(Boolean);

        const productAnalysis = new Map<number, { name: string; totalQuantity: number; totalProfit: number; }>();
        const invoiceAnalysis = new Map<number, { totalRevenue: number; totalProfit: number; }>();

        lineAnalysis.forEach(line => {
            if (!line) return;
            // Product aggregation
            const existingProduct = productAnalysis.get(line.productId);
            if (existingProduct) {
                existingProduct.totalQuantity += line.quantity;
                existingProduct.totalProfit += line.totalProfit;
            } else {
                productAnalysis.set(line.productId, {
                    name: line.productName,
                    totalQuantity: line.quantity,
                    totalProfit: line.totalProfit,
                });
            }

            // Invoice/Order aggregation
            const docId = line.salesInvoiceId || line.salesOrderId;
            if (docId) {
                const existingInvoice = invoiceAnalysis.get(docId);
                const lineRevenue = line.price * line.quantity;
                if (existingInvoice) {
                    existingInvoice.totalRevenue += lineRevenue;
                    existingInvoice.totalProfit += line.totalProfit;
                } else {
                    invoiceAnalysis.set(docId, {
                        totalRevenue: lineRevenue,
                        totalProfit: line.totalProfit,
                    });
                }
            }
        });

        const totalProfit = lineAnalysis.reduce((sum, line) => sum + (line?.totalProfit || 0), 0);
        const totalLoss = lineAnalysis.filter(l => (l?.totalProfit || 0) < 0).reduce((sum, line) => sum + (line?.totalProfit || 0), 0);
        const totalPureProfit = lineAnalysis.filter(l => (l?.totalProfit || 0) > 0).reduce((sum, line) => sum + (line?.totalProfit || 0), 0);

        return {
            lineAnalysis,
            productAnalysis: Array.from(productAnalysis.entries()),
            invoiceAnalysis: Array.from(invoiceAnalysis.entries()),
            summary: {
                totalProfit,
                totalLoss,
                totalPureProfit,
            }
        };
    }, [lines, productMap]);

    if (!reportData) {
        return <div className={styles.reportPage}><h1>{t('no_data')}</h1></div>;
    }

    const { lineAnalysis, productAnalysis, invoiceAnalysis, summary } = reportData;

    const renderValue = (value: number) => (
        <span className={value > 0 ? styles.positiveValue : value < 0 ? styles.negativeValue : styles.neutralValue}>
            {value.toFixed(2)}
        </span>
    );

    return (
        <div className={`${styles.reportPage} ${isDarkMode ? styles.dark : ''}`}>
            <header className={styles.header}>
                <h1>{t('title')} ({serviceType === 'sales' ? t('sales') : t('purchases')})</h1>
                <p>{t('profit_reports.subtitle')}</p>
            </header>

            <div className={styles.summaryCards}>
                <div className={styles.card}>
                    <h3 className={styles.cardTitle}>{t('profit_reports.total_pure_profit')}</h3>
                    <p className={`${styles.cardValue} ${styles.profit}`}>${summary.totalPureProfit.toFixed(2)}</p>
                </div>
                <div className={styles.card}>
                    <h3 className={styles.cardTitle}>{t('profit_reports.total_losses')}</h3>
                    <p className={`${styles.cardValue} ${styles.loss}`}>${Math.abs(summary.totalLoss).toFixed(2)}</p>
                </div>
                <div className={styles.card}>
                    <h3 className={styles.cardTitle}>{t('profit_reports.net_profit')}</h3>
                    <p className={`${styles.cardValue} ${styles.net}`}>${summary.totalProfit.toFixed(2)}</p>
                </div>
            </div>

            <div className={styles.section}>
                <h2 className={styles.sectionTitle} onClick={() => setInvoiceOpen(!isInvoiceOpen)}>
                    <span className={`${styles.icon} ${isInvoiceOpen ? styles.open : ''}`}>▶</span>
                    {t('profit_reports.invoice_analysis_title')}
                </h2>
                {isInvoiceOpen && (
                    <table className={styles.reportTable}>
                        <thead>
                        <tr>
                            <th>{t('invoice_id')}</th>
                            <th>{t('profit_reports.total_revenue')}</th>
                            <th>{t('total_profit')}</th>
                            <th>{t('profit_margin')}</th>
                        </tr>
                        </thead>
                        <tbody>
                        {invoiceAnalysis.map(([id, data]) => (
                            <tr key={id}>
                                <td>{id}</td>
                                <td>${data.totalRevenue.toFixed(2)}</td>
                                <td>${renderValue(data.totalProfit)}</td>
                                <td>{renderValue((data.totalProfit / data.totalRevenue) * 100)}%</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}
            </div>

            <div className={styles.section}>
                <h2 className={styles.sectionTitle} onClick={() => setProductOpen(!isProductOpen)}>
                     <span className={`${styles.icon} ${isProductOpen ? styles.open : ''}`}>▶</span>
                    {t('profit_reports.product_analysis_title')}
                </h2>
                {isProductOpen && (
                    <table className={styles.reportTable}>
                        <thead>
                        <tr>
                            <th>{t('product')}</th>
                            <th>{t('profit_reports.total_quantity_sold')}</th>
                            <th>{t('total_profit')}</th>
                        </tr>
                        </thead>
                        <tbody>
                        {productAnalysis.map(([id, data]) => (
                            <tr key={id}>
                                <td>{data.name}</td>
                                <td>{data.totalQuantity}</td>
                                <td>${renderValue(data.totalProfit)}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}
            </div>

            <div className={styles.section}>
                <h2 className={styles.sectionTitle} onClick={() => setLineOpen(!isLineOpen)}>
                    <span className={`${styles.icon} ${isLineOpen ? styles.open : ''}`}>▶</span>
                    {t('profit_reports.line_analysis_title')}
                </h2>
                {isLineOpen && (
                    <table className={styles.reportTable}>
                        <thead>
                        <tr>
                            <th>{t('profit_reports.line_id')}</th>
                            <th>{t('product')}</th>
                            <th>{t('cost_price')}</th>
                            <th>{t('selling_price')}</th>
                            <th>{t('quantity')}</th>
                            <th>{t('total_profit')}</th>
                        </tr>
                        </thead>
                        <tbody>
                        {lineAnalysis.map(line => line && (
                            <tr key={line.id}>
                                <td>{line.id}</td>
                                <td>{line.productName}</td>
                                <td>${line.costPrice.toFixed(2)}</td>
                                <td>${line.price.toFixed(2)}</td>
                                <td>{line.quantity}</td>
                                <td>${renderValue(line.totalProfit)}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default ProfitReportPage;