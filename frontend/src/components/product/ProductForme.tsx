import React, { useEffect, useState, memo } from 'react';
import { useDarkMode } from "../DarkModeProvider";
import { createProduct, getProductById, updateProduct } from "../../api/product/productService";
import { Product } from "../../classe/Product";
import ProductImage from "./ProductImage";
import { db } from "../../classe/MyImageCacheDB";
import styles from '../../Css/product/productForm.module.css';

const getImageUrl = (productName: string): string => {
    const keywords = productName.split(' ').slice(0, 2).join(' ');
    return `https://source.unsplash.com/400x300/?${encodeURIComponent(keywords)}`;
};

interface ProductFormProps {
    productId?: number | null;
    isFromPurchaseInvoice?: boolean;
    handleClose?: () => void;
    initialCategory?: string | null;
}

type ProductFormData = {
    id?: number;
    name: string;
    price: number;
    priceInit?: number;
    quantity: number;
    barcode: string;
    category?: string;
    image?: string;
    QuantityAlmostDepleted?:number;
};

const ProductForm = ({ productId, isFromPurchaseInvoice, handleClose, initialCategory }: ProductFormProps) => {
    // @ts-ignore
    const { isDarkMode } = useDarkMode();

    const initialProductState: ProductFormData = {
        name: '',
        price: 0,
        priceInit: 0,
        quantity: isFromPurchaseInvoice ? 100 : 0,
        barcode: '',
        image: '',
        category: initialCategory || ''
    };

    const [product, setProduct] = useState<ProductFormData>(initialProductState);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch product data when editing
    useEffect(() => {
        if (productId) {
            getProductById(productId)
                .then(response => {
                    const apiData: Product = response.data;
                    if (apiData) {
                        setProduct({
                            id: apiData.id,
                            name: apiData.name || '',
                            price: Number(apiData.price) || 0,
                            priceInit: Number(apiData.priceInit) || 0,
                            quantity: Number(apiData.quantity) || 0,
                            barcode: apiData.barcode || '',
                            category: apiData.category || '',
                            image: apiData.image || '',
                        });
                    }
                })
                .catch(error => console.error('Error fetching product:', error));
        } else {
            setProduct(initialProductState);
        }
    }, [productId]);

    // Auto-generate image URL based on product name
    useEffect(() => {
        if (!product.name || productId || product.image?.startsWith('local-image:')) return;

        const handler = setTimeout(() => {
            const newImageUrl = getImageUrl(product.name);
            setProduct(prevProduct => ({ ...prevProduct, image: newImageUrl }));
        }, 500);

        return () => clearTimeout(handler);
    }, [product.name, productId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const numericValue = (name === 'price' || name === 'quantity') ? Number(value) : value;
        setProduct(prevProduct => ({ ...prevProduct, [name]: numericValue }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (productId) {
                await updateProduct(productId, product);
            } else {
                await createProduct(product);
            }
            if (handleClose) handleClose();
        } catch (error) {
            console.error("Error saving product:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleManualImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const localImageKey = `local-image:${product.name || Date.now()}`;

        try {
            await db.images.put({
                url: localImageKey,
                imageBlob: file,
                timestamp: Date.now()
            });
            setProduct(prev => ({ ...prev, image: localImageKey }));
        } catch (error) {
            console.error("Failed to save uploaded image to DB", error);
        }
    };

    const themeClass = isDarkMode ? 'dark' : 'light';

    return (
        <div className={`${styles.container} ${styles[themeClass]}`}>
            <div className={`${styles.card} ${styles[themeClass]}`}>
                {/* Header */}
                <div className={`${styles.header} ${styles[themeClass]}`}>
                    <h1 className={`${styles.headerTitle} ${styles[themeClass]}`}>
                        {productId ? 'Edit Product' : 'Add New Product'}
                    </h1>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className={styles.formContent}>
                        <div className={styles.formGrid}>
                            {/* Image Section */}
                            <div className={styles.imageSection}>
                                <label className={`${styles.imageLabel} ${styles[themeClass]}`}>
                                    Product Image
                                </label>
                                <ProductImage imageUrl={product.image} productName={product.name} />

                                <div>
                                    <label htmlFor="image-upload" className={`${styles.uploadLabel} ${styles[themeClass]}`}>
                                        Or upload new image
                                    </label>
                                    <input
                                        type="file"
                                        id="image-upload"
                                        onChange={handleManualImageUpload}
                                        accept="image/*"
                                        className={`${styles.fileInput} ${styles[themeClass]}`}
                                    />
                                </div>
                            </div>

                            {/* Form Fields */}
                            <div className={styles.fieldsGrid}>
                                <div className={styles.fieldFull}>
                                    <label htmlFor="name" className={`${styles.fieldLabel} ${styles[themeClass]}`}>
                                        Product Name *
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={product.name}
                                        onChange={handleChange}
                                        className={`${styles.input} ${styles[themeClass]}`}
                                        placeholder="Enter product name"
                                        required
                                    />
                                </div>

                                <div className={styles.fieldHalf}>
                                    <label htmlFor="price" className={`${styles.fieldLabel} ${styles[themeClass]}`}>
                                        Price init *
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        id="price"
                                        name="priceInit"
                                        value={product.priceInit || ''}
                                        onChange={handleChange}
                                        className={`${styles.input} ${styles[themeClass]}`}
                                        placeholder="0.00"
                                        required
                                    />
                                </div>

                                <div className={styles.fieldHalf}>
                                    <label htmlFor="price" className={`${styles.fieldLabel} ${styles[themeClass]}`}>
                                        Price *
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        id="price"
                                        name="price"
                                        value={product.price || ''}
                                        onChange={handleChange}
                                        className={`${styles.input} ${styles[themeClass]}`}
                                        placeholder="0.00"
                                        required
                                    />
                                </div>

                                <div className={styles.fieldHalf}>
                                    <label htmlFor="quantity" className={`${styles.fieldLabel} ${styles[themeClass]}`}>
                                        Quantity *
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        id="quantity"
                                        name="quantity"
                                        value={product.quantity || ''}
                                        onChange={handleChange}
                                        className={`${styles.input} ${styles[themeClass]}`}
                                        placeholder="0"
                                        required
                                    />
                                </div>

                                <div className={styles.fieldHalf}>
                                    <label htmlFor="quantity" className={`${styles.fieldLabel} ${styles[themeClass]}`}>
                                        Quantity Almost Depleted *
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        id="quantity"
                                        name="QuantityAlmostDepleted"
                                        value={product.QuantityAlmostDepleted || ''}
                                        onChange={handleChange}
                                        className={`${styles.input} ${styles[themeClass]}`}
                                        placeholder="0"
                                        required
                                    />
                                </div>

                                <div className={styles.fieldHalf}>
                                    <label htmlFor="barcode" className={`${styles.fieldLabel} ${styles[themeClass]}`}>
                                        Description/Barcode
                                    </label>
                                    <input
                                        type="text"
                                        id="barcode"
                                        name="barcode"
                                        value={product.barcode}
                                        onChange={handleChange}
                                        className={`${styles.input} ${styles[themeClass]}`}
                                        placeholder="Enter barcode"
                                    />
                                </div>

                                <div className={styles.fieldHalf}>
                                    <label htmlFor="category" className={`${styles.fieldLabel} ${styles[themeClass]}`}>
                                        Category
                                    </label>
                                    <input
                                        type="text"
                                        id="category"
                                        name="category"
                                        value={product.category}
                                        onChange={handleChange}
                                        className={`${styles.input} ${styles[themeClass]}`}
                                        placeholder="Enter category"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className={`${styles.actionButtons} ${styles[themeClass]}`}>
                        {handleClose && (
                            <button
                                type="button"
                                onClick={handleClose}
                                className={`${styles.cancelButton} ${styles[themeClass]}`}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </button>
                        )}
                        <button
                            type="submit"
                            className={`${styles.submitButton} ${styles[themeClass]} ${isSubmitting ? styles.disabled : ''}`}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Saving...' : (productId ? 'Update Product' : 'Save Product')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default memo(ProductForm);