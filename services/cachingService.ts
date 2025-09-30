interface CacheEntry<T> {
    data: T;
    expiry: number;
}

const cache = new Map<string, CacheEntry<any>>();

export const cachingService = {
    /**
     * Retrieves an item from the cache if it exists and is not expired.
     * @param key The cache key.
     * @returns The cached data or null if not found or expired.
     */
    get<T>(key: string): T | null {
        const entry = cache.get(key);
        if (entry && Date.now() < entry.expiry) {
            console.log(`[Cache] HIT for key: ${key}`);
            return entry.data as T;
        }
        if (entry) {
            // Expired, delete it
            cache.delete(key);
        }
        console.log(`[Cache] MISS for key: ${key}`);
        return null;
    },

    /**
     * Adds an item to the cache with a Time-To-Live (TTL).
     * @param key The cache key.
     * @param data The data to cache.
     * @param ttlSeconds The number of seconds until the cache entry expires. Defaults to 60.
     */
    set<T>(key: string, data: T, ttlSeconds: number = 60): void {
        const expiry = Date.now() + ttlSeconds * 1000;
        cache.set(key, { data, expiry });
        console.log(`[Cache] SET for key: ${key} with TTL: ${ttlSeconds}s`);
    },

    /**
     * Clears a specific entry from the cache.
     * @param key The cache key to clear.
     */
    clear(key: string): void {
        cache.delete(key);
    },

    /**
     * Clears the entire cache.
     */
    clearAll(): void {
        cache.clear();
    }
};
