import React, { useMemo } from 'react';

import styles from '../../../../../Css/rapports.module.css';
import { Invoice } from "../../../../../classe/Invoice";
import { Order } from "../../../../../classe/Order";

interface DynamicReportSummaryProps {
    items: (Invoice | Order)[];
}

const DynamicReportSummary: React.FC<DynamicReportSummaryProps> = ({ items }) => {
    const summaryData = useMemo(() => {
        const totalCount = items.length;

        const totalAmountSum = items.reduce((sum, item) => sum + (item.totalAmount || 0), 0);

        const totalSoldAmountSum = items.reduce((sum, item) => {
            // Check if item has soldAmount property (indicating it's an Order)
            if ('soldAmount' in item && item.soldAmount !== undefined && item.soldAmount !== null) {
                return sum + item.soldAmount;
            }
            return sum;
        }, 0);

        return {
            totalCount,
            totalAmountSum,
            totalSoldAmountSum
        };
    }, [items]);

    return (
        <div className={styles.summaryContainer}>
            <div className={styles.summaryGrid}>
                <div className={styles.summaryCard}>
                    <div className={styles.cardHeader}>
                        <div className={`${styles.cardIcon} ${styles.countIcon}`}>
                            <i className="fas fa-list"></i>
                        </div>
                        <div className={styles.cardContent}>
                            <h3 className={styles.cardTitle}>
                                Total Items
                            </h3>
                            <p className={styles.cardValue}>
                                {summaryData.totalCount}
                            </p>
                        </div>
                    </div>
                </div>

                <div className={styles.summaryCard}>
                    <div className={styles.cardHeader}>
                        <div className={`${styles.cardIcon} ${styles.amountIcon}`}>
                            <i className="fas fa-dollar-sign"></i>
                        </div>
                        <div className={styles.cardContent}>
                            <h3 className={styles.cardTitle}>
                                Total Amount
                            </h3>
                            <p className={styles.cardValue}>
                                ${summaryData.totalAmountSum.toFixed(2)}
                            </p>
                        </div>
                    </div>
                </div>

                <div className={styles.summaryCard}>
                    <div className={styles.cardHeader}>
                        <div className={`${styles.cardIcon} ${styles.soldIcon}`}>
                            <i className="fas fa-chart-line"></i>
                        </div>
                        <div className={styles.cardContent}>
                            <h3 className={styles.cardTitle}>
                                Total Sold Amount
                            </h3>
                            <p className={styles.cardValue}>
                                ${summaryData.totalSoldAmountSum.toFixed(2)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DynamicReportSummary;