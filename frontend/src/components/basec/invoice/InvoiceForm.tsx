import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { getSupplerClients } from "../../../api/supplierClientService";
import { getAllProducts } from "../../../api/product/productService";
import { useDarkMode } from "../../DarkModeProvider"; // Assuming type export
import { createOrderOrInvoice } from "../../../api/OrderInvoiceService";
import { addOrUpdatePayment } from "../../../api/payment/paymentService";
import { Delivery } from "../../../classe/Delivery";
import { Product as ProductClass, ExpiredProduct } from "../../../classe/Product";
import DeliveryForm from "./DeliveryForm";
import SupplarClientForm from "../../supplierClient/SupplierClientForm";
import ProductForm from "../../product/ProductForme";
import ExpiredProductForm from "./ExpiredProduct/ExpiredProductForm";
import styles from "../../../Css/invoiceOrOrder/InvoiceForm.module.css";
import expiredProductService from "../../../api/product/expiredProductService";
import Modal from "../Modal";
import PaymentDetailsModal from './PaymentDetailsForm';
import {DataPaidDate} from "../../../classe/DataPaidDate"
import { Payment } from "../../../classe/Payment"; // Assuming type export
import dataPaidDateService from "../../../api/payment/dataPaidDateService";
import { withGlobalAutoTranslate } from '../../GlobalAutoTranslate';

// Interfaces
interface Customer {
    id: number | string;
    name: string;
    email?: string;
    phone?: string;
}

interface Product extends ProductClass {}

interface LineItem {
    id: string;
    productSearch: string;
    selectedProduct: Product | null;
    quantity: number | string;
    price: number | string;
    quantityError: string;
}

interface InvoiceFormProps {
    serviceType: "sales" | "purchases" | string;
    orderType: "Invoice" | "Order" | string;
}

interface Categories {
    [key: string]: string[]
}

// Type Aliases for clarity
type PaymentMethod = "CASH" | "CARD" | "BANK_TRANSFER" | "PAYPAL" | "CHECK" | "OTHER";
type PaymentStatus = 'PAID' | 'PARTPAID' | 'UNPAID';
type BackendPaymentMethod = "CASH_PAYMENT" | "CREDIT_CARD_PAYMENT" | "BANK_TRANSFER" | "POST_PAID" | "PAYPAL_PAYMENT";
type PaymentScheduleStatus = "PAID" | "SCHEDULED" | "FAILED" | "OVERDUE";


// Constants
const PAYMENT_METHODS: { value: PaymentMethod, label: string }[] = [
    { value: 'CASH', label: 'Cash' },
    { value: 'CARD', label: 'Credit Card' },
    { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
    { value: 'PAYPAL', label: 'PayPal' },
    { value: 'CHECK', label: 'Post Paid/Check' },
    { value: 'OTHER', label: 'Other' }
];

const PAYMENT_STATUS_OPTIONS: readonly PaymentStatus[] = ['PAID', 'PARTPAID', 'UNPAID'];

const InvoiceForm: React.FC<InvoiceFormProps> = ({ serviceType, orderType }) => {
    // Correctly type the context hook
    // @ts-ignore
    const { isDarkMode } = useDarkMode();

    // State management
    const [lineItems, setLineItems] = useState<LineItem[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('PAID');
    const [selectedCustomer, setSelectedCustomer] = useState<string>('');
    const [customerSearch, setCustomerSearch] = useState<string>('');
    const [amountPaid, setAmountPaid] = useState<number | string>('');
    const [amountSold, setAmountSold] = useState<number | string>('');
    const [delivery, setDelivery] = useState<Partial<Delivery> | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');

    // UI State
    const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
    const [activeCustomerSuggestionIndex, setActiveCustomerSuggestionIndex] = useState(-1);
    const [categories, setCategories] = useState<Categories>({});
    const [activeCategory, setActiveCategory] = useState<string | null>('All');
    const [selectedFilter, setSelectedFilter] = useState<{ cat: string | null, sub: string | null }>({ cat: 'All', sub: null });

    // Modal State
    const [showDeliveryModal, setShowDeliveryModal] = useState(false);
    const [showProductModal, setShowProductModal] = useState(false);
    const [showCustomerModal, setShowCustomerModal] = useState(false);
    const [showExpiredProductModal, setShowExpiredProductModal] = useState(false);
    const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);

    // Payment State
    const [pendingInvoiceData, setPendingInvoiceData] = useState<any>(null);
    const [paymentDetails, setPaymentDetails] = useState<Partial<Payment>>({
        dueDate: undefined,
        paidDates: []
    });

    // Memoized calculations
    const totalAmount = useMemo(() =>
        lineItems.reduce((total, item) =>
            total + ((parseFloat(String(item.price)) || 0) * (parseFloat(String(item.quantity)) || 0)), 0
        ), [lineItems]);

    // Utility functions
    const createNewLineItem = useCallback((): LineItem => ({
        id: `line-${Date.now()}-${Math.random()}`,
        productSearch: '',
        selectedProduct: null,
        quantity: 1,
        price: '',
        quantityError: ''
    }), []);

    const resetForm = useCallback(() => {
        setLineItems([createNewLineItem()]);
        setSelectedCustomer('');
        setCustomerSearch('');
        setDelivery(null);
        setPaymentStatus('PAID');
        setAmountSold('');
        setAmountPaid('');
        setPaymentMethod('CASH');
        setPaymentDetails({ dueDate: undefined, paidDates: [] });
    }, [createNewLineItem]);

    const fetchData = useCallback(async () => {
        try {
            const [customersData, productsData] = await Promise.all([
                getSupplerClients(),
                getAllProducts()
            ]);
            setCustomers(customersData);
            setAllProducts(productsData);
            setFilteredProducts(productsData);
        } catch (error) {
            console.error('Failed to fetch initial data:', error);
        }
    }, []);

    // Payment utility functions
    const mapPaymentMethodToBackend = useCallback((method: PaymentMethod): BackendPaymentMethod => {
        const methodMap: { [key in PaymentMethod]: BackendPaymentMethod } = {
            'CASH': 'CASH_PAYMENT',
            'CARD': 'CREDIT_CARD_PAYMENT',
            'BANK_TRANSFER': 'BANK_TRANSFER',
            'CHECK': 'POST_PAID',
            'PAYPAL': 'PAYPAL_PAYMENT',
            'OTHER': 'PAYPAL_PAYMENT' // Default 'OTHER' to something
        };
        return methodMap[method] || 'CASH_PAYMENT';
    }, []);

    const validatePaymentData = useCallback((orderId: number, currentTotalAmount: number): boolean => {
        if (!orderId || orderId <= 0) {
            console.error('Invalid order ID');
            return false;
        }

        if (currentTotalAmount < 0) {
            console.error('Invalid total amount');
            return false;
        }

        if (!PAYMENT_STATUS_OPTIONS.includes(paymentStatus)) {
            console.error('Invalid payment status');
            return false;
        }

        if (paymentStatus === 'PARTPAID') {
            const numericAmountPaid = parseFloat(String(amountPaid));
            if (isNaN(numericAmountPaid) || numericAmountPaid <= 0 || numericAmountPaid >= currentTotalAmount) {
                console.error('Invalid amount paid for partial payment. It must be greater than 0 and less than the total.');
                return false;
            }
        }
        return true;
    }, [selectedCustomer, paymentStatus, amountPaid]);


    const preparePaymentDataForBackend = useCallback(() => {
        const paymentData: any = {};

        if (orderType === 'Invoice' && paymentDetails.dueDate) {
            paymentData.dueDate = paymentDetails.dueDate;
        }

        if (paymentDetails.paidDates && paymentDetails.paidDates.length > 0) {
            const validPaidDates = paymentDetails.paidDates
                .filter(pd => pd.date && pd.amountPaid && pd.methodePayment && pd.paymentScheduleStatus)
                .map(pd => {
                    // Fix for type comparison error
                    const status = (pd.paymentScheduleStatus as string);
                    let finalStatus: PaymentScheduleStatus = 'PAID';
                    if (status === 'OVERDUE') finalStatus = 'OVERDUE';
                    else if (['PARTIAL', 'PENDING', 'SCHEDULED'].includes(status)) finalStatus = 'SCHEDULED';

                    return {
                        ...pd,
                        paymentScheduleStatus: finalStatus,
                        methodePayment: mapPaymentMethodToBackend(pd.methodePayment as PaymentMethod)
                    };
                });

            if (validPaidDates.length > 0) {
                paymentData.paidDates = validPaidDates;
            }
        }
        return paymentData;
    }, [orderType, paymentDetails, mapPaymentMethodToBackend]);


    const savePaymentData = useCallback(async (orderId: number, currentTotalAmount: number) => {
        if (orderType === 'Order') {
            console.log('Skipping payment data save because orderType is "Order".');
            return;
        }
        try {
            if (!validatePaymentData(orderId, currentTotalAmount)) {
                console.warn('Payment data validation failed, skipping payment save');
                return;
            }

            let paymentAmount = 0;
            let paymentScheduleStatus: PaymentScheduleStatus = 'PAID';

            if (paymentStatus === 'PAID') {
                paymentAmount = currentTotalAmount;
                paymentScheduleStatus = 'PAID';
            } else if (paymentStatus === 'PARTPAID') {
                paymentAmount = parseFloat(String(amountPaid)) || 0;
                paymentScheduleStatus = 'SCHEDULED';
            } else if (paymentStatus === 'UNPAID') {
                paymentAmount = 0;
                paymentScheduleStatus = 'SCHEDULED';
            }

            const shouldSavePayment = paymentAmount > 0 || paymentStatus !== 'PAID' || paymentDetails.dueDate || (paymentDetails.paidDates && paymentDetails.paidDates.length > 0);

            if (!shouldSavePayment) {
                console.log('No meaningful payment data to save.');
                return;
            }

            const supplierClientId = parseInt(selectedCustomer, 10);
            if (isNaN(supplierClientId)) {
                throw new Error('Supplier/Client ID is required for payment data');
            }

            const api = await addOrUpdatePayment(
                serviceType,
                orderId,
                paymentAmount,
                paymentStatus,
                paymentScheduleStatus,
                mapPaymentMethodToBackend(paymentMethod),
                currentTotalAmount,
                supplierClientId,
                paymentDetails.dueDate
            );

            if (api?.id && paymentDetails.paidDates && paymentDetails.paidDates.length > 0) {
                for (const paidDate of paymentDetails.paidDates) {
                    try {
                        const status = (paidDate.paymentScheduleStatus as string);
                        let finalStatus: PaymentScheduleStatus = 'PAID';
                        if (status === 'OVERDUE') finalStatus = 'OVERDUE';
                        else if (['PARTIAL', 'PENDING', 'SCHEDULED'].includes(status)) finalStatus = 'SCHEDULED';

                        // Ensure the object shape matches DataPaidDate
                        const paidDateToSave: Omit<DataPaidDate, 'id'> = {
                            date: paidDate.date!,
                            amountPaid: paidDate.amountPaid!,
                            methodePayment: mapPaymentMethodToBackend(paidDate.methodePayment as PaymentMethod),
                            paymentScheduleStatus: finalStatus,
                            paymentId: api.id,
                            // Add missing required fields if any, assuming they exist on paidDate or have defaults
                            status: paidDate.status || "DANS",
                            userCreator: paidDate.userCreator || 0,
                            userExecutor: paidDate.userExecutor || 0,
                        };

                        await dataPaidDateService.save(0, paidDateToSave as DataPaidDate, "create");

                    } catch (dateError) {
                        console.error('Error saving paid date:', dateError);
                    }
                }
            }

            console.log('Payment data saved successfully');
        } catch (error) {
            console.error('Error saving payment data:', error);
            throw new Error(`Failed to save payment data: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }, [validatePaymentData, paymentStatus, amountPaid, paymentDetails, selectedCustomer, serviceType, mapPaymentMethodToBackend, paymentMethod, orderType]);


    // Event handlers
    const handleAddLineItem = useCallback(() => {
        setLineItems(prev => [...prev, createNewLineItem()]);
    }, [createNewLineItem]);

    const handleRemoveLineItem = useCallback((id: string) => {
        if (lineItems.length > 1) {
            setLineItems(prev => prev.filter(item => item.id !== id));
        }
    }, [lineItems.length]);

    const handleLineItemChange = useCallback((id: string, field: keyof LineItem, value: any) => {
        setLineItems(prevItems => prevItems.map(item => {
            if (item.id === id) {
                const updatedItem = { ...item, [field]: value };
                if (field === 'quantity' && item.selectedProduct && serviceType === 'sales') {
                    const numericQuantity = parseFloat(String(value));
                    updatedItem.quantityError = numericQuantity > item.selectedProduct.quantity ?
                        `Stock has ${item.selectedProduct.quantity}` : '';
                }
                if (field === 'productSearch') {
                    updatedItem.selectedProduct = null;
                }
                return updatedItem;
            }
            return item;
        }));
    }, [serviceType]);

    const handleSelectProduct = useCallback((lineId: string, product: Product) => {
        setLineItems(prevItems => prevItems.map(item => {
            if (item.id === lineId) {
                // Fix: Check for priceInit on purchases
                const price = serviceType === 'sales' ? product.price : (product.priceInit || 0);
                const quantityError = serviceType === 'sales' && 1 > product.quantity ? `Stock has ${product.quantity}` : '';
                return {
                    ...item,
                    productSearch: product.name,
                    selectedProduct: product,
                    price: price,
                    quantity: 1,
                    quantityError,
                };
            }
            return item;
        }));
        setActiveSuggestionIndex(-1);
    }, [serviceType]);

    const handleSelectCustomer = useCallback((customer: Customer) => {
        setSelectedCustomer(String(customer.id));
        setCustomerSearch(customer.name);
        setActiveCustomerSuggestionIndex(-1);
    }, []);

    const handleCategoryClick = useCallback((category: string) => {
        setActiveCategory(prev => (prev === category ? 'All' : category));
        setSelectedFilter({ cat: category, sub: null });
    }, []);

    const handleSubCategoryClick = useCallback((e: React.MouseEvent, category: string, subCategory: string) => {
        e.stopPropagation();
        setSelectedFilter({ cat: category, sub: subCategory });
    }, []);

    const handleSavePaymentDetails = useCallback((details: Partial<Payment>) => {
        const hasValidData = details.dueDate || (details.paidDates && details.paidDates.length > 0);
        setPaymentDetails(hasValidData ? details : { dueDate: undefined, paidDates: [] });
        setPaymentModalOpen(false);
    }, []);


    const handleExpiredProductsSave = useCallback(async (expiredProducts: ExpiredProduct[]) => {
        try {
            if (!pendingInvoiceData) return;

            const response = await createOrderOrInvoice(pendingInvoiceData, serviceType, orderType);
            if (!response?.id) throw new Error("Failed to create the order/invoice.");

            if (expiredProducts.length > 0) {
                await Promise.all(expiredProducts.map(expProduct => {
                    const transformedProduct = {
                        ...expProduct,
                        productId: typeof expProduct.product === 'number' ? expProduct.product : expProduct.product?.id || expProduct.productId,
                        purchaseId: response.id
                    };
                    delete (transformedProduct as any).product;
                    return expiredProductService.create(transformedProduct);
                }));
            }

            await savePaymentData(response.id, totalAmount);

            alert(`${orderType} created successfully!`);
            resetForm();
        } catch (error) {
            console.error(`Error creating ${orderType}:`, error);
            alert(`Failed to create ${orderType}.`);
        } finally {
            setShowExpiredProductModal(false);
            setPendingInvoiceData(null);
        }
    }, [pendingInvoiceData, serviceType, orderType, savePaymentData, resetForm, totalAmount]);


    const handleSubmit = useCallback(async (event: React.FormEvent) => {
        event.preventDefault();

        const apiReadyLines = lineItems
            .filter(item => item.selectedProduct && parseFloat(String(item.quantity)) > 0)
            .map(item => ({
                productId: item.selectedProduct!.id,
                quantity: parseFloat(String(item.quantity)) || 0,
                price: parseFloat(String(item.price)) || 0,
            }));

        if (apiReadyLines.length === 0) {
            alert("Please add at least one valid product with a quantity greater than 0.");
            return;
        }

        const payload: any = {
            paymentStatus,
            returns: []
        };

        if (serviceType === "sales") {
            payload.customer = parseInt(selectedCustomer, 10);
        } else {
            payload.supplier = parseInt(selectedCustomer, 10);
        }

        const linesKey = serviceType === "sales" ? 'salesLines' : 'purchaseLines';
        payload[linesKey] = apiReadyLines;

        if (orderType === 'Order') {
            if (delivery) payload.delivery = delivery;
            if (amountSold) payload.soldAmount = parseFloat(String(amountSold));
        }

        if (orderType === 'Invoice') {
            const paymentData = preparePaymentDataForBackend();
            if (paymentData.dueDate) payload.dueDate = paymentData.dueDate;
            if (paymentData.paidDates) payload.paidDates = paymentData.paidDates;
        }

        if (serviceType === 'purchases') {
            setPendingInvoiceData(payload);
            setShowExpiredProductModal(true);
        } else {
            try {
                const response = await createOrderOrInvoice(payload, serviceType, orderType);
                if (response?.id) {
                    const hasPaymentDetails = paymentDetails.dueDate || (paymentDetails.paidDates && paymentDetails.paidDates.length > 0);
                    if (paymentStatus === 'PARTPAID' || hasPaymentDetails) {
                        console.log("Saving payment data because status is PARTPAID or details were provided.");
                        await savePaymentData(response.id, totalAmount);
                    } else {
                        console.log("Skipping payment data save because status is PAID/UNPAID and no specific details were provided.");
                    }
                }
                alert(`${orderType} created successfully!`);
                resetForm();
            } catch (error) {
                console.error(`Error creating ${orderType}:`, error);
                alert(`Failed to create ${orderType}: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        }
    }, [lineItems, paymentStatus, selectedCustomer, serviceType, orderType, delivery, amountSold, preparePaymentDataForBackend, savePaymentData, totalAmount, resetForm]);

    // Effects
    useEffect(() => {
        fetchData();
        setLineItems([createNewLineItem()]);
    }, [fetchData, createNewLineItem]);

    useEffect(() => {
        const parsedCategories: Categories = { 'All': [] };
        allProducts.forEach(p => {
            if (!p.category) return;
            const parts = p.category.split(/[/|]| > /).map((part: string) => part.trim());
            const mainCategory = parts[0] || 'Uncategorized';
            if (!parsedCategories[mainCategory]) {
                parsedCategories[mainCategory] = [];
            }
            if (parts[1] && !parsedCategories[mainCategory].includes(parts[1])) {
                parsedCategories[mainCategory].push(parts[1]);
            }
        });
        setCategories(parsedCategories);
    }, [allProducts]);

    useEffect(() => {
        let newFilteredProducts = allProducts;
        if (selectedFilter.cat && selectedFilter.cat !== 'All') {
            newFilteredProducts = newFilteredProducts.filter(p => {
                if (!p.category) return false;
                const parts = p.category.split(/[/|]| > /).map((part: string) => part.trim());
                if (selectedFilter.sub) {
                    return parts[0] === selectedFilter.cat && parts[1] === selectedFilter.sub;
                }
                return parts[0] === selectedFilter.cat;
            });
        }
        setFilteredProducts(newFilteredProducts);
    }, [selectedFilter, allProducts]);

    // Memoized values for rendering
    const soldAmountWarning = useMemo(() => {
        const numericSoldAmount = parseFloat(String(amountSold));
        if (orderType !== 'Order' || !numericSoldAmount || !totalAmount) return '';
        const limit = totalAmount * 1.15;
        if (numericSoldAmount > limit) {
            return `Warning: Sold amount ($${numericSoldAmount.toFixed(2)}) exceeds 115% of total cost ($${limit.toFixed(2)}).`;
        }
        return '';
    }, [amountSold, totalAmount, orderType]);

    const productSuggestions = useCallback((lineId: string) => {
        const currentItem = lineItems.find(item => item.id === lineId);
        if (!currentItem?.productSearch) return [];
        const lowerCaseSearch = currentItem.productSearch.toLowerCase();
        return filteredProducts.filter(p =>
            p.name.toLowerCase().includes(lowerCaseSearch) ||
            p.barcode?.toLowerCase().includes(lowerCaseSearch) ||
            p.category?.toLowerCase().includes(lowerCaseSearch)
        ).slice(0, 10);
    }, [lineItems, filteredProducts]);

    const customerSuggestions = useMemo(() => {
        if (!customerSearch) return [];
        const lowerCaseSearch = customerSearch.toLowerCase();
        return customers.filter(customer =>
            customer.name.toLowerCase().includes(lowerCaseSearch) ||
            customer.email?.toLowerCase().includes(lowerCaseSearch) ||
            customer.phone?.toLowerCase().includes(lowerCaseSearch)
        ).slice(0, 10);
    }, [customerSearch, customers]);

    // CSS classes
    const containerClasses = `${styles.container} ${isDarkMode ? styles.darkMode : ''}`;
    const inputClasses = `form-control ${isDarkMode ? styles.inputDark : ''}`;
    const selectClasses = `form-select ${isDarkMode ? styles.inputDark : ''}`;

    // Render helper for Payment Details Summary
    const PaymentDetailsSummary = () => {
        const hasDetails = paymentDetails.dueDate || (paymentDetails.paidDates && paymentDetails.paidDates.length > 0);
        if (!hasDetails) return null;
        return (
            <div className="mt-2 p-2 bg-light rounded small">
                <strong>Payment Details:</strong>
                {paymentDetails.dueDate && <div>Due: {new Date(paymentDetails.dueDate).toLocaleDateString()}</div>}
                {paymentDetails.paidDates && paymentDetails.paidDates.length > 0 && <div>Partial payments: {paymentDetails.paidDates.length}</div>}
            </div>
        );
    };

    return (
        <div className={containerClasses}>
            <h2 className={styles.pageTitle}>
                Create {serviceType === 'sales' ? 'Sales' : 'Purchase'} {orderType}
            </h2>

            <div className={styles.formWrapper}>
                <aside className={styles.categorySidebar}>
                    <h5 className={styles.sidebarTitle}>Categories</h5>
                    <ul className={styles.categoryList}>
                        {Object.keys(categories).map(cat => (
                            <li key={cat}>
                                <div
                                    className={`${styles.categoryItem} ${selectedFilter.cat === cat && !selectedFilter.sub ? styles.active : ''}`}
                                    onClick={() => handleCategoryClick(cat)}
                                >
                                    {cat}
                                </div>
                                {activeCategory === cat && categories[cat].length > 0 && (
                                    <ul className={styles.subCategoryList}>
                                        {categories[cat].map(subCat => (
                                            <li
                                                key={subCat}
                                                className={`${styles.subCategoryItem} ${selectedFilter.sub === subCat ? styles.active : ''}`}
                                                onClick={(e) => handleSubCategoryClick(e, cat, subCat)}
                                            >
                                                {subCat}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </li>
                        ))}
                    </ul>
                    <div className={styles.sidebarActions}>
                        <button className={`btn btn-outline-success ${styles.actionButton}`} onClick={() => setShowProductModal(true)}>
                            <i className="fas fa-box-open me-2"></i> New Product
                        </button>
                        <button className={`btn btn-outline-primary ${styles.actionButton}`} onClick={() => setShowCustomerModal(true)}>
                            <i className="fas fa-user-plus me-2"></i> New {serviceType === 'sales' ? 'Customer' : 'Supplier'}
                        </button>
                        {orderType === 'Order' && (
                            <button type="button" className={`btn btn-outline-secondary ${styles.actionButton}`} onClick={() => setShowDeliveryModal(true)}>
                                <i className="fas fa-truck me-2"></i> {delivery ? 'Edit' : 'Add'} Delivery
                            </button>
                        )}
                    </div>
                </aside>

                <main className={styles.mainForm}>
                    <form onSubmit={handleSubmit}>
                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <label className="form-label">{serviceType === 'sales' ? 'Customer' : 'Supplier'}:</label>
                                <div className={styles.productInputWrapper}>
                                    <input
                                        type="text"
                                        className={inputClasses}
                                        value={customerSearch}
                                        onChange={(e) => { setCustomerSearch(e.target.value); setSelectedCustomer(''); }}
                                        placeholder={`Search ${serviceType === 'sales' ? 'customer' : 'supplier'}...`}
                                        onFocus={() => setActiveCustomerSuggestionIndex(0)}
                                        onBlur={() => setTimeout(() => setActiveCustomerSuggestionIndex(-1), 200)}
                                        required
                                    />
                                    {activeCustomerSuggestionIndex >= 0 && customerSuggestions.length > 0 && (
                                        <ul className={styles.suggestionsList}>
                                            {customerSuggestions.map(customer => (
                                                <li key={customer.id} className={styles.suggestionItem} onMouseDown={() => handleSelectCustomer(customer)}>
                                                    <strong>{customer.name}</strong>
                                                    {customer.email && <small className="d-block text-muted">{customer.email}</small>}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>
                            <div className="col-md-6 mb-3">
                                <label className="form-label">Payment Status:</label>
                                <select className={selectClasses} value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}>
                                    {PAYMENT_STATUS_OPTIONS.map(status => <option key={status} value={status}>{status}</option>)}
                                </select>

                                {paymentStatus === "PARTPAID" && (<div><div className="mt-2">
                                    <label className="form-label">Payment Method:</label>
                                    <select className={selectClasses} value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}>
                                        {PAYMENT_METHODS.map(method => <option key={method.value} value={method.value}>{method.label}</option>)}
                                    </select>
                                </div>
                                    <input type="number" className={`${inputClasses} mt-2`} placeholder="Amount Paid" value={amountPaid} onChange={(e) => setAmountPaid(e.target.value)} required min="0.01" /></div>
                                )}

                                {orderType === 'Invoice' && (
                                    <div className="mt-2">
                                        <button type="button" className={`btn btn-outline-info w-100 ${styles.detailsButton}`} onClick={() => setPaymentModalOpen(true)}>
                                            <i className="fas fa-calendar-alt me-2"></i> Manage Payment Details
                                        </button>
                                        <PaymentDetailsSummary />
                                    </div>
                                )}
                                {orderType === "Order" && (
                                    <div className="mt-2">
                                        <input type="number" className={inputClasses} placeholder="Amount Sold" value={amountSold} onChange={(e) => setAmountSold(e.target.value)} />
                                        {soldAmountWarning && (
                                            <div className={styles.warningMessage}><i className="fas fa-exclamation-triangle me-2"></i>{soldAmountWarning}</div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <hr />
                        <h3 className={styles.sectionTitle}>Line Items</h3>

                        {lineItems.map((lineItem, index) => (
                            <div className={styles.lineItemRow} key={lineItem.id}>
                                <div className={styles.productInputWrapper}>
                                    <label className="form-label">Product:</label>
                                    <input
                                        type="text"
                                        className={inputClasses}
                                        value={lineItem.productSearch}
                                        onChange={(e) => handleLineItemChange(lineItem.id, 'productSearch', e.target.value)}
                                        onFocus={() => setActiveSuggestionIndex(index)}
                                        onBlur={() => setTimeout(() => setActiveSuggestionIndex(-1), 200)}
                                        placeholder="Type to search..."
                                    />
                                    {activeSuggestionIndex === index && productSuggestions(lineItem.id).length > 0 && (
                                        <ul className={styles.suggestionsList}>
                                            {productSuggestions(lineItem.id).map(p => (
                                                <li key={p.id} className={styles.suggestionItem} onMouseDown={() => handleSelectProduct(lineItem.id, p)}>
                                                    {p.name} <small className="text-muted">(Stock: {p.quantity})</small>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                                <div>
                                    <label className="form-label">Quantity:</label>
                                    <input type="number" className={`${inputClasses} ${lineItem.quantityError ? 'is-invalid' : ''}`} value={lineItem.quantity} onChange={(e) => handleLineItemChange(lineItem.id, 'quantity', e.target.value)} min="1" />
                                    {lineItem.quantityError && serviceType === "sales" && <div className={styles.quantityError}>{lineItem.quantityError}</div>}
                                </div>
                                <div>
                                    <label className="form-label">Price:</label>
                                    <input type="number" className={inputClasses} value={lineItem.price} onChange={(e) => handleLineItemChange(lineItem.id, 'price', e.target.value)} step="0.01" min="0" />
                                </div>
                                <div>
                                    <label className="form-label invisible">Remove</label>
                                    <button type="button" className="btn btn-outline-danger w-100" onClick={() => handleRemoveLineItem(lineItem.id)} disabled={lineItems.length <= 1}>
                                        <i className="fas fa-trash-alt"></i>
                                    </button>
                                </div>
                            </div>
                        ))}

                        <div className={styles.bottomActionsWrapper}>
                            <button type="button" className={`btn btn-primary ${styles.actionButtonSmall}`} onClick={handleAddLineItem}>
                                <i className="fas fa-plus me-2"></i> Add Item
                            </button>
                            <button type="submit" className={`btn btn-success ${styles.actionButtonSmall}`}>
                                <i className="fas fa-check-circle me-2"></i> Create {orderType}
                            </button>
                        </div>
                    </form>
                </main>
            </div>

            {/* Modals */}
            {showDeliveryModal && (
                <div className={styles.modalBackdrop} onClick={() => setShowDeliveryModal(false)}>
                    <div className={`${styles.modalContent} ${isDarkMode ? styles.darkMode : ''}`} onClick={(e) => e.stopPropagation()}>
                        <button className={styles.closeBtn} onClick={() => setShowDeliveryModal(false)}>×</button>
                        <h3>{delivery ? 'Edit' : 'Add'} Delivery Details</h3>
                        <DeliveryForm initialData={delivery || {}} onSave={(data) => { setDelivery(data); setShowDeliveryModal(false); }} />
                    </div>
                </div>
            )}

            <Modal isOpen={showProductModal} onClose={() => setShowProductModal(false)} size="xl">
                <ProductForm productId={null} handleClose={() => { setShowProductModal(false); fetchData(); }} />
            </Modal>

            <Modal isOpen={showCustomerModal} onClose={() => { setShowCustomerModal(false); fetchData(); }}>
                    <SupplarClientForm onSuccess={() => { setShowCustomerModal(false); fetchData(); }} />
            </Modal>

            {showExpiredProductModal && pendingInvoiceData && (
                <div className={styles.modalBackdrop} onClick={() => { setShowExpiredProductModal(false); setPendingInvoiceData(null); }}>
                    <div className={`${styles.modalContent} ${isDarkMode ? styles.darkMode : ''}`} onClick={(e) => e.stopPropagation()}>
                        <button className={styles.closeBtn} onClick={() => { setShowExpiredProductModal(false); setPendingInvoiceData(null); }}>×</button>
                        <ExpiredProductForm
                            purchaseLines={pendingInvoiceData.purchaseLines}
                            supplierId={pendingInvoiceData.supplierId}
                            onSave={handleExpiredProductsSave}
                            onCancel={async () => {
                                try {
                                    const response = await createOrderOrInvoice(pendingInvoiceData, serviceType, orderType);
                                    if (response?.id) {
                                        await savePaymentData(response.id, totalAmount);
                                    }
                                    alert(`${orderType} created successfully (expiration dates not set).`);
                                    resetForm();
                                } catch (error) {
                                    console.error(`Error creating ${orderType}:`, error);
                                    alert(`Failed to create ${orderType}.`);
                                } finally {
                                    setShowExpiredProductModal(false);
                                    setPendingInvoiceData(null);
                                }
                            }}
                        />
                    </div>
                </div>
            )}

            <PaymentDetailsModal isOpen={isPaymentModalOpen} onClose={() => setPaymentModalOpen(false)} initialData={paymentDetails} onSave={handleSavePaymentDetails} />
        </div>
    );
};

export default withGlobalAutoTranslate(InvoiceForm);
