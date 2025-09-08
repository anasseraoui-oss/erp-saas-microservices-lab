import React, { useState } from "react";
import InvoicePoductChart from "./InvoicePoductChart";
import styles from "../../Css/product/ProductCard.module.css";
import { Product } from "../../classe/Product";
import ProductImage from "./ProductImage";
import { useDarkMode } from "../DarkModeProvider";

interface ProductCardProps {
    product: Product;
    onViewDetails?: (product: Product) => void;
    onEdit?: (product: Product) => void;
    onDelete?: (id: number) => void;
    isModalView?: boolean;
    className?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({
                                                     product,
                                                     onViewDetails,
                                                     onEdit,
                                                     onDelete,
                                                     isModalView = false,
                                                     className = ""
                                                 }) => {
    const [isChartModalOpen, setIsChartModalOpen] = useState(false);
    // @ts-ignore
    const { isDarkMode } = useDarkMode();

    if (!product) return null;

    const toggleChartModal = (e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        if (!isModalView) {
            setIsChartModalOpen(!isChartModalOpen);
        }
    };

    const handleCardClick = () => {
        if (!isModalView) {
            if (onViewDetails && !onEdit && !onDelete) {
                onViewDetails(product);
            } else {
                toggleChartModal();
            }
        }
    };

    const formatDate = (dateString: string | Date | undefined) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString();
        } catch (error) {
            return 'Invalid Date';
        }
    };

    // Create class names with proper dark mode handling
    const cardClasses = [
        styles.productCard,
        isModalView ? styles.modalViewCard : styles.clickableCard,
        isDarkMode ? styles.darkMode : '',
        className
    ].filter(Boolean).join(' ');

    const modalOverlayClasses = [
        styles.chartModalOverlay,
        isDarkMode ? styles.darkMode : ''
    ].filter(Boolean).join(' ');

    return (
        <>
            <div
                className={cardClasses}
                onClick={!isModalView ? handleCardClick : undefined}
            >
                <div className={styles.imageContainer}>
                    <ProductImage
                        imageUrl={product.image}
                        productName={product.name}
                        className={styles.productImage}
                        alt={`Image for ${product.name}`}
                    />
                </div>

                <div className={styles.cardBody}>
                    <h5 className={styles.title}>{product.name}</h5>
                    <div className={styles.details}>
                        <p>
                            <strong>Price:</strong>
                            <span>${product.price?.toFixed(2) || 'N/A'}</span>
                        </p>
                        {product.priceInit !== undefined && product.priceInit !== product.price && (
                            <p>
                                <strong>Initial Price:</strong>
                                <span>${product.priceInit?.toFixed(2)}</span>
                            </p>
                        )}
                        <p>
                            <strong>Quantity:</strong>
                            <span>{product.quantity ?? 'N/A'}</span>
                        </p>
                        <p>
                            <strong>Category:</strong>
                            <span>{product.category || 'N/A'}</span>
                        </p>
                        <p>
                            <strong>Barcode:</strong>
                            <span>{product.barcode || 'N/A'}</span>
                        </p>
                        {isModalView && (
                            <>
                                <p>
                                    <strong>ID:</strong>
                                    <span>{product.id}</span>
                                </p>
                                <p>
                                    <strong>Created:</strong>
                                    <span>{formatDate(product.dateCreating)}</span>
                                </p>
                                <p>
                                    <strong>Modified:</strong>
                                    <span>{formatDate(product.dateLastModification)}</span>
                                </p>
                            </>
                        )}
                    </div>
                </div>

                {!isModalView && (onViewDetails || onEdit || onDelete) && (
                    <div className={styles.actions}>
                        {onViewDetails && (
                            <button
                                className={`${styles.actionButton} ${styles.infoButton}`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onViewDetails(product);
                                }}
                            >
                                Details
                            </button>
                        )}
                        {onEdit && (
                            <button
                                className={`${styles.actionButton} ${styles.primaryButton}`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onEdit(product);
                                }}
                            >
                                Edit
                            </button>
                        )}
                        {onDelete && (
                            <button
                                className={`${styles.actionButton} ${styles.dangerButton}`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(product.id);
                                }}
                            >
                                Delete
                            </button>
                        )}
                    </div>
                )}
            </div>

            {!isModalView && isChartModalOpen && (
                <div className={modalOverlayClasses} onClick={toggleChartModal}>
                    <div className={styles.chartModalContent} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.chartModalHeader}>
                            <h3 className={styles.chartModalTitle}>{product.name}</h3>
                            <button className={styles.chartModalCloseButton} onClick={toggleChartModal}>
                                ×
                            </button>
                        </div>
                        <InvoicePoductChart key={`chart-${product.id}`} productId={product.id} />
                    </div>
                </div>
            )}
        </>
    );
};

export default ProductCard;