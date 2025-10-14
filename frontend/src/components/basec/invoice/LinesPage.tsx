// LinesPage.tsx (Style Corrected)
import React, { useState, useEffect, useMemo } from 'react';
import styles from '../../../Css/invoiceOrOrder/Lines.module.css';
import { Product } from "../../../classe/Product";
import { useDarkMode } from "../../DarkModeProvider";
import useLinesActions from "../../hook/useLinesActions";
import { Item } from "../../../classe/Item";
import { Return } from "../../../classe/Return";
import StatisticsModal from "./StatisticsModal";
import { getAllProducts } from "../../../api/product/productService";
import GenericActionButtons from "../GenericActionButtons";
import { getAllLines } from "../../../api/lineApiService";
import {useTranslation} from "react-i18next";

const LinesPage = ({ ServiceType, OrderType }: { ServiceType: 'sales' | 'purchases', OrderType: 'Invoice' | 'Order' }) => {
    const { moveToReturns, restoreLine, deleteLineOrReturn, updateLineOrReturn } = useLinesActions();
    // @ts-ignore
    const { isDarkMode } = useDarkMode();

    const [lines, setLines] = useState<Item[]>([]);
    const [returns, setReturns] = useState<Return[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [typeHeader, setTypeHeader] = useState<'lines' | 'return'>('lines');
    const [statsModal, setStatsModal] = useState({
        isOpen: false,
        data: [] as (Item | Return)[],
        title: ''
    });
    const { t: translate } = useTranslation(); // Renomme 't' en 'translate'
    const displayData = useMemo(() => {
        return typeHeader === 'return' ? returns : lines;
    }, [typeHeader, lines, returns]);

    const productNameMap = useMemo(() => {
        const map: { [key: number]: string } = {};
        products.forEach(p => { map[p.id] = p.name; });
        return map;
    }, [products]);

    useEffect(() => {
        const fetchDataAndDisplay = async () => {
            try {
                const fetchedProducts = await getAllProducts();
                setProducts(fetchedProducts);

                const service = ServiceType === 'sales' ? 'sales' : 'purchases';
                const [fetchedLines, fetchedReturns] = await Promise.all([
                    getAllLines(service, "line"),
                    getAllLines(service, "lineReturn")
                ]);
                setLines(fetchedLines);
                setReturns(fetchedReturns);
            } catch (error) {
                console.error("Failed to fetch data:", error);
                setLines([]);
                setReturns([]);
            }
        };
        fetchDataAndDisplay();
    }, [ServiceType]);

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        id: number,
        field: keyof Item | keyof Return
    ) => {
        const { value } = e.target;
        const numericFields = ['quantity', 'price', 'productId', 'invoiceId', 'orderId'];

        let finalValue: string | number | null = value;
        if (numericFields.includes(field as string)) {
            finalValue = value === '' ? null : parseInt(value, 10);
            if (isNaN(finalValue as number)) finalValue = null;
        }

        const updater = (prev: any[]) =>
            prev.map(item => item.id === id ? { ...item, [field]: finalValue } : item);

        if (typeHeader === 'return') {
            setReturns(updater);
        } else {
            setLines(updater);
        }
    };

    const handleStatsModal = (type: 'lines' | 'returns') => {
        const data = type === 'lines' ? lines : returns;
        const serviceTypeName = translate(ServiceType === 'sales' ? 'lines_page.service_type_sales' : 'lines_page.service_type_purchases');
        const modalTitleKey = type === 'lines' ? 'lines_page.stats_modal_title_lines' : 'lines_page.stats_modal_title_returns';
        const title = translate(modalTitleKey, { serviceType: serviceTypeName });
        setStatsModal({ isOpen: true, data, title });
    };

    const closeStatsModal = () => {
        setStatsModal(prev => ({ ...prev, isOpen: false }));
    };

    // Computed values
    const themedInputClass = `form-control ${styles.themedInput} ${isDarkMode ? styles.dark : ''}`;
    const themedSelectClass = `form-select ${styles.themedSelect} ${isDarkMode ? styles.dark : ''}`;
    const isInvoiceMode = OrderType === 'Invoice';
    const idField: keyof Item = isInvoiceMode ? 'salesInvoiceId' : 'salesOrderId';
    const isReturnMode = typeHeader === 'return';
    const idHeader = isInvoiceMode
        ? translate('lines_page.table_header_invoice_id')
        : translate('lines_page.table_header_order_id');
    return (
        <div className={`${styles.linesContainer} ${isDarkMode ? styles.dark : ''}`}>
            {/* Header Section */}
            <div className={styles.header}>
                <div className={styles.headerControls}>
                    <div className={styles.controlGroup}>
                        <label htmlFor="type-select" className={styles.controlLabel}>
                            View Type:
                        </label>
                        <select
                            id="type-select"
                            value={typeHeader}
                            onChange={(e) => setTypeHeader(e.target.value as 'lines' | 'return')}
                            className={themedSelectClass}
                            aria-label="Select view type"
                        >
                            <option value="lines">Lines</option>
                            <option value="return">Returns</option>
                        </select>
                    </div>

                    <div className={styles.buttonGroup}>
                        <button
                            onClick={() => handleStatsModal('lines')}
                            className={`btn btn-info ${styles.statsButton}`}
                            type="button"
                            aria-label="View lines statistics"
                        >
                            <span className={styles.buttonIcon}>📊</span>
                            Lines Statistics
                        </button>
                        <button
                            onClick={() => handleStatsModal('returns')}
                            className={`btn btn-warning ${styles.statsButton}`}
                            type="button"
                            aria-label="View returns statistics"
                        >
                            <span className={styles.buttonIcon}>🔄</span>
                            Returns Statistics
                        </button>
                    </div>
                </div>
            </div>

            {/* Table Section */}
            <div className={styles.tableContainer}>
                <div className="table-responsive">
                    <table className={`table table-hover ${isDarkMode ? 'table-dark' : ''} ${styles.dataTable}`}>
                        <thead className={styles.tableHeader}>
                        <tr>
                            <th scope="col" className={styles.idColumn}>ID</th>
                            <th scope="col" className={styles.productColumn}>  {translate('product.title')}</th>
                            <th scope="col" className={styles.quantityColumn}>Quantity</th>
                            <th scope="col" className={styles.priceColumn}>Price</th>
                            <th scope="col" className={styles.idColumn}>{idHeader}</th>
                            {isReturnMode && (
                                <>
                                    <th scope="col" className={styles.dateColumn}>Return Date</th>
                                    <th scope="col" className={styles.reasonColumn}>Return Reason</th>
                                </>
                            )}
                            <th scope="col" className={`text-center ${styles.actionsColumn}`}>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {displayData.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={isReturnMode ? 8 : 6}
                                    className={`text-center ${styles.emptyState}`}
                                >
                                    {isReturnMode
                                        ? translate('lines_page.empty_state_returns')
                                        : translate('lines_page.empty_state_lines')}                                </td>
                            </tr>
                        ) : (
                            displayData.map((item: any) => {
                                const currentItem = isReturnMode
                                    ? returns.find(r => r.id === item.id)
                                    : lines.find(l => l.id === item.id);

                                const actions = isReturnMode
                                    ? [
                                        {
                                            label: translate('lines_page.action_restore'),
                                            onClick: () => restoreLine(item.id, ServiceType),
                                            className: 'btn btn-outline-secondary btn-sm me-2'
                                        },
                                        {
                                            label: 'Edit',
                                            onClick: () => updateLineOrReturn(item.id, currentItem!, "lineReturn", ServiceType),
                                            className: 'btn btn-outline-primary btn-sm me-2'
                                        },
                                        {
                                            label: 'Delete',
                                            onClick: () => deleteLineOrReturn(item.id, "lineReturn", ServiceType),
                                            className: 'btn btn-outline-danger btn-sm'
                                        }
                                    ]
                                    : [
                                        {
                                            label: 'Move to Returns',
                                            onClick: () => moveToReturns(currentItem!, ServiceType),
                                            className: 'btn btn-outline-warning btn-sm me-2'
                                        },
                                        {
                                            label: 'Edit',
                                            onClick: () => updateLineOrReturn(item.id, currentItem!, "line", ServiceType),
                                            className: 'btn btn-outline-primary btn-sm me-2'
                                        },
                                        {
                                            label: 'Delete',
                                            onClick: () => deleteLineOrReturn(item.id, "line", ServiceType),
                                            className: 'btn btn-outline-danger btn-sm'
                                        }
                                    ];

                                return (
                                    <tr key={item.id} className={styles.tableRow}>
                                        <td className={styles.idCell}>{item.id}</td>
                                        <td className={styles.productCell}>
                                            {productNameMap[item.productId] || `ID: ${item.productId}`}
                                        </td>
                                        <td className={styles.inputCell}>
                                            <input
                                                type="number"
                                                className={themedInputClass}
                                                value={item.quantity ?? ''}
                                                onChange={(e) => handleInputChange(e, item.id, 'quantity')}
                                                readOnly={isReturnMode}
                                                min="0"
                                                step="1"
                                                aria-label={`Quantity for item ${item.id}`}
                                            />
                                        </td>
                                        <td className={styles.inputCell}>
                                            <input
                                                type="number"
                                                className={themedInputClass}
                                                value={item.price ?? ''}
                                                onChange={(e) => handleInputChange(e, item.id, 'price')}
                                                readOnly={isReturnMode}
                                                min="0"
                                                step="0.01"
                                                aria-label={`Price for item ${item.id}`}
                                            />
                                        </td>
                                        <td className={styles.inputCell}>
                                            <input
                                                type="number"
                                                className={themedInputClass}
                                                value={item[idField] ?? ''}
                                                onChange={(e) => handleInputChange(e, item.id, idField)}
                                                readOnly={isReturnMode}
                                                min="1"
                                                step="1"
                                                aria-label={`${idHeader} for item ${item.id}`}
                                            />
                                        </td>
                                        {isReturnMode && (
                                            <>
                                                <td className={styles.inputCell}>
                                                    <input
                                                        type="date"
                                                        className={themedInputClass}
                                                        value={item.returnDate || ''}
                                                        onChange={(e) => handleInputChange(e, item.id, 'returnDate')}
                                                        aria-label={`Return date for item ${item.id}`}
                                                    />
                                                </td>
                                                <td className={styles.inputCell}>
                                                    <input
                                                        type="text"
                                                        className={themedInputClass}
                                                        value={item.returnReason || ''}
                                                        onChange={(e) => handleInputChange(e, item.id, 'returnReason')}
                                                        placeholder="Return reason"
                                                        aria-label={`Return reason for item ${item.id}`}
                                                    />
                                                </td>
                                            </>
                                        )}
                                        <td className={`text-center ${styles.actionsCell}`}>
                                            <GenericActionButtons actions={actions} />
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Statistics Modal */}
            {statsModal.isOpen && (
                <StatisticsModal
                    isOpen={statsModal.isOpen}
                    onClose={closeStatsModal}
                    data={statsModal.data}
                    title={statsModal.title}
                    productNameMap={productNameMap}
                    isDarkMode={isDarkMode}
                />
            )}
        </div>
    );
};

export default LinesPage;