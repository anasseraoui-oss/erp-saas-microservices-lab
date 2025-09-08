// src/components/ProductImage.tsx

import React, {memo, useEffect, useState} from 'react';
import {useInView} from 'react-intersection-observer';
import styles from '../../Css/product/productImage.module.css';
import {useCachedImage} from "../hook/useCachedImage";

interface ProductImageProps {
    productName: string;
    className?: string;
    style?: React.CSSProperties;
    alt?: string;
    width?: number;
    height?: number;
    imageUrl?: string;
}

const getImageUrl = (productName: string): string => {
    const keywords = productName.split(' ').slice(0, 2).join(' ');
    // Use a more reliable placeholder service
    return `https://via.placeholder.com/400x300/e0e0e0/666666?text=${encodeURIComponent(keywords)}`;
};

const ProductImage: React.FC<ProductImageProps> = memo(({
                                                            productName,
                                                            className,
                                                            style,
                                                            alt,
                                                            width = 400,
                                                            height = 300,
                                                            imageUrl
                                                        }) => {
    const [triggeredUrl, setTriggeredUrl] = useState<string | null>(null);

    const {ref, inView} = useInView({
        triggerOnce: true,
        threshold: 0.1,
        rootMargin: '100px',
    });

    useEffect(() => {
        if (inView && !triggeredUrl) {
            setTriggeredUrl(imageUrl || getImageUrl(productName));
        }
    }, [inView, productName, triggeredUrl, imageUrl]);

    const {imageSrc, status} = useCachedImage(triggeredUrl);

    const handleRetry = () => {
        setTriggeredUrl(null);
        setTimeout(() => setTriggeredUrl(imageUrl || getImageUrl(productName)), 50);
    };

    const renderContent = () => {
        switch (status) {
            case 'error':
                return (
                    <div className={`${styles.placeholder} ${styles.errorPlaceholder}`}>
                        <span>Failed to load image</span>
                        <button onClick={handleRetry} className={styles.retryButton}>
                            Retry
                        </button>
                    </div>
                );

            case 'cached':
            case 'loaded':
                return (
                    <img
                        src={imageSrc!}
                        alt={alt || `Image for ${productName}`}
                        className={styles.imageFadeIn}
                    />
                );

            case 'loading':
            default:
                return (
                    <div className={`${styles.placeholder} ${styles.loadingPlaceholder}`}>
                        <div className={styles.spinner}></div>
                        <span>{productName}</span>
                    </div>
                );
        }
    };

    return (
        <div
            ref={ref}
            className={`${styles.productImageContainer} ${className || ''}`}
            style={{...style, minHeight: `${height}px`, width: `${width}px`}}
        >
            {renderContent()}
        </div>
    );
});

export default ProductImage;