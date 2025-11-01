import React, {useState, useEffect} from 'react';
import {useDarkMode} from '../DarkModeProvider';
import styles from '../../Css/SupplierClient/SupplierClientForm.module.css';
import {createSupplierClient, updateSupplierClient} from "../../api/supplierClientService";
import { ClientSupplier } from '../../classe/ClientSupplier';

interface SupplierClientFormProps {
    existingClient?: ClientSupplier,
    onSuccess: () => void,
    onCancel?: () => void,
    currentUserId?: string | number,
    defaultCategory?: string | null | undefined
}

const SupplierClientForm: React.FC<SupplierClientFormProps> = ({
                                                                   existingClient,
                                                                   onSuccess,
                                                                   onCancel,
                                                                   currentUserId,
                                                                   defaultCategory
                                                               }) => {
    // Basic fields
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState(defaultCategory || '');

    // Financial fields
    const [borrowingPricePurchase, setBorrowingPricePurchase] = useState<number>(0);
    const [borrowingPriceSales, setBorrowingPriceSales] = useState<number>(0);
    const [totalePurchase, setTotalePurchase] = useState<number>(0);
    const [totalSales, setTotalSales] = useState<number>(0);
    const [customerCreditCap, setCustomerCreditCap] = useState<number | undefined>(undefined);

    // User fields
    const [userCreator, setUserCreator] = useState<string | number>('');
    const [userExecutor, setUserExecutor] = useState<string | number>('');

    // Form state
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // @ts-ignore
    const {isDarkMode} = useDarkMode();

    useEffect(() => {
        if (existingClient) {
            setName(existingClient.name || '');
            setEmail(existingClient.email || '');
            setPhoneNumber(existingClient.phoneNumber || '');
            setDescription(existingClient.description || '');
            setCategory(existingClient.category || '');
            setBorrowingPricePurchase(existingClient.borrowingPricePurchase || 0);
            setBorrowingPriceSales(existingClient.borrowingPriceSales || 0);
            setTotalePurchase(existingClient.totalePurchase || 0);
            setTotalSales(existingClient.totalSales || 0);
            setCustomerCreditCap(existingClient.customerCreditCap);
            setUserCreator(existingClient.userCreator || '');
            setUserExecutor(existingClient.userExecutor || '');
        } else if (currentUserId) {
            // Set current user as creator for new clients
            setUserCreator(currentUserId);
            setUserExecutor(currentUserId);
        }
    }, [existingClient, currentUserId]);

    // Validation functions
    const validatePhoneNumber = (phone: string): boolean => {
        const phoneRegex = /^[\+]?[2-9][\d]{0,15}$/;
        return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
    };

    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validateNumericField = (value: number, fieldName: string): boolean => {
        if (isNaN(value) || value < 0) {
            setError(`${fieldName} must be a valid positive number.`);
            return false;
        }
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        // Client-side validation
        if (!validateEmail(email)) {
            setError("Please enter a valid email address.");
            setIsSubmitting(false);
            return;
        }

        if (!validatePhoneNumber(phoneNumber)) {
            setError("Please enter a valid phone number.");
            setIsSubmitting(false);
            return;
        }

        // Validate numeric fields
        if (!validateNumericField(borrowingPricePurchase, "Borrowing Price Purchase") ||
            !validateNumericField(borrowingPriceSales, "Borrowing Price Sales") ||
            !validateNumericField(totalePurchase, "Total Purchase") ||
            !validateNumericField(totalSales, "Total Sales")) {
            setIsSubmitting(false);
            return;
        }

        if (customerCreditCap !== undefined && !validateNumericField(customerCreditCap, "Customer Credit Cap")) {
            setIsSubmitting(false);
            return;
        }

        const clientData: Omit<ClientSupplier, 'id' | 'createdAt' | 'updatedAt'> = {
            name: name.trim(),
            email: email.trim().toLowerCase(),
            phoneNumber: phoneNumber.trim(),
            description: description.trim(),
            category: category.trim(),
            borrowingPricePurchase,
            borrowingPriceSales,
            totalePurchase,
            totalSales,
            userCreator: userCreator,
            userExecutor: userExecutor,
            customerCreditCap: customerCreditCap === 0 ? undefined : customerCreditCap
        };

        try {
            if (existingClient && existingClient.id) {
                const updatedData = {
                    ...existingClient,
                    ...clientData,
                    updatedAt: new Date().toISOString()
                };
                await updateSupplierClient(existingClient.id, updatedData);
            } else {
                const newClientData = {
                    ...clientData,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };
                await createSupplierClient(newClientData);
            }

            // Reset form
            setName('');
            setEmail('');
            setPhoneNumber('');
            setDescription('');
            setCategory('');
            setBorrowingPricePurchase(0);
            setBorrowingPriceSales(0);
            setTotalePurchase(0);
            setTotalSales(0);
            setCustomerCreditCap(undefined);
            setUserCreator('');
            setUserExecutor('');

            onSuccess();
        } catch (error: any) {
            console.error("Failed to save client:", error);

            // More specific error handling
            if (error.response?.status === 409) {
                setError("A client with this name or email already exists.");
            } else if (error.response?.status === 400) {
                setError("Invalid data provided. Please check your inputs.");
            } else if (error.response?.status === 500) {
                setError("Server error. Please try again later.");
            } else {
                setError("Operation failed. Please try again.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const formClasses = `${styles.formContainer} ${isDarkMode ? styles.darkMode : ''}`;
    const inputClasses = styles.input;
    const errorClasses = styles.error;

    return (
        <form className={formClasses} onSubmit={handleSubmit}>
            {error && (
                <div className={errorClasses} role="alert">
                    {error}
                </div>
            )}

            {/* Basic Information Section */}
            <div className={styles.formSection}>
                <h3>Basic Information</h3>

                <div className={styles.formGroup}>
                    <label htmlFor="name">Name *</label>
                    <input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className={inputClasses}
                        disabled={isSubmitting}
                        maxLength={100}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="email">Email *</label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className={inputClasses}
                        disabled={isSubmitting}
                        maxLength={100}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="phoneNumber">Phone Number *</label>
                    <input
                        id="phoneNumber"
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        required
                        className={inputClasses}
                        disabled={isSubmitting}
                        placeholder="+1234567890"
                        maxLength={20}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="category">Category *</label>
                    <input
                        id="category"
                        type="text"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        required
                        className={inputClasses}
                        disabled={isSubmitting}
                        maxLength={50}
                        placeholder="e.g., Supplier, Client, Both"
                    />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="description">Description</label>
                    <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className={inputClasses}
                        disabled={isSubmitting}
                        maxLength={500}
                        rows={3}
                        placeholder="Additional details about the client/supplier..."
                    />
                </div>
            </div>

            {/* Financial Information Section */}
            <div className={styles.formSection}>
                <h3>Financial Information</h3>

                <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                        <label htmlFor="borrowingPricePurchase">Borrowing Price Purchase</label>
                        <input
                            id="borrowingPricePurchase"
                            type="number"
                            value={borrowingPricePurchase}
                            onChange={(e) => setBorrowingPricePurchase(parseFloat(e.target.value) || 0)}
                            className={inputClasses}
                            disabled={isSubmitting}
                            min="0"
                            step="0.01"
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="borrowingPriceSales">Borrowing Price Sales</label>
                        <input
                            id="borrowingPriceSales"
                            type="number"
                            value={borrowingPriceSales}
                            onChange={(e) => setBorrowingPriceSales(parseFloat(e.target.value) || 0)}
                            className={inputClasses}
                            disabled={isSubmitting}
                            min="0"
                            step="0.01"
                        />
                    </div>
                </div>

                <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                        <label htmlFor="totalePurchase">Total Purchase</label>
                        <input
                            id="totalePurchase"
                            type="number"
                            value={totalePurchase}
                            onChange={(e) => setTotalePurchase(parseFloat(e.target.value) || 0)}
                            className={inputClasses}
                            disabled={isSubmitting}
                            min="0"
                            step="0.01"
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="totalSales">Total Sales</label>
                        <input
                            id="totalSales"
                            type="number"
                            value={totalSales}
                            onChange={(e) => setTotalSales(parseFloat(e.target.value) || 0)}
                            className={inputClasses}
                            disabled={isSubmitting}
                            min="0"
                            step="0.01"
                        />
                    </div>
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="customerCreditCap">Customer Credit Cap (Optional)</label>
                    <input
                        id="customerCreditCap"
                        type="number"
                        value={customerCreditCap || ''}
                        onChange={(e) => setCustomerCreditCap(e.target.value ? parseFloat(e.target.value) : undefined)}
                        className={inputClasses}
                        disabled={isSubmitting}
                        min="0"
                        step="0.01"
                        placeholder="Leave empty for no credit limit"
                    />
                </div>
            </div>

            <div className={styles.buttonGroup}>
                <button
                    className={styles.submitBtn}
                    type="submit"
                    disabled={isSubmitting}
                >
                    {isSubmitting
                        ? 'Saving...'
                        : `${existingClient ? 'Update' : 'Add'} Client/Supplier`
                    }
                </button>

                {onCancel && (
                    <button
                        className={styles.cancelBtn}
                        type="button"
                        onClick={onCancel}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </button>
                )}
            </div>
        </form>
    );
};

export default SupplierClientForm;