// src/components/ProductImage.tsx

import React, { memo } from 'react';
import { useInView } from 'react-intersection-observer';
import { useCachedImage } from '../hook/useCachedImage';
import { useRobustImage } from '../../api/fetchImageUnsplash';
import styles from '../../Css/product/productImage.module.css';

interface ProductImageProps {
    imageUrl: string | null | undefined;
    productName: string;
    className?: string;
    alt?: string;
    width?: number;
    height?: number;
}

const ProductImage: React.FC<ProductImageProps> = memo(({
                                                            imageUrl,
                                                            productName,
                                                            className,
                                                            alt,
                                                            width = 400,
                                                            height = 300,
                                                        }) => {
    const { ref, inView } = useInView({
        triggerOnce: true,
        threshold: 0.1,
        rootMargin: '100px',
    });

    // Only fetch image when in view
    const { imageResult, isLoading, error } = useRobustImage(
        inView ? imageUrl : null,
        inView ? productName : '',
        { width, height, timeout: 5000 }
    );

    const { imageSrc, status: cacheStatus } = useCachedImage(imageResult?.url);

    const renderContent = () => {
        // Show loading state
        if (!inView || isLoading || !imageResult) {
            return (
                <div className={`${styles.placeholder} ${styles.loadingPlaceholder}`}>
                    <div className={styles.spinner}></div>
                    <span>Loading...</span>
                </div>
            );
        }

        // Show error state
        if (error && imageResult.source === 'fallback') {
            return (
                <div className={`${styles.placeholder} ${styles.errorPlaceholder}`}>
                    <img
                        src={imageResult.url}
                        alt={alt || `Placeholder for ${productName}`}
                        className={styles.placeholderImage}
                    />
                    <small className={styles.errorMessage}>
                        Image service unavailable
                    </small>
                </div>
            );
        }

        // Show cached or loaded image
        if (cacheStatus === 'cached' || cacheStatus === 'loaded') {
            return (
                <div className={styles.imageWrapper}>
                    <img
                        src={imageSrc!}
                        alt={alt || `Image for ${productName}`}
                        className={styles.imageFadeIn}
                        onError={(e) => {
                            console.warn('Image load error:', e);
                            // Don't set error state here as it would cause infinite loop
                        }}
                    />
                    {imageResult.source !== 'provided' && (
                        <div className={styles.imageSourceBadge}>
                            {imageResult.source === 'unsplash' && '📸'}
                            {imageResult.source === 'picsum' && '🖼️'}
                            {imageResult.source === 'placeholder' && '🔧'}
                            {imageResult.source === 'fallback' && '⚠️'}
                        </div>
                    )}
                </div>
            );
        }

        // Show loading state for cache
        return (
            <div className={`${styles.placeholder} ${styles.loadingPlaceholder}`}>
                <div className={styles.spinner}></div>
                <span>Loading image...</span>
            </div>
        );
    };

    return (
        <div
            ref={ref}
            className={`${styles.productImageContainer} ${className || ''}`}
            style={{ width, height }}
        >
            {renderContent()}
        </div>
    );
});

ProductImage.displayName = 'ProductImage';

export default ProductImage;