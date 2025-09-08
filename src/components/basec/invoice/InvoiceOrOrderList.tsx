import React, { useEffect, useState } from 'react';
import styles from '../../../Css/invoiceOrOrder/InvoiceList.module.css';
import { getAllProducts } from "../../../api/product/productService";
import { getSupplerClients } from "../../../api/supplierClientService";
import InvoiceOrOrderDetails from './invoiceOrOrderDetails/InvoiceDetails';
import Modal from "../Modal";
import { useInvoicesOrOrders } from './InvoicesOrOrdersService';
import { useDarkMode } from "../../DarkModeProvider";
import authService from "../../../api/authService";
import { Invoice } from '../../../classe/Invoice';
import { ClientSupplier } from "../../../classe/ClientSupplier";
import { Product } from "../../../classe/Product";
import { User } from "../../../classe/types";
import {OrderType} from "../../../api/OrderInvoiceService";
import {ServiceType} from "../../../api/lineApiService";
import DynamicReportSummary from "./invoiceOrOrderDetails/Rapports/DynamicReportSummary";
import { useTranslation } from 'react-i18next';
interface InvoiceOrOrderListProps {
    ServiceType: ServiceType;
    OrderType: OrderType;
}
interface DarkModeContext {
    isDarkMode: boolean;
}
const InvoiceOrOrderList: React.FC<InvoiceOrOrderListProps> = ({ ServiceType, OrderType }) => {
    const {
        handleOpenModal, handleShowAll, handleCloseModal,
        fetchInvoices, handleDelete, handleEdit, handleSave, handleInputChange,
        calculateTotalAmount, setFilteredInvoices, setSelectedProductType, setSelectedPartyType,
        setSelectedDate, selectedDate, selectedPartyType, selectedProductType,
        filteredInvoices, selectedInvoice, formData, orders, invoices,
        showModal, setShowModal, showModaldtls, handleUpdateOrderStatus
    } = useInvoicesOrOrders(ServiceType, OrderType);

    const [customers, setCustomers] = useState<ClientSupplier[]>([]);
    const [suppliers, setSuppliers] = useState<ClientSupplier[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [userMap, setUserMap] = useState<Map<string | number, string>>(new Map());
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCreatedBy, setSelectedCreatedBy] = useState('');
    const [selectedExecutedBy, setSelectedExecutedBy] = useState('');
    const [selectedOrderStatus, setSelectedOrderStatus] = useState('');
    // @ts-ignore
    const { isDarkMode } = useDarkMode() as DarkModeContext;
    const { t: translate } = useTranslation(); // Renomme 't' en 'translate'

    const [activeActionsMenu, setActiveActionsMenu] = useState<number | null>(null);

    useEffect(() => {
        const handleClickOutside = () => {
            setActiveActionsMenu(null);
        };
        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, []);

    // Fetch users and create userMap on component mount
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const usersList = await authService.getAccounts();
                setUsers(usersList);

                // Create a map for quick user lookup
                const map = new Map<string | number, string>();
                usersList.forEach((user: { id: string | number; fullName: string; username: string; }) => {
                    map.set(user.id, user.fullName || user.username || `User ${user.id}`);
                });
                setUserMap(map);
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };

        fetchUsers();
    }, []);

    useEffect(() => {
        const sourceData = OrderType === "Order" ? orders : invoices;

        if (!sourceData.length && !selectedDate && !selectedPartyType && !selectedProductType && !selectedCreatedBy && !selectedExecutedBy && !selectedOrderStatus) {
            setFilteredInvoices(sourceData);
            return;
        }

        let filtered = [...sourceData];

        // --- FILTER LOGIC ---

        if (selectedDate) {
            filtered = filtered.filter(inv => inv.date && inv.date.startsWith(selectedDate));
        }

        if (selectedPartyType) {
            filtered = filtered.filter(inv => {
                const partyId = ServiceType === "sales" ? inv.customer : inv.supplier;
                return String(partyId) === String(selectedPartyType);
            });
        }

        // PRODUCT FILTER
        if (selectedProductType) {
            filtered = filtered.filter(inv =>
                inv.items.some(line =>
                    line.productId === selectedProductType
                ));
        }

        // USER FILTERS
        if (selectedCreatedBy) {
            filtered = filtered.filter(inv => inv.userCreator && String(inv.userCreator) === String(selectedCreatedBy));
        }

        if (selectedExecutedBy) {
            filtered = filtered.filter(inv => inv.userExecutor && String(inv.userExecutor) === String(selectedExecutedBy));
        }

        // ORDER STATUS FILTER - Fixed to access orderStatus directly
        if (selectedOrderStatus && OrderType === 'Order') {
            filtered = filtered.filter(inv => {
                // Check if the invoice has orderStatus property and it matches the selected status
                return 'orderStatus' in inv && inv.orderStatus === selectedOrderStatus;
            });
        }
        console.log(invoices);
        console.log("Filtered by product:", selectedProductType, filtered.map(inv => inv.items));
        console.log("Filtered by creator:", selectedCreatedBy, filtered.map(inv => inv.userCreator));


        setFilteredInvoices(filtered);

    }, [
        selectedDate, selectedPartyType, selectedProductType,
        selectedCreatedBy, selectedExecutedBy, selectedOrderStatus,
        orders, invoices, OrderType, ServiceType, setFilteredInvoices
    ]);

    useEffect(() => {
        if (ServiceType && OrderType) {
            fetchInvoices();
            getSupplerClients().then(data => {
                setCustomers(data);
                setSuppliers(data);
            });
            getAllProducts().then(setProducts);
        }
    }, [ServiceType, OrderType, fetchInvoices]);

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        const sourceData = OrderType === "Order" ? orders : invoices;
        if (query.trim() === "") {
            handleShowAll();
            return;
        }
        const lowercasedQuery = query.toLowerCase();
        const filtered = sourceData.filter((invoice) => {
            const partyName = getPartyName(invoice);
            const totalAmount = String(invoice.totalAmount);
            const paymentStatus = (invoice.paymentStatus || '').toLowerCase();

            return (
                String(invoice.id).includes(lowercasedQuery) ||
                partyName.toLowerCase().includes(lowercasedQuery) ||
                totalAmount.includes(lowercasedQuery) ||
                paymentStatus.includes(lowercasedQuery)
            );
        });
        setFilteredInvoices(filtered);
    };

    const getPartyName = (invoice: Invoice) => {
        const partyList = ServiceType === 'sales' ? customers : suppliers;
        const partyId = ServiceType === 'sales' ? invoice.customer : invoice.supplier;
        const party = partyList.find(p => String(p.id) === String(partyId));
        return party ? party.name : 'Unknown';
    };

    const getUserName = (userId: string | number) => {
        return userMap.get(userId) || `User ${userId}`;
    };

    const getPaymentStatusBadge = (status: string | null | undefined) => {
        const safeStatus = status || 'UNPAID';
        const statusLower = safeStatus.toLowerCase();

        if (statusLower === 'paid') {
            return <span className={`${styles.badge} ${styles.badgePaid}`}>{translate('order_invoice.paid', 'Paid')}</span>;
        } else if (statusLower === 'partpaid') {
            return <span className={`${styles.badge} ${styles.badgePartpaid}`}>PART PAID</span>;
        }
        return <span className={`${styles.badge} ${styles.badgeUnpaid}`}>{translate(`order_invoice.${statusLower}`, safeStatus.toUpperCase())}</span>;
    };

    const getOrderStatusBadge = (status: string | null | undefined) => {
        const safeStatus = status || 'PENDING';
        const statusLower = safeStatus.toLowerCase();

        let badgeClass = styles.badgeUnpaid; // Default class

        switch (statusLower) {
            case 'pending':
                badgeClass = styles.badgePartpaid;
                break;
            case 'processing':
                badgeClass = styles.badgeProcessing;
                break;
            case 'shipped':
                badgeClass = styles.badgeShipped;
                break;
            case 'delivered':
                badgeClass = styles.badgePaid;
                break;
            case 'cancelled':
                badgeClass = styles.badgeUnpaid;
                break;
        }

        return <span className={`${styles.badge} ${badgeClass}`}>{translate(`order_invoice.${statusLower}`, safeStatus.toUpperCase())}</span>;
    };

    const toggleActionsMenu = (e: React.MouseEvent, invoiceId: number) => {
        e.stopPropagation();
        setActiveActionsMenu(prev => (prev === invoiceId ? null : invoiceId));
    };

    const resetAllFilters = () => {
        setSelectedDate('');
        setSelectedPartyType('');
        setSelectedProductType(0);
        setSelectedCreatedBy('');
        setSelectedExecutedBy('');
        setSelectedOrderStatus('');
        setSearchQuery('');
        handleShowAll();
    };

    // Helper function to safely get order status from invoice
    const getOrderStatus = (invoice: any) => {
        if ('orderStatus' in invoice) {
            return invoice.orderStatus;
        }
        return null;
    };

    // Helper function to safely get sold amount from invoice
    const getSoldAmount = (invoice: any) => {
        if ('soldAmount' in invoice) {
            return invoice.soldAmount;
        }
        return null;
    };
    const totalAmount = calculateTotalAmount(filteredInvoices).toFixed(2);
    return (
        <div className={`${styles.listContainer} ${isDarkMode ? styles.darkMode : ''}`}>
            {/* Dynamic Report Summary */}
            <DynamicReportSummary items={filteredInvoices} />
            <div className={`${styles.cardHeader} ${isDarkMode ? styles.cardHeaderDark : ''}`}>
                <div className={styles.inputGroup}>
                    <span className={`${styles.inputGroupText} ${isDarkMode ? styles.inputGroupTextDark : ''}`}>
                        <i className="fas fa-search"></i>
                    </span>
                    <input
                        type="text"
                        placeholder="Search by ID, Customer/Supplier, Amount..."
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        className={`${styles.formControl} ${isDarkMode ? styles.formControlDark : ''}`}
                    />
                </div>
            </div>

            <div className={`${styles.cardBody} ${isDarkMode ? styles.cardBodyDark : ''}`}>
                <div className={styles.filtersGrid}>
                    <div className={styles.formGroup}>
                        <label className={`${styles.formLabel} ${isDarkMode ? styles.formLabelDark : ''}`}>Filter by Date:</label>
                        <input
                            className={`${styles.formControl} ${isDarkMode ? styles.formControlDark : ''}`}
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={`${styles.formLabel} ${isDarkMode ? styles.formLabelDark : ''}`}>
                            {ServiceType === 'sales' ? 'Filter by Customer:' : 'Filter by Supplier:'}
                        </label>
                        <select
                            value={selectedPartyType}
                            onChange={(e) => setSelectedPartyType(e.target.value)}
                            className={`${styles.formSelect} ${isDarkMode ? styles.formSelectDark : ''}`}
                        >
                            <option value="">{ServiceType === 'sales' ? 'All Customers' : 'All Suppliers'}</option>
                            {(ServiceType === 'sales' ? customers : suppliers).map(({ id, name, email }) => (
                                <option key={id} value={id}>
                                    {name} {email ? `-- ${email}` : ''}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.formGroup}>
                        <label className={`${styles.formLabel} ${isDarkMode ? styles.formLabelDark : ''}`}>Filter by Product:</label>
                        <select
                            value={selectedProductType}
                            onChange={(e) => setSelectedProductType(Number(e.target.value))}
                            className={`${styles.formSelect} ${isDarkMode ? styles.formSelectDark : ''}`}
                        >
                            <option value={0}>All Products</option>
                            {products.map(({ id, name, quantity }) => (
                                <option key={id} value={id}>
                                    {name} -- In Stock: {quantity}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.formGroup}>
                        <label className={`${styles.formLabel} ${isDarkMode ? styles.formLabelDark : ''}`}>Filter by Created By:</label>
                        <select
                            value={selectedCreatedBy}
                            onChange={(e) => setSelectedCreatedBy(e.target.value)}
                            className={`${styles.formSelect} ${isDarkMode ? styles.formSelectDark : ''}`}
                        >
                            <option value="">All Users</option>
                            {users.map(({ id, fullName }) => (
                                <option key={id} value={id}>
                                    {fullName}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.formGroup}>
                        <label className={`${styles.formLabel} ${isDarkMode ? styles.formLabelDark : ''}`}>Filter by Executed By:</label>
                        <select
                            value={selectedExecutedBy}
                            onChange={(e) => setSelectedExecutedBy(e.target.value)}
                            className={`${styles.formSelect} ${isDarkMode ? styles.formSelectDark : ''}`}
                        >
                            <option value="">All Users</option>
                            {users.map(({ id, fullName }) => (
                                <option key={id} value={id}>
                                    {fullName}
                                </option>
                            ))}
                        </select>
                    </div>

                    {OrderType === 'Order' && (
                        <div className={styles.formGroup}>
                            <label className={`${styles.formLabel} ${isDarkMode ? styles.formLabelDark : ''}`}>Filter by Order Status:</label>
                            <select
                                value={selectedOrderStatus}
                                onChange={(e) => setSelectedOrderStatus(e.target.value)}
                                className={`${styles.formSelect} ${isDarkMode ? styles.formSelectDark : ''}`}
                            >
                                <option value="">All Statuses</option>
                                <option value="PENDING">Pending</option>
                                <option value="PROCESSING">Processing</option>
                                <option value="SHIPPED">Shipped</option>
                                <option value="DELIVERED">Delivered</option>
                                <option value="CANCELLED">Cancelled</option>
                            </select>
                        </div>
                    )}

                    <div className={styles.formGroupAuto}>
                        <button
                            className={`${styles.btnOutline} ${isDarkMode ? styles.btnOutlineDark : ''}`}
                            onClick={resetAllFilters}
                        >
                            Clear All Filters
                        </button>
                    </div>
                </div>

                <div className={styles.tableResponsive}>
                    <table className={`${styles.invoiceTable} ${isDarkMode ? styles.invoiceTableDark : ''}`}>
                        <thead className={isDarkMode ? styles.tableHeadDark : ''}>
                        <tr>
                            <th className={isDarkMode ? styles.tableHeaderDark : ''}>ID</th>
                            <th className={isDarkMode ? styles.tableHeaderDark : ''}>
                                {ServiceType === 'sales' ? "Customer" : "Supplier"}
                            </th>
                            <th className={isDarkMode ? styles.tableHeaderDark : ''}>Total Amount</th>
                            <th className={isDarkMode ? styles.tableHeaderDark : ''}>Payment Status</th>
                            <th className={isDarkMode ? styles.tableHeaderDark : ''}>Date</th>
                            <th className={isDarkMode ? styles.tableHeaderDark : ''}>Created By</th>
                            <th className={isDarkMode ? styles.tableHeaderDark : ''}>Executed By</th>
                            {OrderType === 'Order' && <th className={isDarkMode ? styles.tableHeaderDark : ''}>Sold Amount</th>}
                            {OrderType === 'Order' && <th className={isDarkMode ? styles.tableHeaderDark : ''}>Order Status</th>}
                            <th className={`${styles.actionsHeader} ${isDarkMode ? styles.tableHeaderDark : ''}`}>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filteredInvoices.map((invoice) => (
                            <tr key={invoice.id}
                                className={`${styles.tableRow} ${isDarkMode ? styles.tableRowDark : ''}`}
                                onClick={() => handleOpenModal(invoice)}>
                                <td className={isDarkMode ? styles.tableCellDark : ''}>{invoice.id}</td>
                                <td className={isDarkMode ? styles.tableCellDark : ''}>{getPartyName(invoice)}</td>
                                <td className={isDarkMode ? styles.tableCellDark : ''}>${invoice.totalAmount.toFixed(2)}</td>
                                <td className={isDarkMode ? styles.tableCellDark : ''}>{getPaymentStatusBadge(invoice.paymentStatus)}</td>
                                <td className={isDarkMode ? styles.tableCellDark : ''}>{new Date(invoice.date).toLocaleDateString()}</td>
                                <td className={isDarkMode ? styles.tableCellDark : ''}>
                                    {invoice.userCreator}:<span className={`${styles.badge} ${styles.badgeCreator}`}>{getUserName(invoice.userCreator)}</span>
                                </td>
                                <td className={isDarkMode ? styles.tableCellDark : ''}>
                                    {invoice.userExecutor}:<span className={`${styles.badge} ${styles.badgeExecutor}`}>{getUserName(invoice.userExecutor)}</span>
                                </td>
                                {OrderType === 'Order' && (
                                    <td className={isDarkMode ? styles.tableCellDark : ''}>
                                        {getSoldAmount(invoice) !== null ? `$${getSoldAmount(invoice).toFixed(2)}` : 'N/A'}
                                    </td>
                                )}
                                {OrderType === 'Order' && (
                                    <td className={isDarkMode ? styles.tableCellDark : ''}>
                                        {getOrderStatus(invoice) !== null ? getOrderStatusBadge(getOrderStatus(invoice)) : 'N/A'}
                                    </td>
                                )}
                                <td className={`${styles.actionsCell} ${isDarkMode ? styles.tableCellDark : ''}`}
                                    onClick={(e) => e.stopPropagation()}>
                                    <button
                                        className={`${styles.actionsButton} ${isDarkMode ? styles.actionsButtonDark : ''}`}
                                        onClick={(e) => toggleActionsMenu(e, invoice.id)}>
                                        <i className="fas fa-ellipsis-v"></i>
                                    </button>
                                    {activeActionsMenu === invoice.id && (
                                        <div className={`${styles.actionsMenu} ${isDarkMode ? styles.actionsMenuDark : ''}`}>
                                            <button
                                                className={`${styles.menuButton} ${styles.update} ${isDarkMode ? styles.menuButtonDark : ''}`}
                                                onClick={() => handleEdit(invoice)}>
                                                <i className="fas fa-pen"></i> Update
                                            </button>
                                            <button
                                                className={`${styles.menuButton} ${styles.delete} ${isDarkMode ? styles.menuButtonDark : ''}`}
                                                onClick={() => handleDelete(invoice.id)}>
                                                <i className="fas fa-trash-alt"></i> Delete
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className={`${styles.cardFooter} ${isDarkMode ? styles.cardFooterDark : ''}`}>
                <h5 className={isDarkMode ? styles.footerTitleDark : ''}
                data-no-translate={true}>
                    {translate("order_invoice.total_amount_for_displayed_items", { amount: totalAmount })}
                </h5>
            </div>

            {showModaldtls && (
                <Modal isOpen={showModaldtls} onClose={handleCloseModal} >
                    <InvoiceOrOrderDetails
                        invoiceOrOrder={selectedInvoice}
                        ServiceType={ServiceType}
                        OrderType={OrderType}
                        onClose={handleCloseModal}
                        onUpdateOrderStatus={handleUpdateOrderStatus}
                    />
                </Modal>
            )}

            {showModal && (
                <div className={styles.modalBackdrop}>
                    <div className={`${styles.modalContent} ${isDarkMode ? styles.modalContentDark : ''}`}>
                        <div className={`${styles.modalHeader} ${isDarkMode ? styles.modalHeaderDark : ''}`}>
                            <h5 className={`${styles.modalTitle} ${isDarkMode ? styles.modalTitleDark : ''}`}>
                                Edit {OrderType} #{selectedInvoice?.id}
                            </h5>
                            <button
                                className={`${styles.btnClose} ${isDarkMode ? styles.btnCloseDark : ''}`}
                                onClick={() => setShowModal(false)}></button>
                        </div>
                        <div className={`${styles.modalBody} ${isDarkMode ? styles.modalBodyDark : ''}`}>
                            <form>
                                <div className={styles.formGroup}>
                                    <label className={`${styles.formLabel} ${isDarkMode ? styles.formLabelDark : ''}`}>
                                        {ServiceType === 'sales' ? 'Customer' : 'Supplier'}
                                    </label>
                                    <input
                                        type="text"
                                        name="party"
                                        value={formData.party}
                                        onChange={handleInputChange}
                                        className={`${styles.formControl} ${isDarkMode ? styles.formControlDark : ''}`}
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={`${styles.formLabel} ${isDarkMode ? styles.formLabelDark : ''}`}>Total Amount</label>
                                    <input
                                        type="number"
                                        name="totalAmount"
                                        value={formData.totalAmount}
                                        onChange={handleInputChange}
                                        className={`${styles.formControl} ${isDarkMode ? styles.formControlDark : ''}`}
                                    />
                                </div>
                                {OrderType === "Order" && (
                                    <>
                                        <div className={styles.formGroup}>
                                            <label className={`${styles.formLabel} ${isDarkMode ? styles.formLabelDark : ''}`}>Paid Amount</label>
                                            <input
                                                type="number"
                                                name="orderAmountPaid"
                                                value={formData.paidAmount}
                                                onChange={handleInputChange}
                                                className={`${styles.formControl} ${isDarkMode ? styles.formControlDark : ''}`}
                                            />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label className={`${styles.formLabel} ${isDarkMode ? styles.formLabelDark : ''}`}>sold Amount</label>
                                            <input
                                                type="number"
                                                name="soldAmount"
                                                value={formData.soldAmount}
                                                onChange={handleInputChange}
                                                className={`${styles.formControl} ${isDarkMode ? styles.formControlDark : ''}`}
                                            />
                                        </div></>
                                )}
                                <div className={styles.formGroup}>
                                    <label className={`${styles.formLabel} ${isDarkMode ? styles.formLabelDark : ''}`}>Payment Status</label>
                                    <input
                                        type="text"
                                        name="paymentStatus"
                                        value={formData.paymentStatus}
                                        onChange={handleInputChange}
                                        className={`${styles.formControl} ${isDarkMode ? styles.formControlDark : ''}`}
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={`${styles.formLabel} ${isDarkMode ? styles.formLabelDark : ''}`}>Date</label>
                                    <input
                                        type="date"
                                        name="date"
                                        value={formData.date}
                                        onChange={handleInputChange}
                                        className={`${styles.formControl} ${isDarkMode ? styles.formControlDark : ''}`}
                                    />
                                </div>
                            </form>
                        </div>
                        <div className={`${styles.modalFooter} ${isDarkMode ? styles.modalFooterDark : ''}`}>
                            <button
                                className={`${styles.btnSecondary} ${isDarkMode ? styles.btnSecondaryDark : ''}`}
                                onClick={() => setShowModal(false)}>
                                Close
                            </button>
                            <button
                                className={`${styles.btn} ${styles.btnSuccess}`}
                                onClick={handleSave}>
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InvoiceOrOrderList;