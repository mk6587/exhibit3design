
interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  persist?: boolean; // Whether to persist to localStorage
}

class Cache {
  private memoryCache = new Map<string, CacheItem<any>>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly STORAGE_PREFIX = 'app_cache_';

  set<T>(key: string, data: T, options: CacheOptions = {}): void {
    const ttl = options.ttl || this.DEFAULT_TTL;
    const now = Date.now();
    const cacheItem: CacheItem<T> = {
      data,
      timestamp: now,
      expiresAt: now + ttl
    };

    // Store in memory
    this.memoryCache.set(key, cacheItem);

    // Optionally persist to localStorage
    if (options.persist) {
      try {
        localStorage.setItem(
          `${this.STORAGE_PREFIX}${key}`,
          JSON.stringify(cacheItem)
        );
      } catch (error) {
        console.warn('Failed to persist cache item to localStorage:', error);
      }
    }
  }

  get<T>(key: string): T | null {
    const now = Date.now();

    // Check memory cache first
    const memoryItem = this.memoryCache.get(key);
    if (memoryItem && memoryItem.expiresAt > now) {
      return memoryItem.data;
    }

    // Check localStorage if not in memory
    try {
      const stored = localStorage.getItem(`${this.STORAGE_PREFIX}${key}`);
      if (stored) {
        const parsedItem: CacheItem<T> = JSON.parse(stored);
        if (parsedItem.expiresAt > now) {
          // Restore to memory cache
          this.memoryCache.set(key, parsedItem);
          return parsedItem.data;
        } else {
          // Remove expired item
          localStorage.removeItem(`${this.STORAGE_PREFIX}${key}`);
        }
      }
    } catch (error) {
      console.warn('Failed to read from localStorage cache:', error);
    }

    // Remove expired memory cache item
    if (memoryItem) {
      this.memoryCache.delete(key);
    }

    return null;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): void {
    this.memoryCache.delete(key);
    try {
      localStorage.removeItem(`${this.STORAGE_PREFIX}${key}`);
    } catch (error) {
      console.warn('Failed to remove from localStorage:', error);
    }
  }

  clear(): void {
    this.memoryCache.clear();
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.STORAGE_PREFIX)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('Failed to clear localStorage cache:', error);
    }
  }

  // Clean up expired items
  cleanup(): void {
    const now = Date.now();
    
    // Clean memory cache
    for (const [key, item] of this.memoryCache.entries()) {
      if (item.expiresAt <= now) {
        this.memoryCache.delete(key);
      }
    }

    // Clean localStorage cache
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.STORAGE_PREFIX)) {
          const stored = localStorage.getItem(key);
          if (stored) {
            const parsedItem = JSON.parse(stored);
            if (parsedItem.expiresAt <= now) {
              localStorage.removeItem(key);
            }
          }
        }
      });
    } catch (error) {
      console.warn('Failed to cleanup localStorage cache:', error);
    }
  }

  getStats() {
    return {
      memoryItems: this.memoryCache.size,
      storageItems: Object.keys(localStorage).filter(key => 
        key.startsWith(this.STORAGE_PREFIX)
      ).length
    };
  }
}

export const cache = new Cache();

// Cleanup expired items every 5 minutes
setInterval(() => {
  cache.cleanup();
}, 5 * 60 * 1000);
