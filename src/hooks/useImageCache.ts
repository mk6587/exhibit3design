
import { useState, useEffect, useCallback } from 'react';
import { cache } from '@/lib/cache';

interface ImageCacheOptions {
  fallbackUrl?: string;
  cacheTime?: number;
}

const IMAGE_CACHE_TTL = 30 * 60 * 1000; // 30 minutes

export const useImageCache = (imageUrl: string, options: ImageCacheOptions = {}) => {
  const [cachedUrl, setCachedUrl] = useState<string>(imageUrl);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<boolean>(false);

  const { fallbackUrl, cacheTime = IMAGE_CACHE_TTL } = options;

  const loadAndCacheImage = useCallback(async (url: string) => {
    if (!url || url.startsWith('blob:')) {
      setCachedUrl(fallbackUrl || url);
      return;
    }

    const cacheKey = `image_${url}`;
    
    // Check if image is already cached
    const cached = cache.get<string>(cacheKey);
    if (cached) {
      setCachedUrl(cached);
      return;
    }

    setLoading(true);
    setError(false);

    try {
      // Preload image to ensure it's valid
      const img = new Image();
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = url;
      });

      // Cache the successful URL
      cache.set(cacheKey, url, { ttl: cacheTime, persist: true });
      setCachedUrl(url);
    } catch (err) {
      console.warn('Failed to load image:', url, err);
      setError(true);
      
      if (fallbackUrl) {
        // Cache the fallback URL too
        cache.set(cacheKey, fallbackUrl, { ttl: cacheTime, persist: true });
        setCachedUrl(fallbackUrl);
      }
    } finally {
      setLoading(false);
    }
  }, [fallbackUrl, cacheTime]);

  useEffect(() => {
    loadAndCacheImage(imageUrl);
  }, [imageUrl, loadAndCacheImage]);

  return {
    src: cachedUrl,
    loading,
    error,
    reload: () => loadAndCacheImage(imageUrl)
  };
};

// Hook for preloading multiple images
export const useImagePreloader = () => {
  const preloadImages = useCallback(async (urls: string[]) => {
    const validUrls = urls.filter(url => url && !url.startsWith('blob:'));
    
    const promises = validUrls.map(async (url) => {
      const cacheKey = `image_${url}`;
      
      // Skip if already cached
      if (cache.has(cacheKey)) {
        return;
      }

      try {
        const img = new Image();
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = url;
        });
        
        // Cache successful load
        cache.set(cacheKey, url, { ttl: IMAGE_CACHE_TTL, persist: true });
      } catch (error) {
        console.warn('Failed to preload image:', url);
      }
    });

    await Promise.allSettled(promises);
  }, []);

  return { preloadImages };
};
