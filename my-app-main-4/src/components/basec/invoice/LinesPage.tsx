// LinesPage.tsx (Style Corrected)
import ReactDOM from 'react-dom';
import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect, useMemo } from 'react';
import styles from '../../../Css/invoiceOrOrder/Lines.module.css';
import { useDarkMode } from "../../DarkModeProvider";
import useLinesActions from "../../hook/useLinesActions";
import { Item } from "../../../classe/Item";
import { Return } from "../../../classe/Return";
import StatisticsModal from "./StatisticsModal";
import { getAllProducts } from "../../../api/product/productService";
import GenericActionButtons from "../GenericActionButtons";
import { Product } from "../../../classe/Product";
import { getSupplerClients } from "../../../api/supplierClientService";
import { ClientSupplier } from "../../../classe/ClientSupplier";
import { getAllLines } from "../../../api/lineApiService";
import {useTranslation} from "react-i18next";
import LinesPdfReport from "./LinesPdfReport";

const LinesPage = ({ ServiceType, OrderType }: { ServiceType: 'sales' | 'purchases', OrderType: 'Invoice' | 'Order' }) => {
    const { moveToReturns, restoreLine, deleteLineOrReturn, updateLineOrReturn } = useLinesActions();
    // @ts-ignore
    const navigate = useNavigate();
    const { isDarkMode } = useDarkMode();

    const [lines, setLines] = useState<Item[]>([]);
    const [returns, setReturns] = useState<Return[]>([]);
    const [customers, setCustomers] = useState<ClientSupplier[]>([]);
    const [suppliers, setSuppliers] = useState<ClientSupplier[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [typeHeader, setTypeHeader] = useState<'lines' | 'return'>('lines');
    const [statsModal, setStatsModal] = useState({
        isOpen: false,
        data: [] as (Item | Return)[],
        title: ''
    });
    const { t } = useTranslation('lines_page');
    const displayData = useMemo(() => {
        return typeHeader === 'return' ? returns : lines;
    }, [typeHeader, lines, returns]);

    // Filter state
    const [filterDate, setFilterDate] = useState<string>('');
    const [filterType, setFilterType] = useState<string>('');
    const [partySearch, setPartySearch] = useState('');
    const [selectedPartyId, setSelectedPartyId] = useState<number | null>(null);
    const [showPartySuggestions, setShowPartySuggestions] = useState(false);

    const productNameMap = useMemo(() => {
        const map: { [key: number]: string } = {};
        products.forEach(p => { map[p.id] = p.name; });
        return map;
    }, [products]);

    useEffect(() => {
        const fetchDataAndDisplay = async () => {
            try {
                const [fetchedProducts, fetchedLines, fetchedReturns, fetchedParties] = await Promise.all([
                    getAllProducts(),
                    getAllLines(ServiceType, "line"),
                    getAllLines(ServiceType, "lineReturn"),
                    getSupplerClients()
                ]);
                setCustomers(fetchedParties);
                setSuppliers(fetchedParties);
                setProducts(fetchedProducts);
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
        const serviceTypeName = t(ServiceType === 'sales' ? 'service_type_sales' : 'service_type_purchases');
        const modalTitleKey = type === 'lines' ? 'lines_page.stats_modal_title_lines' : 'lines_page.stats_modal_title_returns';
        const title = t(modalTitleKey, { serviceType: serviceTypeName });
        setStatsModal({ isOpen: true, data, title });
    };

    const closeStatsModal = () => {
        setStatsModal(prev => ({ ...prev, isOpen: false }));
    };

    const partySuggestions = useMemo(() => {
        if (!partySearch) return [];
        const partyList = ServiceType === 'sales' ? customers : suppliers;
        const lowerCaseSearch = partySearch.toLowerCase();
        return partyList.filter(p => p.name.toLowerCase().includes(lowerCaseSearch)).slice(0, 5);
    }, [partySearch, customers, suppliers, ServiceType]);

    const handleSelectParty = (party: ClientSupplier) => {
        setPartySearch(party.name);
        setSelectedPartyId(party.id as number);
        setShowPartySuggestions(false);
    };

    const exportToPdf = async () => {
        const { default: jsPDF } = await import('jspdf');
        const { default: html2canvas } = await import('html2canvas');

        const reportRoot = document.createElement('div');
        document.body.appendChild(reportRoot);

        const reportTitle = t('report_title', {
            type: typeHeader.charAt(0).toUpperCase() + typeHeader.slice(1),
            service: ServiceType
        });

        ReactDOM.render(
            <LinesPdfReport
                data={displayData}
                productNameMap={productNameMap}
                reportTitle={reportTitle}
                isReturnMode={isReturnMode}
                idField={idField}
                isInvoiceMode={isInvoiceMode}
            />,
            reportRoot
        );

        const canvas = await html2canvas(reportRoot.children[0] as HTMLElement, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`${typeHeader}_report.pdf`);

        ReactDOM.unmountComponentAtNode(reportRoot);
        document.body.removeChild(reportRoot);
    };

    const navigateToReport = () => {
        navigate('/profit-report', {
            state: {
                lines: lines, // Pass all lines, not just displayed
                products: products,
                serviceType: ServiceType,
            }
        });
    };

    // Computed values
    const themedInputClass = `form-control ${styles.themedInput} ${isDarkMode ? styles.dark : ''}`;
    const themedSelectClass = `form-select ${styles.themedSelect} ${isDarkMode ? styles.dark : ''}`;
    const isInvoiceMode = OrderType === 'Invoice';
    const idField: keyof Item = isInvoiceMode ? 'salesInvoiceId' : 'salesOrderId';
    const isReturnMode = typeHeader === 'return';
    const idHeader = isInvoiceMode
        ? t('table_header_invoice_id')
        : t('table_header_order_id');
    return (
        <div className={`${styles.linesContainer} ${isDarkMode ? styles.dark : ''}`}>
            {/* Header Section */}
            <div className={styles.header}>
                <div className={styles.headerControls}>
                    <div className={styles.controlGroup}>
                        <label htmlFor="type-select" className={styles.controlLabel}>
                            {t('view_type')}
                        </label>
                        <select
                            id="type-select"
                            value={typeHeader}
                            onChange={(e) => setTypeHeader(e.target.value as 'lines' | 'return')}
                            className={themedSelectClass}
                            aria-label={t('select_view_type_aria')}
                        >
                            <option value="lines">{t('lines')}</option>
                            <option value="return">{t('returns')}</option>
                        </select>
                    </div>

                    <div className={styles.filtersContainer}>
                        <div className={`${styles.filterInputGroup} ${styles.partySearchWrapper}`}>
                            <label className={styles.controlLabel}>{t('by_party')}</label>
                            <input
                                type="text"
                                placeholder={t(ServiceType === 'sales' ? 'search_customer' : 'search_supplier')}
                                className={themedInputClass}
                                value={partySearch}
                                onChange={(e) => {
                                    setPartySearch(e.target.value);
                                    setSelectedPartyId(null);
                                    setShowPartySuggestions(true);
                                }}
                                onBlur={() => setTimeout(() => setShowPartySuggestions(false), 200)}
                                aria-label={t('filter_by_party_aria')}
                            />
                            {showPartySuggestions && partySuggestions.length > 0 && (
                                <ul className={styles.suggestionsList}>
                                    {partySuggestions.map(party => (
                                        <li key={party.id} onMouseDown={() => handleSelectParty(party)}>
                                            {party.name}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        <div className={styles.filterInputGroup}>
                            <label className={styles.controlLabel}>{t('by_date')}</label>
                            <input
                                type="date"
                                className={themedInputClass}
                                value={filterDate}
                                onChange={(e) => setFilterDate(e.target.value)}
                                aria-label={t('filter_by_date_aria')}
                            />
                        </div>
                        {ServiceType === 'sales' && (
                            <div className={styles.filterInputGroup}>
                                <label className={styles.controlLabel}>{t('by_type')}</label>
                                <select className={themedSelectClass} value={filterType} onChange={e => setFilterType(e.target.value)}>
                                    <option value="">{t('any')}</option>
                                    <option value="invoice">{t('invoice')}</option>
                                    <option value="order">{t('order')}</option>
                                </select>
                            </div>
                        )}
                        <div className={styles.filterActions}>
                            <button
                                className={`btn btn-primary ${styles.filterButton}`}
                                onClick={async () => {
                                    try {
                                        const dateObj = filterDate ? new Date(filterDate) : undefined;
                                        const result = await (await import('../../../api/lineApiService')).filterLines(ServiceType, { id: selectedPartyId, date: dateObj, type: filterType || undefined });
                                        if (typeHeader === 'return') {
                                            setReturns(result);
                                        } else {
                                            setLines(result);
                                        }
                                    } catch (err) {
                                        console.error('Filter failed', err);
                                    }
                                }}
                            >
                                {t('filter')}
                            </button>
                            <button
                                className={`btn btn-secondary ${styles.filterButton}`}
                                onClick={async () => {
                                    setPartySearch('');
                                    setSelectedPartyId(null);
                                    setFilterDate(''); setFilterType('');
                                    try {
                                        const fetched = await getAllLines(ServiceType, typeHeader === 'return' ? 'lineReturn' : 'line');
                                        if (typeHeader === 'return') setReturns(fetched); else setLines(fetched);
                                    } catch (err) { console.error(err); }
                                }}
                            >
                                {t('reset')}
                            </button>
                        </div>
                    </div>

                    <div className={styles.buttonGroup}>
                        <button
                            onClick={() => handleStatsModal('lines')}
                            className={`btn btn-info ${styles.statsButton}`}
                            type="button"
                            aria-label={t('view_lines_stats_aria')}
                        >
                            <span className={styles.buttonIcon}>📊</span>
                            {t('lines_stats')}
                        </button>
                        <button
                            onClick={() => handleStatsModal('returns')}
                            className={`btn btn-warning ${styles.statsButton}`}
                            type="button"
                            aria-label={t('view_returns_stats_aria')}
                        >
                            <span className={styles.buttonIcon}>🔄</span>
                            {t('returns_stats')}
                        </button>
                        <button
                            onClick={exportToPdf}
                            className={`btn btn-success ${styles.statsButton}`}
                            type="button"
                            aria-label={t('export_pdf_aria')}
                        >
                            <span className={styles.buttonIcon}>📄</span>
                            {t('export_pdf')}
                        </button>
                        {ServiceType === 'sales' && (
                            <button
                                onClick={navigateToReport}
                                className={`btn btn-primary ${styles.statsButton}`}
                                type="button"
                            >
                                <span className={styles.buttonIcon}>📈</span>
                                {t('profit_report.title')}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Table Section */}
            <div className={styles.tableContainer}>
                <div className="table-responsive">
                    <table className={`table table-hover ${isDarkMode ? 'table-dark' : ''} ${styles.dataTable}`}>
                        <thead className={styles.tableHeader}>
                        <tr>
                            <th scope="col" className={styles.idColumn}>{t('id_header')}</th>
                            <th scope="col" className={styles.productColumn}>  {t('title', { ns: 'common' })}</th>
                            <th scope="col" className={styles.quantityColumn}>{t('quantity')}</th>
                            <th scope="col" className={styles.priceColumn}>{t('price')}</th>
                            <th scope="col" className={styles.idColumn}>{idHeader}</th>
                            {isReturnMode && (
                                <>
                                    <th scope="col" className={styles.dateColumn}>{t('return_date')}</th>
                                    <th scope="col" className={styles.reasonColumn}>{t('return_reason')}</th>
                                </>
                            )}
                            <th scope="col" className={`text-center ${styles.actionsColumn}`}>{t('actions')}</th>
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
                                        ? t('empty_state_returns')
                                        : t('empty_state_lines')}                                </td>
                            </tr>
                        ) : (
                            displayData.map((item: any) => {
                                const currentItem = isReturnMode
                                    ? returns.find(r => r.id === item.id)
                                    : lines.find(l => l.id === item.id);

                                const actions = isReturnMode
                                    ? [
                                        {
                                            label: t('action_restore'),
                                            onClick: () => restoreLine(item.id, ServiceType),
                                            className: 'btn btn-outline-secondary btn-sm me-2'
                                        },
                                        {
                                            label: t('common:edit', { ns: 'common' }),
                                            onClick: () => updateLineOrReturn(item.id, currentItem!, "lineReturn", ServiceType),
                                            className: 'btn btn-outline-primary btn-sm me-2'
                                        },
                                        {
                                            label: t('common:delete', { ns: 'common' }),
                                            onClick: () => deleteLineOrReturn(item.id, "lineReturn", ServiceType),
                                            className: 'btn btn-outline-danger btn-sm'
                                        }
                                    ]
                                    : [
                                        {
                                            label: t('returns'),
                                            onClick: () => moveToReturns(currentItem!, ServiceType),
                                            className: 'btn btn-outline-warning btn-sm me-2'
                                        },
                                        {
                                            label: t('common:edit', { ns: 'common' }),
                                            onClick: () => updateLineOrReturn(item.id, currentItem!, "line", ServiceType),
                                            className: 'btn btn-outline-primary btn-sm me-2'
                                        },
                                        {
                                            label: t('common:delete', { ns: 'common' }),
                                            onClick: () => deleteLineOrReturn(item.id, "line", ServiceType),
                                            className: 'btn btn-outline-danger btn-sm'
                                        }
                                    ];

                                return (
                                    <tr key={item.id} className={styles.tableRow}>
                                        <td className={styles.idCell}>{item.id}</td>
                                        <td className={styles.productCell}>
                                            {productNameMap[item.productId] || t('product_id_fallback', { id: item.productId })}
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
                                                aria-label={t('quantity_for_item_aria', {id: item.id})}
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
                                                aria-label={t('price_for_item_aria', {id: item.id})}
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
                                                aria-label={t('id_for_item_aria', {idHeader: idHeader, id: item.id})}
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
                                                        aria-label={t('return_date_for_item_aria', {id: item.id})}
                                                    />
                                                </td>
                                                <td className={styles.inputCell}>
                                                    <input
                                                        type="text"
                                                        className={themedInputClass}
                                                        value={item.returnReason || ''}
                                                        onChange={(e) => handleInputChange(e, item.id, 'returnReason')}
                                                        placeholder={t('return_reason')}
                                                        aria-label={t('return_reason_for_item_aria', {id: item.id})}
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