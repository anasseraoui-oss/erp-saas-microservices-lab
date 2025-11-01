// src/utils/imageUtils.ts
// Hook for using the image fetcher in React components
import { useState, useEffect } from 'react';
export interface ImageFetchResult {
    url: string;
    source: 'provided' | 'unsplash' | 'picsum' | 'placeholder' | 'fallback';
    error?: string;
}

// Helper function to check if a URL is valid and accessible
const isValidHttpUrl = (url: string): boolean => {
    try {
        const urlObj = new URL(url);
        return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
        return false;
    }
};

// Helper function to test if an image URL is accessible
const testImageUrl = async (url: string, timeoutMs: number = 3000): Promise<boolean> => {
    if (!isValidHttpUrl(url)) {
        return false;
    }

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

        const response = await fetch(url, {
            method: 'HEAD',
            signal: controller.signal,
            mode: 'cors',
            cache: 'no-cache'
        });

        clearTimeout(timeoutId);
        return response.ok;
    } catch (error) {
        console.warn(`Image URL test failed for ${url}:`, error);
        return false;
    }
};

// Create a simple placeholder image as SVG data URL
const createPlaceholderSVG = (productName: string, width: number = 400, height: number = 300): string => {
    const text = productName.slice(0, 20);
    const svg = `
        <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
            <rect width="${width}" height="${height}" fill="#f1f5f9"/>
            <rect x="10" y="10" width="${width-20}" height="${height-20}" fill="#e2e8f0" stroke="#cbd5e1" stroke-width="2"/>
            <text x="${width/2}" y="${height/2 - 10}" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" fill="#64748b" font-weight="bold">
                ${text}
            </text>
            <text x="${width/2}" y="${height/2 + 15}" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="#94a3b8">
                No image available
            </text>
        </svg>
    `;
    return `data:image/svg+xml;base64,${btoa(svg)}`;
};

// Main image fetching function with robust fallbacks
export const fetchImageUrl = async (
    providedImageUrl: string | null | undefined,
    productName: string,
    options: {
        width?: number;
        height?: number;
        timeout?: number;
    } = {}
): Promise<ImageFetchResult> => {
    const { width = 400, height = 300, timeout = 5000 } = options;

    // Step 1: Try to use provided image URL if it's valid
    if (providedImageUrl && isValidHttpUrl(providedImageUrl)) {
        try {
            const isAccessible = await testImageUrl(providedImageUrl, timeout);
            if (isAccessible) {
                return {
                    url: providedImageUrl,
                    source: 'provided'
                };
            }
        } catch (error) {
            console.warn('Provided image URL failed:', error);
        }
    }

    // Step 2: Try Unsplash API (with proper error handling)
    try {
        const keywords = productName.split(' ').slice(0, 3).join(' ');
        const unsplashUrl = `https://api.unsplash.com/photos/random?query=${encodeURIComponent(keywords)}&w=${width}&h=${height}&orientation=landscape`;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(unsplashUrl, {
            headers: {
                'Authorization': 'Client-ID REDACTED_UNSPLASH_ACCESS_KEY',
                'Accept': 'application/json',
            },
            signal: controller.signal,
            mode: 'cors'
        });

        clearTimeout(timeoutId);

        if (response.ok) {
            const data = await response.json();
            if (data?.urls?.small || data?.urls?.regular) {
                const imageUrl = data.urls.small || data.urls.regular;
                const isAccessible = await testImageUrl(imageUrl, 3000);
                if (isAccessible) {
                    return {
                        url: imageUrl,
                        source: 'unsplash'
                    };
                }
            }
        }
    } catch (error) {
        console.warn('Unsplash API failed:', error);
    }

    // Step 3: Try Picsum Photos (Lorem Picsum)
    try {
        const seed = Math.floor(Math.random() * 10000);
        const picsumUrl = `https://picsum.photos/${width}/${height}?random=${seed}`;

        const isAccessible = await testImageUrl(picsumUrl, 3000);
        if (isAccessible) {
            return {
                url: picsumUrl,
                source: 'picsum'
            };
        }
    } catch (error) {
        console.warn('Picsum failed:', error);
    }

    // Step 4: Try placeholder services
    const placeholderServices = [
        `https://via.placeholder.com/${width}x${height}/e2e8f0/64748b?text=${encodeURIComponent(productName.slice(0, 15))}`,
        `https://dummyimage.com/${width}x${height}/e2e8f0/64748b.png&text=${encodeURIComponent(productName.slice(0, 15))}`,
        `https://placehold.co/${width}x${height}/e2e8f0/64748b?text=${encodeURIComponent(productName.slice(0, 15))}`
    ];

    for (const serviceUrl of placeholderServices) {
        try {
            const isAccessible = await testImageUrl(serviceUrl, 3000);
            if (isAccessible) {
                return {
                    url: serviceUrl,
                    source: 'placeholder'
                };
            }
        } catch (error) {
            console.warn(`Placeholder service failed for ${serviceUrl}:`, error);
        }
    }

    // Step 5: Ultimate fallback - SVG data URL
    return {
        url: createPlaceholderSVG(productName, width, height),
        source: 'fallback'
    };
};



export const useRobustImage = (
    providedImageUrl: string | null | undefined,
    productName: string,
    options?: { width?: number; height?: number; timeout?: number }
) => {
    const [imageResult, setImageResult] = useState<ImageFetchResult | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isCancelled = false;

        const loadImage = async () => {
            if (!productName) return;

            setIsLoading(true);
            setError(null);

            try {
                const result = await fetchImageUrl(providedImageUrl, productName, options);

                if (!isCancelled) {
                    setImageResult(result);
                }
            } catch (err) {
                if (!isCancelled) {
                    const errorMessage = err instanceof Error ? err.message : 'Failed to load image';
                    setError(errorMessage);
                    // Provide fallback even on error
                    setImageResult({
                        url: createPlaceholderSVG(productName, options?.width, options?.height),
                        source: 'fallback',
                        error: errorMessage
                    });
                }
            } finally {
                if (!isCancelled) {
                    setIsLoading(false);
                }
            }
        };

        loadImage();

        return () => {
            isCancelled = true;
        };
    }, [providedImageUrl, productName, options?.width, options?.height, options?.timeout]);

    return { imageResult, isLoading, error };
};