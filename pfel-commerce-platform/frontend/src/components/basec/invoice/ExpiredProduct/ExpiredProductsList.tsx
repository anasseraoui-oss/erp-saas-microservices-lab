import React, { useState, useEffect } from 'react';
import {ExpiredProduct, Product} from '../../../../classe/Product';
import styles from "../../../../Css/invoiceOrOrder/InvoiceForm.module.css";
import {useDarkMode} from "../../../DarkModeProvider";
import {getSupplerClients} from "../../../../api/supplierClientService";
import {getAllProducts} from "../../../../api/product/productService";
import expiredProductService from "../../../../api/product/expiredProductService";

interface Customer {
    id: number | string;
    name: string;
    email?: string;
    phone?: string;
}

interface ExtendedExpiredProduct extends ExpiredProduct {
    productName?: string;
    supplierName?: string;
    isExpired?: boolean;
    daysUntilExpiry?: number;
}

const ExpiredProductsList: React.FC = () => {
    // @ts-ignore
    const { isDarkMode } = useDarkMode();
    const [expiredProducts, setExpiredProducts] = useState<ExtendedExpiredProduct[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [suppliers, setSuppliers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState<'all' | 'expired' | 'expiring-soon'>('all');
    const [selectedProduct, setSelectedProduct] = useState<ExtendedExpiredProduct | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [expiredData, productsData, suppliersData] = await Promise.all([
                expiredProductService.getAll(),
                getAllProducts(),
                getSupplerClients()
            ]);
            console.log(expiredData);
            setProducts(productsData);
            setSuppliers(suppliersData);

            // Enhance expired products with additional info
            const enhancedExpiredProducts = expiredData.map((item: { productId: any; supplierId: any; expiryDate: string | number | Date; }) => {
                const product = productsData.find((p: { id: any; }) => p.id === item.productId);
                const supplier = suppliersData.find((s: { id: any; }) => s.id === item.supplierId);
                const expiryDate = new Date(item.expiryDate);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                expiryDate.setHours(0, 0, 0, 0);

                const timeDiff = expiryDate.getTime() - today.getTime();
                const daysUntilExpiry = Math.ceil(timeDiff / (1000 * 3600 * 24));

                return {
                    ...item,
                    productName: product?.name || 'Unknown Product',
                    supplierName: supplier?.name || 'Unknown Supplier',
                    isExpired: daysUntilExpiry < 0,
                    daysUntilExpiry
                };
            });

            setExpiredProducts(enhancedExpiredProducts);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredProducts = expiredProducts.filter(product => {
        switch (filterType) {
            case 'expired':
                return product.isExpired;
            case 'expiring-soon':
                return !product.isExpired && product.daysUntilExpiry! <= 30;
            default:
                return true;
        }
    });

    const handleEdit = (product: ExtendedExpiredProduct) => {
        setSelectedProduct(product);
        setShowEditModal(true);
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this expired product record?')) {
            try {
                await expiredProductService.delete(id);
                await fetchData();
                alert('Expired product record deleted successfully');
            } catch (error) {
                console.error('Error deleting expired product:', error);
                alert('Failed to delete expired product record');
            }
        }
    };

    const handleUpdate = async (updatedProduct: Partial<ExpiredProduct>) => {
        if (!selectedProduct?.id) return;

        try {
            await expiredProductService.update(selectedProduct.id, updatedProduct);
            await fetchData();
            setShowEditModal(false);
            setSelectedProduct(null);
            alert('Expired product updated successfully');
        } catch (error) {
            console.error('Error updating expired product:', error);
            alert('Failed to update expired product');
        }
    };

    const getStatusBadge = (product: ExtendedExpiredProduct) => {
        if (product.isExpired) {
            return <span className="badge bg-danger">Expired</span>;
        } else if (product.daysUntilExpiry! <= 7) {
            return <span className="badge bg-warning">Expires Soon</span>;
        } else if (product.daysUntilExpiry! <= 30) {
            return <span className="badge bg-info">Monitor</span>;
        }
        return <span className="badge bg-success">Good</span>;
    };

    const containerClasses = `${styles.container} ${isDarkMode ? styles.darkMode : ''}`;
    const inputClasses = `form-control ${isDarkMode ? styles.inputDark : ''}`;
    const tableClasses = `table ${isDarkMode ? 'table-dark' : ''}`;

    if (loading) {
        return (
            <div className={containerClasses}>
                <div className="d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            </div>
        );
    }

    // @ts-ignore
    return (
        <div className={containerClasses}>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Expired Products Management</h2>
                <div className="d-flex gap-2">
                    <select
                        className={`form-select ${isDarkMode ? styles.inputDark : ''}`}
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value as any)}
                        style={{ width: 'auto' }}
                    >
                        <option value="all">All Products</option>
                        <option value="expired">Expired Only</option>
                        <option value="expiring-soon">Expiring Soon (30 days)</option>
                    </select>
                    <button
                        className="btn btn-outline-primary"
                        onClick={fetchData}
                    >
                        <i className="fas fa-sync-alt me-2"></i>
                        Refresh
                    </button>
                </div>
            </div>

            {filteredProducts.length === 0 ? (
                <div className="text-center py-5">
                    <i className="fas fa-box-open fa-3x text-muted mb-3"></i>
                    <h5 className="text-muted">No expired products found</h5>
                    <p className="text-muted">
                        {filterType === 'all' ? 'No expired products have been recorded yet.' :
                            filterType === 'expired' ? 'No products are currently expired.' :
                                'No products are expiring in the next 30 days.'}
                    </p>
                </div>
            ) : (
                <div className="table-responsive">
                    <table className={tableClasses}>
                        <thead>
                        <tr>
                            <th>Product</th>
                            <th>Supplier</th>
                            <th>Expiry Date</th>
                            <th>Quantity</th>
                            <th>Batch Number</th>
                            <th>Status</th>
                            <th>Days Until Expiry</th>
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filteredProducts.map(product => (
                            <tr key={product.id}>
                                <td>
                                    <strong>{product.productName}</strong>
                                </td>
                                <td>{product.supplierName}</td>
                                <td>
                                    {new Date(product.expirationDate).toLocaleDateString()}
                                </td>
                                <td>
                                        <span className="badge bg-secondary">
                                            {product.quantityExpired}
                                        </span>
                                </td>
                                <td>
                                    {product.lotNumber ||
                                        <span className="text-muted">N/A</span>}
                                </td>
                                <td>{getStatusBadge(product)}</td>
                                <td>
                                        <span className={
                                            product.isExpired ? 'text-danger fw-bold' :
                                                product.daysUntilExpiry! <= 7 ? 'text-warning fw-bold' :
                                                    'text-muted'
                                        }>
                                            {product.isExpired ?
                                                `${Math.abs(product.daysUntilExpiry!)} days ago` :
                                                `${product.daysUntilExpiry} days`
                                            }
                                        </span>
                                </td>
                                <td>
                                    <div className="btn-group btn-group-sm">
                                        <button
                                            className="btn btn-outline-primary"
                                            onClick={() => handleEdit(product)}
                                            title="Edit"
                                        >
                                            <i className="fas fa-edit"></i>
                                        </button>
                                        <button
                                            className="btn btn-outline-danger"
                                            onClick={() => handleDelete(product.id!)}
                                            title="Delete"
                                        >
                                            <i className="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Edit Modal */}
            {showEditModal && selectedProduct && (
                <div className={styles.modalBackdrop} onClick={() => setShowEditModal(false)}>
                    <div className={`${styles.modalContent} ${isDarkMode ? styles.darkMode : ''}`} onClick={(e) => e.stopPropagation()}>
                        <button className={styles.closeBtn} onClick={() => setShowEditModal(false)}>×</button>
                        <h3>Edit Expired Product</h3>
                        <EditExpiredProductForm
                            product={selectedProduct}
                            onSave={handleUpdate}
                            onCancel={() => setShowEditModal(false)}
                            isDarkMode={isDarkMode}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

// Edit form component
interface EditExpiredProductFormProps {
    product: ExtendedExpiredProduct;
    onSave: (updatedProduct: { expirationDate: string; quantityExpired: number; lotNumber: string; notes: string }) => void;
    onCancel: () => void;
    isDarkMode: boolean;
}

// Helper function to format date to YYYY-MM-DD string
const formatDateForInput = (date: string | Date): string => {
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const EditExpiredProductForm: React.FC<EditExpiredProductFormProps> = ({
                                                                           product,
                                                                           onSave,
                                                                           onCancel,
                                                                           isDarkMode
                                                                       }) => {
    const [formData, setFormData] = useState({
        expirationDate: formatDateForInput(product.expirationDate), // Convert to YYYY-MM-DD format
        quantityExpired: product.quantityExpired || 0,
        lotNumber: product.lotNumber || '',
        notes: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    const inputClasses = `form-control ${isDarkMode ? styles.inputDark : ''}`;

    return (
        <form onSubmit={handleSubmit}>
            <div className="mb-3">
                <label className="form-label">Product: {product.productName}</label>
                <p className="text-muted">Supplier: {product.supplierName}</p>
            </div>

            <div className="row">
                <div className="col-md-6 mb-3">
                    <label className="form-label">Expiry Date:</label>
                    <input
                        type="date"
                        className={inputClasses}
                        value={formData.expirationDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, expirationDate: e.target.value }))}
                        required
                    />
                </div>

                <div className="col-md-6 mb-3">
                    <label className="form-label">Quantity:</label>
                    <input
                        type="number"
                        className={inputClasses}
                        value={formData.quantityExpired}
                        onChange={(e) => setFormData(prev => ({ ...prev, quantityExpired: parseInt(e.target.value) || 0 }))}
                        min="0"
                        required
                    />
                </div>

                <div className="col-md-6 mb-3">
                    <label className="form-label">Batch Number:</label>
                    <input
                        type="text"
                        className={inputClasses}
                        value={formData.lotNumber}
                        onChange={(e) => setFormData(prev => ({ ...prev, lotNumber: e.target.value }))}
                        placeholder="Enter batch number"
                    />
                </div>

                <div className="col-md-6 mb-3">
                    <label className="form-label">Notes:</label>
                    <textarea
                        className={inputClasses}
                        value={formData.notes}
                        onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="Additional notes"
                        rows={3}
                    />
                </div>
            </div>

            <div className="d-flex justify-content-end gap-2">
                <button type="button" className="btn btn-secondary" onClick={onCancel}>
                    Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                    <i className="fas fa-save me-2"></i>
                    Update
                </button>
            </div>
        </form>
    );
};

export default ExpiredProductsList;