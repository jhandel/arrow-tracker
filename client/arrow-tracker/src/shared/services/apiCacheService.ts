import { openDB, IDBPDatabase } from 'idb';

/**
 * Interface for cache entry
 */
interface CacheEntry<T> {
  data: T;
  expires: number;
  url: string;
}

/**
 * Database schema for cache
 */
interface ApiCacheDB {
  cache: {
    key: string;
    value: CacheEntry<any>;
  };
}

/**
 * Default cache expiration time (5 minutes)
 */
const DEFAULT_CACHE_EXPIRY = 5 * 60 * 1000;

/**
 * Service for caching API responses in IndexedDB
 */
class ApiCacheService {
  private db: Promise<IDBPDatabase<ApiCacheDB>>;
  private dbName = 'api-cache-db';
  private dbVersion = 1;

  constructor() {
    this.db = this.initDB();
  }

  /**
   * Initialize the database
   */
  private async initDB(): Promise<IDBPDatabase<ApiCacheDB>> {
    return openDB<ApiCacheDB>(this.dbName, this.dbVersion, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('cache')) {
          db.createObjectStore('cache');
        }
      },
    });
  }

  /**
   * Generate a cache key from URL and params
   */
  private generateCacheKey(url: string, params?: Record<string, string>): string {
    if (!params) {
      return url;
    }
    
    // Sort params to ensure consistent keys
    const sortedParams = Object.entries(params)
      .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
      .map(([key, value]) => `${key}=${value}`)
      .join('&');
      
    return `${url}?${sortedParams}`;
  }

  /**
   * Get a response from the cache
   */
  async get<T>(url: string, params?: Record<string, string>): Promise<T | null> {
    const cacheKey = this.generateCacheKey(url, params);
    
    try {
      const cacheEntry = await (await this.db).get('cache', cacheKey) as CacheEntry<T>;
      
      if (!cacheEntry) {
        return null;
      }
      
      // Check if cache is expired
      if (cacheEntry.expires < Date.now()) {
        await this.delete(url, params);
        return null;
      }
      
      return cacheEntry.data;
    } catch (error) {
      console.error('Error retrieving from cache:', error);
      return null;
    }
  }

  /**
   * Set a response in the cache
   */
  async set<T>(
    url: string,
    data: T,
    expiryTime = DEFAULT_CACHE_EXPIRY,
    params?: Record<string, string>
  ): Promise<void> {
    const cacheKey = this.generateCacheKey(url, params);
    
    try {
      const cacheEntry: CacheEntry<T> = {
        data,
        expires: Date.now() + expiryTime,
        url,
      };
      
      await (await this.db).put('cache', cacheEntry, cacheKey);
    } catch (error) {
      console.error('Error setting cache:', error);
    }
  }

  /**
   * Delete a response from the cache
   */
  async delete(url: string, params?: Record<string, string>): Promise<void> {
    const cacheKey = this.generateCacheKey(url, params);
    
    try {
      await (await this.db).delete('cache', cacheKey);
    } catch (error) {
      console.error('Error deleting from cache:', error);
    }
  }

  /**
   * Clear all cache entries
   */
  async clear(): Promise<void> {
    try {
      await (await this.db).clear('cache');
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

  /**
   * Clear expired cache entries
   */
  async clearExpired(): Promise<void> {
    try {
      const allCacheEntries = await (await this.db).getAll('cache');
      const now = Date.now();
      
      for (const entry of allCacheEntries) {
        if (entry.expires < now) {
          await (await this.db).delete('cache', this.generateCacheKey(entry.url));
        }
      }
    } catch (error) {
      console.error('Error clearing expired cache:', error);
    }
  }
}

// Export a singleton instance
const apiCacheService = new ApiCacheService();
export default apiCacheService;