import React, {useEffect, useCallback, useMemo, useState} from 'react';
import { getSupplerClients, deleteSupplierClient } from '../../api/supplierClientService';
import { useNavigate } from 'react-router-dom';
import { useDarkMode } from "../DarkModeProvider";
import Modal from "../basec/Modal";
import GenericActionButtons from '../basec/GenericActionButtons';
import styles from '../../Css/SupplierClient/SupplierClientList.module.css';
import SupplierClientCard from "./SupplierClientCard";
import SupplierClientForm from "./SupplierClientForm";
import {ClientSupplier} from "../../classe/ClientSupplier";
import CategoryFilter from "../product/CategoryFilter";
import EnhancedStats from '../product/EnhancedStats';
import SuppliersClientsChart from "../statistics/SuppliersClientsChart";
import {SupplierClientData} from  "../statistics/basec"
interface ModalState {
    type: 'edit' | 'add' | 'view' | 'stats' | null;
    data: ClientSupplier | null;
    defaultCategory?: string | null;
}

interface Totals {
    totalSalesValue: number;
    totalPurchasesValue: number;
    totalSalesCredit: number;
    totalPurchaseCredit: number;
}

interface DarkModeContext {
    isDarkMode: boolean;
}


const INITIAL_MODAL_STATE: ModalState = { type: null, data: null, defaultCategory: null };
const CURRENCY_FORMATTER = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
});


const SupplierClientList: React.FC = () => {
    const navigate = useNavigate();
    const [supplierClients, setSupplierClients] = useState<ClientSupplier[]>([]);
    const [modalContent, setModalContent] = useState<ModalState>(INITIAL_MODAL_STATE);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedClientPath, setSelectedClientPath] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCreator, setSelectedCreator] = useState<string | null>(null);
    const [selectedExecutor, setSelectedExecutor] = useState<string | null>(null);
    const [showStats, setShowStats] = useState(false);
    const { isDarkMode } = useDarkMode() as DarkModeContext;

    const formatCurrency = useCallback((amount: number): string => {
        return CURRENCY_FORMATTER.format(amount);
    }, []);

    const fetchSupplierClients = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await getSupplerClients();
            setSupplierClients(data);
        } catch (error) {
            console.error("Failed to fetch supplier/clients:", error);
            setError("Failed to load supplier/clients. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSupplierClients();
    }, [fetchSupplierClients]);

    const handleSuccess = useCallback(() => {
        setModalContent(INITIAL_MODAL_STATE);
        fetchSupplierClients();
    }, [fetchSupplierClients]);

    const handleDelete = useCallback(async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this client?')) {
            return;
        }
        try {
            await deleteSupplierClient(id);
            fetchSupplierClients();
        } catch (error) {
            console.error('Error deleting client:', error);
            alert('Failed to delete client.');
        }
    }, [fetchSupplierClients]);

    const closeModal = useCallback(() => {
        setModalContent(INITIAL_MODAL_STATE);
    }, []);

    const openModal = useCallback((type: 'add' | 'edit' | 'view' | 'stats', data: ClientSupplier | null = null, defaultCategory: string | null = null) => {
        setModalContent({ type, data, defaultCategory });
    }, []);

    const totals = useMemo((): Totals => {
        return supplierClients.reduce((acc, client) => {
            const salesValue = client.totalSales || 0;
            const purchasesValue = client.totalePurchase || 0;
            const salesCredit = client.borrowingPriceSales || 0;
            const purchaseCredit = client.borrowingPricePurchase || 0;

            return {
                totalSalesValue: acc.totalSalesValue + salesValue,
                totalPurchasesValue: acc.totalPurchasesValue + purchasesValue,
                totalSalesCredit: acc.totalSalesCredit + salesCredit,
                totalPurchaseCredit: acc.totalPurchaseCredit + purchaseCredit
            };
        }, {
            totalSalesValue: 0,
            totalPurchasesValue: 0,
            totalSalesCredit: 0,
            totalPurchaseCredit: 0
        });
    }, [supplierClients]);

    const allClientCategories = useMemo(() => {
        const categories = new Set<string>();
        supplierClients.forEach(client => {
            if (client.category) {
                categories.add(client.category);
            }
        });
        return Array.from(categories);
    }, [supplierClients]);

    const clientMainCategories = useMemo(() => {
        const mainCategories = new Set<string>();
        allClientCategories.forEach(category => {
            const mainCategory = category.split(' > ')[0];
            if (mainCategory) {
                mainCategories.add(mainCategory);
            }
        });
        return Array.from(mainCategories);
    }, [allClientCategories]);

    const allCreators = useMemo(() => {
        const creators = new Set<string>();
        supplierClients.forEach(client => {
            if (client.userCreator) {
                creators.add(client.userCreator.toString());
            }
        });
        return Array.from(creators);
    }, [supplierClients]);

    const allExecutors = useMemo(() => {
        const executors = new Set<string>();
        supplierClients.forEach(client => {
            if (client.userExecutor) {
                executors.add(client.userExecutor.toString());
            }
        });
        return Array.from(executors);
    }, [supplierClients]);

    const chartData = useMemo((): SupplierClientData[] => {
        return supplierClients.map(client => ({
            id: client.id,
            name: client.name,
            totalSales: client.totalSales || 0,
            totalePurchase: client.totalePurchase || 0,
            borrowingPriceSales: client.borrowingPriceSales || 0,
            borrowingPricePurchase: client.borrowingPricePurchase || 0
        }));
    }, [supplierClients]);

    const handleAddPartyToCategory = useCallback((categoryPath: string) => {
        openModal('add', null, categoryPath);
    }, [openModal]);

    const handleBarClick = useCallback((partnerId: number) => {
        if (partnerId) navigate(`/partners/${partnerId}`);
    }, [navigate]);

    const filteredClients = useMemo(() => {
        return supplierClients.filter(client => {
            const matchesCategory = !selectedClientPath || client.category?.startsWith(selectedClientPath);
            const matchesSearch = client.name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCreator = !selectedCreator || (client.userCreator !== null && client.userCreator.toString() === selectedCreator);
            const matchesExecutor = !selectedExecutor || (client.userExecutor !== null && client.userExecutor.toString() === selectedExecutor);
            return matchesCategory && matchesSearch && matchesCreator && matchesExecutor;
        });
    }, [supplierClients, selectedClientPath, searchQuery, selectedCreator, selectedExecutor]);

    const tableRows = useMemo(() => {
        return filteredClients.map((client) => {
            const actions = [
                { label: 'View Details', onClick: () => openModal('view', client) },
                { label: 'Update', onClick: () => openModal('edit', client) },
                { label: 'Delete', onClick: () => handleDelete(client.id) },
            ];
            return (
                <tr key={client.id}>
                    <td>{client.name}</td>
                    <td>{client.email}</td>
                    <td>{client.phoneNumber}</td>
                    <td>
                        <GenericActionButtons actions={actions} />
                    </td>
                </tr>
            );
        });
    }, [filteredClients, openModal, handleDelete]);

    const summaryCards = useMemo(() => [
        { label: 'Total Partners', value: supplierClients.length.toString(), className: '' },
        { label: 'Total Sales Value', value: formatCurrency(totals.totalSalesValue), className: styles.sales },
        { label: 'Total Purchases Value', value: formatCurrency(totals.totalPurchasesValue), className: styles.purchases },
        { label: 'Total Sales Credit', value: formatCurrency(totals.totalSalesCredit), className: styles.credit },
        { label: 'Total Purchase Debt', value: formatCurrency(totals.totalPurchaseCredit), className: styles.debt }
    ], [supplierClients.length, totals, formatCurrency]);

    const hasActiveFilters = selectedClientPath || searchQuery || selectedCreator || selectedExecutor;

    if (isLoading) {
        return <div className={styles.loadingState}>Loading...</div>;
    }

    if (error) {
        return (
            <div className={styles.listContainer}>
                <div className={styles.errorState}>
                    <div className={styles.errorMessage}>{error}</div>
                    <button className={styles.retryButton} onClick={fetchSupplierClients}>Retry</button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.listContainer}>
            <div className={styles.mainContent}>
                <header className={styles.header}>
                    <div className={styles.headerTop}>
                        <h2 className={styles.title}>Supplier & Clients</h2>
                        <div className={styles.headerActions}>
                            <button
                                className={`${styles.addButton} ${showStats ? styles.activeTab : ''}`}
                                onClick={() => setShowStats(!showStats)}
                                style={{ marginRight: '10px' }}
                            >
                                <i className={`fas ${showStats ? 'fa-list' : 'fa-chart-bar'} me-2`} aria-hidden="true"></i>
                                {showStats ? 'Show List' : 'Show Analytics'}
                            </button>
                            <button className={styles.addButton} onClick={() => openModal('add')}>
                                <i className="fas fa-plus me-2" aria-hidden="true"></i>
                                New Client/Supplier
                            </button>
                        </div>
                    </div>

                    {!showStats && (
                        <>
                            <div className={styles.filtersContainer}>
                                <CategoryFilter
                                    mainCategories={clientMainCategories}
                                    allCategories={allClientCategories}
                                    selectedCategoryPath={selectedClientPath}
                                    onSelectCategory={setSelectedClientPath}
                                    onAddItemToCategory={handleAddPartyToCategory}
                                    showAddItemButton={true}
                                    showAddButton={true}
                                    showSubCategoryButton={true}
                                    isDarkMode={isDarkMode}
                                />

                                <div className={styles.searchAndFilters}>
                                    <div className={styles.searchInputWrapper}>
                                        <i className="fas fa-search" aria-hidden="true"></i>
                                        <input
                                            type="text"
                                            className={styles.searchInput}
                                            placeholder="Search by name..."
                                            value={searchQuery}
                                            onChange={e => setSearchQuery(e.target.value)}
                                        />
                                        {searchQuery && (
                                            <button
                                                className={styles.clearSearchButton}
                                                onClick={() => setSearchQuery('')}
                                                title="Clear search"
                                            >
                                                <i className="fas fa-times" aria-hidden="true"></i>
                                            </button>
                                        )}
                                    </div>

                                    <select
                                        className={styles.filterSelect}
                                        value={selectedCreator || ''}
                                        onChange={e => setSelectedCreator(e.target.value || null)}
                                        title="Filter by creator"
                                    >
                                        <option value="">All Creators</option>
                                        {allCreators.map((creator: string) => (
                                            <option key={creator} value={creator}>{creator}</option>
                                        ))}
                                    </select>

                                    <select
                                        className={styles.filterSelect}
                                        value={selectedExecutor || ''}
                                        onChange={e => setSelectedExecutor(e.target.value || null)}
                                        title="Filter by executor"
                                    >
                                        <option value="">All Executors</option>
                                        {allExecutors.map((executor: string) => (
                                            <option key={executor} value={executor}>{executor}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {hasActiveFilters && (
                                <div className={styles.activeFiltersIndicator}>
                                    <small>
                                        Showing {filteredClients.length} of {supplierClients.length} clients
                                        {selectedClientPath && <span> in "{selectedClientPath.replace(/ > /g, ' / ')}"</span>}
                                    </small>
                                </div>
                            )}
                        </>
                    )}
                </header>

                {showStats ? (
                    <div className={styles.statsContainer}>
                        <div style={{ marginBottom: '2rem' }}>
                            <EnhancedStats
                                suppliers={supplierClients}
                                dataType="suppliers"
                            />
                        </div>

                        {chartData.length > 0 && (
                            <SuppliersClientsChart data={chartData} onBarClick={handleBarClick}/>
                        )}
                    </div>
                ) : (
                    <div className={styles.tableResponsive}>
                        <table className={styles.contentTable}>
                            <colgroup>
                                <col className={styles.colName} />
                                <col className={styles.colEmail} />
                                <col className={styles.colPhone} />
                                <col className={styles.colActions} />
                            </colgroup>
                            <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Phone Number</th>
                                <th>Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {tableRows.length > 0 ? tableRows : (
                                <tr>
                                    <td colSpan={4} className={styles.emptyState}>
                                        No clients match the current filters.
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <footer className={styles.summaryFooter}>
                <div className={styles.summaryGrid}>
                    {summaryCards.map((card, index) => (
                        <div key={index} className={styles.summaryCard}>
                            <span className={styles.summaryLabel}>{card.label}</span>
                            <span className={`${styles.summaryValue} ${card.className}`}>{card.value}</span>
                        </div>
                    ))}
                </div>
            </footer>

            <Modal isOpen={!!modalContent.type} onClose={closeModal}>
                {modalContent.type === 'view' && modalContent.data && (
                    <SupplierClientCard partner={modalContent.data} />
                )}
                {(modalContent.type === 'add' || modalContent.type === 'edit') && (
                    <div className={styles.modalContent}>
                        <h3 className={styles.modalTitle}>
                            {modalContent.type === 'edit' ? 'Edit' : 'Add'} Client/Supplier
                            {modalContent.defaultCategory && (
                                <small className={styles.modalSubtitle}>
                                    Category: {modalContent.defaultCategory.replace(/ > /g, ' / ')}
                                </small>
                            )}
                        </h3>
                        <SupplierClientForm
                            existingClient={modalContent.type === 'edit' ? modalContent.data || undefined : undefined}
                            defaultCategory={modalContent.defaultCategory}
                            onSuccess={handleSuccess}
                            onCancel={closeModal}
                        />
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default SupplierClientList;