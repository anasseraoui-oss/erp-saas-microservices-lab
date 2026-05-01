import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { deleteProduct, getAllProducts } from '../../api/product/productService';
import { useDarkMode } from "../DarkModeProvider";
import styles from "../../Css/product/product.module.css";
import Header from "../Header";
import CategoryFilter from "./CategoryFilter";
import ProductForm from "./ProductForme";
import Modal from "../basec/Modal";
import ProductCardComponent from './ProductCard';
import ProductsChart from '../statistics/ProductsChart';
import { Product } from "../../classe/Product";
import { allApplicationRoutes } from "../buildMenuHome/y";
import { ProductChartData } from "../statistics/basec";
import EnhancedStats from "./EnhancedStats";
import { getAllLinesAllContexts } from "../../api/lineApiService";

// Type definitions
interface ProductListState {
    products: Product[];
    selectedProduct: Product | null;
    modalType: string | null;
    selectedCategory: string | null;
    selectedCategoryPath: string | null;
    chartViewMode: 'quantity' | 'value';
    isLoading: boolean;
    error: string | null;
}

// Dark mode context type
interface DarkModeContextType {
    isDarkMode: boolean;
    toggleDarkMode: () => void;
}

// Product lines data interface
interface ProductLinesData {
    salesLines: any[];
    purchaseLines: any[];
    salesReturnLines: any[];
    purchaseReturnLines: any[];
}

// Custom hook for debouncing
function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

// Custom hook for chart data
function useChartData(products: Product[], viewMode: 'quantity' | 'value', linesData: ProductLinesData): ProductChartData[] {
    return useMemo(() => {
        if (!products.length) return [];

        const { salesLines, purchaseLines, salesReturnLines, purchaseReturnLines } = linesData;
        const productStats: { [key: number]: ProductChartData } = {};

        // إنشاء كائن إحصائيات لكل منتج
        products.forEach((product: Product) => {
            productStats[product.id] = {
                name: product.name,
                soldQuantity: 0,
                soldValue: 0,
                purchasedQuantity: 0,
                purchasedValue: 0,
                salesReturnedQuantity: 0,
                salesReturnedValue: 0,
                purchaseReturnedQuantity: 0,
                purchaseReturnedValue: 0
            };
        });

        // معالجة خطوط المبيعات
        salesLines.forEach((line: any) => {
            if (productStats[line.productId]) {
                productStats[line.productId].soldQuantity += line.quantity;
                productStats[line.productId].soldValue += (line.quantity * line.price);
            }
        });

        // معالجة خطوط المشتريات
        purchaseLines.forEach((line: any) => {
            if (productStats[line.productId]) {
                productStats[line.productId].purchasedQuantity += line.quantity;
                productStats[line.productId].purchasedValue += (line.quantity * line.price);
            }
        });

        // معالجة مرتجعات المبيعات
        salesReturnLines.forEach((line: any) => {
            if (productStats[line.productId]) {
                productStats[line.productId].salesReturnedQuantity += line.quantity;
                productStats[line.productId].salesReturnedValue += (line.quantity * line.price);
            }
        });

        // معالجة مرتجعات المشتريات
        purchaseReturnLines.forEach((line: any) => {
            if (productStats[line.productId]) {
                productStats[line.productId].purchaseReturnedQuantity += line.quantity;
                productStats[line.productId].purchaseReturnedValue += (line.quantity * line.price);
            }
        });

        // تصفية المنتجات التي لها نشاط وترتيبها
        return Object.values(productStats)
            .filter(product =>
                product.soldQuantity > 0 ||
                product.purchasedQuantity > 0 ||
                product.salesReturnedQuantity > 0 ||
                product.purchaseReturnedQuantity > 0
            )
            .sort((a, b) => {
                if (viewMode === 'quantity') {
                    return b.soldQuantity - a.soldQuantity;
                } else {
                    return b.soldValue - a.soldValue;
                }
            })
            .slice(0, 10); // أفضل 10 منتجات
    }, [products, viewMode, linesData]);
}

const ProductList: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [state, setState] = useState<ProductListState>({
        products: [],
        selectedProduct: null,
        modalType: null,
        selectedCategory: null,
        selectedCategoryPath: null,
        chartViewMode: 'quantity',
        isLoading: false,
        error: null,
    });

    // Product lines data state
    const [productLinesData, setProductLinesData] = useState<ProductLinesData>({
        salesLines: [],
        purchaseLines: [],
        salesReturnLines: [],
        purchaseReturnLines: []
    });

    // Fix the useDarkMode hook usage with proper typing
    const { isDarkMode } = useDarkMode();

    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    // Fetch product lines data
    useEffect(() => {
        const fetchProductLines = async () => {
            try {
                const [salesLines, purchaseLines, salesReturnLines, purchaseReturnLines] = await Promise.all([
                    getAllLinesAllContexts('sales', 'line'),
                    getAllLinesAllContexts('purchases', 'line'),
                    getAllLinesAllContexts('sales', 'lineReturn'),
                    getAllLinesAllContexts('purchases', 'lineReturn')
                ]);

                setProductLinesData({
                    salesLines,
                    purchaseLines,
                    salesReturnLines,
                    purchaseReturnLines
                });
            } catch (error) {
                console.error('Error fetching product lines:', error);
            }
        };

        fetchProductLines();
    }, []);

    // Memoized categories
    const mainCategoriesForFilter = useMemo(() => {
        const categories = new Set<string>();
        state.products.forEach((product: Product) => {
            if (product.category) categories.add(product.category.split(' > ')[0]);
        });
        return Array.from(categories).sort();
    }, [state.products]);

    const allProductCategoriesForFilter = useMemo(() => {
        return state.products.map((p: Product) => p.category).filter((c: string | undefined) => c) as string[];
    }, [state.products]);

    // Fetch products with error handling
    const fetchProducts = useCallback(async () => {
        setState((prev: ProductListState) => ({ ...prev, isLoading: true, error: null }));
        try {
            const result = await getAllProducts();
            setState((prev: ProductListState) => ({ ...prev, products: result, isLoading: false }));
        } catch (error) {
            console.error('Failed to fetch products:', error);
            setState((prev: ProductListState) => ({
                ...prev,
                error: 'Failed to load products. Please try again.',
                isLoading: false
            }));
        }
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    // Handle product deletion
    const handleDelete = useCallback(async (id: number) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await deleteProduct(id);
                setState((prev: ProductListState) => ({
                    ...prev,
                    products: prev.products.filter((product: Product) => product.id !== id)
                }));
            } catch (error) {
                console.error('Error deleting product:', error);
                setState((prev: ProductListState) => ({
                    ...prev,
                    error: 'Failed to delete product. Please try again.'
                }));
            }
        }
    }, []);

    // Modal handlers
    const openModal = useCallback((type: string, product: Product | null = null) => {
        setState((prev: ProductListState) => ({
            ...prev,
            selectedProduct: product,
            modalType: type
        }));
    }, []);

    const closeModal = useCallback(() => {
        setState((prev: ProductListState) => ({
            ...prev,
            selectedProduct: null,
            modalType: null,
            selectedCategory: null
        }));
    }, []);

    const handleFormSuccess = useCallback(async () => {
        closeModal();
        await fetchProducts();
    }, [closeModal, fetchProducts]);

    const handleAddProductToCategory = useCallback((categoryPath: string) => {
        setState(prev => ({ ...prev, selectedCategory: categoryPath }));
        openModal('add');
    }, [openModal]);

    const handleChartViewModeChange = useCallback((mode: 'quantity' | 'value') => {
        setState((prev: ProductListState) => ({ ...prev, chartViewMode: mode }));
    }, []);

    // Filtered products with debounced search
    const filteredProducts = useMemo(() => {
        return state.products.filter((product: Product) => {
            const matchesSearchTerm =
                product.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                (product.barcode && product.barcode.toLowerCase().includes(debouncedSearchTerm.toLowerCase()));
            const matchesCategory = state.selectedCategoryPath
                ? (product.category ? product.category.startsWith(state.selectedCategoryPath) : false)
                : true;
            return matchesSearchTerm && matchesCategory;
        });
    }, [state.products, debouncedSearchTerm, state.selectedCategoryPath]);

    // Chart data using the custom hook
    const performanceChartData = useChartData(state.products, state.chartViewMode, productLinesData);

    const containerClasses = `${styles.productListContainer} ${isDarkMode ? styles.dark : ''}`;

    // Loading state
    if (state.isLoading && state.products.length === 0) {
        return (
            <div className={containerClasses}>
                <div className={styles.loadingContainer}>
                    <div className={styles.loadingSpinner} />
                    <p>Loading products...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={containerClasses}>
            <Header allRoutes={allApplicationRoutes} />

            {/* Error Message */}
            {state.error && (
                <div className={styles.errorMessage} role="alert">
                    {state.error}
                    <button
                        onClick={() => setState((prev: ProductListState) => ({ ...prev, error: null }))}
                        className={styles.errorCloseBtn}
                        aria-label="Close error message"
                    >
                        ×
                    </button>
                </div>
            )}

            <div className={styles.pageHeader}>
                <h2 className={styles.pageTitle}>Product Management</h2>
                <div className={styles.searchAndActions}>
                    <div className={styles.searchContainer}>
                        <input
                            type="text"
                            className={styles.searchInput}
                            placeholder="Search by name or barcode..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            aria-label="Search products"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className={styles.searchClearBtn}
                                aria-label="Clear search"
                            >
                                ×
                            </button>
                        )}
                    </div>
                    <button
                        className={styles.addProductBtn}
                        onClick={() => openModal('add')}
                        aria-label="Add new product"
                    >
                        <i className="fas fa-plus" aria-hidden="true"></i> New Product
                    </button>
                </div>
            </div>

            <div className={styles.reportsBar}>
                <h3 className={styles.reportsBarTitle}>Product Reports</h3>
                <div className={styles.reportsBarButtons}>
                    <button
                        className={styles.reportButton}
                        onClick={() => openModal('performanceReport')}
                        aria-label="View performance analysis"
                    >
                        Performance Analysis
                    </button>
                    <button
                        className={styles.reportButton}
                        onClick={() => openModal('activityReport')}
                        aria-label="View creation and update statistics"
                    >
                        Creation & Update Stats
                    </button>
                </div>
            </div>

            <div className={styles.categoryFilterBar}>
                <CategoryFilter
                    mainCategories={mainCategoriesForFilter}
                    allCategories={allProductCategoriesForFilter}
                    selectedCategoryPath={state.selectedCategoryPath}
                    onSelectCategory={(categoryPath) =>
                        setState((prev: ProductListState) => ({ ...prev, selectedCategoryPath: categoryPath }))
                    }
                    showAddButton={true}
                    onAddItemToCategory={handleAddProductToCategory}
                    showAddItemButton={true}
                    showSubCategoryButton={true}
                    isDarkMode={isDarkMode}
                />
            </div>

            {/* Products Grid */}
            <div className={styles.productGridContainer}>
                <div className={styles.productGridHeader}>
                    <span className={styles.productCount}>
                        {filteredProducts.length} product
                        {state.selectedCategoryPath && ' in this category'}
                    </span>
                    {state.isLoading && (
                        <div className={styles.loadingIndicator}>
                            <div className={styles.loadingSpinner} />
                            <span>Updating...</span>
                        </div>
                    )}
                </div>

                {filteredProducts.length > 0 ? (
                    <div className={styles.productGrid} role="grid">
                        {filteredProducts.map((product: Product) => (
                            <div key={product.id} role="gridcell">
                                <ProductCardComponent
                                    className={styles.productCard}
                                    product={product}
                                    onViewDetails={(p) => openModal('view', p)}
                                    onEdit={(p) => openModal('edit', p)}
                                    onDelete={handleDelete}
                                    isModalView={false}
                                />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className={styles.noProductsContainer}>
                        <div className={styles.noProductsIcon}>
                            <i className="fas fa-box-open" aria-hidden="true"></i>
                        </div>
                        <p className={styles.noProductsLead}>
                            {debouncedSearchTerm || state.selectedCategoryPath
                                ? 'No products found matching your criteria.'
                                : 'No products found.'
                            }
                        </p>
                        {(debouncedSearchTerm || state.selectedCategoryPath) && (
                            <button
                                className={styles.clearFiltersBtn}
                                onClick={() => {
                                    setSearchTerm('');
                                    setState((prev: ProductListState) => ({ ...prev, selectedCategoryPath: null }));
                                }}
                            >
                                Clear filters
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Modal */}
            <Modal
                isOpen={!!state.modalType}
                onClose={closeModal}
                size="xl"
                aria-labelledby="modal-title"
            >
                {state.modalType === 'view' && state.selectedProduct && (
                    <ProductCardComponent
                        product={state.selectedProduct}
                        isModalView={true}
                    />
                )}
                {(state.modalType === 'edit' || state.modalType === 'add') && (
                    <ProductForm
                        productId={state.modalType === 'edit' && state.selectedProduct ? state.selectedProduct.id : null}
                        isFromPurchaseInvoice={false}
                        handleClose={handleFormSuccess}
                        initialCategory={state.selectedCategory}
                    />
                )}
                {state.modalType === 'activityReport' && (
                    <EnhancedStats products={state.products} dataType={"products"}/>
                )}
                {state.modalType === 'performanceReport' && (
                    <ProductsChart
                        data={performanceChartData}
                        viewMode={state.chartViewMode}
                        onViewModeChange={handleChartViewModeChange}
                    />
                )}
            </Modal>
        </div>
    );
};

export default ProductList;