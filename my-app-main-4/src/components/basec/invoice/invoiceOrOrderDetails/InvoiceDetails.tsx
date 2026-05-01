// InvoiceDetails.tsx (Enhanced UI/UX Version)

import React, { useMemo, useState, useEffect } from 'react';
import { FaTimes, FaChevronDown, FaInfoCircle } from 'react-icons/fa';
import styles from '../../../../Css/invoiceOrOrder/InvoiceDetails.module.css';
import type { IconType } from "react-icons";
import { Invoice } from "../../../../classe/Invoice";
import { Order } from "../../../../classe/Order";
import { useDarkMode } from "../../../DarkModeProvider";
import { OrderType, ServiceType } from "../../../../api/OrderInvoiceService";

// Import the new components
import LineItemsSection from './LineItemsSection';
import PaymentSection from './PaymentSection';
import ReturnItemsSection from './ReturnItemsSection';
import { getUserName } from "../../../../axiosBasec/storagByUser";
import { getProductNameById } from "../../../../api/product/productService";
import { getSupplierClientNameById } from "../../../../api/supplierClientService";
import { useTranslation } from "react-i18next";

// Mock services for demo - replace with actual API calls
const getUserInfo = async (userId: string) => {
    const username = await getUserName(userId);
    return { fullName: `User ${username}`, email: `${username}@gmail.com` }; // email added for tooltip;
};

const getEntityName = async (entityId: string): Promise<string> => {
    return await getSupplierClientNameById(entityId);
};

export const getProductName = async (productId: string | number) => {
    return await getProductNameById(productId);
};

// Props Interfaces
interface InvoiceOrOrderDetailsProps {
    invoiceOrOrder: Invoice | Order | null;
    ServiceType: ServiceType;
    OrderType: OrderType;
    onClose: () => void;
    onUpdateOrderStatus: (orderId: number, status: string) => void;
    isEmbedded?: boolean;
}

interface IconProps {
    as: IconType;
    className?: string;
    size?: number;
}

interface UserInfoTooltipProps {
    userId: string;
    label: string;
}

// Helper Components and Functions
const Icon: React.FC<IconProps> = ({ as, ...props }) => {
    const IconComponent = as as React.ElementType;
    return <IconComponent {...props} />;
};

const UserInfoTooltip: React.FC<UserInfoTooltipProps> = ({ userId, label }) => {
    // @ts-ignore
    const { isDarkMode } = useDarkMode();
    const [userInfo, setUserInfo] = useState<{ fullName: string; email: string } | null>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isVisible && !userInfo) {
            getUserInfo(userId).then(setUserInfo);
        }
    }, [isVisible, userId, userInfo]);

    return (
        <div className={styles.userInfoContainer}>
            <span className={styles.userIdText}>{label}: {userId}</span>
            <div
                className={styles.infoIconContainer}
                onMouseEnter={() => setIsVisible(true)}
                onMouseLeave={() => setIsVisible(false)}
            >
                <Icon as={FaInfoCircle} className={styles.infoIcon} size={14} />
                {isVisible && (
                    <div className={`${styles.tooltip} ${isDarkMode ? styles.tooltipDark : styles.tooltipLight}`}>
                        {userInfo ? (
                            <>
                                <div className={styles.tooltipName}>{userInfo.fullName}</div>
                                <div className={styles.tooltipEmail}>{userInfo.email}</div>
                            </>
                        ) : (
                            <div className={styles.tooltipLoading}>Loading...</div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

const EntityDisplay: React.FC<{ entityId: string; serviceType: ServiceType }> = ({ entityId, serviceType }) => {
    const [entityName, setEntityName] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        getEntityName(entityId)
            .then((name: string) => {
                setEntityName(name);
                setIsLoading(false);
            })
            .catch(() => {
                setEntityName(entityId);
                setIsLoading(false);
            });
    }, [entityId, serviceType]);

    if (isLoading) {
        return <span className={styles.loadingText}>Loading...</span>;
    }

    return (
        <span className={styles.entityDisplay}>
            {entityName} <span className={styles.entityId}>(#{entityId})</span>
        </span>
    );
};

const getSafeInfo = (invoiceOrOrder: Invoice | Order | null, OrderType: OrderType) => {
    if (!invoiceOrOrder) return { orderInfo: null, deliveryInfo: null };
    const isOrderType = (obj: any): obj is Order => OrderType === 'Order' && 'orderStatus' in obj;
    if (isOrderType(invoiceOrOrder)) {
        return { orderInfo: invoiceOrOrder, deliveryInfo: invoiceOrOrder.delivery };
    }
    if ('order' in invoiceOrOrder && invoiceOrOrder.order) {
        return { orderInfo: invoiceOrOrder.order, deliveryInfo: invoiceOrOrder.order.delivery };
    }
    return { orderInfo: null, deliveryInfo: null };
};

const AccordionItem = ({ id, title, activeId, toggle, children }: any) => {
    // @ts-ignore
    const { isDarkMode } = useDarkMode();
    const isOpen = activeId === id;
    const itemClasses = `${styles.accordionItem} ${isOpen ? styles.open : ''} ${isDarkMode ? styles.dark : ''}`;

    return (
        <div className={itemClasses}>
            <div className={styles.accordionHeader} onClick={() => toggle(id)}>
                <h5 className={styles.accordionTitle}>{title}</h5>
                <Icon as={FaChevronDown} className={styles.accordionToggleIcon} />
            </div>
            <div className={styles.accordionContent}>
                <div className={styles.accordionContentInner}>
                    {children}
                </div>
            </div>
        </div>
    );
};

// Main Enhanced Component
const InvoiceOrOrderDetails: React.FC<InvoiceOrOrderDetailsProps> = ({
    invoiceOrOrder,
    ServiceType,
    OrderType,
    onClose,
    onUpdateOrderStatus,
    isEmbedded = false
}) => {
    // @ts-ignore
    const { isDarkMode } = useDarkMode();
    const { t: translate } = useTranslation(); // Renomme 't' en 'translate'

    const [activeAccordion, setActiveAccordion] = useState<string | null>('info');

    const { orderInfo, deliveryInfo } = useMemo(() => getSafeInfo(invoiceOrOrder, OrderType), [invoiceOrOrder, OrderType]);

    const toggleAccordion = (id: string) => {
        setActiveAccordion(activeAccordion === id ? null : id);
    };

    const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        if (invoiceOrOrder) {
            onUpdateOrderStatus(invoiceOrOrder.id, e.target.value);
        }
    };

    const containerClasses = `${styles.modalContainer} ${isDarkMode ? styles.dark : ''}`;

    if (!invoiceOrOrder) {
        return null;
    }

    const showPaymentSection = invoiceOrOrder.paymentStatus === 'PARTPAID' || invoiceOrOrder.paymentStatus === 'UNPAID';

    const content = (
        <div className={containerClasses} onClick={(e) => e.stopPropagation()}>
            <header className={styles.modalHeader}>
                <h2 className={styles.modalTitle}
                    data-no-translate={true}
                >
                    {translate("order_invoice.details_for_order_type_id", {
                        orderType: OrderType,
                        id: invoiceOrOrder.id
                    })}
                </h2>
                <button onClick={onClose} className={styles.closeButton}>
                    <Icon as={FaTimes} size={20} />
                </button>
            </header>

            <main className={styles.modalBody}>
                <AccordionItem title="General Information" id="info" activeId={activeAccordion} toggle={toggleAccordion}>
                    <div className={styles.infoGrid}>
                        <div className={styles.infoItem}>
                            <strong className={styles.label}>
                                {ServiceType === 'sales' ? translate("order_invoice.customer") + ':' : translate("order_invoice.supplier") + ':'}
                            </strong>
                            <EntityDisplay
                                entityId={String(invoiceOrOrder.customer || invoiceOrOrder.supplier)}
                                serviceType={ServiceType}
                            />
                        </div>

                        <div className={styles.infoItem}>
                            <strong className={styles.label}>{translate("total_amount")}:</strong>
                            <span className={styles.amountValue}>${invoiceOrOrder.totalAmount?.toFixed(2)}</span>
                        </div>

                        <div className={styles.infoItem}>
                            <strong className={styles.label}>{translate("payment_status")}:</strong>
                            <span className={`${styles.statusBadge} ${styles[invoiceOrOrder.paymentStatus?.toLowerCase() || 'default']}`}>
                                {translate(`order_invoice.${invoiceOrOrder.paymentStatus?.toLowerCase() || 'unpaid'}`, invoiceOrOrder.paymentStatus || 'UNPAID')}
                            </span>
                        </div>

                        <div className={styles.infoItem}>
                            <strong className={styles.label}>{translate("label_date")}:</strong>
                            <span className={styles.text}>
                                {new Date(invoiceOrOrder.date).toLocaleDateString()}
                            </span>
                        </div>

                        {/* Enhanced User Info Display */}
                        {invoiceOrOrder.userCreator && (
                            <div className={styles.infoItem}>
                                <UserInfoTooltip
                                    userId={String(invoiceOrOrder.userCreator)}
                                    label="Creator"
                                />
                            </div>
                        )}

                        {invoiceOrOrder.userExecutor && (
                            <div className={styles.infoItem}>
                                <UserInfoTooltip
                                    userId={String(invoiceOrOrder.userExecutor)}
                                    label="Executor"
                                />
                            </div>
                        )}
                    </div>
                </AccordionItem>

                {showPaymentSection && (
                    <AccordionItem title="Payment History" id="payment" activeId={activeAccordion} toggle={toggleAccordion}>
                        <PaymentSection invoiceOrOrder={invoiceOrOrder} ServiceType={ServiceType} OrderType={OrderType} />
                    </AccordionItem>
                )}

                {(orderInfo || deliveryInfo) && (
                    <AccordionItem
                        title={translate('order_invoice.order_and_delivery', 'Order & Delivery Information')}
                        id="order" activeId={activeAccordion} toggle={toggleAccordion}>
                        {orderInfo && (
                            <div className={styles.orderSection}>
                                <h5 className={styles.sectionTitle}>
                                    Order Details
                                </h5>
                                <div className={styles.infoGrid}>
                                    <div className={styles.infoItem}>
                                        <strong className={styles.label}>{translate('order_invoice.sold_amount', 'Sold Amount')}:</strong>
                                        <span className={styles.amountValue}>${orderInfo.soldAmount?.toFixed(2)}</span>
                                    </div>
                                    <div className={styles.infoItem}>
                                        <strong className={styles.label}>
                                            {translate('order_invoice.current_status', 'Current Status')}:
                                        </strong>
                                        <span className={`${styles.statusBadge} ${styles[orderInfo.orderStatus?.toLowerCase() || 'default']}`}>
                                            {translate(`order_invoice.${orderInfo.orderStatus?.toLowerCase()}`, orderInfo.orderStatus)}
                                        </span>
                                    </div>
                                </div>

                                {OrderType === 'Order' && (
                                    <div className={styles.statusChangeSection}>
                                        <label htmlFor="order-status-select" className={styles.selectLabel}>
                                            <strong>{translate('order_invoice.change_order_status', 'Change Order Status')}:</strong>
                                        </label>
                                        <select
                                            id="order-status-select"
                                            className={styles.statusSelect}
                                            value={orderInfo.orderStatus}
                                            onChange={handleStatusChange}
                                        >
                                            <option value="PENDING">Pending</option>
                                            <option value="CONFIRMED">Confirmed</option>
                                            <option value="SHIPPED">Shipped</option>
                                            <option value="CANCELED">Canceled</option>
                                        </select>
                                    </div>
                                )}
                            </div>
                        )}

                        {deliveryInfo && (
                            <div className={styles.deliverySection}>
                                <h5 className={styles.sectionTitle}>
                                    Delivery Details
                                </h5>
                                <div className={styles.infoGrid}>
                                    <div className={styles.infoItem}>
                                        <strong className={styles.label}>
                                            {translate('order_invoice.location', 'Location')}:
                                        </strong>
                                        <span className={styles.text}>
                                            {deliveryInfo.location}
                                        </span>
                                    </div>
                                    <div className={styles.infoItem}>
                                        <strong className={styles.label}>
                                            {translate('order_invoice.date', 'Date')}:
                                        </strong>
                                        <span className={styles.text}>
                                            {new Date(deliveryInfo.deliveryDate).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </AccordionItem>
                )}

                <AccordionItem title="Items" id="items" activeId={activeAccordion} toggle={toggleAccordion}>
                    <LineItemsSection parentId={invoiceOrOrder.id} ServiceType={ServiceType} OrderType={OrderType} />
                </AccordionItem>

                <AccordionItem title="Returned Items" id="returns" activeId={activeAccordion} toggle={toggleAccordion}>
                    <ReturnItemsSection parentId={invoiceOrOrder.id} ServiceType={ServiceType} OrderType={OrderType} />
                </AccordionItem>
            </main>
        </div>
    );

    if (isEmbedded) {
        return content;
    }

    return (
        <div className={`${styles.modalOverlay} ${isDarkMode ? styles.darkOverlay : ''}`} onClick={onClose}>
            {content}
        </div>
    );
};

export default InvoiceOrOrderDetails;