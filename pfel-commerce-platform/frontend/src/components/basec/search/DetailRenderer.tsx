import React, { useCallback, useState } from "react"

import styles from '../../../Css/HeaderSearch.module.css';
import InvoiceOrOrderDetails from "../invoice/invoiceOrOrderDetails/InvoiceDetails";
import ProductCard from "../../product/ProductCard";
import SupplierClientCard from "../../supplierClient/SupplierClientCard";
import UserDetailsModal from "../../Scrty/UserDetailsModal";

interface DetailRendererProps {
    selectedItem: any;
    selectedType: string | null;
    isDarkMode: boolean;
    onBack: () => void;
    onClose: () => void;
    // Callback functions with proper implementations
    onEditProduct?: (product: any) => void;
    onDeleteProduct?: (productId: number) => void;
    onViewProductDetails?: (product: any) => void;
    onUpdateUser?: (user: any) => void;
    onUpdateOrderStatus: (orderId: number, status: string, serviceType: string) => Promise<void>;
}

// Interface for order status options
interface OrderStatusOption {
    value: string;
    label: string;
    color: string;
}

// Define available status options for different order types
const ORDER_STATUS_OPTIONS: Record<string, OrderStatusOption[]> = {
    sales: [
        { value: 'pending', label: 'Pending', color: '#fbbf24' },
        { value: 'confirmed', label: 'Confirmed', color: '#3b82f6' },
        { value: 'processing', label: 'Processing', color: '#8b5cf6' },
        { value: 'shipped', label: 'Shipped', color: '#10b981' },
        { value: 'delivered', label: 'Delivered', color: '#059669' },
        { value: 'cancelled', label: 'Cancelled', color: '#ef4444' }
    ],
    purchases: [
        { value: 'pending', label: 'Pending', color: '#fbbf24' },
        { value: 'approved', label: 'Approved', color: '#3b82f6' },
        { value: 'ordered', label: 'Ordered', color: '#8b5cf6' },
        { value: 'received', label: 'Received', color: '#10b981' },
        { value: 'completed', label: 'Completed', color: '#059669' },
        { value: 'cancelled', label: 'Cancelled', color: '#ef4444' }
    ]
};

const DetailRenderer: React.FC<DetailRendererProps> = ({
                                                           selectedItem,
                                                           selectedType,
                                                           isDarkMode,
                                                           onBack,
                                                           onClose,
                                                           onEditProduct,
                                                           onDeleteProduct,
                                                           onViewProductDetails,
                                                           onUpdateUser,
                                                           onUpdateOrderStatus
                                                       }) => {
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
    const [showUserModal, setShowUserModal] = useState(false);


    // Handle order status update with proper validation
    const handleUpdateOrderStatus = useCallback(async (orderId: number, newStatus: string, serviceType: string) => {
        if (!newStatus || !serviceType) {
            console.warn('Invalid status or service type provided');
            return;
        }

        setIsUpdatingStatus(true);
        try {
            await onUpdateOrderStatus(orderId, newStatus, serviceType);
            // You might want to show a success notification here
        } catch (error) {
            console.error(`Failed to update ${serviceType} order ${orderId}:`, error);
            // You might want to show an error notification here
        } finally {
            setIsUpdatingStatus(false);
        }
    }, [onUpdateOrderStatus]);

    // Handle product actions with proper callbacks
    const handleProductEdit = useCallback(() => {
        if (onEditProduct && selectedItem) {
            onEditProduct(selectedItem);
        }
    }, [onEditProduct, selectedItem]);

    const handleProductDelete = useCallback(() => {
        if (onDeleteProduct && selectedItem?.id) {
            // You might want to show a confirmation dialog here
            if (window.confirm(`Are you sure you want to delete "${selectedItem.name}"?`)) {
                onDeleteProduct(selectedItem.id);
            }
        }
    }, [onDeleteProduct, selectedItem]);

    const handleProductViewDetails = useCallback(() => {
        if (onViewProductDetails && selectedItem) {
            onViewProductDetails(selectedItem);
        }
    }, [onViewProductDetails, selectedItem]);

    // Handle user update
    const handleUserUpdate = useCallback(() => {
        if (onUpdateUser && selectedItem) {
            onUpdateUser(selectedItem);
            setShowUserModal(false);
        }
    }, [onUpdateUser, selectedItem]);

    // Create status update component for orders
    const StatusUpdateComponent: React.FC<{ serviceType: string; currentStatus?: string }> = ({
                                                                                                  serviceType,
                                                                                                  currentStatus = 'pending'
                                                                                              }) => {
        const statusOptions = ORDER_STATUS_OPTIONS[serviceType] || ORDER_STATUS_OPTIONS.sales;

        return (
            <div className={styles.statusUpdateSection}>
                <h4>Update Order Status</h4>
                <div className={styles.statusButtons}>
                    {statusOptions.map((status) => (
                        <button
                            key={status.value}
                            className={`${styles.statusButton} ${currentStatus === status.value ? styles.currentStatus : ''}`}
                            style={{ backgroundColor: status.color }}
                            onClick={() => handleUpdateOrderStatus(selectedItem.id, status.value, serviceType)}
                            disabled={isUpdatingStatus || currentStatus === status.value}
                            type="button"
                        >
                            {status.label}
                            {isUpdatingStatus && currentStatus !== status.value && '...'}
                        </button>
                    ))}
                </div>
                <p className={styles.currentStatusText}>
                    Current Status: <span style={{ color: statusOptions.find(s => s.value === currentStatus)?.color }}>
            {statusOptions.find(s => s.value === currentStatus)?.label || 'Unknown'}
          </span>
                </p>
            </div>
        );
    };

    if (!selectedItem || !selectedType) {
        return (
            <div className={styles.noSelection}>
                <p>No item selected</p>
            </div>
        );
    }

    // Render different components based on type
    const renderContent = () => {
        switch (selectedType) {
            case 'products':
                return (
                    <ProductCard
                        product={selectedItem}
                        isModalView={true}
                        onViewDetails={handleProductViewDetails}
                        onEdit={onEditProduct ? handleProductEdit : undefined}
                        onDelete={onDeleteProduct ? handleProductDelete : undefined}
                    />
                );

            case 'supplierClients':
                return <SupplierClientCard partner={selectedItem} />;

            case 'salesInvoice':
                return (
                    <InvoiceOrOrderDetails
                        invoiceOrOrder={selectedItem}
                        ServiceType="sales"
                        OrderType="Invoice"
                        onClose={onBack}
                        onUpdateOrderStatus={() => {}} // Invoices typically don't have status updates
                        isEmbedded={true}
                    />
                );

            case 'purchasesInvoice':
                return (
                    <InvoiceOrOrderDetails
                        invoiceOrOrder={selectedItem}
                        ServiceType="purchases"
                        OrderType="Invoice"
                        onClose={onBack}
                        onUpdateOrderStatus={() => {}} // Invoices typically don't have status updates
                        isEmbedded={true}
                    />
                );
            case 'salesOrder':
                return (
                    <div className={`${styles['inline-user-container']} ${isDarkMode ? styles.dark : ''}`}>
                        <InvoiceOrOrderDetails
                            invoiceOrOrder={selectedItem}
                            ServiceType="sales"
                            OrderType="Invoice"
                            onClose={onBack}
                            onUpdateOrderStatus={() => {}} // Invoices typically don't have status updates
                            isEmbedded={true}
                        />
                    </div>
                );

            case 'purchasesOrder':
                return (
                    <div className={styles.orderDetails}>
                        <InvoiceOrOrderDetails
                            invoiceOrOrder={selectedItem}
                            ServiceType="purchases"
                            OrderType="Order"
                            onClose={onBack}
                            onUpdateOrderStatus={() => {}} // We handle status updates separately
                            isEmbedded={true}
                        />
                    </div>
                );
            case 'UsersToRoles':
                return (
                    <UserDetailsModal
                        user={selectedItem}
                        isDarkMode={isDarkMode}
                        isModalView={true}
                        onClose={() => setShowUserModal(false)}
                        onUpdate={handleUserUpdate}                    />
                );
            case 'salesLines':
            case 'purchasesLines':
                return (
                    <div className={styles.lineDetails}>
                        <h4>Document Line Details</h4>
                        <div className={styles.detailsGrid}>
                            <div className={styles.detailItem}>
                                <label>Line ID:</label>
                                <span>#{selectedItem.id}</span>
                            </div>
                            <div className={styles.detailItem}>
                                <label>Product:</label>
                                <span>{selectedItem.productName || 'Unknown Product'}</span>
                            </div>
                            <div className={styles.detailItem}>
                                <label>Quantity:</label>
                                <span>{selectedItem.quantity || 0}</span>
                            </div>
                            <div className={styles.detailItem}>
                                <label>Unit Price:</label>
                                <span>${(selectedItem.price || 0).toFixed(2)}</span>
                            </div>
                            <div className={styles.detailItem}>
                                <label>Total:</label>
                                <span>${((selectedItem.quantity || 0) * (selectedItem.price || 0)).toFixed(2)}</span>
                            </div>
                            {selectedItem.discount && (
                                <div className={styles.detailItem}>
                                    <label>Discount:</label>
                                    <span>{selectedItem.discount}%</span>
                                </div>
                            )}
                            {selectedItem.description && (
                                <div className={styles.detailItem}>
                                    <label>Description:</label>
                                    <span>{selectedItem.description}</span>
                                </div>
                            )}
                        </div>
                    </div>
                );
// Continuation of the DetailRenderer component from where it was cut off

            case 'salesLineReturns':
            case 'purchasesLineReturns':
                return (
                    <div className={styles.returnDetails}>
                        <h4>Return Line Details</h4>
                        <div className={styles.detailsGrid}>
                            <div className={styles.detailItem}>
                                <label>Return ID:</label>
                                <span>#{selectedItem.id}</span>
                            </div>
                            <div className={styles.detailItem}>
                                <label>Original Quantity:</label>
                                <span>{selectedItem.originalQuantity || 0}</span>
                            </div>
                            <div className={styles.detailItem}>
                                <label>Returned Quantity:</label>
                                <span>{selectedItem.returnedQuantity || 0}</span>
                            </div>
                            <div className={styles.detailItem}>
                                <label>Return Reason:</label>
                                <span>{selectedItem.returnReason || 'No reason provided'}</span>
                            </div>
                            {selectedItem.returnDate && (
                                <div className={styles.detailItem}>
                                    <label>Return Date:</label>
                                    <span>{new Date(selectedItem.returnDate).toLocaleString()}</span>
                                </div>
                            )}
                            {selectedItem.refundAmount && (
                                <div className={styles.detailItem}>
                                    <label>Refund Amount:</label>
                                    <span>${selectedItem.refundAmount.toFixed(2)}</span>
                                </div>
                            )}
                            {selectedItem.status && (
                                <div className={styles.detailItem}>
                                    <label>Return Status:</label>
                                    <span className={`${styles.statusBadge} ${styles[selectedItem.status.toLowerCase()]}`}>
                    {selectedItem.status}
                  </span>
                                </div>
                            )}
                            {selectedItem.approvedBy && (
                                <div className={styles.detailItem}>
                                    <label>Approved By:</label>
                                    <span>{selectedItem.approvedBy}</span>
                                </div>
                            )}
                            {selectedItem.notes && (
                                <div className={styles.detailItem}>
                                    <label>Notes:</label>
                                    <span>{selectedItem.notes}</span>
                                </div>
                            )}
                        </div>
                    </div>
                );

            default:
                return (
                    <div className={styles.genericDetails}>
                        <h4>Item Details</h4>
                        <div className={styles.detailsGrid}>
                            {Object.entries(selectedItem).map(([key, value]) => (
                                <div key={key} className={styles.detailItem}>
                                    <label>{key.charAt(0).toUpperCase() + key.slice(1)}:</label>
                                    <span>{typeof value === 'object' && value !== null
                                        ? JSON.stringify(value)
                                        : String(value || 'N/A')
                                    }</span>
                                </div>
                            ))}
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className={`${styles.detailRenderer} ${isDarkMode ? styles.dark : ''}`}>
            {renderContent()}
        </div>
    );
};

// Helper function to get detail title (used in SearchResultsModal)
export const getDetailTitle = (selectedItem: any, selectedType: string): string => {
    if (!selectedItem || !selectedType) return 'Item Details';

    switch (selectedType) {
        case 'products':
            return `Product: ${selectedItem.name || 'Unnamed Product'}`;
        case 'supplierClients':
            return `Partner: ${selectedItem.name || 'Unnamed Partner'}`;
        case 'UsersToRoles':
            return `User: ${selectedItem.fullName || selectedItem.email || 'Unknown User'}`;
        case 'salesInvoice':
            return `Sales Invoice #${selectedItem.id}`;
        case 'purchasesInvoice':
            return `Purchase Invoice #${selectedItem.id}`;
        case 'salesOrder':
            return `Sales Order #${selectedItem.id}`;
        case 'purchasesOrder':
            return `Purchase Order #${selectedItem.id}`;
        case 'salesLines':
            return `Sales Line #${selectedItem.id}`;
        case 'purchasesLines':
            return `Purchase Line #${selectedItem.id}`;
        case 'salesLineReturns':
            return `Sales Return #${selectedItem.id}`;
        case 'purchasesLineReturns':
            return `Purchase Return #${selectedItem.id}`;
        default:
            return `Item #${selectedItem.id || 'Unknown'}`;
    }
};

export default DetailRenderer;