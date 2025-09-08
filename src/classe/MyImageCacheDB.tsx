// src/lib/db.ts

import Dexie, { Table } from 'dexie';

// Define the structure of the data we'll store
export interface CachedImage {
    url: string;        // The original image URL, will be our primary key
    imageBlob: Blob;    // The actual image data
    timestamp: number;  // To manage cache eviction later (optional but good practice)
}

export class MyImageCacheDB extends Dexie {
    // 'images' is the name of our object store (like a table)
    images!: Table<CachedImage>;

    constructor() {
        super('myImageCacheDB'); // The name of the database
        this.version(1).stores({
            // Define the schema. '&url' means 'url' is the primary key and must be unique.
            images: '&url, timestamp'
        });
    }
}

// Export a singleton instance of the database
export const db = new MyImageCacheDB();