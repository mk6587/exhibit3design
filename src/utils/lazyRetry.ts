/**
 * Retry logic for lazy-loaded components
 * Attempts to load a component multiple times with exponential backoff
 * This prevents white screens from temporary network issues
 */
export function lazyRetry<T>(
  importFn: () => Promise<T>,
  retriesLeft = 3,
  interval = 1000
): Promise<T> {
  return new Promise((resolve, reject) => {
    importFn()
      .then(resolve)
      .catch((error) => {
        if (retriesLeft === 0) {
          // After all retries failed, reject with error
          console.error('Failed to load component after retries:', error);
          reject(error);
          return;
        }
        
        console.warn(`Component load failed, retrying... (${retriesLeft} attempts left)`);
        
        // Wait and retry with exponential backoff
        setTimeout(() => {
          lazyRetry(importFn, retriesLeft - 1, interval * 2)
            .then(resolve)
            .catch(reject);
        }, interval);
      });
  });
}
