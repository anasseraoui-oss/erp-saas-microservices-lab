// src/hooks/useCachedImage.ts

import { useState, useEffect } from 'react';
import {db} from "../../classe/MyImageCacheDB";

type ImageStatus = 'loading' | 'loaded' | 'cached' | 'error';

interface CachedImageState {
    imageSrc: string | null;
    status: ImageStatus;
}

const imageUrlToBlob = (url: string): Promise<Blob> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';

        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (!ctx) return reject(new Error('Failed to get canvas context.'));

            ctx.drawImage(img, 0, 0);
            canvas.toBlob((blob) => {
                if (blob) resolve(blob);
                else reject(new Error('Canvas to Blob conversion failed.'));
            }, 'image/jpeg');
        };

        img.onerror = (error) => reject(error);

        // إضافة معلمة عشوائية لتجنب التخزين المؤقت للصور من طرف المتصفح
        img.src = `${url}${url.includes('?') ? '&' : '?'}cacheBust=${new Date().getTime()}`;
    });
};

export function useCachedImage(imageUrl: string | null | undefined): CachedImageState {
    const [state, setState] = useState<CachedImageState>({ imageSrc: null, status: 'loading' });

    useEffect(() => {
        if (!imageUrl) {
            setState({ imageSrc: null, status: 'loading' });
            return;
        }

        let objectUrl: string | null = null;

        const loadImage = async () => {
            setState({ imageSrc: null, status: 'loading' });
            try {
                const cachedImage = await db.images.get(imageUrl);

                if (cachedImage) {
                    objectUrl = URL.createObjectURL(cachedImage.imageBlob);
                    setState({ imageSrc: objectUrl, status: 'cached' });
                } else {
                    const imageBlob = await imageUrlToBlob(imageUrl);
                    await db.images.put({ url: imageUrl, imageBlob, timestamp: Date.now() });
                    objectUrl = URL.createObjectURL(imageBlob);
                    setState({ imageSrc: objectUrl, status: 'loaded' });
                }
            } catch (error) {
                console.error(`Failed to load or cache image from ${imageUrl}:`, error);
                setState({ imageSrc: null, status: 'error' });
            }
        };

        loadImage();

        return () => {
            if (objectUrl) URL.revokeObjectURL(objectUrl);
        };
    }, [imageUrl]);

    return state;
}